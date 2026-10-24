// src/services/webLlmService.ts
// In-Browser WebGPU Local LLM Engine for EduDiscovery AI Counselor
// Supports tiered on-device models with explicit VRAM safety and fallback

import {
  CreateMLCEngine,
  MLCEngine,
  hasModelInCache,
  InitProgressReport
} from '@mlc-ai/web-llm';

export type WebLlmStatus =
  | 'unsupported'       // Browser/Hardware lacks WebGPU
  | 'idle'              // WebGPU available, model not yet downloaded/loaded
  | 'checking_cache'    // Checking if model tensors already in browser cache
  | 'downloading'       // Downloading model weights with byte/percent progress
  | 'initializing'      // Compiling shaders / initializing pipeline on GPU
  | 'ready'             // Engine verified and ready for generation
  | 'error';            // Initialization or memory error

export interface DeviceGpuProfile {
  supported: boolean;
  adapterName?: string;
  architecture?: string;
  vendor?: string;
  vramEstimatedMb?: number;
  recommendedModel: string;
  isLowVramDevice: boolean;
}

export interface WebLlmProgressState {
  status: WebLlmStatus;
  progressPercent: number;
  progressText: string;
  activeModel: string;
  isCached: boolean;
  errorMessage?: string;
}

// Model Tier Configurations
// Mobile / Low-VRAM friendly model: ~376 MB VRAM requirement
export const MOBILE_MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC';
// Desktop / Capable GPU model: ~879 MB VRAM requirement
export const DESKTOP_MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

class WebLlmService {
  private engine: MLCEngine | null = null;
  private gpuProfile: DeviceGpuProfile | null = null;
  private progressState: WebLlmProgressState = {
    status: 'idle',
    progressPercent: 0,
    progressText: '',
    activeModel: MOBILE_MODEL_ID,
    isCached: false
  };

  private listeners = new Set<(state: WebLlmProgressState) => void>();

  public subscribe(callback: (state: WebLlmProgressState) => void) {
    this.listeners.add(callback);
    callback(this.progressState);
    return () => this.listeners.delete(callback);
  }

  private updateState(partial: Partial<WebLlmProgressState>) {
    this.progressState = { ...this.progressState, ...partial };
    for (const listener of this.listeners) {
      listener(this.progressState);
    }
  }

  public getState(): WebLlmProgressState {
    return this.progressState;
  }

  /**
   * Evaluates client WebGPU hardware limits and assigns the safest model tier
   */
  public async detectGpuProfile(): Promise<DeviceGpuProfile> {
    if (this.gpuProfile) return this.gpuProfile;

    const nav = typeof window !== 'undefined' ? (navigator as any) : null;
    if (!nav || !nav.gpu) {
      this.gpuProfile = {
        supported: false,
        recommendedModel: MOBILE_MODEL_ID,
        isLowVramDevice: true
      };
      this.updateState({ status: 'unsupported' });
      return this.gpuProfile;
    }

    try {
      const adapter = await nav.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      if (!adapter) {
        this.gpuProfile = {
          supported: false,
          recommendedModel: MOBILE_MODEL_ID,
          isLowVramDevice: true
        };
        this.updateState({ status: 'unsupported' });
        return this.gpuProfile;
      }

      // Read adapter limits
      const maxBufferSize = adapter.limits?.maxStorageBufferBindingSize || 0;
      // If max storage buffer is < 1GB, or mobile user-agent, classify as Low-VRAM
      const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      const isLowVram = isMobileAgent || maxBufferSize < 1024 * 1024 * 1024; // < 1GB buffer

      const recommendedModel = isLowVram ? MOBILE_MODEL_ID : DESKTOP_MODEL_ID;

      // Safe inspection of adapter info if available
      let adapterName = 'Standard WebGPU Adapter';
      if ('info' in adapter && (adapter as any).info) {
        const info = (adapter as any).info;
        adapterName = info.description || info.device || info.vendor || adapterName;
      }

      this.gpuProfile = {
        supported: true,
        adapterName,
        isLowVramDevice: isLowVram,
        recommendedModel
      };

      this.updateState({
        status: 'idle',
        activeModel: recommendedModel
      });

      // Check if recommended model is already cached
      this.checkCacheStatus(recommendedModel);

      return this.gpuProfile;
    } catch (err) {
      console.warn('[WebLLM] WebGPU adapter inspection failed:', err);
      this.gpuProfile = {
        supported: false,
        recommendedModel: MOBILE_MODEL_ID,
        isLowVramDevice: true
      };
      this.updateState({ status: 'unsupported' });
      return this.gpuProfile;
    }
  }

