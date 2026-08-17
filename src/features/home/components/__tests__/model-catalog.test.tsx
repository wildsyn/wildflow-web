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
import { after, describe, test } from 'node:test'

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
const { ModelCatalog } = await import('../sections/model-catalog')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'First-party models': 'First-party models',
        'Two voice experiences and one image model':
          'Two voice experiences and one image model',
        'VoxCPM2 Standard TTS': 'VoxCPM2 Standard TTS',
        'VoxCPM2 Wang Liqun Premium Voice':
          'VoxCPM2 Wang Liqun Premium Voice',
        'FLUX.2 [klein] 4B Image Generation':
          'FLUX.2 [klein] 4B Image Generation',
        'General-purpose voice design and voice cloning.':
          'General-purpose voice design and voice cloning.',
        'A premium Wang Liqun voice profile on the same VoxCPM2 foundation model.':
          'A premium Wang Liqun voice profile on the same VoxCPM2 foundation model.',
        'Open-source image generation for Chinese and English prompts.':
          'Open-source image generation for Chinese and English prompts.',
        Available: 'Available',
        Unavailable: 'Unavailable',
        TTS: 'TTS',
        'Image Generation': 'Image Generation',
      },
    },
  },
})

const offerings = [
  {
    id: 'tts-standard',
    display_name: 'server title',
    kind: 'tts' as const,
    vendor: 'OpenBMB',
    model_version_ref: 'openbmb/VoxCPM2',
    profile: 'standard',
    description: 'server description',
    callable: true,
    status: 'available' as const,
  },
  {
    id: 'tts-premium',
    display_name: 'server title',
    kind: 'tts' as const,
    vendor: 'OpenBMB',
    model_version_ref: 'openbmb/VoxCPM2',
    profile: 'wangliqun-premium',
    description: 'server description',
    callable: true,
    status: 'available' as const,
  },
  {
    id: 'flux2-klein-4b',
    display_name: 'server title',
    kind: 'image' as const,
    vendor: 'Black Forest Labs',
    model_version_ref: 'black-forest-labs/FLUX.2-klein-4B',
    profile: 'default',
    description: 'server description',
    callable: false,
    status: 'unavailable' as const,
  },
]

describe('WildFlow first-party model catalog', () => {
  after(() => domWindow.close())

  test('renders two TTS offerings and one image offering without inventing a third foundation model', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <ModelCatalog offerings={offerings} />
        </I18nextProvider>
      )
    )

    const cards = container.querySelectorAll('[data-model-offering]')
    assert.equal(cards.length, 3)
    assert.deepEqual(
      [...cards].map((card) => card.getAttribute('data-model-offering')),
      ['tts-standard', 'tts-premium', 'flux2-klein-4b']
    )
    assert.equal(
      container.textContent?.match(/openbmb\/VoxCPM2/g)?.length,
      2
    )
    assert.equal(
      container.textContent?.includes('VoxCPM2 Wang Liqun Premium Voice'),
      true
    )
    assert.equal(container.textContent?.includes('Unavailable'), true)
    assert.equal(container.textContent?.includes('server title'), false)

    await act(async () => root.unmount())
    container.remove()
  })
})
