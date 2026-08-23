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

import { normalizeWildFlowCatalog } from '../use-wildflow-catalog'

const asrOffering = {
  id: 'wildflow/exam-replay-dual-asr-v1',
  display_name: '直播回放双 ASR',
  kind: 'asr',
  vendor: 'WildFlow',
  model_version_ref: 'wildflow/exam-replay-dual-asr-v1',
  description: 'Segment transcript and word timestamps.',
  required_parameters: ['input_artifact_ids'],
  pricing: {
    currency: 'CNY',
    amount: 0,
    unit: 'team_trial',
    display: '团队内测 · 暂不扣零售余额',
  },
  callable: true,
}

describe('WildFlow catalog normalization', () => {
  test('accepts the callable dual ASR team-trial contract', () => {
    const offerings = normalizeWildFlowCatalog([asrOffering])

    assert.equal(offerings.length, 1)
    assert.equal(offerings[0].id, 'wildflow/exam-replay-dual-asr-v1')
    assert.equal(offerings[0].kind, 'asr')
    assert.equal(offerings[0].status, 'available')
  })

  test('rejects a zero amount disguised as a retail unit price', () => {
    const offerings = normalizeWildFlowCatalog([
      {
        ...asrOffering,
        pricing: { ...asrOffering.pricing, unit: 'image' },
      },
    ])

    assert.deepEqual(offerings, [])
  })
})
