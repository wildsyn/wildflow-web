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
import { isAxiosError } from 'axios'

function parsePositiveSeconds(value: unknown): number | null {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  return Math.ceil(seconds)
}

export function getRateLimitRetryAfterSeconds(error: unknown): number | null {
  if (!isAxiosError(error) || error.response?.status !== 429) return null

  const data = error.response.data
  if (data && typeof data === 'object' && 'retry_after' in data) {
    const seconds = parsePositiveSeconds(data.retry_after)
    if (seconds !== null) return seconds
  }

  const headers = error.response.headers
  const retryAfter =
    typeof headers?.get === 'function'
      ? headers.get('retry-after')
      : headers?.['retry-after']
  return parsePositiveSeconds(retryAfter)
}
