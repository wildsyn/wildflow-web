import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { parseHeaderNavModules } from '@/lib/nav-modules'

import {
  WILDFLOW_DEFAULT_NAV_LINKS,
  WILDFLOW_PRODUCT,
  WILDFLOW_ROUTES,
} from './wildflow-product'

describe('WildFlow 1.0 product shell', () => {
  test('freezes the public brand and M1 route skeleton', () => {
    assert.equal(WILDFLOW_PRODUCT.name, '野生流动')
    assert.equal(WILDFLOW_PRODUCT.version, '1.0')
    assert.deepEqual(WILDFLOW_ROUTES, {
      home: '/',
      models: '/pricing',
      signIn: '/sign-in',
      console: '/dashboard',
      harness: '/harness',
    })
  })

  test('keeps only decided public entries in the fallback navigation', () => {
    assert.deepEqual(WILDFLOW_DEFAULT_NAV_LINKS.map((link) => link.href), [
      '/',
      '/pricing',
      '/harness',
      'https://github.com/wildsyn/wildflow/tree/main/docs',
      '/dashboard',
    ])
    assert.equal(
      WILDFLOW_DEFAULT_NAV_LINKS.some((link) =>
        /rank|wallet|subscription|check.?in|affiliate/i.test(link.href)
      ),
      false
    )
  })

  test('keeps rankings closed when the backend has no explicit configuration', () => {
    assert.equal(parseHeaderNavModules(undefined).rankings.enabled, false)
  })
})
