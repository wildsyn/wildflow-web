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

assert_contains "$hero" "Bring models into real work" "hero title"
assert_contains "$hero" "Model services, Skills, and composable Harness" "hero product line"
assert_contains "$hero" "WildFlow is WildSyn's AI model, API, and task service platform" "hero introduction"

assert_contains "$cta" "Bring AI into real work" "CTA title"
assert_contains "$cta" "Start with models, build with Harness" "CTA product line"
assert_contains "$cta" "Explore model services, then combine Skills and Harness capabilities" "CTA description"

assert_contains "$footer" "Model services, Skills, and composable Harness for content and delivery workflows." "footer introduction"
assert_contains index.html "野生流动是野生智能旗下的 AI 模型、API 与任务服务平台。" "HTML metadata"

assert_contains "$zh" '"Bring models into real work": "让模型真正流入工作"' "Chinese hero title"
assert_contains "$zh" '"Model services, Skills, and composable Harness": "模型服务、Skill 与 Harness 生态"' "Chinese product line"
assert_contains "$zh" '"WildFlow is WildSyn'"'"'s AI model, API, and task service platform, providing model services, Skills, and composable Harness capabilities for content production and project delivery.": "野生流动是野生智能旗下的 AI 模型、API 与任务服务平台，为内容生产和项目交付提供模型服务、Skill 与可组合的 Harness 能力。"' "Chinese introduction"

if grep -Fq "Deploy your own gateway and start routing requests through your configured upstream services." "$cta"; then
  echo "upstream self-hosting introduction is still visible" >&2
  exit 1
fi

echo "WildFlow introduction contract passed"
