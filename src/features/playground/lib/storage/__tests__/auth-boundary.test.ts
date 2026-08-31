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
import { afterEach, beforeEach, describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import { Window } from 'happy-dom'

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
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: domWindow.localStorage,
})

const { QueryClient } = await import('@tanstack/react-query')
const { useAuthStore } = await import('@/stores/auth-store')
type AuthBundle = Parameters<typeof applyAuthBundle>[0]
const { applyAuthBundle, clearAuthenticatedClientState } =
  await import('@/lib/auth-session')
const { LEGACY_STORAGE_KEYS, STORAGE_KEYS } =
  await import('@/features/playground/constants')
const { saveMessages } =
  await import('@/features/playground/lib/storage/storage')
const { cleanupPlaygroundPersistence, installPlaygroundAuthBoundary } =
  await import('@/features/playground/lib/storage/auth-boundary')

// Mirror app bootstrap: the boundary listener is installed at startup, not
// per feature mount, so cleanup also happens when Playground never mounted.
installPlaygroundAuthBoundary()

function makeBundle(userId: number, sid: string): AuthBundle {
  return {
    access_token: 'access-token',
    token_type: 'Bearer',
    access_expires_at: Math.floor(Date.now() / 1000) + 600,
    user: {
      id: userId,
      username: `user-${userId}`,
      role: 1,
    },
    session: {
      sid,
      current: true,
      login_method: 'password',
      ip: '127.0.0.1',
      user_agent: 'test',
      created_at: 100,
      last_active_at: 100,
      expires_at: 1000,
    },
  }
}

function storedMessages() {
  return [
    {
      key: 'm-1',
      from: 'user' as const,
      versions: [{ id: 'v1', content: 'private prompt' }],
    },
  ]
}

beforeEach(() => {
  domWindow.localStorage.clear()
  useAuthStore.getState().auth.reset('idle')
})

afterEach(() => {
  domWindow.localStorage.clear()
  useAuthStore.getState().auth.reset('idle')
})

describe('playground persistence at the authentication boundary', () => {
  test('clears the namespace, unbinds the owner, and wipes legacy keys when local auth state is cleared', () => {
    applyAuthBundle(makeBundle(1, 'session-a'))
    saveMessages(storedMessages())
    domWindow.localStorage.setItem(
      LEGACY_STORAGE_KEYS.MESSAGES,
      JSON.stringify({ version: 1, data: storedMessages() })
    )
    assert.ok(domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`))

    clearAuthenticatedClientState(new QueryClient())

    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(LEGACY_STORAGE_KEYS.MESSAGES),
      null
    )
    // The namespace binding is released: without an owner, saves are dropped.
    saveMessages(storedMessages())
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      null
    )
  })

  test('the boundary wipe works when a namespace was never resolved', () => {
    domWindow.localStorage.setItem(
      LEGACY_STORAGE_KEYS.CONFIG,
      JSON.stringify({ version: 1, data: { model: 'legacy' } })
    )

    cleanupPlaygroundPersistence()

    assert.equal(
      domWindow.localStorage.getItem(LEGACY_STORAGE_KEYS.CONFIG),
      null
    )
  })

  test('account B boot does not resurrect account A playground messages', () => {
    applyAuthBundle(makeBundle(1, 'session-a'))
    saveMessages(storedMessages())
    clearAuthenticatedClientState(new QueryClient())

    applyAuthBundle(makeBundle(2, 'session-b'))

    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-2`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(LEGACY_STORAGE_KEYS.MESSAGES),
      null
    )
  })
})
