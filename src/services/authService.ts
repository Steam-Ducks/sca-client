import type { AuthResponse, AuthUser, LoginCredentials } from "@/types/api";
import { CONFIG } from "@/utils/config";

const TOKEN_KEY = "sca_access_token";
const USER_KEY = "sca_user";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Erro ao fazer login.");
    }
    return data as AuthResponse;
  },

  saveSession(authData: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, authData.access);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
