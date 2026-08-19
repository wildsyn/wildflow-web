# First-party model documentation links

## User journey

Users viewing VoxCPM2 or FLUX.2 [klein] 4B in the Model Square can open the matching public guide. Models without a
dedicated guide do not show a misleading link.

## TDD evidence

| Stage | Command | Result |
| --- | --- | --- |
| RED | `bun test src/features/pricing/components/__tests__/model-documentation-link.test.tsx` | Missing component, as expected; checkpoint `3bc8a197` |
| GREEN | Same targeted test | 3/3 passed; implementation checkpoint `2cf8395a` |
| Coverage | `bun test --coverage src/features/pricing/components/__tests__/model-documentation-link.test.tsx` | Component functions and lines 100% |

The pricing test scope passed 6/6, typecheck and production build passed, changed TypeScript files passed targeted
oxlint, and `bash scripts/check-local.sh` passed. Full-repository lint/format/copyright remain blocked by unrelated
pre-existing baseline findings. This branch has not been pushed, merged, deployed, or verified in production.
