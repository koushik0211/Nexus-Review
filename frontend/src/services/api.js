const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');

export const analyzePR = async (url, options, onLog, onHitl) => {
  const bodyData = { url, ...options };
  
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to analyze PR');
  }

  // Read the Server-Sent Events (SSE) stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let resultData = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Split by SSE message separator \n\n
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop(); // Keep the last incomplete chunk in the buffer

    for (const chunk of chunks) {
      if (chunk.startsWith('data: ')) {
        const dataStr = chunk.substring(6);
        let parsed;
        try {
          parsed = JSON.parse(dataStr);
        } catch (e) {
          console.error('Failed to parse stream chunk:', chunk);
          continue;
        }

        if (parsed.type === 'log' && onLog) {
          onLog(parsed.message);
        } else if (parsed.type === 'result') {
          resultData = parsed.data;
        } else if (parsed.type === 'hitl_request') {
          if (onHitl) onHitl(parsed.data, parsed.thread_id);
          return null; // Return gracefully so frontend can show HITL UI
        } else if (parsed.type === 'error') {
          throw new Error(parsed.message); // This will now bubble up correctly
        }
      }
    }
  }

  if (!resultData) {
    throw new Error('Analysis completed but no final result was received.');
  }

  return resultData;
};

export const resumeAnalysis = async (threadId, findings, options, onLog) => {
  const bodyData = { thread_id: threadId, findings, ...options };
  
  const response = await fetch(`${API_BASE_URL}/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to resume PR analysis');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let resultData = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop();

    for (const chunk of chunks) {
      if (chunk.startsWith('data: ')) {
        const dataStr = chunk.substring(6);
        let parsed;
        try {
          parsed = JSON.parse(dataStr);
        } catch (e) {
          console.error('Failed to parse stream chunk:', chunk);
          continue;
        }

        if (parsed.type === 'log' && onLog) {
          onLog(parsed.message);
        } else if (parsed.type === 'result') {
          resultData = parsed.data;
        } else if (parsed.type === 'error') {
          throw new Error(parsed.message); // This will now bubble up correctly
        }
      }
    }
  }

  if (!resultData) {
    throw new Error('Analysis completed but no final result was received.');
  }

  return resultData;
};

export const chatWithAI = async (message, findings, history, options) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, findings, history, ...options }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Chat request failed');
  }

  const data = await response.json();
  return data.reply;
};
