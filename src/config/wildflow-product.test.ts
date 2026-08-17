import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  isSidebarModuleEnabled,
  parseHeaderNavModules,
} from '@/lib/nav-modules'
import { getDefaultSidebarModules } from '@/hooks/use-sidebar-config'
import { DEFAULT_LOGO, DEFAULT_SYSTEM_NAME } from '@/lib/constants'

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

  test('uses WildFlow brand defaults before status is loaded', () => {
    assert.equal(DEFAULT_SYSTEM_NAME, '野生流动')
    assert.equal(DEFAULT_LOGO, '/logo.png')
  })

  test('keeps unapproved commercial and upstream task entries closed by default', () => {
    const modules = getDefaultSidebarModules()

    assert.equal(modules.console.midjourney, false)
    assert.equal(modules.console.task, false)
    assert.equal(modules.personal.topup, false)
    assert.equal(modules.admin.redemption, false)
    assert.equal(modules.admin.subscription, false)
  })

  test('fails closed for direct access to unapproved sidebar modules', () => {
    assert.equal(isSidebarModuleEnabled('console', 'midjourney'), false)
    assert.equal(isSidebarModuleEnabled('console', 'task'), false)
    assert.equal(isSidebarModuleEnabled('personal', 'topup'), false)
    assert.equal(isSidebarModuleEnabled('admin', 'redemption'), false)
    assert.equal(isSidebarModuleEnabled('admin', 'subscription'), false)
  })
})
