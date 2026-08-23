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
import { describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import {
  getWildFlowDefaultAnnouncements,
  getWildFlowDefaultFAQ,
  resolveWildFlowPublicContent,
} from '../wildflow-public-content'

const translate = (key: string) => key

describe('WildFlow public content defaults', () => {
  test('uses practical announcement and FAQ defaults when enabled content is empty', () => {
    const announcements = resolveWildFlowPublicContent(
      true,
      [],
      getWildFlowDefaultAnnouncements(translate)
    )
    const faq = resolveWildFlowPublicContent(
      true,
      undefined,
      getWildFlowDefaultFAQ(translate)
    )

    assert.equal(announcements.length, 1)
    assert.match(announcements[0].content, /Domestic site progress update/)
    assert.equal(faq.length, 4)
    assert.match(faq[0].question, /Who is WildFlow for/)
    assert.match(faq[2].question, /How do I confirm a model is ready/)
    assert.doesNotMatch(
      JSON.stringify({ announcements, faq }),
      /price|pricing|performance/i
    )
  })

  test('keeps configured content as the source of truth', () => {
    const configured = [{ id: 9, question: 'Configured?', answer: 'Yes.' }]

    assert.equal(
      resolveWildFlowPublicContent(
        true,
        configured,
        getWildFlowDefaultFAQ(translate)
      ),
      configured
    )
  })

  test('does not inject defaults when a content panel is disabled', () => {
    assert.deepEqual(
      resolveWildFlowPublicContent(
        false,
        [],
        getWildFlowDefaultAnnouncements(translate)
      ),
      []
    )
  })
})
