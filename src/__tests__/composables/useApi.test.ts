import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useApi } from "@/composables/useApi";
import { apiService } from "@/services/apiService";
import type { User } from "@/types/api";

// Mock apiService before importing useApi
vi.mock("@/services/apiService", () => ({
  apiService: {
    user: {
      fetchUsers: vi.fn(),
      createUser: vi.fn(),
    },
    health: {
      check: vi.fn(),
    },
  },
}));

describe("useApi", () => {
  let useApiInstance: ReturnType<typeof useApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000/api");
    useApiInstance = useApi();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchUsers", () => {
    it("should fetch users successfully", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          username: "user1",
          email: "user1@example.com",
          date_joined: "2024-01-01",
        },
        {
          id: 2,
          username: "user2",
          email: "user2@example.com",
          date_joined: "2024-01-02",
        },
      ];

      vi.mocked(apiService.user.fetchUsers).mockResolvedValue(mockUsers);

      const result = await useApiInstance.fetchUsers();

      expect(apiService.user.fetchUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array on error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(apiService.user.fetchUsers).mockRejectedValue(
        new Error("API Error"),
      );

      const result = await useApiInstance.fetchUsers();

      expect(apiService.user.fetchUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const createdUser: User = {
        id: 3,
        ...userData,
        date_joined: "2024-01-03",
      };

      vi.mocked(apiService.user.createUser).mockResolvedValue(createdUser);

      const result = await useApiInstance.createUser(userData);

      expect(apiService.user.createUser).toHaveBeenCalledWith(userData);
      expect(apiService.user.createUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdUser);
    });

    it("should return null on error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      vi.mocked(apiService.user.createUser).mockRejectedValue(
        new Error("API Error"),
      );

      const result = await useApiInstance.createUser(userData);

      expect(apiService.user.createUser).toHaveBeenCalledWith(userData);
      expect(apiService.user.createUser).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("healthCheck", () => {
    it("should return true when health check passes", async () => {
      vi.mocked(apiService.health.check).mockResolvedValue(true);

      const result = await useApiInstance.healthCheck();

      expect(apiService.health.check).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false when health check fails", async () => {
      vi.mocked(apiService.health.check).mockResolvedValue(false);

      const result = await useApiInstance.healthCheck();

      expect(apiService.health.check).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it("should return false when health check throws error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(apiService.health.check).mockRejectedValue(
        new Error("Connection failed"),
      );

      const result = await useApiInstance.healthCheck();

      expect(apiService.health.check).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
