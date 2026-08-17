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
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  buildUnifiedEnrollmentPath,
  startUnifiedEnrollment,
} from './unified-enrollment'

describe('unified Authentik enrollment', () => {
  test('uses the API enrollment route and preserves only a valid affiliate code', () => {
    assert.equal(buildUnifiedEnrollmentPath(''), '/api/oauth/oidc/enroll')
    assert.equal(
      buildUnifiedEnrollmentPath('?aff=partner%20code&redirect=https://attacker.example'),
      '/api/oauth/oidc/enroll?aff=partner+code'
    )
    assert.equal(
      buildUnifiedEnrollmentPath(`?aff=${'x'.repeat(33)}`),
      '/api/oauth/oidc/enroll'
    )
  })

  test('replaces the local password registration page', () => {
    const destinations: string[] = []
    startUnifiedEnrollment({
      search: '?aff=inviter',
      replace: (destination) => destinations.push(destination),
    })

    assert.deepEqual(destinations, [
      '/api/oauth/oidc/enroll?aff=inviter',
    ])
  })
})
