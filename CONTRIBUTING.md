# Contributing

Internal task planning, priorities, ownership, and progress use self-hosted Multica as the default entry point.
This repository retains source, pull requests, CI, and release evidence; link that evidence from the corresponding
Multica task. Public issues remain available for external feedback and do not require access to internal Multica.

All changes go through pull requests against `main`. Preserve New API attribution and record upstream-derived changes in
`UPSTREAM.md`. For code changes, run the relevant local commands in `README.md` and include the results in the pull request.
Documentation-only changes require link and command checks, `git diff --check`, and `bash scripts/check-local.sh`;
they do not require an application build or a full user journey.

Do not commit `.env` files, credentials, user data, generated `dist/`, `node_modules/`, or local tool indexes.
