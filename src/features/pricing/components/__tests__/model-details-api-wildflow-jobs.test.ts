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

import { buildWildFlowJobSample } from '../../lib/wildflow-job-samples'

describe('WildFlow Job code samples', () => {
  test('renders a copyable neutral ASR request with its required artifact and idempotency key', () => {
    const sample = buildWildFlowJobSample('curl', {
      apiKeyEnv: 'NEW_API_KEY',
      modelName: 'wildflow/internal-vibevoice-faster-whisper-asr-v1',
    })

    assert.match(sample, /https:\/\/api\.wildflow\.cn\/v1\/jobs/)
    assert.match(sample, /Idempotency-Key/)
    assert.match(sample, /wildflow\/internal-vibevoice-faster-whisper-asr-v1/)
    assert.match(sample, /input_artifact_ids/)
    assert.match(sample, /输入 Artifact ID/)
  })
})
