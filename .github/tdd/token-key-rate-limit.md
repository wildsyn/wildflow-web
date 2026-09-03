# API key copy rate-limit TDD evidence

## Source and user journeys

The journeys were derived from the request to make API-key copying recoverable
when the server applies an authenticated, action-scoped rate limit.

1. As a user, I see how long to wait after a 429 instead of a raw Axios error.
2. As a user, the copy control remains disabled during the server-provided
   cooldown and does not send repeated requests.
3. As a user selecting multiple keys, a batch retry also respects the active
   cooldown.

## RED and GREEN evidence

- RED: `bun test src/features/keys/lib/__tests__/rate-limit-error.test.ts
  src/features/keys/components/__tests__/api-key-rate-limit.test.tsx` failed
  because no retry parser existed and the copy button exposed no accessible
  retry state. Checkpoint: `cb329634`.
- GREEN: the same tests passed after parsing the structured body/header,
  displaying a translated countdown, and disabling repeated copy attempts.
  Checkpoint: `9b4e3a95`.
- RED: the batch regression test observed two requests during one cooldown
  instead of one. Checkpoint: `a44735a7`.
- GREEN: batch resolution now filters IDs with an active cooldown. Checkpoint:
  `41a8e671` (`fbf38ec6` contains the final test lint correction).

## Test specification

| Guarantee | Test | Type | Result |
|---|---|---|---|
| Structured `retry_after` takes precedence over the HTTP header | `lib/__tests__/rate-limit-error.test.ts` | unit | PASS |
| `Retry-After` remains a supported fallback and non-429 errors are ignored | same unit test | unit | PASS |
| Copy is disabled and exposes the countdown as an accessible label | `components/__tests__/api-key-rate-limit.test.tsx` | component | PASS |
| Repeated single and batch actions do not resend during cooldown | same component test | regression | PASS |
| Countdown text is available in every supported locale | locale JSON files | i18n contract | PASS |

## Final verification

- `bun test`: PASS, 245 tests across 55 files.
- `bun run typecheck`: PASS.
- `bun run lint`: PASS with pre-existing warnings and no errors.
- `bun run build`: PASS.
- `bun run format:check`: PASS.
- `bash scripts/check-local.sh`: PASS.
- Focused coverage: `rate-limit-error.ts` 100% functions/lines and
  `api-keys-provider.tsx` 81.14% lines. The imported component module reports
  lower aggregate coverage because it also contains unrelated table cells.

## Known boundary

The frontend behavior, build, and local gates were verified. No browser was
connected to a deployed backend, and no PR was pushed or merged. Production
deployment and a real-user copy journey remain unverified.
