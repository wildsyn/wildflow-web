# 前后端分离开发说明

## 启动后端

```bash
cd ../wildflow-api
go run .          # 默认监听 http://localhost:3000
```

如需其他端口：

```bash
PORT=3000 go run .
```

## 启动前端

```bash
npm install       # 首次需要，依赖较大
npm run dev       # 默认 http://localhost:8080，代理 /api -> localhost:3000
```

默认代理目标已在 `rsbuild.config.ts` 中配置：

- `/api`、`/mj`、`/pg` -> `VITE_REACT_APP_SERVER_URL` 或 `http://localhost:3000`

指定其他后端：

```bash
VITE_REACT_APP_SERVER_URL=http://127.0.0.1:3000 npm run dev
```

## 生产部署

- 前端构建产物：`npm run build` 后生成 `dist/`；
- 后端不再托管 `web/` 静态资源；由 Nginx 同源反向代理把 `wildflow.cn/*` 指向前端，
  `/api/*` 指向 `wildflow-api`，避免跨域 Cookie 复杂度。

## 已验证

- Bun 1.3.14 执行 `bun install --frozen-lockfile` 通过；
- `bun run typecheck` 和 `bun run build` 通过，产物为 `dist/`；
- `bash scripts/check-local.sh` 通过；
- 固定上游版本的 `bun test` 与 `bun run lint` 尚未全绿，详见 `BASELINE.md`。

## 合规提醒

本仓库是 New API 前端的 AGPL Fork，线上部署 revision 必须与公开源码一致，并在 about/legal/
footer 保留 New API NOTICE 第 7 条署名和原项目链接。
