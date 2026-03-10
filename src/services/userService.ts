import type { User } from '@/types/api'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const userService = {
  async fetchUsers(): Promise<User[]> {
    const response = await fetch(`${apiBaseUrl}/users/`)
    if (!response.ok) throw new Error('Erro ao buscar usuários')
    return response.json()
  },

  async createUser(userData: Omit<User, 'id' | 'date_joined'>): Promise<User> {
    const response = await fetch(`${apiBaseUrl}/users/`, {
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