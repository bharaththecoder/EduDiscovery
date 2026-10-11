export interface ChatRequest {
  message: string;
  context: Record<string, unknown> | null;
  history: { sender: 'user' | 'ai'; text: string }[];
  onChunk?: (text: string) => void;
}

export async function sendChatMessage(request: ChatRequest) {
  try {
    const { onChunk, ...bodyPayload } = request;
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to send message';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.reply || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Split on either CRLF or LF line endings
      const lines = buffer.split(/\r?\n/);
      // Retain incomplete trailing segment in buffer across chunk reads
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line === 'data: [DONE]') return { reply: fullResponse };
        
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
            // Rethrow explicit server errors
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
            console.warn('[chatApi] Skipped malformed SSE line fragment:', dataStr);
          }
        }
      }
    }

    // Flush any complete event remaining in the buffer upon stream closure
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        const dataStr = line.slice(6).trim();
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

    return { reply: fullResponse };
  } catch (error: unknown) {
    throw error;
  }
}
