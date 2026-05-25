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
    authService.clearSession();
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
    it("returns parsed user after saveSession", () => {
      authService.saveSession(mockAuthResponse);
      expect(authService.getUser()).toEqual(mockAuthResponse.user);
    });

    it("returns null when nothing stored", () => {
      expect(authService.getUser()).toBeNull();
    });

    it("returns null after clearSession", () => {
      authService.saveSession(mockAuthResponse);
      authService.clearSession();
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

  describe("isAuthenticated", () => {
    it("returns true when token is present", () => {
      localStorage.setItem("sca_access_token", "some_token");
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("returns false when token is absent", () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
