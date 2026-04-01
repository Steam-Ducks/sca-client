import { CONFIG } from '@/utils/config'

export const healthService = {
  async check(): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/health/`)
      return response.ok
    } catch {
      return false
    }
  },
}