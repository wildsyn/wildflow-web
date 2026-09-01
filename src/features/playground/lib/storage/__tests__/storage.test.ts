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

const domWindow = new Window({ url: 'https://wildflow.cn/playground' })
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: domWindow,
})
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: domWindow.localStorage,
})

const { STORAGE_KEYS, LEGACY_STORAGE_KEYS } = await import('../../../constants')
const storage = await import('../storage')
const { resolveStorageOwner, releaseStorageOwner } =
  await import('../storage-owner')

type StoredEnvelope = { version: number; data: unknown }

function readRaw(key: string): unknown | null {
  const raw = domWindow.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredEnvelope
  } catch {
    return raw
  }
}

function writeEnvelope(key: string, data: unknown): void {
  domWindow.localStorage.setItem(
    key,
    JSON.stringify({ version: 1, data } satisfies StoredEnvelope)
  )
}

const legacyConfig = {
  model: 'legacy-model',
  group: 'default',
  stream: false,
}

const legacyMessages = [
  {
    key: 'legacy-1',
    from: 'user' as const,
    versions: [{ id: 'v1', content: 'account A secret prompt' }],
  },
]

beforeEach(() => {
  domWindow.localStorage.clear()
  resolveStorageOwner(null)
})

afterEach(() => {
  domWindow.localStorage.clear()
  resolveStorageOwner(null)
})

