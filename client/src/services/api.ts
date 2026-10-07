const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Auth ───
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(name: string, email: string, password: string, homeCity: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, homeCity }),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.json();
}

// ─── Trips ───
export async function createTrip(config: any) {
  const res = await fetch(`${API_BASE}/api/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function getTrips() {
  const res = await fetch(`${API_BASE}/api/trips`, { credentials: 'include' });
  return res.json();
}

export async function getTrip(id: string) {
  const res = await fetch(`${API_BASE}/api/trips/${id}`, { credentials: 'include' });
  return res.json();
}

export async function updateTrip(id: string, updates: any) {
  const res = await fetch(`${API_BASE}/api/trips/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteTrip(id: string) {
  const res = await fetch(`${API_BASE}/api/trips/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

// ─── SSE Streaming Trip Generation ───
export interface AgentEvent {
  agent_name: string;
  status: 'thinking' | 'working' | 'done' | 'error' | 'handoff';
  message: string;
  data?: any;
  timestamp: string;
}

export function createTripStream(
  config: any,
  onAgentEvent: (event: AgentEvent) => void,
  onTripResult: (trip: any) => void,
  onError: (error: string) => void,
  onDone: () => void,
): AbortController {
  const controller = new AbortController();

  fetch(`${API_BASE}/api/trips/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(config),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        onError('Failed to connect to agent service');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            if (data === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'agent_event') {
                onAgentEvent(parsed.event);
              } else if (parsed.type === 'trip_result') {
                onTripResult(parsed.trip);
              } else if (parsed.type === 'error') {
                onError(parsed.message);
              }
            } catch { /* skip malformed lines */ }
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message);
      }
    });

  return controller;
}

// ─── Agent Health Check ───
export async function checkAgentHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/agents/health`);
    return res.json();
  } catch {
    return { status: 'unavailable' };
  }
}

// ─── Natural Language Parse ───
export async function parseNaturalLanguage(prompt: string) {
  try {
    const res = await fetch(`${API_BASE}/api/trips/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  } catch {
    return { parsedConfig: { destination: 'Kerala, India', origin: 'Hyderabad, Telangana, India', durationDays: 5 } };
  }
}
