const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function getAuth() {
	try {
		const raw = localStorage.getItem('auth');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function setAuth(data) {
	localStorage.setItem('auth', JSON.stringify(data));
}

export function clearAuth() {
	localStorage.removeItem('auth');
}

export async function apiFetch(path, { method = 'GET', body, shopId, headers = {} } = {}) {
	const auth = getAuth();
	const finalHeaders = { 'Content-Type': 'application/json', ...headers };
	if (auth?.token) finalHeaders['Authorization'] = `Bearer ${auth.token}`;
	if (shopId) finalHeaders['X-Shop-Id'] = String(shopId);
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers: finalHeaders,
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const msg = await safeJson(res);
		throw new Error(msg?.error || `HTTP ${res.status}`);
	}
	return safeJson(res);
}

async function safeJson(res) {
	try {
		return await res.json();
	} catch {
		return null;
	}
}


