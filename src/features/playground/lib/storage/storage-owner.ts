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
/**
 * Account namespace binding for Playground browser persistence.
 *
 * Playground content (config, messages, parameter toggles) must never be
 * readable across accounts on a shared browser. The storage module derives
 * every key from the owner resolved here, so each authenticated account gets
 * an isolated namespace and anonymous states cannot touch persisted content.
 */

export type StorageOwner = {
  key: string
}

let storageOwner: StorageOwner | null = null

const ownerChangeListeners = new Set<(owner: StorageOwner | null) => void>()

function notifyOwnerChange(owner: StorageOwner | null): void {
  for (const listener of ownerChangeListeners) {
    try {
      listener(owner)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Playground owner change listener failed:', error)
    }
  }
}

function isResolvedOwner(value: StorageOwner | null): value is StorageOwner {
  if (!value) return false
  return typeof value.key === 'string' && value.key.length > 0
}

/**
 * Subscribe to namespace binding changes. Listeners receive the new owner
 * (`null` when unbound) and should drop in-memory content written under a
 * previous owner so it can never be re-persisted under the next one.
 */
export function onStorageOwnerChange(
  listener: (owner: StorageOwner | null) => void
): () => void {
  ownerChangeListeners.add(listener)
  return () => {
    ownerChangeListeners.delete(listener)
  }
}

/**
 * Bind the account that owns persistence. Pass `null` when no account can be
 * proven: reads and writes then stay off storage entirely.
 */
export function resolveStorageOwner(owner: StorageOwner | null): void {
  const previous = storageOwner
  const next = isResolvedOwner(owner) ? { key: owner.key } : null
  if (previous?.key === next?.key) {
    return
  }

  storageOwner = next
  notifyOwnerChange(next)
}

/**
 * Release the binding without deleting persisted data. Used on sign-out after
 * the storage was wiped, and on any state where ownership is no longer known.
 */
export function releaseStorageOwner(): void {
  resolveStorageOwner(null)
}

/**
 * Current owner, or `null` when persistence must not touch storage.
 */
export function getStorageOwner(): StorageOwner | null {
  return isResolvedOwner(storageOwner) ? storageOwner : null
}

/**
 * Stable per-account storage key suffix. The numeric `user.id` is the account
 * subject issued by the API and is stable across sessions and reloads.
 */
export function storageOwnerKeyFromUserId(userId: number): StorageOwner {
  return { key: `u-${userId}` }
}
