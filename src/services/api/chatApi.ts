// src/services/api/chatApi.ts
// Hybrid AI Counselor Dispatcher: On-Device WebGPU + Resilient Cloud Fallback

import { webLlmService } from '@/services/webLlmService';
import { retrieveCollegeContext } from '@/services/ragEngine';
import { PredictionResult } from '@/utils/predictorEngine';

export interface ChatRequest {
  message: string;
  context: Record<string, unknown> | null;
  history: { sender: 'user' | 'ai'; text: string }[];
  onChunk?: (text: string) => void;
  enginePreference?: 'auto' | 'webgpu' | 'cloud' | 'self_hosted';
  predictorResults?: PredictionResult[];
  candidateRank?: number;
}

export interface ChatResponse {
  reply: string;
  source: 'webgpu' | 'cloud' | 'self_hosted' | 'fallback';
  engineModel?: string;
}

export interface AiBackendHealth {
  selfHosted: {
    available: boolean;
    url: string;
    model: string;
    availableModels?: string[];
  };
  cloud: {
    available: boolean;
    model: string;
    fallbackModel?: string;
  };
}

export async function checkAiBackendHealth(): Promise<AiBackendHealth | null> {
  try {
    const res = await fetch('/api/ai/health', { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {
    // Backend health endpoint not responding
  }
  return null;
}

/**
 * System prompt template enforcing AP counseling statutory accuracy
 */
function buildCounselorSystemPrompt(verifiedFacts: string, context: Record<string, unknown> | null) {
  return `You are the EduDiscovery Senior College Admissions Counselor, dedicated to guiding students through Andhra Pradesh EAPCET, ICET, and degree admissions.

${verifiedFacts}

STUDENT CONTEXT:
${JSON.stringify(context || {})}

CORE COUNSELING DIRECTIVES:
1. Use ONLY the verified statutory data provided above. If specific cutoffs, hostel fees, or numbers are missing, state that they are not published in official APHERMC gazettes. NEVER invent numbers.
2. When advising on choices, categorize colleges into:
   - Safe: High probability of seat allotment in Round 1/2.
   - Target: Competitive, realistic chance with sliding round probability.
   - Reach: High-tier aspirational choices to keep at the top of the Web-Options list.
3. Explicitly explain the APSCHE Web-Options Strategy: always put higher-ranked/reach institutions first because the allotment algorithm processes choices top-to-bottom without penalty.
4. If the student has an eligible rank, mention Jagananna Vidya Deevena (JVD) 100% tuition reimbursement scheme for Category-A convener quota seats.
5. Keep explanations warm, structured, and easy to read with bullet points.`;
}

/**
 * Sends chat message either via on-device WebGPU (if ready) or cloud server API
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const {
    message,
    context,
    history,
    onChunk,
    enginePreference = 'auto',
    predictorResults,
    candidateRank
  } = request;

  // Retrieve client-side verified facts via RAG
  const ragResult = retrieveCollegeContext(message, predictorResults, { candidateRank });
  const ragFacts = ragResult.factsText;

  let webLlmState = webLlmService.getState();
  let canUseWebGPU = enginePreference !== 'cloud' && webLlmState.status === 'ready';

  // If local engine is idle or downloading and user requested local, ensure initialization
  if (!canUseWebGPU && enginePreference !== 'cloud' && webLlmState.status !== 'unsupported' && webLlmState.status !== 'error') {
    try {
      console.log('[ChatApi] Activating on-device WebGPU model for query...');
      const initialized = await webLlmService.initializeEngine();
      if (initialized) {
        canUseWebGPU = true;
        webLlmState = webLlmService.getState();
      }
    } catch (e) {
      console.warn('[ChatApi] WebGPU initialization attempt bypassed:', e);
      canUseWebGPU = false;
    }
  }

  // ── Path 1: In-Browser WebGPU Inference ─────────────────────
  if (canUseWebGPU) {
    try {
      console.log(`[ChatApi] Executing locally via WebGPU model: ${webLlmState.activeModel}`);
      const systemPrompt = buildCounselorSystemPrompt(ragFacts, context);

      const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map(h => ({
          role: (h.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: h.text
        })),
        { role: 'user', content: message }
      ];

      const fullReply = await webLlmService.streamChat(formattedMessages, chunk => {
        if (onChunk) onChunk(chunk);
      });

      return {
        reply: fullReply,
        source: 'webgpu',
        engineModel: webLlmState.activeModel
      };
    } catch (gpuError: any) {
      console.warn('[ChatApi] WebGPU inference failed, seamlessly switching to cloud fallback:', gpuError);
      // Fall through to Path 2 (Cloud)
    }
  }

  // ── Path 2: Resilient Cloud API Fallback ─────────────────────
  try {
    const payloadContext = {
      ...(context || {}),
      verifiedCollegeFacts: ragFacts,
      predictorResults: predictorResults?.slice(0, 8),
      candidateRank
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: payloadContext,
        history
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to connect to counselor service';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.reply || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line === 'data: [DONE]') {
          return { reply: fullResponse, source: 'cloud' };
        }

        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.error) throw new Error(data.error);
            if (data.text) {
              fullResponse += data.text;
              if (onChunk) onChunk(fullResponse);
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }
    }

    return {
      reply: fullResponse,
      source: canUseWebGPU ? 'fallback' : 'cloud'
    };
  } catch (cloudErr: any) {
    // If both engines failed, provide graceful rule-based response
    console.error('[ChatApi] All inference paths failed:', cloudErr);
    
    // Fallback: If we have retrieved facts, return a clear, factual rule-based summary
    if (ragResult.retrievedColleges.length > 0) {
      const fallbackReply = `Here are the verified admissions details based on official records:\n\n${ragFacts}\n\n*(Note: AI explanation is temporarily unavailable. All verified figures above remain official and accurate.)*`;
      if (onChunk) onChunk(fallbackReply);
      return { reply: fallbackReply, source: 'fallback' };
    }

    throw new Error(cloudErr.message || 'Admissions Counselor is temporarily unreachable. Please check your network or try again.');
  }
}
