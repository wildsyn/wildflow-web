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

import type { WildFlowOffering } from '../../types'

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
        'First-party models': 'First-party models',
        'Voice, image, and speech recognition models':
          'Voice, image, and speech recognition models',
        Available: 'Available',
        Unavailable: 'Unavailable',
        TTS: 'TTS',
        'Image Generation': 'Image Generation',
        'Speech Recognition': 'Speech Recognition',
      },
    },
  },
})

const offerings: WildFlowOffering[] = [
  {
    id: 'VoxCPM2',
    display_name: 'VoxCPM2',
    kind: 'tts',
    vendor: 'OpenBMB',
    model_version_ref: 'openbmb/VoxCPM2',
    description: 'server description',
    required_parameters: ['voice'],
    voices: [
      { id: 'shuoshuren', name: '说书人', category: 'official' },
      { id: 'dabin', name: '大斌', category: 'official' },
      { id: 'tingting', name: '婷婷', category: 'official' },
      { id: 'default', name: '默认', category: 'official' },
      { id: 'wangliqun', name: '王立群', category: 'custom' },
    ],
    pricing: {
      currency: 'CNY',
      amount: 0.8,
      unit: '10k_characters',
      display: '¥0.8 / 万字符',
    },
    callable: true,
    status: 'available',
  },
  {
    id: 'FLUX.2 [klein] 4B',
    display_name: 'FLUX.2 [klein] 4B 图片生成',
    kind: 'image',
    vendor: 'Black Forest Labs',
    model_version_ref: 'black-forest-labs/FLUX.2-klein-4B',
    description: 'server description',
    required_parameters: [],
    voices: [],
    pricing: {
      currency: 'CNY',
      amount: 0.05,
      unit: 'image',
      display: '¥0.05 / 张',
    },
    callable: false,
    status: 'unavailable',
  },
  {
    id: 'wildflow/internal-vibevoice-faster-whisper-asr-v1',
    display_name: 'Internal Speech Recognition',
    kind: 'asr',
    vendor: 'WildFlow',
    model_version_ref: 'wildflow/internal-vibevoice-faster-whisper-asr-v1',
    description: 'Segment transcript and word timestamps.',
    required_parameters: ['input_artifact_ids'],
    pricing: {
      currency: 'CNY',
      amount: 0,
      unit: 'team_trial',
      display: '团队内测 · 暂不扣零售余额',
    },
    callable: true,
    status: 'available',
  },
]

describe('WildFlow first-party model catalog', () => {
  afterAll(() => domWindow.close())

  test('renders TTS, image, and neutral internal ASR models', async () => {
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
      [
        'VoxCPM2',
        'FLUX.2 [klein] 4B',
        'wildflow/internal-vibevoice-faster-whisper-asr-v1',
      ]
    )
    assert.equal(container.textContent?.match(/openbmb\/VoxCPM2/g)?.length, 1)
    assert.equal(container.textContent?.includes('王立群'), true)
    assert.equal(container.textContent?.includes('¥0.8 / 万字符'), true)
    assert.equal(container.textContent?.includes('¥0.05 / 张'), true)
    assert.equal(container.textContent?.includes('Unavailable'), true)
    assert.equal(container.textContent?.includes('Speech Recognition'), true)
    assert.equal(
      container.textContent?.includes('团队内测 · 暂不扣零售余额'),
      true
    )

    await act(async () => root.unmount())
    container.remove()
  })
})
