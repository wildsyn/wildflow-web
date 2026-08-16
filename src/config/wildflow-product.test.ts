import { describe, expect, test } from 'bun:test'

import { parseHeaderNavModules } from '@/lib/nav-modules'

import {
  WILDFLOW_DEFAULT_NAV_LINKS,
  WILDFLOW_PRODUCT,
  WILDFLOW_ROUTES,
} from './wildflow-product'

describe('WildFlow 1.0 product shell', () => {
  test('freezes the public brand and M1 route skeleton', () => {
    expect(WILDFLOW_PRODUCT.name).toBe('野生流动')
    expect(WILDFLOW_PRODUCT.version).toBe('1.0')
    expect(WILDFLOW_ROUTES).toEqual({
      home: '/',
      models: '/pricing',
      signIn: '/sign-in',
      console: '/dashboard',
      harness: '/harness',
    })
  })

  test('keeps only decided public entries in the fallback navigation', () => {
    expect(WILDFLOW_DEFAULT_NAV_LINKS.map((link) => link.href)).toEqual([
      '/',
      '/pricing',
      '/harness',
      'https://github.com/wildsyn/wildflow/tree/main/docs',
      '/dashboard',
    ])
    expect(
      WILDFLOW_DEFAULT_NAV_LINKS.some((link) =>
        /rank|wallet|subscription|check.?in|affiliate/i.test(link.href)
      )
    ).toBeFalse()
  })

  test('keeps rankings closed when the backend has no explicit configuration', () => {
    expect(parseHeaderNavModules(undefined).rankings.enabled).toBeFalse()
  })
})
