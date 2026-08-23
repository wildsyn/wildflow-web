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
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))

describe('TypeScript ambient type boundaries', () => {
  test('keeps Bun globals in the test project and out of browser production code', () => {
    const appConfig = readFileSync(
      join(projectRoot, 'tsconfig.app.json'),
      'utf8'
    )
    const testConfigPath = join(projectRoot, 'tsconfig.test.json')
    const rootConfig = JSON.parse(
      readFileSync(join(projectRoot, 'tsconfig.json'), 'utf8')
    ) as { references?: Array<{ path?: string }> }

    const appTypes = appConfig.match(/"types"\s*:\s*\[([^\]]*)\]/)?.[1]
    assert.ok(appTypes, 'tsconfig.app.json must declare ambient types')
    assert.doesNotMatch(appTypes, /["']bun["']/)
    assert.match(
      appConfig,
      /"exclude"\s*:\s*\[[^\]]*src\/\*\*\/\*\.test\.ts[^\]]*\]/s
    )

    assert.equal(existsSync(testConfigPath), true)
    const testConfig = JSON.parse(readFileSync(testConfigPath, 'utf8')) as {
      compilerOptions?: { types?: string[] }
      include?: string[]
    }
    assert.deepEqual(testConfig.compilerOptions?.types, ['node', 'bun'])
    assert.equal(testConfig.include?.includes('src/**/*.d.ts'), true)
    assert.equal(testConfig.include?.includes('src/**/*.test.ts'), true)
    assert.equal(testConfig.include?.includes('src/**/*.test.tsx'), true)
    assert.equal(testConfig.include?.includes('scripts/**/*.test.ts'), true)
    assert.equal(
      rootConfig.references?.some(
        (reference) => reference.path === './tsconfig.test.json'
      ),
      true
    )
  })
})
