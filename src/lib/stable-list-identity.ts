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

const identitiesByItem = new WeakMap<object, Map<string, string>>()
let nextIdentity = 0

export function getStableListItemIdentity(
  item: object,
  namespace: string
): string {
  let identities = identitiesByItem.get(item)
  if (!identities) {
    identities = new Map()
    identitiesByItem.set(item, identities)
  }

  const existing = identities.get(namespace)
  if (existing) return existing

  nextIdentity += 1
  const identity = `${namespace}-${nextIdentity}`
  identities.set(namespace, identity)
  return identity
}

export function inheritStableListItemIdentity<T extends object>(
  source: object,
  target: T
): T {
  const identities = identitiesByItem.get(source)
  if (identities) {
    identitiesByItem.set(target, new Map(identities))
  }
  return target
}

export function createOccurrenceKeyedItems<T>(
  items: readonly T[],
  getSignature: (item: T) => string
): Array<{ item: T; index: number; key: string }> {
  const occurrenceBySignature = new Map<string, number>()
  return items.map((item, index) => {
    const signature = getSignature(item)
    const occurrence = occurrenceBySignature.get(signature) ?? 0
    occurrenceBySignature.set(signature, occurrence + 1)
    return {
      item,
      index,
      key: JSON.stringify([signature, occurrence]),
    }
  })
}
