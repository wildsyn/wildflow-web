# wildflow-web

野生流动 1.0 官网、模型目录、控制台和 Harness 入口前端。本仓库是
[QuantumNous/new-api](https://github.com/QuantumNous/new-api) 前端（`web/`）的受控 Fork。

## 技术路线

- 复制 New API 前端源码，保留业务层：API Client、状态、路由、表格、表单、SSE、i18n；
- UI 层逐步替换为 Ant Design 与 WildFlow 品牌体系；
- 构建基线：React 19 + Rsbuild + TypeScript（见 `package.json`）。

## 许可证与可见性

- 许可证：AGPL-3.0（继承上游）；
- 可见性：公开仓库；
- 必须保留 New API NOTICE 第 7 条署名：

> Frontend design and development by New API contributors.

- 必须在用户可见的 about / legal / footer / attribution 位置保留原项目链接。

## 上游基线

- 上游：https://github.com/QuantumNous/new-api
- 源目录：`web/`
- 锁定 Release：`v1.0.0-rc.24`
- 锁定上游 commit：`5c3abffe8572aa8a49f15c3916707d2019d66af4`
- 详细来源：`UPSTREAM.md`

## 边界

- 公开页面和登录后控制台是同一个前端，不拆两套；
- 通过 `wildflow.cn/api/*` 同源反向代理访问 `wildflow-api`；
- 私密品牌主张、运营资料、客户数据和生产配置不进入本仓库。

## 本地验证

```bash
bun install --frozen-lockfile
bun test
bun run typecheck
bun run build
bash scripts/check-local.sh
```

固定上游版本的测试和 lint 当前并非全绿；准确结果与处置边界见 `BASELINE.md`。在基线债务清零前，
任何 WildFlow 新改动都必须补充受影响范围的测试，不能用已有失败掩盖新增回归。

首次改造先保证固定基线可构建；Ant Design 迁移、WildFlow 页面和 about/legal/footer 的可见署名分别
通过后续 PR 推进。
