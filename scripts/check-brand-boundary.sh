#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

expected_logo_sha='4cf4521ec1c02c7713399b5aed44e6ed918f8adbd6db8858a5b6f7afa1f4c0de'
expected_favicon_sha='ba4efd39e338b3b1451f05bc55146ae003d5705dad0a7703de67f32980ff42e8'

actual_logo_sha="$(shasum -a 256 public/logo.png | awk '{print $1}')"
actual_favicon_sha="$(shasum -a 256 public/favicon.ico | awk '{print $1}')"

test "$actual_logo_sha" = "$expected_logo_sha" || {
  echo 'public/logo.png is not the approved WildFlow brand asset' >&2
  exit 1
}
test "$actual_favicon_sha" = "$expected_favicon_sha" || {
  echo 'public/favicon.ico is not the approved WildFlow brand asset' >&2
  exit 1
}

if rg -n 'docs\.newapi\.pro|ccswitch\.io|cherry-ai\.com' \
  src/components/layout/components/footer.tsx \
  src/features/home/components/sections/hero.tsx \
  src/features/about/index.tsx; then
  echo 'an upstream or unverified external product link remains in the public shell' >&2
  exit 1
fi

grep -Fq "https://github.com/wildsyn/wildflow-web" src/features/about/index.tsx || {
  echo 'the About fallback does not identify the WildFlow source repository' >&2
  exit 1
}
grep -Fq "https://github.com/QuantumNous/new-api" src/features/about/index.tsx || {
  echo 'the required New API attribution is missing from the About fallback' >&2
  exit 1
}

if rg -n 'DEFAULT_STATS|<Stats[[:space:]]*/>' \
  src/features/home/constants.ts \
  src/features/home/index.tsx; then
  echo 'unsupported marketing counts remain on the public home page' >&2
  exit 1
fi

for route in \
  src/routes/_authenticated/wallet/index.tsx \
  src/routes/_authenticated/redemption-codes/index.tsx \
  src/routes/_authenticated/subscriptions/index.tsx \
  'src/routes/_authenticated/usage-logs/$section.tsx'; do
  grep -Fq 'isSidebarModuleEnabled' "$route" || {
    echo "$route does not enforce the WildFlow feature policy" >&2
    exit 1
  }
done

echo 'WildFlow public brand boundary passed'
