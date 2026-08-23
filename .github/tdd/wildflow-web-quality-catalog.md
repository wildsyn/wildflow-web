# WildFlow Web quality and catalog merge

Date: 2026-08-24. Source issue: `wildsyn/wildflow-web#20`; parent issue: `wildsyn/wildflow#452`.

## User journeys

- An API Key user can identify the Auto group, see its ratio without clipped effects, and distinguish whether
  cross-group retry is enabled. Reduced-motion users retain the same static information without moving layers.
- A Model Square user sees current catalog availability, display name, model version, public catalog price,
  required parameters, and voices even after a same-name backend pricing row is configured.
- A reviewer can rely on the required CI baseline to execute the complete Bun suite and reject lint errors in
  changed JavaScript or TypeScript files.

## TDD evidence

| Stage | Guarantee                                                                             | Command                                                                       | Result                                                                   |
| ----- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| RED   | Same-name pricing did not retain catalog metadata                                     | `bun test src/features/pricing/lib/__tests__/wildflow-catalog.test.ts`        | 2 passed, 1 failed on seven missing catalog fields; checkpoint `d77dbb5` |
| RED   | Auto group lacked its main badge/frame                                                | `bun test src/features/keys/components/__tests__/api-key-group-cell.test.tsx` | 1 passed, 3 failed; checkpoint `d77dbb5`                                 |
| GREEN | Pricing identity and price are preserved while all catalog fields are enriched        | Same targeted catalog test                                                    | 3 passed, 0 failed                                                       |
| GREEN | Auto badge, ratio, cross-group state, and reduced-motion behavior remain user-visible | Same targeted API Key test                                                    | 4 passed, 0 failed                                                       |
| GREEN | All tests use the Bun-native runner and are discovered reliably                       | `bun test`                                                                    | 189 passed, 0 failed across 42 files                                     |
| GREEN | Changed-file lint is a required, debt-safe ratchet                                    | `bash scripts/lint-changed.sh origin/main`                                    | 43 changed source files passed                                           |
| RED   | Explicit invalid bases fell back to `HEAD^`; an all-zero initial push could not lint  | `bun test scripts/__tests__/lint-changed.test.ts`                             | 1 passed, 4 failed; checkpoint `a58e34e`                                 |
| RED   | Configured prices hid catalog unavailability and catalog identity metadata            | `bun test src/features/pricing/components/__tests__/model-card.test.tsx`      | 1 passed, 2 failed; checkpoint `a58e34e`                                 |
| RED   | Browser production TypeScript loaded Bun ambient globals                              | `bun test scripts/__tests__/typescript-boundary.test.ts`                      | 0 passed, 1 failed; checkpoint `a58e34e`                                 |
| GREEN | Multi-commit, invalid, missing-object, all-zero, and missing-base lint contracts hold | `bun test scripts/__tests__/lint-changed.test.ts`                             | 5 passed, 0 failed                                                       |
| GREEN | Backend price and catalog availability render separately; catalog identity is visible | `bun test src/features/pricing/components/__tests__/model-card.test.tsx`      | 3 passed, 0 failed                                                       |
| GREEN | Bun ambient globals are restricted to the dedicated test TypeScript project           | `bun test scripts/__tests__/typescript-boundary.test.ts`                      | 1 passed, 0 failed                                                       |
| GREEN | The expanded Bun suite remains executable                                             | `bun test`                                                                    | 197 passed, 0 failed across 44 files                                     |
| GREEN | The full branch diff remains lint-clean                                               | `bash scripts/lint-changed.sh origin/main`                                    | 47 changed source files passed                                           |
| RED   | The Node build project still loaded Bun declarations through unplugin                 | `bun test scripts/__tests__/typescript-boundary.test.ts`                      | 1 passed, 1 failed; checkpoint `a3d3e49`                                 |
| GREEN | Actual TypeScript file lists keep app and Node Bun-free while tests retain Bun        | Same targeted TypeScript boundary test                                        | 2 passed, 0 failed                                                       |
| GREEN | The final expanded Bun suite remains executable                                       | `bun test`                                                                    | 198 passed, 0 failed across 44 files                                     |

The GREEN checkpoint is the commit containing this report. `bun run typecheck`, `bun run build`,
`bash scripts/check-local.sh`, `bash -n scripts/lint-changed.sh`, the invalid-base fail-closed command,
`git diff --check`, frozen dependency install, and GitHub Actions YAML parsing also passed.

## Coverage and known gaps

`bun test --coverage` passed all 198 tests. The changed `api-key-group-cell.tsx` reports 100% function and line
coverage; `wildflow-catalog.ts` reports 88.89% function and 88.42% line coverage. The full-repository lint command
still reports 352 errors and 78 warnings in unrelated files, so CI keeps that job as explicit allowed debt while
the required baseline rejects every changed-file lint error. The protected-header format check also reports 12
pre-existing files outside this task. The Node-only TypeScript project redirects unplugin's unused optional `bun`
type import to a local no-ambient shim; runtime module resolution and the production bundle are unchanged. This
branch has not been pushed, merged, deployed, or verified in production.
