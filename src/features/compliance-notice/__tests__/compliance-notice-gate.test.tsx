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
import assert from 'node:assert/strict'
import { after, beforeEach, describe, test } from 'node:test'

import { Window } from 'happy-dom'

const domWindow = new Window({ url: 'https://www.wildflow.cn/sign-up' })
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLButtonElement',
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
const zhCN = (await import('../../../i18n/locales/zh.json')).default
await i18next.use(initReactI18next).init({
  lng: 'zhCN',
  resources: { zhCN },
})
const { COMPLIANCE_NOTICE_STORAGE_KEY, ComplianceNoticeGate } =
  await import('../compliance-notice-gate')
const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

async function renderGate() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <ComplianceNoticeGate>
        <main>Registration form</main>
      </ComplianceNoticeGate>
    )
  })

  return { container, root }
}

async function unmountGate(rendered: Awaited<ReturnType<typeof renderGate>>) {
  await act(async () => rendered.root.unmount())
  rendered.container.remove()
}

describe('ComplianceNoticeGate', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.body.replaceChildren()
  })

  after(() => {
    domWindow.close()
  })

  test('shows the complete notice over the existing registration page', async () => {
    const rendered = await renderGate()

    assert.match(document.body.textContent ?? '', /Registration form/)
    assert.match(document.body.textContent ?? '', /野生流动内测与合规筹备公告/)
    assert.match(document.body.textContent ?? '', /注册功能已关闭/)
    assert.match(document.body.textContent ?? '', /禁止任何新用户注册/)
    assert.match(document.body.textContent ?? '', /尚未开展社会或公众内测/)
    assert.match(document.body.textContent ?? '', /当前备案模型数量：0/)
    for (const heading of [
      '备案与资质要求',
      '内容安全审核与治理机制',
      '身份管理与日志留存',
      '税务与支付合规',
      '消费者保护',
      '上游授权与服务条款遵循',
    ]) {
      assert.match(document.body.textContent ?? '', new RegExp(heading))
    }

    await unmountGate(rendered)
  })

  test('persists acknowledgement and closes only the notice', async () => {
    const rendered = await renderGate()
    const acknowledgeButton = [...document.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('我已了解，继续浏览')
    )

    assert.ok(acknowledgeButton)
    await act(async () => acknowledgeButton.click())

    assert.equal(
      window.localStorage.getItem(COMPLIANCE_NOTICE_STORAGE_KEY),
      'acknowledged'
    )
    assert.match(document.body.textContent ?? '', /Registration form/)
    assert.equal(document.querySelector('[role="dialog"]'), null)

    await unmountGate(rendered)
  })

  test('does not repeat the same version after acknowledgement', async () => {
    window.localStorage.setItem(COMPLIANCE_NOTICE_STORAGE_KEY, 'acknowledged')
    const rendered = await renderGate()

    assert.match(document.body.textContent ?? '', /Registration form/)
    assert.equal(document.querySelector('[role="dialog"]'), null)

    await unmountGate(rendered)
  })
})
