#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

hero='src/features/home/components/sections/hero.tsx'
cta='src/features/home/components/sections/cta.tsx'
footer='src/components/layout/components/footer.tsx'
zh='src/i18n/locales/zh.json'

assert_contains() {
  local file="$1"
  local text="$2"
  local label="$3"
  if ! grep -Fq "$text" "$file"; then
    echo "missing WildFlow introduction copy: $label" >&2
    exit 1
  fi
}

assert_contains "$hero" "Bring focused AI models" "hero title"
assert_contains "$hero" "into products and real work" "hero product line"
assert_contains "$hero" "WildFlow helps developers and small teams" "hero introduction"

assert_contains "$cta" "Start with the model that fits" "CTA title"
assert_contains "$cta" "then verify the integration path" "CTA product line"
assert_contains "$cta" "Browse the current catalog, confirm the documented interface" "CTA description"

assert_contains "$footer" "Focused model APIs and deployment support for developers and small teams." "footer introduction"
assert_contains index.html "野生流动面向开发者与中小团队，提供中小模型 API、部署与适配支持。" "HTML metadata"

assert_contains "$zh" '"Bring focused AI models": "让合适的 AI 模型"' "Chinese hero title"
assert_contains "$zh" '"into products and real work": "进入产品与真实工作"' "Chinese product line"
assert_contains "$zh" '"WildFlow helps developers and small teams connect suitable small and medium models through practical APIs, with optional deployment and adaptation support.": "野生流动帮助开发者与中小团队通过实用的 API 接入合适的中小模型，并按需提供部署与适配支持。"' "Chinese introduction"

if grep -Fq "Deploy your own gateway and start routing requests through your configured upstream services." "$cta"; then
  echo "upstream self-hosting introduction is still visible" >&2
  exit 1
fi

echo "WildFlow introduction contract passed"
