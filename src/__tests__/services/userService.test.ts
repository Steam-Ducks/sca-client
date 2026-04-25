import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "@/services/userService";
import type { User } from "@/types/api";

// Mock config module
vi.mock("@/utils/config", () => ({
  CONFIG: {
    API_BASE_URL: "http://localhost:3000/api",
    ENABLE_LOGS: true,
    ENABLE_METRICS: true,
  },
}));

// Mock fetch
const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("import.meta", {
      env: {
        VITE_API_BASE_URL: "http://localhost:3000/api",
      },
    });
  });

  describe("fetchUsers", () => {
    it("should fetch users successfully", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: "user1@example.com",
          full_name: "User One",
          is_active: true,
          date_joined: "2024-01-01",
        },
        {
          id: 2,
          email: "user2@example.com",
          full_name: "User Two",
          is_active: true,
          date_joined: "2024-01-02",
        },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockUsers),
      };

      fetchMock.mockResolvedValue(mockResponse);

      const result = await userService.fetchUsers();

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/api/users/",
      );
      expect(result).toEqual(mockUsers);
    });

    it("should throw error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      };

      fetchMock.mockResolvedValue(mockResponse);

      await expect(userService.fetchUsers()).rejects.toThrow(
        "Erro ao buscar usuários",
      );
    });

    it("should throw error when fetch fails", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      await expect(userService.fetchUsers()).rejects.toThrow("Network error");
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        email: "newuser@example.com",
        full_name: "New User",
        is_active: true,
      };

      const createdUser: User = {
        id: 3,
        ...userData,
        date_joined: "2024-01-03",
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(createdUser),
      };

      fetchMock.mockResolvedValue(mockResponse);

      const result = await userService.createUser(userData);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/api/users/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );
      expect(result).toEqual(createdUser);
    });

    it("should throw error when response is not ok", async () => {
      const userData = {
        email: "newuser@example.com",
        full_name: "New User",
        is_active: true,
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
      };

      fetchMock.mockResolvedValue(mockResponse);

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Erro ao criar usuário",
      );
    });

    it("should throw error when fetch fails", async () => {
      const userData = {
        email: "newuser@example.com",
        full_name: "New User",
        is_active: true,
      };

      fetchMock.mockRejectedValue(new Error("Network error"));

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Network error",
      );
    });
  });
});
