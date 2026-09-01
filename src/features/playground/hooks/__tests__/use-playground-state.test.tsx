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
import { afterAll, afterEach, beforeEach, describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import { Window } from 'happy-dom'

const domWindow = new Window({ url: 'https://wildflow.cn/playground' })
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

const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { useAuthStore } = await import('@/stores/auth-store')
type AuthBundle = Parameters<typeof applyAuthBundle>[0]
const { applyAuthBundle, clearAuthenticatedClientState } =
  await import('@/lib/auth-session')
const { DEFAULT_CONFIG, DEFAULT_PARAMETER_ENABLED, STORAGE_KEYS } =
  await import('@/features/playground/constants')
const { installPlaygroundAuthBoundary } =
  await import('@/features/playground/lib/storage/auth-boundary')

// Mirror app bootstrap ordering: boundary listener before any component mounts.
installPlaygroundAuthBoundary()

const { usePlaygroundState } = await import('../use-playground-state')
const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

type HookFixtures = Awaited<ReturnType<typeof usePlaygroundState>>

type Message = {
  key: string
  from: 'user' | 'assistant' | 'system'
  versions: { id: string; content: string }[]
}

function storedMessage(content: string): Message {
  return {
    key: 'm-1',
    from: 'user',
    versions: [{ id: 'v1', content }],
  }
}

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

type HookState = Pick<
  HookFixtures,
  | 'messages'
  | 'config'
  | 'parameterEnabled'
  | 'updateMessages'
  | 'updateConfig'
  | 'updateParameterEnabled'
  | 'isLoadingMessages'
>

function renderHook(): {
  state: HookState
  unmount: () => Promise<void>
} {
  const state: Partial<HookState> = {}

  function Probe() {
    const playground = usePlaygroundState()
    state.messages = playground.messages
    state.config = playground.config
    state.parameterEnabled = playground.parameterEnabled
    state.isLoadingMessages = playground.isLoadingMessages
    state.updateMessages = playground.updateMessages
    state.updateConfig = playground.updateConfig
    state.updateParameterEnabled = playground.updateParameterEnabled
    return null
  }

  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const queryClient = new QueryClient()

  void act(() => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>
    )
  })

  return {
    state: state as HookState,
    unmount: async () => {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

async function flushLoadTimer() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5))
  })
}

async function flushSaveTimer() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
  })
}

let unmountHook: (() => Promise<void>) | null = null

beforeEach(() => {
  domWindow.localStorage.clear()
  useAuthStore.getState().auth.reset('idle')
})

afterEach(async () => {
  if (unmountHook) {
    await unmountHook()
    unmountHook = null
  }
  domWindow.localStorage.clear()
  useAuthStore.getState().auth.reset('idle')
})

afterAll(() => {
  domWindow.close()
})

describe('usePlaygroundState at authentication boundaries', () => {
  test('drops in-memory messages and drops pending saves when auth is cleared while mounted', async () => {
    applyAuthBundle(makeBundle(1, 'session-a'))
    const rendered = renderHook()
    unmountHook = rendered.unmount
    await flushLoadTimer()

    await act(async () => {
      rendered.state.updateMessages([storedMessage('account A prompt')])
    })
    await flushSaveTimer()
    assert.ok(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      'sanity: message persisted for account A'
    )

    clearAuthenticatedClientState(new QueryClient())
    await flushLoadTimer()

    assert.deepEqual(rendered.state.messages, [])
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      null
    )
  })

  test('a new account applied while mounted never receives the previous account content', async () => {
    applyAuthBundle(makeBundle(1, 'session-a'))
    const rendered = renderHook()
    unmountHook = rendered.unmount
    await flushLoadTimer()

    await act(async () => {
      rendered.state.updateMessages([storedMessage('account A prompt')])
    })
    await flushSaveTimer()

    // Account switch on the same tab without a remount: B is applied while
    // the Playground is still mounted (OAuth callback path).
    clearAuthenticatedClientState(new QueryClient())
    await flushLoadTimer()
    applyAuthBundle(makeBundle(2, 'session-b'))
    await flushLoadTimer()

    // In-memory state was dropped; a fresh write from the (dropped) state
    // must not land in account B's namespace.
    await act(async () => {
      rendered.state.updateMessages([])
    })
    await flushSaveTimer()

    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-2`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-1`),
      null
    )
  })

  test('a mounted account switch also isolates config and parameter state', async () => {
    applyAuthBundle(makeBundle(1, 'session-a'))
    const rendered = renderHook()
    unmountHook = rendered.unmount
    await flushLoadTimer()

    // Account A customizes the model and parameter toggles.
    await act(async () => {
      rendered.state.updateConfig('model', 'account-a-private-model')
      rendered.state.updateConfig('temperature', 0.2)
      rendered.state.updateParameterEnabled('max_tokens', true)
    })
    await flushSaveTimer()
    assert.equal(
      rendered.state.config.model,
      'account-a-private-model',
      'sanity: account A model is active in memory'
    )

    // Account switch on the same tab without a remount: B is applied while
    // the Playground is still mounted (OAuth callback path).
    clearAuthenticatedClientState(new QueryClient())
    await flushLoadTimer()
    applyAuthBundle(makeBundle(2, 'session-b'))
    await flushLoadTimer()

    // Account B must not see account A's model or parameter state, and
    // editing a value must not persist A's full config into B's namespace.
    assert.equal(rendered.state.config.model, DEFAULT_CONFIG.model)
    assert.equal(rendered.state.config.temperature, DEFAULT_CONFIG.temperature)
    assert.deepEqual(rendered.state.parameterEnabled, DEFAULT_PARAMETER_ENABLED)

    await act(async () => {
      rendered.state.updateConfig('temperature', 0.3)
    })
    await flushSaveTimer()

    const storedBConfig = JSON.parse(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.CONFIG}:u-2`) ?? 'null'
    )
    assert.ok(storedBConfig, 'B config namespace is written after edit')
    assert.notEqual(
      storedBConfig.data?.model,
      'account-a-private-model',
      'account A model must never land in account B namespace'
    )
    assert.equal(storedBConfig.data?.model, DEFAULT_CONFIG.model)
    assert.equal(storedBConfig.data?.temperature, 0.3)

    const storedBParameterEnabled = JSON.parse(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.PARAMETER_ENABLED}:u-2`) ??
        'null'
    )
    // No parameter edit happened after the switch, so nothing about A's
    // toggles may have been persisted for B.
    assert.equal(storedBParameterEnabled, null)
  })

  test('the same account keeps persisted content across a reload', async () => {
    applyAuthBundle(makeBundle(7, 'session-a'))
    const rendered = renderHook()
    unmountHook = rendered.unmount
    await flushLoadTimer()

    await act(async () => {
      rendered.state.updateMessages([storedMessage('same account content')])
    })
    await flushSaveTimer()
    await rendered.unmount()
    unmountHook = null

    // Simulated reload: fresh module-independent state, same account.
    applyAuthBundle(makeBundle(7, 'session-a-2'))
    const reloaded = renderHook()
    unmountHook = reloaded.unmount
    await flushLoadTimer()

    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-7`) !== null,
      true
    )
  })
})
