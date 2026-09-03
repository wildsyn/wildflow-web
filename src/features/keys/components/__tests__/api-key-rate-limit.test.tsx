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
import { afterEach, describe, expect, test } from 'bun:test'

import { Window } from 'happy-dom'

const domWindow = new Window()
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLButtonElement',
  'HTMLInputElement',
  'SVGElement',
  'Node',
  'Element',
  'Event',
  'PointerEvent',
  'MouseEvent',
  'FocusEvent',
  'CustomEvent',
  'MutationObserver',
  'ResizeObserver',
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
const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { api } = await import('@/lib/api')
const { ApiKeyCell } = await import('../api-keys-cells')
const { ApiKeysProvider, useApiKeys } = await import('../api-keys-provider')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'Copy API key': 'Copy API key',
        'Too many requests. Try again in {{seconds}} seconds.':
          'Too many requests. Try again in {{seconds}} seconds.',
      },
    },
  },
})

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

type ApiPost = (url: string, data?: unknown) => Promise<{ data: unknown }>
type MockableApi = { post: ApiPost }
const apiClient = api as unknown as MockableApi
const originalPost = apiClient.post
let host: HTMLDivElement | null = null
let root: ReturnType<typeof createRoot> | null = null

function BatchProbe() {
  const { keyRetryAfterSeconds, resolveRealKeysBatch } = useApiKeys()
  return (
    <button
      type='button'
      aria-label='Fetch selected API keys'
      onClick={() => void resolveRealKeysBatch([7, 8])}
    >
      {keyRetryAfterSeconds[7] || 0}
    </button>
  )
}

async function waitForButton(label: string): Promise<HTMLButtonElement> {
  const findButton = () =>
    document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  const immediate = findButton()
  if (immediate) return immediate

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const button = findButton()
      if (!button) return
      clearTimeout(timeout)
      observer.disconnect()
      resolve(button)
    })
    const timeout = setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Button not found: ${label}`))
    }, 1500)
    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    })
  })
}

afterEach(async () => {
  apiClient.post = originalPost
  if (root) {
    await act(async () => root?.unmount())
  }
  host?.remove()
  host = null
  root = null
})

describe('API key copy rate limit', () => {
  test('disables repeated copying and exposes the server retry countdown', async () => {
    let requestCount = 0
    apiClient.post = async () => {
      requestCount += 1
      throw {
        isAxiosError: true,
        response: {
          status: 429,
          data: { code: 'rate_limited', retry_after: 3 },
          headers: { 'retry-after': '3' },
        },
      }
    }

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () =>
      root?.render(
        <I18nextProvider i18n={i18n}>
          <ApiKeysProvider>
            <ApiKeyCell
              apiKey={{
                id: 7,
                name: 'shared-office-key',
                key: 'mask1234',
                status: 1,
                remain_quota: 0,
                used_quota: 0,
                unlimited_quota: true,
                expired_time: -1,
                created_time: 1,
                accessed_time: 1,
                group: 'default',
                auto_groups: null,
                cross_group_retry: false,
                model_limits_enabled: false,
                model_limits: '',
                allow_ips: '',
              }}
            />
          </ApiKeysProvider>
        </I18nextProvider>
      )
    )

    const copyButton = await waitForButton('Copy API key')
    await act(async () => copyButton.click())

    const limitedButton = await waitForButton(
      'Too many requests. Try again in 3 seconds.'
    )
    expect(limitedButton.disabled).toBe(true)
    await act(async () => limitedButton.click())
    expect(requestCount).toBe(1)
  })

  test('does not repeat a batch request while its server cooldown is active', async () => {
    let requestCount = 0
    apiClient.post = async () => {
      requestCount += 1
      throw {
        isAxiosError: true,
        response: {
          status: 429,
          data: { code: 'rate_limited', retry_after: 3 },
          headers: { 'retry-after': '3' },
        },
      }
    }

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () =>
      root?.render(
        <I18nextProvider i18n={i18n}>
          <ApiKeysProvider>
            <BatchProbe />
          </ApiKeysProvider>
        </I18nextProvider>
      )
    )

    const batchButton = await waitForButton('Fetch selected API keys')
    await act(async () => batchButton.click())
    expect(batchButton.textContent).toBe('3')
    await act(async () => batchButton.click())
    expect(requestCount).toBe(1)
  })
})
