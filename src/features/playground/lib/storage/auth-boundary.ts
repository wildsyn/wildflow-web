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
import {
  onAuthenticationBoundary,
  type AuthenticationBoundaryEvent,
} from '@/lib/auth-session'

import { LEGACY_STORAGE_KEYS } from '../../constants'
import {
  getStorageOwner,
  releaseStorageOwner,
  resolveStorageOwner,
  storageOwnerKeyFromUserId,
} from './storage-owner'

/**
 * Deterministic Playground persistence wipe for authentication boundaries.
 *
 * Removes the namespace of the resolved owner plus every legacy global key:
 * legacy keys predate namespacing, so their ownership can never be proven
 * and they must never reach a newly signed-in account. Ends with the owner
 * unbound, so anonymous states cannot read or write persisted content.
 */
export function cleanupPlaygroundPersistence(): void {
  wipeLegacyAndOwnerNamespace()
  releaseStorageOwner()
}

/**
 * Remove every legacy global key plus the namespace of the currently bound
 * owner (if one is bound). Does not change the owner binding.
 */
function wipeLegacyAndOwnerNamespace(): void {
  try {
    const currentOwner = getStorageOwner()
    const ownerKeys = currentOwner
      ? Object.values(LEGACY_STORAGE_KEYS).map(
          (key) => `${key}:${currentOwner.key}`
        )
      : []
    for (const key of [...ownerKeys, ...Object.values(LEGACY_STORAGE_KEYS)]) {
      window.localStorage.removeItem(key)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to wipe playground persistence:', error)
  }
}

/**
 * Bind the account confirmed by an `applied` boundary event.
 *
 * Any namespace already bound to a different account is wiped first: the
 * auth route group has no session guard, so a callback can apply a new
 * account while an old one is still bound. Legacy keys are always wiped:
 * their ownership can never be proven, so nothing is ever imported.
 */
function resolveOwnerFromBoundaryEvent(
  event: Extract<AuthenticationBoundaryEvent, { kind: 'applied' }>
): void {
  const currentOwner = getStorageOwner()
  const nextOwner = storageOwnerKeyFromUserId(event.userId)

  if (!currentOwner || currentOwner.key !== nextOwner.key) {
    wipeLegacyAndOwnerNamespace()
  }

  resolveStorageOwner(nextOwner)
}

/**
 * Handle an authentication boundary event: prove or clear ownership.
 *
 * - On `cleared`, wipe persistence: content was written by the signed-out
 *   account and must not survive for whoever signs in next.
 * - On `applied`, bind the account. The previous owner (if any) was already
 *   cleared on its own boundary, so nothing is imported from unknown states.
 */
export function handlePlaygroundAuthBoundary(
  event: AuthenticationBoundaryEvent
): void {
  if (event.kind === 'cleared') {
    cleanupPlaygroundPersistence()
    return
  }

  resolveOwnerFromBoundaryEvent(event)
}

/**
 * Install the boundary listener once per module instance. Idempotent; the
 * returned disposer is only needed by tests.
 */
export function installPlaygroundAuthBoundary(): () => void {
  return onAuthenticationBoundary(handlePlaygroundAuthBoundary)
}
