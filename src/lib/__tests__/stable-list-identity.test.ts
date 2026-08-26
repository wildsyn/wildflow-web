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
import { describe, expect, test } from 'bun:test'

import {
  createOccurrenceKeyedItems,
  getStableListItemIdentity,
  inheritStableListItemIdentity,
} from '../stable-list-identity'

describe('stable list identities', () => {
  test('keeps editable object identity when its content changes', () => {
    const original = { label: 'tier_1' }
    const edited = { label: 'renamed' }
    const originalIdentity = getStableListItemIdentity(original, 'tier')

    inheritStableListItemIdentity(original, edited)

    expect(getStableListItemIdentity(edited, 'tier')).toBe(originalIdentity)
  })

  test('gives duplicate values distinct deterministic occurrence keys', () => {
    const first = createOccurrenceKeyedItems(['same', 'same'], (item) => item)
    const second = createOccurrenceKeyedItems(['same', 'same'], (item) => item)

    expect(new Set(first.map((entry) => entry.key)).size).toBe(2)
    expect(second.map((entry) => entry.key)).toEqual(
      first.map((entry) => entry.key)
    )
  })

  test('keeps duplicate pricing tiers and rule groups independently keyed', () => {
    const duplicateTier = { label: 'same', conditions: [{ var: 'p' }] }
    const duplicateGroup = { multiplier: 2, conditions: [{ field: 'model' }] }
    const tiers = createOccurrenceKeyedItems(
      [duplicateTier, duplicateTier],
      (tier) => JSON.stringify([tier.label, tier.conditions])
    )
    const groups = createOccurrenceKeyedItems(
      [duplicateGroup, duplicateGroup],
      (group) => JSON.stringify(group)
    )

    expect(new Set(tiers.map((entry) => entry.key)).size).toBe(2)
    expect(new Set(groups.map((entry) => entry.key)).size).toBe(2)
    expect(tiers.map((entry) => entry.item)).toEqual([
      duplicateTier,
      duplicateTier,
    ])
    expect(groups.map((entry) => entry.item)).toEqual([
      duplicateGroup,
      duplicateGroup,
    ])
  })
})
