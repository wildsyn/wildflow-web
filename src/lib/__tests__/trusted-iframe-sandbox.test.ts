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
  TRUSTED_CHAT_IFRAME_SANDBOX,
  TRUSTED_WEB_PREVIEW_IFRAME_SANDBOX,
} from '../trusted-iframe-sandbox'

describe('trusted iframe sandbox capabilities', () => {
  test('preserves script and same-origin storage for Web previews', () => {
    expect(TRUSTED_WEB_PREVIEW_IFRAME_SANDBOX.split(' ')).toEqual(
      expect.arrayContaining(['allow-scripts', 'allow-same-origin'])
    )
  })

  test('preserves script and same-origin storage for trusted Chat presets', () => {
    expect(TRUSTED_CHAT_IFRAME_SANDBOX.split(' ')).toEqual(
      expect.arrayContaining(['allow-scripts', 'allow-same-origin'])
    )
  })
})
