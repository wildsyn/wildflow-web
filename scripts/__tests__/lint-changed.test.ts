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
import { afterEach, describe, test } from 'bun:test'
import assert from 'node:assert/strict'
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync, type SpawnSyncReturns } from 'node:child_process'

const lintScript = fileURLToPath(new URL('../lint-changed.sh', import.meta.url))
const temporaryRepos: string[] = []

afterEach(() => {
  for (const repo of temporaryRepos.splice(0)) {
    rmSync(repo, { recursive: true, force: true })
  }
})

function run(
  repo: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env
): SpawnSyncReturns<string> {
  return spawnSync(command, args, {
    cwd: repo,
    encoding: 'utf8',
    env,
  })
}

function runGit(repo: string, ...args: string[]): string {
  const result = run(repo, 'git', args)
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function writeRepoFile(repo: string, path: string, contents: string): void {
  const absolutePath = join(repo, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, contents)
}

function commit(repo: string, message: string): string {
  runGit(repo, 'add', '.')
  runGit(repo, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', message)
  return runGit(repo, 'rev-parse', 'HEAD')
}

function createRepo(): string {
  const repo = mkdtempSync(join(tmpdir(), 'wildflow-lint-changed-'))
  temporaryRepos.push(repo)

  runGit(repo, 'init', '-q')
  runGit(repo, 'config', 'user.name', 'WildFlow Test')
  runGit(repo, 'config', 'user.email', 'wildflow-test@example.invalid')

  mkdirSync(join(repo, 'scripts'), { recursive: true })
  copyFileSync(lintScript, join(repo, 'scripts/lint-changed.sh'))
  chmodSync(join(repo, 'scripts/lint-changed.sh'), 0o755)

  const oxlint = join(repo, 'node_modules/.bin/oxlint')
  mkdirSync(dirname(oxlint), { recursive: true })
  writeFileSync(
    oxlint,
    '#!/usr/bin/env bash\nprintf "%s\\n" "$@" > "${LINT_CAPTURE:?}"\n'
  )
  chmodSync(oxlint, 0o755)

  return repo
}

function runLint(repo: string, baseRef?: string): SpawnSyncReturns<string> {
  const capture = join(repo, 'lint-capture.txt')
  const args = ['scripts/lint-changed.sh']
  if (baseRef !== undefined) args.push(baseRef)

  return run(repo, 'bash', args, {
    ...process.env,
    LINT_CAPTURE: capture,
  })
}

function capturedFiles(repo: string): string[] {
  const lines = readFileSync(join(repo, 'lint-capture.txt'), 'utf8')
    .trim()
    .split('\n')
  return lines.slice(2).sort()
}

describe('lint-changed comparison base contract', () => {
  test('lints every source file across a multi-commit diff', () => {
    const repo = createRepo()
    writeRepoFile(repo, 'README.md', 'base\n')
    const base = commit(repo, 'base')
    writeRepoFile(repo, 'src/first.ts', 'export const first = 1\n')
    commit(repo, 'first change')
    writeRepoFile(repo, 'src/second.ts', 'export const second = 2\n')
    commit(repo, 'second change')

    const result = runLint(repo, base)

    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(capturedFiles(repo), ['src/first.ts', 'src/second.ts'])
  })

  test('fails closed for an explicitly invalid revision', () => {
    const repo = createRepo()
    writeRepoFile(repo, 'src/base.ts', 'export const base = 1\n')
    commit(repo, 'base')
    writeRepoFile(repo, 'src/current.ts', 'export const current = 2\n')
    commit(repo, 'current')

    const result = runLint(repo, 'not-a-revision')

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /unable to resolve.*not-a-revision/i)
  })

  test('fails closed for a well-formed but missing commit object', () => {
    const repo = createRepo()
    writeRepoFile(repo, 'src/base.ts', 'export const base = 1\n')
    commit(repo, 'base')
    writeRepoFile(repo, 'src/current.ts', 'export const current = 2\n')
    commit(repo, 'current')

    const missingCommit = '1111111111111111111111111111111111111111'
    const result = runLint(repo, missingCommit)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, new RegExp(`unable to resolve.*${missingCommit}`))
  })

  test('treats an all-zero before SHA as the empty tree for an initial push', () => {
    const repo = createRepo()
    writeRepoFile(repo, 'src/initial.ts', 'export const initial = 1\n')
    commit(repo, 'initial')

    const result = runLint(repo, '0000000000000000000000000000000000000000')

    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(capturedFiles(repo), ['src/initial.ts'])
  })

  test('requires the caller to provide an explicit comparison base', () => {
    const repo = createRepo()
    writeRepoFile(repo, 'src/base.ts', 'export const base = 1\n')
    commit(repo, 'base')
    writeRepoFile(repo, 'src/current.ts', 'export const current = 2\n')
    commit(repo, 'current')

    const result = runLint(repo)

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /comparison base.*required/i)
  })
})
