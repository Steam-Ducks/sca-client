import { authService } from "@/services/authService";

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = authService.getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Token expirado: limpa sessão e redireciona para login
  if (response.status === 401 && token) {
    authService.clearSession();
    window.location.href = "/login";
  }

  return response;
}
