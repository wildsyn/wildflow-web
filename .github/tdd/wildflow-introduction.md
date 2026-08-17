# 野生流动官网介绍文案 TDD 证据

日期：2026-08-17。

## 用户旅程

作为首次访问官网的用户，我希望首页明确说明野生流动与野生智能的关系，以及模型服务、Skill、
Harness 和任务服务的产品定位，从而不会把它误解为 New API 的自部署网关页面。

## RED

- 命令：`bash scripts/check-wildflow-introduction.sh`；
- 结果：失败，提示 `missing WildFlow introduction copy: hero title`；
- checkpoint：`5a78ce8c`；
- 保证目标：首页 Hero、应用接入说明、CTA、Footer、HTML metadata 和简体中文翻译使用统一品牌口径，
  且不再展示上游自部署网关介绍。

## GREEN

| 保证 | 验证命令 | 类型 | 结果 |
| --- | --- | --- | --- |
| 首页关键位置使用新的野生流动介绍 | `bash scripts/check-wildflow-introduction.sh` | 文案契约 | PASS |
| 品牌、NOTICE、上游署名和密钥扫描仍满足仓库约束 | `bash scripts/check-local.sh` | 集成契约 | PASS |
| 修改后的 TSX 类型正确 | `bun run typecheck` | 静态检查 | PASS |
| 生产静态站可以构建 | `bun run build` | 构建 | PASS |
| 修改文件格式、Shell 和 TSX lint 通过 | `oxfmt --check ...`、`shellcheck ...`、`oxlint ...` | 静态检查 | PASS；Footer 保留一条既有 `no-danger` warning |

## 已知边界

- 本次只替换品牌介绍，不调整现有页面结构、组件、样式、模型目录或控制台功能；
- 仓库没有为首页文案配置覆盖率工具，本次采用直接文案契约加生产构建验证，不报告伪造覆盖率；
- New API 的用户可见署名与源码链接按 AGPL / NOTICE 要求继续保留。
