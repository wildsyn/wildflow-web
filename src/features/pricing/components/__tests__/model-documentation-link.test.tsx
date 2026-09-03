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
import { afterAll, describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import { Window } from 'happy-dom'

const domWindow = new Window()
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'SVGElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'MutationObserver',
  'getComputedStyle',
] as const) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: domWindow[key],
  })
}

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { ModelDocumentationLink } = await import('../model-documentation-link')

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'View documentation': 'View documentation',
      },
    },
  },
})

async function renderLink(modelName: string) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () =>
    root.render(
      <I18nextProvider i18n={i18n}>
        <ModelDocumentationLink modelName={modelName} />
      </I18nextProvider>
    )
  )

  return { container, root }
}

describe('ModelDocumentationLink', () => {
  afterAll(() => domWindow.close())

  test('links VoxCPM2 to its public guide from the model detail header', async () => {
    const { container, root } = await renderLink('VoxCPM2')
    const link = container.querySelector('a')

    assert.equal(link?.textContent?.includes('View documentation'), true)
    assert.equal(
      link?.getAttribute('href'),
      'https://docs.wildflow.cn/docs/voxcpm2'
    )
    assert.equal(link?.getAttribute('target'), '_blank')
    assert.equal(link?.getAttribute('rel'), 'noreferrer')

    await act(async () => root.unmount())
    container.remove()
  })

  test('links FLUX.2 to its public guide from the model detail header', async () => {
    const { container, root } = await renderLink('FLUX.2 [klein] 4B')

    assert.equal(
      container.querySelector('a')?.getAttribute('href'),
      'https://docs.wildflow.cn/docs/flux-2-klein-4b'
    )

    await act(async () => root.unmount())
    container.remove()
  })

  test('links public ASR to its neutral guide', async () => {
    const { container, root } = await renderLink('wildflow/dual-asr-v1')

    assert.equal(
      container.querySelector('a')?.getAttribute('href'),
      'https://docs.wildflow.cn/docs/dual-asr'
    )

    await act(async () => root.unmount())
    container.remove()
  })

  test('does not show a model-specific link for undocumented models', async () => {
    const { container, root } = await renderLink('DeepSeek-V4-Flash@hefei')

    assert.equal(container.querySelector('a'), null)

    await act(async () => root.unmount())
    container.remove()
  })
})