describe('namespaced playground storage', () => {
  test('writes and reads user content only under the resolved account namespace', () => {
    resolveStorageOwner({ key: 'u-42' })

    storage.saveConfig(legacyConfig)
    storage.saveMessages(legacyMessages)
    storage.saveParameterEnabled({ temperature: false })

    const namespacedConfigKey = `${STORAGE_KEYS.CONFIG}:u-42`
    const namespacedMessagesKey = `${STORAGE_KEYS.MESSAGES}:u-42`
    const namespacedParameterEnabledKey = `${STORAGE_KEYS.PARAMETER_ENABLED}:u-42`

    assert.deepEqual(readRaw(namespacedConfigKey), {
      version: 1,
      data: legacyConfig,
    })
    assert.deepEqual(readRaw(namespacedMessagesKey), {
      version: 1,
      data: legacyMessages,
    })
    assert.deepEqual(readRaw(namespacedParameterEnabledKey), {
      version: 1,
      data: { temperature: false },
    })

    // No content may leak into un-namespaced or other-account keys.
    for (const key of [
      STORAGE_KEYS.CONFIG,
      STORAGE_KEYS.MESSAGES,
      STORAGE_KEYS.PARAMETER_ENABLED,
      `${STORAGE_KEYS.CONFIG}:u-43`,
      `${STORAGE_KEYS.MESSAGES}:u-43`,
      `${STORAGE_KEYS.PARAMETER_ENABLED}:u-43`,
    ]) {
      assert.equal(domWindow.localStorage.getItem(key), null, key)
    }

    assert.deepEqual(storage.loadConfig(), legacyConfig)
    assert.deepEqual(storage.loadMessages(), legacyMessages)
    assert.deepEqual(storage.loadParameterEnabled(), { temperature: false })
  })

  test('rejects reads and writes when no account namespace is resolved', () => {
    resolveStorageOwner(null)

    writeEnvelope(`${STORAGE_KEYS.CONFIG}:u-42`, legacyConfig)

    assert.deepEqual(storage.loadConfig(), {})
    storage.saveConfig(legacyConfig)
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.CONFIG}:u-42`),
      JSON.stringify({ version: 1, data: legacyConfig })
    )
    assert.equal(domWindow.localStorage.getItem(`${STORAGE_KEYS.CONFIG}`), null)
  })

  test('does not import legacy global keys back into an account namespace', () => {
    resolveStorageOwner({ key: 'u-42' })
    writeEnvelope(STORAGE_KEYS.CONFIG, legacyConfig)
    writeEnvelope(STORAGE_KEYS.MESSAGES, legacyMessages)
    writeEnvelope(STORAGE_KEYS.PARAMETER_ENABLED, { temperature: true })

    assert.deepEqual(storage.loadConfig(), {})
    assert.equal(storage.loadMessages(), null)
    assert.deepEqual(storage.loadParameterEnabled(), {})
  })

  test('loadMessages drops oversized namespaced payloads instead of loading them', () => {
    resolveStorageOwner({ key: 'u-42' })
    domWindow.localStorage.setItem(
      `${STORAGE_KEYS.MESSAGES}:u-42`,
      'x'.repeat(2 * 1024 * 1024)
    )

    assert.equal(storage.loadMessages(), null)
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-42`),
      null
    )
  })

  test('clearPlaygroundData removes only the current account namespace', () => {
    resolveStorageOwner({ key: 'u-42' })
    storage.saveConfig(legacyConfig)
    storage.saveMessages(legacyMessages)
    storage.saveParameterEnabled({ temperature: false })
    writeEnvelope(`${STORAGE_KEYS.CONFIG}:u-43`, legacyConfig)

    storage.clearPlaygroundData()

    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.CONFIG}:u-42`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.MESSAGES}:u-42`),
      null
    )
    assert.equal(
      domWindow.localStorage.getItem(`${STORAGE_KEYS.PARAMETER_ENABLED}:u-42`),
      null
    )
    assert.ok(domWindow.localStorage.getItem(`${STORAGE_KEYS.CONFIG}:u-43`))
  })

  test('clearPlaygroundData also wipes unproven legacy global keys', () => {
    resolveStorageOwner({ key: 'u-42' })
    writeEnvelope(STORAGE_KEYS.CONFIG, legacyConfig)
    writeEnvelope(STORAGE_KEYS.MESSAGES, legacyMessages)
    writeEnvelope(STORAGE_KEYS.PARAMETER_ENABLED, { temperature: true })

    storage.clearPlaygroundData()

    for (const key of [
      STORAGE_KEYS.CONFIG,
      STORAGE_KEYS.MESSAGES,
      STORAGE_KEYS.PARAMETER_ENABLED,
    ]) {
      assert.equal(domWindow.localStorage.getItem(key), null)
    }
  })

  test('releasing the owner clears the namespace binding without touching data', () => {
    resolveStorageOwner({ key: 'u-42' })
    storage.saveConfig(legacyConfig)

    releaseStorageOwner()

    // Reads are refused without an owner binding.
    assert.deepEqual(storage.loadConfig(), {})
    // Writes are refused too: the pre-release data stays exactly as it was.
    storage.saveConfig(legacyConfig)
    assert.deepEqual(readRaw(`${STORAGE_KEYS.CONFIG}:u-42`), {
      version: 1,
      data: legacyConfig,
    })
  })

  test('legacy key constants stay exported for boundary cleanup', () => {
    assert.deepEqual(LEGACY_STORAGE_KEYS, {
      CONFIG: 'playground_config',
      MESSAGES: 'playground_messages',
      PARAMETER_ENABLED: 'playground_parameter_enabled',
    })
  })
})

describe('cross-account isolation scenario', () => {
  test('account B never sees account A data after A signs out', () => {
    // A signs in and writes content.
    resolveStorageOwner({ key: 'u-1' })
    storage.saveConfig({ model: 'model-a' })
    storage.saveMessages(legacyMessages)

    // A signs out: the auth boundary wipes A's namespace.
    storage.clearPlaygroundData()

    // B signs in on the same browser.
    resolveStorageOwner({ key: 'u-2' })

    assert.deepEqual(storage.loadConfig(), {})
    assert.equal(storage.loadMessages(), null)
    assert.deepEqual(storage.loadParameterEnabled(), {})
  })

  test('the same account keeps its content across a page reload', () => {
    resolveStorageOwner({ key: 'u-1' })
    storage.saveConfig({ model: 'model-a', temperature: 0.3 })
    storage.saveMessages(legacyMessages)
    storage.saveParameterEnabled({ temperature: false })

    // Simulated reload: same account resolves again, fresh module state.
    resolveStorageOwner({ key: 'u-1' })

    assert.deepEqual(storage.loadConfig(), {
      model: 'model-a',
      temperature: 0.3,
    })
    assert.deepEqual(storage.loadMessages(), legacyMessages)
    assert.deepEqual(storage.loadParameterEnabled(), { temperature: false })
  })
})
