/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { afterAll, beforeEach, describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import { Window } from 'happy-dom'

const domWindow = new Window({ url: 'https://www.wildflow.cn/sign-up' })
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLAnchorElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'getComputedStyle',
] as const

for (const key of domGlobals) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: domWindow[key],
  })
}

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const i18next = (await import('i18next')).default
const { initReactI18next } = await import('react-i18next')
const zhCN = (await import('../../../../i18n/locales/zh.json')).default
await i18next.use(initReactI18next).init({
  lng: 'zhCN',
  resources: { zhCN },
})
const { RegistrationFilingNotice } =
  await import('../registration-filing-notice')

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

async function renderNotice(variant: 'sign-in' | 'sign-up') {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<RegistrationFilingNotice variant={variant} />)
  })

  return { container, root }
}

async function unmountNotice(
  rendered: Awaited<ReturnType<typeof renderNotice>>
) {
  await act(async () => rendered.root.unmount())
  rendered.container.remove()
}

describe('RegistrationFilingNotice', () => {
  beforeEach(() => {
    document.body.replaceChildren()
  })

  afterAll(() => {
    domWindow.close()
  })

  test('explains the internal-login boundary on the sign-in page', async () => {
    const rendered = await renderNotice('sign-in')
    const content = document.body.textContent ?? ''

    assert.match(content, /仅限公司内部测试人员登录/)
    assert.match(content, /注册功能已关闭/)
    assert.match(content, /尚未开展社会或公众内测/)
    assert.match(content, /当前备案模型数量：0/)

    await unmountNotice(rendered)
  })

  test('blocks registration and only links internal users back to sign in', async () => {
    const rendered = await renderNotice('sign-up')
    const content = document.body.textContent ?? ''
    const signInLink =
      document.querySelector<HTMLAnchorElement>('a[href="/sign-in"]')

    assert.match(content, /注册暂未开放/)
    assert.match(content, /禁止任何新用户注册/)
    assert.equal(signInLink?.textContent, '公司内部人员登录')
    assert.equal(document.querySelector('form'), null)

    await unmountNotice(rendered)
  })
})
