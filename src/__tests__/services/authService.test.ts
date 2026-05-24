import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthResponse } from "@/types/api";

vi.mock("@/utils/config", () => ({
  CONFIG: { API_BASE_URL: "http://localhost:8000/api" },
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

import { authService } from "@/services/authService";

const mockAuthResponse: AuthResponse = {
  access: "token_abc",
  refresh: "refresh_xyz",
  user: { id: 1, username: "admin", name: "Admin do Sistema", perfil: "Administrador" },
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("returns AuthResponse on successful login", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAuthResponse),
      });
      const result = await authService.login({ username: "admin", password: "admin123" });
      expect(result).toEqual(mockAuthResponse);
    });

    it("calls the correct endpoint with POST method", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAuthResponse),
      });
      await authService.login({ username: "admin", password: "admin123" });
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/login/",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("throws error with API message on 401", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Usuário ou senha inválidos." }),
      });
      await expect(
        authService.login({ username: "wrong", password: "wrong" }),
      ).rejects.toThrow("Usuário ou senha inválidos.");
    });

    it("throws generic error when API returns no error field", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });
      await expect(
        authService.login({ username: "x", password: "y" }),
      ).rejects.toThrow("Erro ao fazer login.");
    });

    it("throws on network failure", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));
      await expect(
        authService.login({ username: "x", password: "y" }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("saveSession", () => {
    it("stores access token in localStorage", () => {
      authService.saveSession(mockAuthResponse);
      expect(localStorage.getItem("sca_access_token")).toBe("token_abc");
    });

    it("stores user data as JSON in localStorage", () => {
      authService.saveSession(mockAuthResponse);
      expect(JSON.parse(localStorage.getItem("sca_user")!)).toEqual(
        mockAuthResponse.user,
      );
    });
  });

  describe("getToken", () => {
    it("returns stored token", () => {
      localStorage.setItem("sca_access_token", "my_token");
      expect(authService.getToken()).toBe("my_token");
    });

    it("returns null when no token stored", () => {
      expect(authService.getToken()).toBeNull();
    });
  });

  describe("getUser", () => {
    it("returns parsed user when stored", () => {
      localStorage.setItem("sca_user", JSON.stringify(mockAuthResponse.user));
      expect(authService.getUser()).toEqual(mockAuthResponse.user);
    });

    it("returns null when nothing stored", () => {
      expect(authService.getUser()).toBeNull();
    });

    it("returns null when stored value is invalid JSON", () => {
      localStorage.setItem("sca_user", "not-valid-json");
      expect(authService.getUser()).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("removes token and user from localStorage", () => {
      authService.saveSession(mockAuthResponse);
      authService.clearSession();
      expect(authService.getToken()).toBeNull();
      expect(authService.getUser()).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    function makeJWT(exp: number): string {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: "1", exp }));
      return `${header}.${payload}.signature`;
    }

    it("returns false for a valid (non-expired) token", () => {
      const future = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem("sca_access_token", makeJWT(future));
      expect(authService.isTokenExpired()).toBe(false);
    });

    it("returns true for an expired token", () => {
      const past = Math.floor(Date.now() / 1000) - 3600;
      localStorage.setItem("sca_access_token", makeJWT(past));
      expect(authService.isTokenExpired()).toBe(true);
    });

    it("returns true when no token is stored", () => {
      expect(authService.isTokenExpired()).toBe(true);
    });

    it("returns true for a malformed token", () => {
      localStorage.setItem("sca_access_token", "not.a.jwt");
      expect(authService.isTokenExpired()).toBe(true);
    });
  });

  describe("isAuthenticated", () => {
    function makeJWT(exp: number): string {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: "1", exp }));
      return `${header}.${payload}.signature`;
    }

    it("returns true when token is present and not expired", () => {
      const future = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem("sca_access_token", makeJWT(future));
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("returns false and clears session when token is expired", () => {
      const past = Math.floor(Date.now() / 1000) - 3600;
      localStorage.setItem("sca_access_token", makeJWT(past));
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getToken()).toBeNull();
    });

    it("returns false when token is absent", () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
