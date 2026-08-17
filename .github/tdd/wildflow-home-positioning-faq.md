# WildFlow home positioning and public content TDD evidence

## Source and journeys

No plan file was supplied. The implemented journeys were derived from the task:

- A developer or small team can understand WildFlow's focused model API and deployment positioning without reading unverified prices, performance figures, availability badges, or a fixed model count.
- A visitor can see a practical domestic-site progress notice and FAQ, while configured console content remains authoritative and explicitly disabled panels remain empty.

## RED and GREEN

| Guarantee                                                                                                                      | Test target                                                     | RED evidence                                                                                        | GREEN evidence                                           |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| The public model overview uses flexible text, speech, and image categories without availability labels or a fixed model count. | `src/features/home/components/__tests__/model-catalog.test.tsx` | `ModelCatalog` still required the old offering list and failed when the new behavior was exercised. | Targeted Bun test passes.                                |
| The home positioning removes Harness-first and unverified commercial messaging.                                                | `src/config/wildflow-product.test.ts`                           | The old Hero lacked the developer and small-team positioning and still exposed the Harness CTA.     | Targeted Bun test passes.                                |
| Default announcement and FAQ content appears only when enabled content has no configured entries.                              | `src/config/__tests__/wildflow-public-content.test.ts`          | The public-content module did not exist.                                                            | Three fallback, override, and disabled-state tests pass. |

## Verification

- `bun test src/features/home/components/__tests__/model-catalog.test.tsx src/config/__tests__/wildflow-public-content.test.ts src/config/wildflow-product.test.ts` — 15 passed, 0 failed.
- `bun test --coverage ...` — changed modules `wildflow-public-content.ts` and `model-catalog.tsx` report 100% function and line coverage; aggregate coverage includes unrelated imported modules and is 34.81% functions / 44.60% lines.
- `bun run typecheck` — passed.
- Affected-file `oxlint` — passed with one pre-existing `dangerouslySetInnerHTML` warning in the footer.
- Affected-file `oxfmt --check` — passed.
- `bun run build` — passed.
- `bash scripts/check-local.sh` — passed, including license and New API attribution checks.

No checkpoint commits were created because this task explicitly prohibits commits.
