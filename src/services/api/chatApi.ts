export interface ChatRequest {
  message: string;
  context: any;
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === 'data: [DONE]') return { reply: fullResponse };
        
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (!dataStr) continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.error) throw new Error(data.error);
            if (data.text) {
              fullResponse += data.text;
              if (onChunk) onChunk(fullResponse);
            }
          } catch (e) {
            // Ignore parse errors from partial chunks if any (though SSE chunks should be complete JSON)
          }
        }
      }
    }

    return { reply: fullResponse };
  } catch (error: any) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}
