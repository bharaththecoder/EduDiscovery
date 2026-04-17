export interface ChatRequest {
  message: string;
  context: any;
  history: { sender: 'user' | 'ai'; text: string }[];
}

export async function sendChatMessage(request: ChatRequest) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty response from counselor. Please try again.');
    }

    let data;
    try {
      data = JSON.parse(text);
      console.log("API response:", data);
    } catch (e) {
      console.error('Failed to parse chat response:', text);
      throw new Error('Invalid response format from counselor.');
    }

    if (!response.ok) {
      throw new Error(data.error || data.reply || 'Failed to send message');
    }

    return data;
  } catch (error: any) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}
