# Registration closed notice

## Source and user journeys

The journeys were derived from the 2026-08-20 requirement to close WildFlow
registration while keeping existing company-internal test accounts able to sign
in.

- A visitor opening the registration page sees that registration is closed and
  cannot reach the former unified enrollment redirect.
- An existing company-internal tester opening the sign-in page sees the filing
  and testing boundary before the login form.
- A visitor who acknowledged the older compliance notice sees the revised
  registration-closed notice once because its acknowledgement version changed.

## RED and GREEN evidence

| Stage    | Command                                                                                                                                                                   | Result                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| RED      | `bun test src/features/auth/components/__tests__/registration-filing-notice.test.tsx src/features/compliance-notice/__tests__/compliance-notice-gate.test.tsx`            | Failed because the new component did not exist and the old notice still allowed designated test-user registration. |
| GREEN    | Same focused command                                                                                                                                                      | 5 passed, 0 failed.                                                                                                |
| Coverage | `bun test --coverage src/features/auth/components/__tests__/registration-filing-notice.test.tsx src/features/compliance-notice/__tests__/compliance-notice-gate.test.tsx` | 82.78% functions and 85.90% lines overall; both changed components reported 100% function coverage.                |

## Guarantees

| What is guaranteed                                                                                                                   | Test                                  | Type      | Result |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | --------- | ------ |
| The sign-in notice limits access to company-internal testers and reports registration closed, no public beta, and zero filed models. | `registration-filing-notice.test.tsx` | Component | PASS   |
| The registration notice prohibits every new registration and offers only an internal sign-in link.                                   | `registration-filing-notice.test.tsx` | Component | PASS   |
| The revised first-visit notice contains the same three filing facts and uses versioned acknowledgement persistence.                  | `compliance-notice-gate.test.tsx`     | Component | PASS   |

## Known gaps

The focused tests, typecheck, build, and local repository checks pass. The full
repository lint and test commands have unrelated pre-existing failures; these
are reported in the task handoff rather than changed in this scope. Production
configuration and browser acceptance require separate authorization and are not
claimed here.
