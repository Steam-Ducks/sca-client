import { apiService } from '@/services/apiService'
import type { User } from '@/types/api'

export const useApi = () => {
  const fetchUsers = async (): Promise<User[]> => {
    try {
      return await apiService.user.fetchUsers()
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const createUser = async (userData: Omit<User, 'id' | 'date_joined'>): Promise<User | null> => {
    try {
      return await apiService.user.createUser(userData)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const healthCheck = async (): Promise<boolean> => {
    return await apiService.health.check()
  }

  return { fetchUsers, createUser, healthCheck }
}