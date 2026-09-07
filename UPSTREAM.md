# Upstream baseline

- `repository`: https://github.com/QuantumNous/new-api
- `release`: `v1.0.0-rc.34`
- `upstream_baseline`: `0c76e4dae77a279e015329b7478e6f02d6b62edd`
- `source_path`: `web/`
- `filtered_history_head`: `7a111f19180c68c466c7639ee62a49182e96f750`
- `initial_baseline_tag`: `upstream/v1.0.0-rc.24`
- `candidate_status`: isolated paired evaluation; not approved for production
- `imported_at`: `2026-09-07`
- `license`: AGPL-3.0; see `LICENSE`, `NOTICE`, `THIRD-PARTY-LICENSES.md`
- `required_attribution`: “Frontend design and development by New API contributors.”

## Reproducible filter

```bash
git clone https://github.com/QuantumNous/new-api.git new-api
cd new-api
git verify-commit 0c76e4dae77a279e015329b7478e6f02d6b62edd
git subtree split --prefix=web 0c76e4dae77a279e015329b7478e6f02d6b62edd
```

The split output is `7a111f19180c68c466c7639ee62a49182e96f750`. Root-level license and notice files
were imported from the same upstream commit and retain their original attribution. WildFlow changes remain separate from upstream history.

The local recovery-only branch `codex/pre-baseline-snapshot-20260817` records the superseded `e2c7aa…` snapshot and
must not be pushed as a product branch.

## Previous import

The initial rc.24 import used `5c3abffe8572aa8a49f15c3916707d2019d66af4` and filtered head `739d364bd6913d3483298c9329bfc3a705374269`.
The rc.34 candidate is merged from full filtered history, preserving that ancestry.
Both WildFlow repositories must be reviewed together. Upstream rc.34 release notes
advise against production use; passing local gates does not change that warning.
