import { describe, it, expect } from 'vitest'
import router from '@/router'

describe('Router', () => {
  it('has the correct routes defined', () => {
    const routes = router.options.routes

    expect(routes).toHaveLength(3)

    expect(routes[0].path).toBe('/')
    expect(routes[0].name).toBe('home')

    expect(routes[1].path).toBe('/about')
    expect(routes[1].name).toBe('about')

    expect(routes[2].path).toBe('/dashboard')
    expect(routes[2].name).toBe('dashboard')
  })
})