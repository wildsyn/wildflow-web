# 前后端分离开发说明

## 准备与目录

准备 Bun，并分别确认 `wildflow-web` 和 `wildflow-api` 的实际 Git 根；两仓不必放在相邻目录。
本页前端命令均在 `wildflow-web` Git 根（包含 `package.json` 和 `bun.lock`）运行。

## 终端 A：启动后端

在 `wildflow-api` 的 Git 根打开一个终端，按
[后端 DEV.md](https://github.com/wildsyn/wildflow-api/blob/main/DEV.md#本地启动) 启动 API，保持进程运行。
默认后端地址为 `http://localhost:3000`；使用其他开发地址时，在前端设置下方代理变量。

## 终端 B：启动前端

另开终端并进入 `wildflow-web` 的 Git 根，执行：

```bash
bun install --frozen-lockfile
bun run dev
```

打开启动日志显示的前端地址，通常为 `http://localhost:8080`；端口被占用时以日志实际地址为准。
停止开发时分别在两个终端按 `Ctrl+C`。

默认代理目标已在 `rsbuild.config.ts` 中配置：

- `/api`、`/mj`、`/pg` -> `VITE_REACT_APP_SERVER_URL` 或 `http://localhost:3000`

指定其他后端：

```bash
VITE_REACT_APP_SERVER_URL=http://127.0.0.1:3000 bun run dev
```

## 生产部署

- 前端构建产物：`bun run build` 后生成 `dist/`；
- 后端不再托管 `web/` 静态资源；由 Nginx 同源反向代理把 `wildflow.cn/*` 指向前端，
  `/api/*` 指向 `wildflow-api`，避免跨域 Cookie 复杂度。

## 验证与证据

验证命令见 [README](README.md#验证)，已登记的上游基线问题见 [BASELINE.md](BASELINE.md)。
在当前改动的 PR 中记录实际执行结果；历史通过记录不能替代当前候选的检查，页面启动也不等于
模型调用、计费或业务流程已经验收。

## 合规提醒

本仓库是 New API 前端的 AGPL Fork，线上部署 revision 必须与公开源码一致，并在 about/legal/
footer 保留 New API NOTICE 第 7 条署名和原项目链接。
