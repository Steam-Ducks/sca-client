import { authService } from "@/services/authService";

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = authService.getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      // Skip Content-Type for FormData — browser sets it with the correct boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401 && token) {
    authService.clearSession();
    window.location.href = "/login";
  }

  return response;
}
