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

import { getRateLimitRetryAfterSeconds } from '../rate-limit-error'

describe('API key rate-limit errors', () => {
  test('uses the structured response delay for a 429 response', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 429,
        data: { code: 'rate_limited', retry_after: 17 },
        headers: { 'retry-after': '19' },
      },
    }

    expect(getRateLimitRetryAfterSeconds(error)).toBe(17)
  })

  test('falls back to Retry-After header and ignores unrelated failures', () => {
    const rateLimited = {
      isAxiosError: true,
      response: {
        status: 429,
        data: {},
        headers: { 'retry-after': '23' },
      },
    }
    const unavailable = {
      isAxiosError: true,
      response: { status: 503, data: {}, headers: {} },
    }

    expect(getRateLimitRetryAfterSeconds(rateLimited)).toBe(23)
    expect(getRateLimitRetryAfterSeconds(unavailable)).toBeNull()
  })
})
