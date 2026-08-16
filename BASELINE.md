# 固定上游基线验证

验证日期：2026-08-17。对象为 `upstream/v1.0.0-rc.24` 加本仓治理文件，不包含 WildFlow UI 改造。

## 已通过

- Bun 1.3.14：`bun install --frozen-lockfile`；
- `bun run typecheck`；
- `bun run build`；
- `bash scripts/check-local.sh`。

## 已知上游债务

- `bun test`：31 个文件中执行 133 个测试，124 通过、9 失败，并出现 6 个 Bun `node:test`
  兼容错误；
- `bun run lint`：375 个 error、78 个 warning；当前 `.oxlintrc.json` 与固定上游 tag 完全一致；
- 依赖审计未给出结论：项目事实源是 `bun.lock`，不能用 npm 生成的另一套锁文件冒充结果。

这些结果阻止把当前基线称为“发布就绪”，但不阻止建立可追溯的公开 Fork。后续先把测试运行器与 lint
基线清零，再开始大面积品牌 UI 改造；每个 PR 必须证明没有增加失败数。
