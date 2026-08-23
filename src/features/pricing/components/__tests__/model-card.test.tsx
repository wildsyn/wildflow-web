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

import type { PricingModel } from '../../types'

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
  'matchMedia',
  'customElements',
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
const { ModelCard } = await import('../model-card')

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
        Available: 'Available',
        Unavailable: 'Unavailable',
        Details: 'Details',
        Copy: 'Copy',
        'First-party model': 'First-party model',
      },
    },
  },
})

const model: PricingModel = {
  id: -10_001,
  model_name: 'VoxCPM2',
  description: 'General-purpose voice design and voice cloning.',
  vendor_name: 'OpenBMB',
  quota_type: 1,
  model_ratio: 0,
  completion_ratio: 0,
  enable_groups: [],
  tags: 'first-party,tts',
  pricing_status: 'catalog',
  catalog_callable: true,
  catalog_price_amount: 0.8,
  catalog_price_display: '¥0.8 / 万字符',
}

describe('ModelCard first-party catalog pricing state', () => {
  afterAll(() => domWindow.close())

  test('shows availability and the configured character price instead of a request price', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <ModelCard model={model} onClick={() => undefined} />
        </I18nextProvider>
      )
    )

    assert.equal(container.textContent?.includes('Available'), true)
    assert.equal(container.textContent?.includes('¥0.8 / 万字符'), true)
    assert.equal(container.textContent?.includes('/ request'), false)
    assert.equal(container.textContent?.includes('$0'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('shows an unavailable catalog state separately from configured backend pricing', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    const configuredButUnavailable: PricingModel = {
      ...model,
      id: 102,
      model_price: 0.8,
      pricing_status: undefined,
      catalog_callable: false,
    }

    try {
      await act(async () =>
        root.render(
          <I18nextProvider i18n={i18n}>
            <ModelCard
              model={configuredButUnavailable}
              onClick={() => undefined}
            />
          </I18nextProvider>
        )
      )

      assert.equal(container.textContent?.includes('Unavailable'), true)
      assert.equal(container.textContent?.includes('$0.8'), true)
      assert.equal(container.textContent?.includes('/ request'), true)
      assert.equal(container.textContent?.includes('¥0.8 / 万字符'), false)
    } finally {
      await act(async () => root.unmount())
      container.remove()
    }
  })

  test('shows the catalog display name and exact model version', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    const enrichedModel: PricingModel = {
      ...model,
      catalog_display_name: 'VoxCPM2 Voice Generation',
      catalog_model_version_ref: 'openbmb/VoxCPM2',
    }

    try {
      await act(async () =>
        root.render(
          <I18nextProvider i18n={i18n}>
            <ModelCard model={enrichedModel} onClick={() => undefined} />
          </I18nextProvider>
        )
      )

      assert.equal(
        container.textContent?.includes('VoxCPM2 Voice Generation'),
        true
      )
      assert.equal(container.textContent?.includes('openbmb/VoxCPM2'), true)
    } finally {
      await act(async () => root.unmount())
      container.remove()
    }
  })
})
