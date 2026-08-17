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
        'Model services': 'Model services',
        'Focused model access for practical products':
          'Focused model access for practical products',
        'The first model lineup is being connected across text, speech, and image. Model names and call availability are published in the Model Square.':
          'The first model lineup is being connected across text, speech, and image. Model names and call availability are published in the Model Square.',
        'Selected model APIs': 'Selected model APIs',
        'A focused catalog for developers and small teams, covering text, speech, and image as each model is ready.':
          'A focused catalog for developers and small teams, covering text, speech, and image as each model is ready.',
        'Deployment and adaptation': 'Deployment and adaptation',
        'Support for suitable small and medium models, from deployment evaluation to API adaptation.':
          'Support for suitable small and medium models, from deployment evaluation to API adaptation.',
        'Clear access boundaries': 'Clear access boundaries',
        'Check supported endpoints, call status, and usage guidance in the Model Square and documentation before integration.':
          'Check supported endpoints, call status, and usage guidance in the Model Square and documentation before integration.',
        Text: 'Text',
        Speech: 'Speech',
        Image: 'Image',
        'Browse Model Square': 'Browse Model Square',
      },
    },
  },
})

describe('WildFlow public model overview', () => {
  after(() => domWindow.close())

  test('describes flexible model categories without publishing hardcoded availability or model counts', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <ModelCatalog />
        </I18nextProvider>
      )
    )

    const cards = container.querySelectorAll('[data-model-capability]')
    assert.equal(cards.length, 3)
    assert.deepEqual(
      [...cards].map((card) => card.getAttribute('data-model-capability')),
      ['model-api', 'deployment', 'access-boundaries']
    )
    assert.match(container.textContent ?? '', /Text/)
    assert.match(container.textContent ?? '', /Speech/)
    assert.match(container.textContent ?? '', /Image/)
    assert.doesNotMatch(container.textContent ?? '', /Available|Unavailable/)
    assert.doesNotMatch(container.textContent ?? '', /Two voice experiences/)

    await act(async () => root.unmount())
    container.remove()
  })
})
