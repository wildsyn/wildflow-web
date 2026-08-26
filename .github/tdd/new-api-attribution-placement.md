# New API attribution placement TDD evidence

## Source and user journey

No plan file was provided. The journey was derived from the request: a visitor
should see only the WildFlow copyright in the footer, while the modified AGPL
frontend continues to expose the required New API notice and original-project
link on the About page.

## RED and GREEN evidence

| Guarantee                                                             | Test                                           | Result                                                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| The footer no longer renders the New API project attribution          | `bun test src/config/wildflow-product.test.ts` | RED before implementation because `ProjectAttribution` was still present; GREEN after removal |
| About retains the exact NOTICE sentence and the original-project link | `bun test src/config/wildflow-product.test.ts` | GREEN                                                                                         |
| The affected frontend still type-checks and builds                    | `bun run typecheck`; `bun run build`           | GREEN                                                                                         |
| Repository attribution and brand checks still pass                    | `bash scripts/check-local.sh`                  | GREEN                                                                                         |

## Coverage and gaps

The source-contract test covers attribution placement, and the repository's
standard local gate covers license and brand requirements. Production browser
verification remains pending because this change has not been merged or
deployed.
