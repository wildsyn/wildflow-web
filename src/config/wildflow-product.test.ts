import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { getDefaultSidebarModules } from '@/hooks/use-sidebar-config'
import { mapStatusDataToConfig } from '@/hooks/use-system-config'
import { DEFAULT_LOGO, DEFAULT_SYSTEM_NAME } from '@/lib/constants'
import {
  isSidebarModuleEnabled,
  parseHeaderNavModules,
} from '@/lib/nav-modules'

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
    assert.deepEqual(
      WILDFLOW_DEFAULT_NAV_LINKS.map((link) => link.href),
      [
        '/',
        '/pricing',
        '/harness',
        'https://docs.wildflow.cn',
        '/dashboard',
      ]
    )
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
    assert.equal(DEFAULT_LOGO, '/logo.png?v=4cf4521e')
  })

  test('cache-busts the legacy logo URL returned by the backend', () => {
    assert.equal(
      mapStatusDataToConfig({ logo: '/logo.png' }).logo,
      DEFAULT_LOGO
    )
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

  test('does not publish unsupported marketing counts on the public home page', () => {
    const homeSource = readFileSync(
      new URL('../features/home/index.tsx', import.meta.url),
      'utf8'
    )
    const constantsSource = readFileSync(
      new URL('../features/home/constants.ts', import.meta.url),
      'utf8'
    )

    assert.doesNotMatch(homeSource, /<Stats\s*\/>/)
    assert.doesNotMatch(constantsSource, /DEFAULT_STATS/)
  })

  test('keeps the default home page limited to evidence-backed content', () => {
    const homeSource = readFileSync(
      new URL('../features/home/index.tsx', import.meta.url),
      'utf8'
    )
    const heroDemoSource = readFileSync(
      new URL(
        '../features/home/components/hero-terminal-demo.tsx',
        import.meta.url
      ),
      'utf8'
    )

    assert.doesNotMatch(homeSource, /<Features\s*\/>/)
    assert.doesNotMatch(homeSource, /<HowItWorks\s*\/>/)
    assert.doesNotMatch(heroDemoSource, /latency:\s*\d+/)
    assert.doesNotMatch(heroDemoSource, /tokens:\s*\d+/)
    assert.doesNotMatch(heroDemoSource, />\s*200 ok\s*</i)
  })

  test('positions the home page for developers and small teams without unverified commercial promises', () => {
    const heroSource = readFileSync(
      new URL('../features/home/components/sections/hero.tsx', import.meta.url),
      'utf8'
    )
    const ctaSource = readFileSync(
      new URL('../features/home/components/sections/cta.tsx', import.meta.url),
      'utf8'
    )
    const modelCatalogSource = readFileSync(
      new URL(
        '../features/home/components/sections/model-catalog.tsx',
        import.meta.url
      ),
      'utf8'
    )

    assert.match(heroSource, /developers and small teams/i)
    assert.doesNotMatch(heroSource, /Explore Harness/)
    assert.doesNotMatch(ctaSource, /View Pricing/)
    assert.match(
      modelCatalogSource,
      /offering\.callable[\s\S]*'Available'[\s\S]*'Unavailable'/
    )
    assert.doesNotMatch(
      modelCatalogSource,
      /Two voice experiences and one image model/
    )
  })

  test('keeps required upstream attribution on About instead of the footer', () => {
    const footerSource = readFileSync(
      new URL('../components/layout/components/footer.tsx', import.meta.url),
      'utf8'
    )
    const aboutSource = readFileSync(
      new URL('../features/about/index.tsx', import.meta.url),
      'utf8'
    )

    assert.doesNotMatch(footerSource, /ProjectAttribution/)
    assert.doesNotMatch(footerSource, /github\.com\/QuantumNous\/new-api/)
    assert.match(
      aboutSource,
      /Frontend design and development by New API contributors\./
    )
    assert.match(aboutSource, /github\.com\/QuantumNous\/new-api/)
  })
})
