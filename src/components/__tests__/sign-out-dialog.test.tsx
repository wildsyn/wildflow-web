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

const events: string[] = []
let logoutResponse: { success: boolean; message: string } = {
  success: true,
  message: '',
}
let logoutError: Error | null = null

const domWindow = new Window({ url: 'https://wildflow.cn/keys' })
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

const { QueryClient, QueryClientProvider } = await import(
  '@tanstack/react-query'
)
const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const i18next = (await import('i18next')).default
const { initReactI18next } = await import('react-i18next')
const en = (await import('../../i18n/locales/en.json')).default
await i18next.use(initReactI18next).init({ lng: 'en', resources: { en } })
const { SignOutDialog } = await import('../sign-out-dialog')
const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

function createRuntime() {
  return {
    logout: async () => {
      events.push('logout')
      if (logoutError) throw logoutError
      return logoutResponse
    },
    clearAuthenticatedClientState: () => {
      events.push('clear')
    },
    redirectToCentralSignOut: () => {
      events.push('redirect')
    },
  }
}

async function renderDialog() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const queryClient = new QueryClient()
  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <SignOutDialog
          open={true}
          onOpenChange={() => undefined}
          runtime={createRuntime()}
        />
      </QueryClientProvider>
    )
  })
  return { container, root }
}

async function confirmSignOut() {
  const dialog = document.querySelector('[role="alertdialog"]')
  assert.ok(dialog)
  const button = [...dialog.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === 'Sign out'
  )
  assert.ok(button)
  await act(async () => {
    button.click()
    await Promise.resolve()
  })
}

describe('SignOutDialog', () => {
  beforeEach(() => {
    events.length = 0
    logoutResponse = { success: true, message: '' }
    logoutError = null
    document.body.replaceChildren()
  })

  afterAll(() => {
    domWindow.close()
  })

  test('clears local state before central redirect after successful revocation', async () => {
    const rendered = await renderDialog()

    await confirmSignOut()

    assert.deepEqual(events, ['logout', 'clear', 'redirect'])
    await act(async () => rendered.root.unmount())
  })

  test('preserves local state and location when revocation is rejected', async () => {
    logoutResponse = { success: false, message: 'not revoked' }
    const rendered = await renderDialog()

    await confirmSignOut()

    assert.deepEqual(events, ['logout'])
    await act(async () => rendered.root.unmount())
  })

  test('preserves local state and location when revocation throws', async () => {
    logoutError = new Error('temporary failure')
    const rendered = await renderDialog()

    await confirmSignOut()

    assert.deepEqual(events, ['logout'])
    await act(async () => rendered.root.unmount())
  })
})
