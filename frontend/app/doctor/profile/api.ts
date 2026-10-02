const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

/** fetch() against the backend with the logged-in doctor's token attached. */
export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');

  return fetch(`${API}${path}`, { ...init, headers });
}

/** Parses a JSON response body, returning an empty object if the body is not JSON. */
export async function readJson<T>(response: Response): Promise<Partial<T>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export interface ApiMessage {
  message: string;
  error: string;
}
