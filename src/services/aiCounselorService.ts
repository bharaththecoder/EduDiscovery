import { University } from '@/types';
import { computeFitScore, parseRankToNumber } from '@/utils/intelligenceEngine';
import { CounselingPreferences } from '@/hooks/useCounselingPreferences';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'huggingface' | 'local';
  timestamp: number;
}

export interface CounselorResponse {
  reply: string;
  source: 'huggingface' | 'local';
}

const HF_SPACE_URL = (import.meta.env.VITE_HF_SPACE_URL as string | undefined)?.replace(/\/+$/, '') || '';
const REQUEST_TIMEOUT_MS = 35000;

/**
 * Builds a compact, verified context string from the candidate's preferences
 * and top matching colleges so the LLM gives grounded AP EAPCET answers.
 */
export function buildCandidateContext(
  prefs: CounselingPreferences,
  universities: University[]
): string {
  const numericRank = parseRankToNumber(prefs.rank);
  const scored = universities
    .map((u) => ({
      uni: u,
      fit: computeFitScore(u, {
        rank: numericRank,
        branches: prefs.branches,
        budget: prefs.budget,
        location: prefs.region,
      }),
    }))
    .sort((a, b) => b.fit.probability - a.fit.probability)
    .slice(0, 6);

  const collegeLines = scored
    .map(
      ({ uni, fit }) =>
        `- ${uni.name} (${uni.code || uni.shortName}, ${uni.city}, NAAC ${uni.naac}, Convenor Fee: ₹${(uni.convenerFee || 70000).toLocaleString('en-IN')}/yr, Fit: ${fit.probability}% ${fit.label})`
    )
    .join('\n');

  return [
    `Candidate Rank: #${numericRank.toLocaleString('en-IN')}`,
    `Category: ${prefs.category} | Gender: ${prefs.gender} | Region: ${prefs.region}`,
    `Preferred Branches: ${prefs.branches.join(', ')}`,
    collegeLines ? `Top Matched AP Colleges:\n${collegeLines}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Generates an instant, grounded local response using verified EduDiscovery
 * cutoff, fee, and branch intelligence when the Hugging Face Space is
 * unconfigured, sleeping, or times out.
 */
export function generateLocalCounselorReply(
  query: string,
  prefs: CounselingPreferences,
  universities: University[]
): string {
  const q = query.toLowerCase();
  const numericRank = parseRankToNumber(prefs.rank);

  // 1. JVD / Fee / Scholarship Guidance
  if (q.includes('jvd') || q.includes('fee') || q.includes('reimbursement') || q.includes('scholarship') || q.includes('tuition')) {
    return [
      `### APHERMC Fees & JVD Fee Reimbursement`,
      `For AP EAPCET Category-A (Convenor Quota) seats:`,
      `- **Jagananna Vidya Deevena (JVD):** Eligible students with family income under ₹2.5L/year receive **100% tuition fee reimbursement** directly for Convenor Quota seats in affiliated & autonomous colleges.`,
      `- **Typical Convenor Fee Range:** Most top AP autonomous colleges charge **₹50,000 – ₹1,05,000/year** as fixed by APHERMC.`,
      `- **Deemed/Private Universities:** Category-A EAPCET seats (typically 35% quota) have regulated fees, while Category-B Management seats do not qualify for JVD.`,
      `\nTip: Check any college's **Programs & Fees** tab on EduDiscovery for exact APHERMC G.O. fee breakdowns.`,
    ].join('\n');
  }

  // 2. Branch & Career Guidance (only when NOT asking for college recommendations)
  const isAskingForColleges =
    q.includes('college') ||
    q.includes('colleges') ||
    q.includes('best') ||
    q.includes('top') ||
    q.includes('recommend') ||
    q.includes('suggest') ||
    q.includes('my rank');

  if (!isAskingForColleges && (q.includes('branch') || q.includes('cse') || q.includes('ai') || q.includes('ece') || q.includes('career') || q.includes('scope'))) {
    return [
      `### Engineering Branch & Career Guidance (2026)`,
      `- **CSE (Computer Science):** Broadest software engineering foundation, highest placement volume across product & service companies.`,
      `- **CSM / CSD (AI, ML & Data Science):** Ideal if you enjoy math, Python, and data modeling. Shares ~80% core syllabus with CSE.`,
      `- **IT (Information Technology):** Nearly identical software job opportunities to CSE, often with slightly more accessible EAPCET closing ranks.`,
      `- **ECE (Electronics & Comm.):** Dual advantage—eligible for both **VLSI/Embedded core hardware** roles and **IT/Software** placements.`,
      `\nFor your rank **#${numericRank.toLocaleString('en-IN')}**, prioritize **CSE/IT/CSM** in Target colleges before falling back to ECE in Dream colleges.`,
    ].join('\n');
  }

  // 3. Web Options Strategy
  if (q.includes('web option') || q.includes('priority') || q.includes('dream') || q.includes('target') || q.includes('safe') || q.includes('allotment')) {
    return [
      `### AP EAPCET Web-Options Priority Strategy`,
      `APSCHE processes your choices strictly from **Option #1 downwards**:`,
      `1. **Top 20% — Dream Choices:** Put ambitious colleges/branches first. There is **zero penalty** if you don't get them.`,
      `2. **Middle 50% — Target Choices:** Colleges where your rank **#${numericRank.toLocaleString('en-IN')}** sits right around the 3-year closing rank.`,
      `3. **Bottom 30% — Safe Choices:** Guaranteed backup seats so you never miss allotment in Phase 1.`,
      `\nOpen the **Web Options** tab in the navigation bar to auto-generate and export your Dream → Target → Safe sheet.`,
    ].join('\n');
  }

  // 4. Default: Rank-based College Recommendations
  const scored = universities
    .map((u) => ({
      uni: u,
      fit: computeFitScore(u, {
        rank: numericRank,
        branches: prefs.branches,
        budget: prefs.budget,
        location: prefs.region,
      }),
    }))
    .sort((a, b) => b.fit.probability - a.fit.probability)
    .slice(0, 4);

  if (scored.length === 0) {
    return `I can help you with AP EAPCET rank predictions, college comparisons, JVD fee eligibility, and branch guidance. Try asking about **CSE vs AI/ML**, **Web Options ordering**, or **JVD fees**!`;
  }

  const list = scored
    .map(
      ({ uni, fit }, idx) =>
        `${idx + 1}. **${uni.name}** (${uni.city}) — *${fit.probability}% ${fit.label} Fit* · Convenor Fee: ₹${(uni.convenerFee || 70000).toLocaleString('en-IN')}/yr`
    )
    .join('\n');

  return [
    `### Top Matches for Rank #${numericRank.toLocaleString('en-IN')} (${prefs.category})`,
    list,
    `\nAsk me to **compare branches**, explain **Web Options ordering**, or check **JVD fee reimbursement**!`,
  ].join('\n');
}