  /**
   * Checks whether the selected model weights exist in CacheStorage/IndexedDB
   */
  public async checkCacheStatus(modelId?: string): Promise<boolean> {
    const targetModel = modelId || this.progressState.activeModel;
    try {
      const inCache = await hasModelInCache(targetModel);
      this.updateState({ isCached: inCache });
      return inCache;
    } catch (e) {
      console.warn('[WebLLM] Cache check failed:', e);
      return false;
    }
  }

  /**
   * Loads the model into browser GPU memory with live progress tracking
   */
  public async initializeEngine(selectedModel?: string): Promise<boolean> {
    const profile = await this.detectGpuProfile();
    if (!profile.supported) {
      this.updateState({
        status: 'unsupported',
        errorMessage: 'WebGPU is not supported in this browser. Cloud counselor will be used.'
      });
      return false;
    }

    const modelToLoad = selectedModel || profile.recommendedModel;

    // If already loaded with the same model
    if (this.engine && this.progressState.status === 'ready' && this.progressState.activeModel === modelToLoad) {
      return true;
    }

    this.updateState({
      status: 'downloading',
      activeModel: modelToLoad,
      progressPercent: 0,
      progressText: 'Preparing local neural engine...'
    });

    try {
      const progressCallback = (report: InitProgressReport) => {
        const percent = Math.round(report.progress * 100);
        const text = report.text || 'Loading neural model weights...';
        this.updateState({
          status: percent >= 100 ? 'initializing' : 'downloading',
          progressPercent: percent,
          progressText: text
        });
      };

      const newEngine = await CreateMLCEngine(modelToLoad, {
        initProgressCallback: progressCallback,
        logLevel: 'WARN'
      });

      // Verification test: perform a dry-run test completion to confirm VRAM stability
      this.updateState({
        status: 'initializing',
        progressText: 'Verifying on-device GPU inference pipeline...'
      });

      await newEngine.chat.completions.create({
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 1
      });

      this.engine = newEngine;
      this.updateState({
        status: 'ready',
        progressPercent: 100,
        progressText: 'Local AI Counselor ready (On-device & private)',
        isCached: true,
        errorMessage: undefined
      });

      return true;
    } catch (err: any) {
      console.error('[WebLLM] Engine initialization failed:', err);

      // If larger model failed on desktop, attempt fallback to lightweight mobile model
      if (modelToLoad !== MOBILE_MODEL_ID) {
        console.warn('[WebLLM] Retrying with low-VRAM model:', MOBILE_MODEL_ID);
        return this.initializeEngine(MOBILE_MODEL_ID);
      }

      this.updateState({
        status: 'error',
        errorMessage: err.message || 'GPU memory allocation failed. Seamlessly routing to cloud counselor.',
        progressText: 'Local load failed'
      });

      return false;
    }
  }

  /**
   * Generates streaming completion using on-device WebGPU model
   */
  public async streamChat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    onChunk: (fullText: string) => void
  ): Promise<string> {
    if (!this.engine || this.progressState.status !== 'ready') {
      throw new Error('Local WebGPU engine is not ready');
    }

    try {
      const completion = await this.engine.chat.completions.create({
        messages,
        temperature: 0.6,
        max_tokens: 800,
        stream: true
      });

      let fullText = '';
      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || '';
        fullText += delta;
        if (delta) {
          onChunk(fullText);
        }
      }

      return fullText;
    } catch (err: any) {
      console.error('[WebLLM] Inference crashed:', err);
      // If WebGPU crashed during generation, flag state so caller falls back
      this.updateState({
        status: 'error',
        errorMessage: 'Local inference interrupted. Falling back to cloud.'
      });
      throw err;
    }
  }

  /**
   * Unloads model from memory if user switches modes
   */
  public async unloadEngine() {
    if (this.engine) {
      try {
        await this.engine.unload();
      } catch (e) {
        console.warn('[WebLLM] Unload notice:', e);
      }
      this.engine = null;
    }
    this.updateState({ status: 'idle', progressPercent: 0, progressText: '' });
  }
}

export const webLlmService = new WebLlmService();
