import type { TopNavLink } from '@/components/layout/types'

export const WILDFLOW_PRODUCT = {
  name: '野生流动',
  englishName: 'WildFlow',
  version: '1.0',
  docsUrl: 'https://github.com/wildsyn/wildflow/tree/main/docs',
  sourceUrl: 'https://github.com/wildsyn/wildflow-web',
  upstreamUrl: 'https://github.com/QuantumNous/new-api',
} as const

export const WILDFLOW_ROUTES = {
  home: '/',
  models: '/pricing',
  signIn: '/sign-in',
  console: '/dashboard',
  harness: '/harness',
} as const

export const WILDFLOW_DEFAULT_NAV_LINKS: TopNavLink[] = [
  { title: '首页', href: WILDFLOW_ROUTES.home },
  { title: '模型服务', href: WILDFLOW_ROUTES.models },
  { title: 'Harness', href: WILDFLOW_ROUTES.harness },
  { title: '文档', href: WILDFLOW_PRODUCT.docsUrl, external: true },
  { title: '控制台', href: WILDFLOW_ROUTES.console },
]
