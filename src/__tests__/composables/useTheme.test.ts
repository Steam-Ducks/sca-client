import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('defaults to light theme when localStorage is empty', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const { theme } = useTheme()
      expect(theme.value).toBe('light')
    })

    it('sets data-theme="light" on document.documentElement when localStorage is empty', async () => {
      await import('@/composables/useTheme')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('reads dark theme from localStorage on init', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('@/composables/useTheme')
      const { theme } = useTheme()
      expect(theme.value).toBe('dark')
    })

    it('sets data-theme="dark" on document.documentElement when localStorage has dark', async () => {
      localStorage.setItem('theme', 'dark')
      await import('@/composables/useTheme')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('toggle', () => {
    it('switches theme from light to dark', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const { theme, toggle } = useTheme()
      toggle()
      expect(theme.value).toBe('dark')
    })

    it('switches theme from dark to light', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('@/composables/useTheme')
      const { theme, toggle } = useTheme()
      toggle()
      expect(theme.value).toBe('light')
    })

    it('updates data-theme attribute to dark after toggle', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const { toggle } = useTheme()
      toggle()
      await nextTick()
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('updates data-theme attribute to light after toggling back', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('@/composables/useTheme')
      const { toggle } = useTheme()
      toggle()
      await nextTick()
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('persists dark theme in localStorage after toggle', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const { toggle } = useTheme()
      toggle()
      await nextTick()
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('persists light theme in localStorage after toggling back from dark', async () => {
      localStorage.setItem('theme', 'dark')
      const { useTheme } = await import('@/composables/useTheme')
      const { toggle } = useTheme()
      toggle()
      await nextTick()
      expect(localStorage.getItem('theme')).toBe('light')
    })
  })

  describe('singleton behavior', () => {
    it('returns the same theme ref across multiple useTheme() calls', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const { theme: t1 } = useTheme()
      const { theme: t2 } = useTheme()
      expect(t1).toBe(t2)
    })

    it('toggle called from one instance is reflected in another instance', async () => {
      const { useTheme } = await import('@/composables/useTheme')
      const instance1 = useTheme()
      const instance2 = useTheme()
      instance1.toggle()
      expect(instance2.theme.value).toBe('dark')
    })
  })
})
