const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer";
  expires_at?: number;
}

interface AuthSuccessEnvelope {
  ok: true;
  data: {
    user: AuthUser;
    session: AuthSession;
  };
}

interface AuthErrorEnvelope {
  ok: false;
  error?: {
    code?: string;
    message?: string;
    request_id?: string;
    requestId?: string;
  };
}

interface SuccessEnvelope<TData> {
  ok: true;
  data: TData;
}

type AuthEnvelope<TData> = SuccessEnvelope<TData> | AuthErrorEnvelope;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const USER_KEY = "glamr.auth.user";
const SESSION_KEY = "glamr.auth.session";

function getErrorMessage(payload: unknown, fallbackMessage: string) {
  const maybeEnvelope = payload as AuthErrorEnvelope | undefined;
  return maybeEnvelope?.error?.message || fallbackMessage;
}

async function postAuthPayload<TPayload, TData>(
  path: string,
  payload: TPayload,
): Promise<SuccessEnvelope<TData>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const parsedBody = (await response.json().catch(() => undefined)) as
    | AuthEnvelope<TData>
    | undefined;

  if (!response.ok || !parsedBody?.ok) {
    throw new Error(getErrorMessage(parsedBody, "Request failed. Please try again."));
  }

  return parsedBody;
}

export async function registerWithEmail(payload: RegisterPayload) {
  return postAuthPayload<RegisterPayload, AuthSuccessEnvelope["data"]>("/auth/register", payload);
}

export async function loginWithEmail(payload: LoginPayload) {
  return postAuthPayload<LoginPayload, AuthSuccessEnvelope["data"]>("/auth/login", payload);
}

export async function requestPasswordReset(email: string) {
  const response = await postAuthPayload<
    { email: string },
    { accepted: boolean; message: string }
  >("/auth/forgot-password", { email });

  return response.data;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const response = await postAuthPayload<
    { token: string; new_password: string },
    { reset: boolean }
  >("/auth/reset-password", {
    token,
    new_password: newPassword,
  });

  return response.data;
}

export function persistAuthSession(data: AuthSuccessEnvelope["data"]) {
  const expiresAt = Date.now() + data.session.expires_in * 1000;

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...data.session,
      expires_at: expiresAt,
    }),
  );

  // Set a cookie so the middleware can verify auth server-side
  const maxAge = data.session.expires_in;
  document.cookie = `glamr.auth.token=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = "glamr.auth.token=; path=/; max-age=0; SameSite=Lax";
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function isSessionExpired(): boolean {
  const session = getStoredSession();
  if (!session?.expires_at) return true;
  // Consider expired 60s early to avoid edge cases
  return Date.now() > session.expires_at - 60_000;
}

export async function refreshAccessToken(): Promise<boolean> {
  const session = getStoredSession();
  if (!session?.refresh_token) return false;

  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    const body = (await response.json().catch(() => undefined)) as
      | { ok: true; data: { session: AuthSession } }
      | { ok: false }
      | undefined;

    if (!response.ok || !body?.ok) return false;

    const newSession = (body as { ok: true; data: { session: AuthSession } }).data.session;
    const expiresAt = Date.now() + newSession.expires_in * 1000;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...newSession, expires_at: expiresAt }));
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  const session = getStoredSession();
  if (session?.refresh_token) {
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
    } catch {
      // Best-effort: clear local state regardless
    }
  }
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("glamr.studio.businessId");
  clearAuthCookie();
}
