import { describe, it, expect, vi, beforeEach } from 'vitest'
import { healthService } from '@/services/healthService'

// Mock config module
vi.mock('@/utils/config', () => ({
  CONFIG: {
    API_BASE_URL: 'http://localhost:3000/api',
    ENABLE_LOGS: true,
    ENABLE_METRICS: true,
  },
}))

// Mock fetch
const fetchMock = vi.fn()
globalThis.fetch = fetchMock

describe('healthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3000/api'
      }
    })
  })

  describe('check', () => {
    it('should return true when health check is successful', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
      }

      fetchMock.mockResolvedValue(mockResponse)

      const result = await healthService.check()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/health/')
      expect(result).toBe(true)
    })

    it('should return false when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      }

      fetchMock.mockResolvedValue(mockResponse)

      const result = await healthService.check()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/health/')
      expect(result).toBe(false)
    })

    it('should return false when fetch throws error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'))

      const result = await healthService.check()

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/health/')
      expect(result).toBe(false)
    })

    it('should return false when fetch throws any error', async () => {
      fetchMock.mockRejectedValue(new TypeError('Connection timeout'))

      const result = await healthService.check()

      expect(result).toBe(false)
    })
  })
})