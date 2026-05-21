import type { User } from "@/types/api";
import { CONFIG } from "@/utils/config";
import { apiFetch } from "@/utils/apiFetch";

const apiBaseUrl = CONFIG.API_BASE_URL;

export const userService = {
  async fetchUsers(): Promise<User[]> {
    const response = await apiFetch(`${apiBaseUrl}/users/`);
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    return response.json();
  },

  async createUser(userData: Omit<User, "id" | "date_joined">): Promise<User> {
    const response = await apiFetch(`${apiBaseUrl}/users/`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Erro ao criar usuário");
    return response.json();
  },
};
