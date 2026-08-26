# WildFlow About and open-source content

## User journey

A visitor opening the default About page can understand what WildFlow provides,
which WildFlow repositories are public, and how the project relates to
QuantumNous/new-api. The page keeps the required upstream attribution while
making clear that WildFlow is independently maintained and is not an official
New API distribution.

## TDD evidence

| Stage              | Command                                                                                           | Result                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| RED                | `bun test src/features/about/__tests__/about-content.test.ts`                                     | 0 passed, 3 failed; the old page lacked the product, repository, and upstream relationship content; checkpoint `074cb857` |
| GREEN              | Same targeted test                                                                                | 3 passed, 0 failed                                                                                                        |
| Related regression | `bun test src/features/about/__tests__/about-content.test.ts src/config/wildflow-product.test.ts` | 14 passed, 0 failed                                                                                                       |
| Static checks      | `bun run typecheck`; targeted `oxlint`; targeted `oxfmt --check`                                  | Passed                                                                                                                    |
| Release checks     | `bun run build`; `bash scripts/check-local.sh`                                                    | Passed                                                                                                                    |

`bun test --coverage` also passed for the source-contract test, but no numeric
production-code coverage is claimed because this change is user-visible copy
and semantic markup rather than executable business logic.

## Scope and boundary

- The change updates the default About page and all seven shipped locale files.
- Configured remote, HTML, and Markdown About content remains authoritative;
  the upstream attribution continues to be appended to every configured mode.
- Navigation, console features, API behavior, deployment configuration, and
  production state are unchanged.
- Repository-wide `copyright:check` remains blocked by eight pre-existing files
  outside this change; both changed TypeScript files contain the required
  copyright header.
- This change has not been pushed, merged, deployed, or browser-verified in
  production.
