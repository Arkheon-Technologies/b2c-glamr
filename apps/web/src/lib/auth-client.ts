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
}