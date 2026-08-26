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

import { getMutationTargetId } from '../mutation-mode'

describe('model mutation mode', () => {
  test('returns no target for create mode', () => {
    expect(getMutationTargetId('create', null)).toBeNull()
  })

  test('returns the selected target for edit mode', () => {
    expect(getMutationTargetId('edit', 42)).toBe(42)
  })

  test('fails edit mode instead of silently creating without a target', () => {
    expect(() => getMutationTargetId('edit', null)).toThrow(
      'Edit target is unavailable'
    )
  })
})
