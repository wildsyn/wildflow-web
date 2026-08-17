# WildFlow brand and fact boundary TDD evidence

## Red

- `bun test src/config/wildflow-product.test.ts` first failed because the
  upstream product defaults still exposed commercial/task modules and direct
  routes did not fail closed.
- The same test then failed while the public home page still rendered the
  hard-coded `50+`/`100+` statistics block.
- `bash scripts/check-brand-boundary.sh` first failed because the public logo
  was not the approved WildFlow asset and unverified external links remained.

## Green

- `bun test src/config/wildflow-product.test.ts`: 7 passed.
- `bun run typecheck`: passed.
- `bun run build`: passed.
- `bash scripts/check-local.sh`: passed.
- Changed TypeScript/TSX files pass targeted oxlint (one pre-existing
  `dangerouslySetInnerHTML` warning in the footer) and oxfmt checks.

## Known environment limits

- Repository-wide lint and format checks still report unrelated baseline
  findings outside this change. Those files were left untouched.

## Black-and-white logo regression fix

- RED: `bash scripts/check-brand-boundary.sh` rejected the colorful
  `public/logo.png` after the approved hash was changed to the existing
  black-and-white WildFlow brand asset.
- GREEN: the same command passed after `public/logo.png` was replaced with the
  canonical 180 x 180 black-and-white asset already used by WildFlow.
- Regression verification: `bun test src/config/wildflow-product.test.ts`
  passed 7 tests; `bash scripts/check-local.sh`, `bun run typecheck`, and
  `bun run build` all passed.