/**
 * Sends a message to the free Hugging Face Space (ZeroGPU) endpoint if configured,
 * and seamlessly falls back to the local grounded EAPCET engine on timeout or error.
 */
export async function askAiCounselor(
  message: string,
  history: ChatMessage[],
  prefs: CounselingPreferences,
  universities: University[]
): Promise<CounselorResponse> {
  if (!HF_SPACE_URL) {
    return {
      reply: generateLocalCounselorReply(message, prefs, universities),
      source: 'local',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const context = buildCandidateContext(prefs, universities);
    const enrichedMessage = context
      ? `[Candidate Context]\n${context}\n\n[Question]\n${message}`
      : message;

    const formattedHistory = history.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Step 1: Call Gradio's native /gradio_api/call/gradio_chat endpoint (1 parameter: message)
    const initRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/gradio_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        data: [enrichedMessage],
      }),
    });

    if (!initRes.ok) {
      throw new Error(`HF Space returned ${initRes.status}`);
    }

    const initData = await initRes.json();
    const eventId = initData?.event_id;
    if (!eventId) {
      throw new Error('Missing event_id from Gradio');
    }

    // Step 2: Read the SSE result stream
    const streamRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/gradio_chat/${eventId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!streamRes.ok) {
      throw new Error(`HF Space stream returned ${streamRes.status}`);
    }

    const sseText = await streamRes.text();
    const lines = sseText.split(/\r?\n/);

    // Check if Gradio returned an explicit error event (e.g. ZeroGPU quota exceeded)
    const errorIdx = lines.findIndex((l) => l.trim() === 'event: error');
    if (errorIdx !== -1 && lines[errorIdx + 1]?.startsWith('data: ')) {
      try {
        const errObj = JSON.parse(lines[errorIdx + 1].slice(6));
        throw new Error(errObj?.error || errObj?.title || 'HF Space error event');
      } catch (e) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e;
      }
    }

    // Find the last non-null `data: [...]` line (Gradio's `event: complete` payload)
    const dataLine = [...lines]
      .reverse()
      .find((line) => line.startsWith('data: ') && line !== 'data: null');

    if (dataLine) {
      const parsed = JSON.parse(dataLine.slice(6));
      const reply = Array.isArray(parsed) ? parsed[0] : parsed;
      if (typeof reply === 'string' && reply.trim()) {
        return { reply: reply.trim(), source: 'huggingface' };
      }
    }
    throw new Error('Empty reply from HF Space');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[EduAI] HF Space fallback triggered:', err);
    return {
      reply: generateLocalCounselorReply(message, prefs, universities),
      source: 'local',
    };
  }
}
