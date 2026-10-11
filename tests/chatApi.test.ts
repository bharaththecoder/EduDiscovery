import { describe, it, expect, vi } from 'vitest';
import { sendChatMessage } from '../src/services/api/chatApi';

// Helper to create a mocked ReadableStream that yields chunks
function createMockStream(chunks: string[]) {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    }
  });
}

describe('chatApi SSE Parser Resilience', () => {
  it('correctly reassembles JSON payloads split across TCP packet boundaries', async () => {
    const chunks = [
      'data: {"te',
      'xt": "Hello, ',
      'AP Students!"}\n\n',
      'data: [DONE]\n\n'
    ];

    const stream = createMockStream(chunks);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    });
    vi.stubGlobal('fetch', mockFetch);

    const receivedChunks: string[] = [];
    const result = await sendChatMessage({
      message: 'Hello',
      context: null,
      history: [],
      onChunk: (text) => receivedChunks.push(text)
    });

    expect(result.reply).toBe('Hello, AP Students!');
    expect(receivedChunks[receivedChunks.length - 1]).toBe('Hello, AP Students!');
  });

  it('handles multiple SSE events delivered in a single chunk with CRLF line breaks', async () => {
    const chunks = [
      'data: {"text": "Top "}\r\n\r\ndata: {"text": "Engineering "}\r\n\r\ndata: {"text": "Colleges"}\r\n\r\ndata: [DONE]\r\n\r\n'
    ];

    const stream = createMockStream(chunks);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    }));

    const result = await sendChatMessage({
      message: 'Colleges query',
      context: null,
      history: []
    });

    expect(result.reply).toBe('Top Engineering Colleges');
  });

  it('correctly handles stream closure flushing final buffered event', async () => {
    const chunks = [
      'data: {"text": "Stream closed without explicit DONE marker"}\n\n'
    ];

    const stream = createMockStream(chunks);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    }));

    const result = await sendChatMessage({
      message: 'Unterminated stream test',
      context: null,
      history: []
    });

    expect(result.reply).toBe('Stream closed without explicit DONE marker');
  });

  it('surfaces explicit server error event payloads properly', async () => {
    const chunks = [
      'data: {"error": "AI rate limit exceeded"}\n\n'
    ];

    const stream = createMockStream(chunks);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    }));

    await expect(sendChatMessage({
      message: 'Rate limit trigger',
      context: null,
      history: []
    })).rejects.toThrow('AI rate limit exceeded');
  });

  it('rejects HTTP non-OK responses with server message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: 'Service Unavailable' }))
    }));

    await expect(sendChatMessage({
      message: 'HTTP error test',
      context: null,
      history: []
    })).rejects.toThrow('Service Unavailable');
  });
});
