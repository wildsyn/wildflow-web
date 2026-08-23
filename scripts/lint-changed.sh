#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

base_ref="${1:-}"
if [[ -z "$base_ref" ]]; then
  echo '[wildflow-web] an explicit lint comparison base is required' >&2
  exit 1
fi

if [[ "$base_ref" =~ ^0+$ ]]; then
  resolved_base="$(git hash-object -t tree -w /dev/null)"
elif ! resolved_base="$(
  git rev-parse --verify --end-of-options "${base_ref}^{commit}" 2>/dev/null
)"; then
  echo "[wildflow-web] unable to resolve lint comparison base: $base_ref" >&2
  exit 1
fi

changed_files=()
while IFS= read -r file; do
  case "$file" in
    *.cjs | *.js | *.jsx | *.mjs | *.ts | *.tsx)
      [[ -f "$file" ]] && changed_files+=("$file")
      ;;
  esac
done < <(git diff --name-only --diff-filter=ACMR "$resolved_base" --)

if [[ "${#changed_files[@]}" -eq 0 ]]; then
  echo '[wildflow-web] no changed JavaScript or TypeScript files to lint'
  exit 0
fi

echo "[wildflow-web] linting ${#changed_files[@]} changed source files"
./node_modules/.bin/oxlint -c .oxlintrc.json "${changed_files[@]}"
