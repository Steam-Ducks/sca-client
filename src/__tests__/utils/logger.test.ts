import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@/utils/logger'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))
const mockedAxios = vi.mocked(axios)

// Mock CONFIG
vi.mock('@/utils/config', () => ({
  CONFIG: {
    ENABLE_LOGS: true,
    API_BASE_URL: 'http://localhost:3000/api',
  },
}))

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
})

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('info', () => {
    it('should send info log with correct payload', async () => {
      mockedAxios.post.mockResolvedValue({})

      await logger.info('Test message', { userId: 123 })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/logs/',
        {
          level: 'INFO',
          message: 'Test message',
          timestamp: '2024-01-01T12:00:00.000Z',
          context: { userId: 123 },
          correlation_id: 'test-uuid-123',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('should send info log without context', async () => {
      mockedAxios.post.mockResolvedValue({})

      await logger.info('Simple message')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/logs/',
        {
          level: 'INFO',
          message: 'Simple message',
          timestamp: '2024-01-01T12:00:00.000Z',
          correlation_id: 'test-uuid-123',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('should handle axios error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.post.mockRejectedValue(new Error('Network error'))

      await expect(logger.info('Test message')).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith('Error while sending log', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('error', () => {
    it('should send error log with correct payload', async () => {
      mockedAxios.post.mockResolvedValue({})

      await logger.error('Error message', { error: 'Test error' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/logs/',
        {
          level: 'ERROR',
          message: 'Error message',
          timestamp: '2024-01-01T12:00:00.000Z',
          context: { error: 'Test error' },
          correlation_id: 'test-uuid-123',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })

  describe('warn', () => {
    it('should send warn log with correct payload', async () => {
      mockedAxios.post.mockResolvedValue({})

      await logger.warn('Warning message', { warning: 'Test warning' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/logs/',
        {
          level: 'WARN',
          message: 'Warning message',
          timestamp: '2024-01-01T12:00:00.000Z',
          context: { warning: 'Test warning' },
          correlation_id: 'test-uuid-123',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })

  describe('when logs are disabled', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.doMock('@/utils/config', () => ({
        CONFIG: {
          ENABLE_LOGS: false,
          API_BASE_URL: 'http://localhost:3000/api',
        },
      }))
    })

    it('should not send logs when ENABLE_LOGS is false', async () => {
      // Clear mocks before test
      vi.clearAllMocks()

      // Re-import to get the updated config
      const { logger: disabledLogger } = await import('@/utils/logger')

      await disabledLogger.info('This should not be sent')

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })
  })
})
