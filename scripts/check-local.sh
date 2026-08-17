#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0

echo "[wildflow-web] license/attribution presence"
test -f LICENSE || { echo "missing LICENSE"; fail=1; }
test -f NOTICE || { echo "missing NOTICE"; fail=1; }
grep -q "Frontend design and development by New API contributors" NOTICE || {
  echo "missing required New API attribution in NOTICE"; fail=1; }
grep -q "AGPL" LICENSE || { echo "LICENSE is not AGPL text"; fail=1; }

echo "[wildflow-web] upstream baseline recorded"
grep -q "5c3abffe8572aa8a49f15c3916707d2019d66af4" UPSTREAM.md || {
  echo "upstream commit not recorded"; fail=1; }

echo "[wildflow-web] production shell branding"
grep -q '<title>野生流动</title>' index.html || {
  echo "index title is not WildFlow branded"; fail=1; }
grep -q 'content="野生流动"' index.html || {
  echo "index metadata title is not WildFlow branded"; fail=1; }
grep -q '统一的大模型服务、模型目录与开发者控制台。' index.html || {
  echo "index description is not WildFlow branded"; fail=1; }

echo "[wildflow-web] secret pattern guard (best effort)"
if grep -RInE "AKIA[0-9A-Z]{16}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|sk-[A-Za-z0-9]{20,}" src public scripts README.md 2>/dev/null; then
  echo "secret-like pattern found"; fail=1
fi

if [ "$fail" -ne 0 ]; then exit 1; fi
echo "[wildflow-web] local checks passed"
