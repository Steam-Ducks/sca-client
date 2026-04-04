import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackMetric } from '@/utils/metrics'
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
    ENABLE_METRICS: true,
    API_BASE_URL: 'http://localhost:3000/api',
  },
}))

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'metric-uuid-456'),
  },
})

describe('trackMetric', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should send metric with default value', async () => {
    mockedAxios.post.mockResolvedValue({})

    await trackMetric('page_view', undefined, { page: '/home' })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/metrics/',
      {
        name: 'page_view',
        value: 1,
        labels: { page: '/home' },
        timestamp: '2024-01-01T12:00:00.000Z',
        correlation_id: 'metric-uuid-456',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  })

  it('should send metric with custom value', async () => {
    mockedAxios.post.mockResolvedValue({})

    await trackMetric('response_time', 150.5, { endpoint: '/api/users' })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/metrics/',
      {
        name: 'response_time',
        value: 150.5,
        labels: { endpoint: '/api/users' },
        timestamp: '2024-01-01T12:00:00.000Z',
        correlation_id: 'metric-uuid-456',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  })

  it('should send metric without labels', async () => {
    mockedAxios.post.mockResolvedValue({})

    await trackMetric('button_click', 1)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/metrics/',
      {
        name: 'button_click',
        value: 1,
        labels: {},
        timestamp: '2024-01-01T12:00:00.000Z',
        correlation_id: 'metric-uuid-456',
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

    await expect(trackMetric('error_metric', 1)).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith('Error while sending metric', expect.any(Error))

    consoleSpy.mockRestore()
  })

  describe('when metrics are disabled', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.doMock('@/utils/config', () => ({
        CONFIG: {
          ENABLE_METRICS: false,
          API_BASE_URL: 'http://localhost:3000/api',
        },
      }))
    })

    it('should not send metrics when ENABLE_METRICS is false', async () => {
      // Clear mocks before test
      vi.clearAllMocks()

      // Re-import to get the updated config
      const { trackMetric: disabledTrackMetric } = await import('@/utils/metrics')

      await disabledTrackMetric('disabled_metric', 1)

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })
  })

  it('should handle labels with different types', async () => {
    mockedAxios.post.mockResolvedValue({})

    await trackMetric('mixed_labels', 42, {
      string: 'text',
      number: 123,
      page: '/dashboard',
      user_id: 789,
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/metrics/',
      {
        name: 'mixed_labels',
        value: 42,
        labels: {
          string: 'text',
          number: 123,
          page: '/dashboard',
          user_id: 789,
        },
        timestamp: '2024-01-01T12:00:00.000Z',
        correlation_id: 'metric-uuid-456',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  })
})
