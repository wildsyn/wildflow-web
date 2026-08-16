# Upstream baseline

- `repository`: https://github.com/QuantumNous/new-api
- `release`: `v1.0.0-rc.24`
- `upstream_baseline`: `5c3abffe8572aa8a49f15c3916707d2019d66af4`
- `source_path`: `web/`
- `filtered_history_head`: `739d364bd6913d3483298c9329bfc3a705374269`
- `baseline_tag`: `upstream/v1.0.0-rc.24`
- `imported_at`: `2026-08-17`
- `license`: AGPL-3.0; see `LICENSE`, `NOTICE`, `THIRD-PARTY-LICENSES.md`
- `required_attribution`: “Frontend design and development by New API contributors.”

## Reproducible filter

```bash
git clone https://github.com/QuantumNous/new-api.git new-api
cd new-api
git verify-commit 5c3abffe8572aa8a49f15c3916707d2019d66af4
git subtree split --prefix=web 5c3abffe8572aa8a49f15c3916707d2019d66af4
```

The split output is `739d364bd6913d3483298c9329bfc3a705374269`. Root-level license and notice files
were imported from the same upstream commit before the baseline tag was created. WildFlow changes start after that tag.

The local recovery-only branch `codex/pre-baseline-snapshot-20260817` records the superseded `e2c7aa…` snapshot and
must not be pushed as a product branch.
