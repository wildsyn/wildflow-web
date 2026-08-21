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
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

const aboutSource = readFileSync(
  new URL('../index.tsx', import.meta.url),
  'utf8'
)

describe('WildFlow About content', () => {
  test('explains the product boundary with concrete platform capabilities', () => {
    assert.match(aboutSource, /unified model APIs/)
    assert.match(aboutSource, /durable asynchronous jobs/)
    assert.match(aboutSource, /artifact management/)
    assert.match(aboutSource, /usage-based billing/)
    assert.match(aboutSource, /third-party model services/)
    assert.match(aboutSource, /self-hosted GPU inference resources/)
    assert.match(aboutSource, /reusable solutions for specific scenarios/)
  })

  test('lists the public Web and API repositories with clear ownership', () => {
    assert.match(aboutSource, /Open-source projects/)
    assert.match(aboutSource, /github\.com\/wildsyn\/wildflow-web/)
    assert.match(aboutSource, /Frontend, Model Square, and Console/)
    assert.match(aboutSource, /github\.com\/wildsyn\/wildflow-api/)
    assert.match(aboutSource, /Public API and commercial control plane/)
    assert.match(aboutSource, /LICENSE, NOTICE, and repository documentation/)
    assert.doesNotMatch(aboutSource, /WildFlow source repository:/)
  })

  test('states the upstream relationship without presenting WildFlow as official New API', () => {
    assert.match(aboutSource, /Upstream project and acknowledgements/)
    assert.match(aboutSource, /fixed revision of QuantumNous\/new-api/)
    assert.match(aboutSource, /independently maintained derivative project/)
    assert.match(aboutSource, /not an official New API distribution/)
    assert.match(
      aboutSource,
      /Frontend design and development by New API contributors\./
    )
    assert.match(aboutSource, /View the New API upstream project/)
    assert.match(aboutSource, /GNU AGPL v3\.0/)
    assert.doesNotMatch(aboutSource, />\s*New API source\s*</)
  })
})
