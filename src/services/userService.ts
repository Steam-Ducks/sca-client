import type { User } from '@/types/api'
import { CONFIG } from '@/utils/config'

export const userService = {
  async fetchUsers(): Promise<User[]> {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/`)
    if (!response.ok) throw new Error('Erro ao buscar usuários')
    return response.json()
  },

  async createUser(userData: Omit<User, 'id' | 'date_joined'>): Promise<User> {
    const response = await fetch(`${CONFIG.API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Erro ao criar usuário')
    return response.json()
  },
}