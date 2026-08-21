# WildFlow Web（野生流动前端）

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Upstream: New API](https://img.shields.io/badge/Upstream-QuantumNous%2Fnew--api-6f42c1.svg)](https://github.com/QuantumNous/new-api)

WildFlow Web 是野生流动的开源 Web 前端，承载官网、模型目录、开发者控制台和 Harness 入口。
它与 [WildFlow API](https://github.com/wildsyn/wildflow-api) 分离构建和部署，通过同源 `/api/*`
路由访问公开控制面。

[野生流动官网](https://wildflow.cn) · [开发者文档](https://docs.wildflow.cn/docs) ·
[后端源码](https://github.com/wildsyn/wildflow-api)

> **上游与署名**
>
> 本项目基于 [QuantumNous/new-api](https://github.com/QuantumNous/new-api) 的 `web/` 前端开发，
> 固定导入 `v1.0.0-rc.24` / `5c3abffe8572aa8a49f15c3916707d2019d66af4`，并在其上进行
> WildFlow 产品、品牌和前后端分离改造。原项目由 QuantumNous 与 New API contributors 开发；
> 本仓库不是 New API 官方发行版。
>
> **Frontend design and development by New API contributors.**

导入方式、过滤历史和精确基线见 [UPSTREAM.md](UPSTREAM.md)；完整法律声明见
[LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md)。

## 项目职责

| 负责 | 不负责 |
|---|---|
| WildFlow 官网与公开产品页面 | 用户、余额、价格和账单的后端事实 |
| 模型目录、模型详情与开发者文档入口 | GPU 生命周期、Worker、Lease 和 Artifact 执行 |
| 登录后控制台、API Key 与用量界面 | 渠道凭据、生产配置和私密运营资料 |
| Harness 入口和浏览器侧交互 | 另建一套后端或推理控制面 |

相关仓库：

- [wildflow-api](https://github.com/wildsyn/wildflow-api)：用户、Key、价格、余额、账单和公共 API；
- `wildflow-inference`：私有推理执行面，不在本公开仓库中分发；
- WildFlow 内部主仓：品牌、跨仓契约与产品治理。

## 技术栈

- React 19 + TypeScript；
- Rsbuild；
- TanStack Router / Query / Table；
- Zustand、i18next、React Hook Form、Zod；
- Tailwind CSS 与现有上游组件体系。

依赖和脚本的准确版本以 [package.json](package.json) 与 [bun.lock](bun.lock) 为准。

## 本地启动

准备 Bun 后执行：

```bash
bun install --frozen-lockfile
bun run dev
```

开发服务器默认把 `/api`、`/mj` 和 `/pg` 代理到本地 WildFlow API。需要指定其他本地后端时：

```bash
VITE_REACT_APP_SERVER_URL=http://127.0.0.1:3000 bun run dev
```

完整的前后端分离说明见 [DEV.md](DEV.md)。不要把生产密钥、用户数据或 `.env` 文件提交到仓库。

## 验证

```bash
bun run typecheck
bun run build
bash scripts/check-local.sh
```

固定上游基线仍有已记录的测试与 lint 债务，详情见 [BASELINE.md](BASELINE.md)。新增 WildFlow 改动
必须验证受影响范围，不能用上游已有失败掩盖新回归。

## 上游同步与修改说明

- 本仓库是 New API `web/` 的受控过滤历史，不是从零实现的前端；
- 上游同步必须与 `wildflow-api` 成对评审，避免前后端协议漂移；
- WildFlow 自有修改从 `upstream/v1.0.0-rc.24` 之后开始，可通过 Git 历史审计；
- New API 的名称、作者信息、原项目链接和所需署名必须保留；
- 用户界面的 About / Legal / Attribution 位置必须继续提供原项目链接和署名。

## 开源许可证

本项目依据 [GNU Affero General Public License v3.0](LICENSE) 开源。通过网络向用户提供修改版服务时，
应按 AGPL-3.0 和 NOTICE 的要求提供对应源码、保留适当法律声明并标记修改。第三方依赖仍遵循各自许可。

## 参与贡献

提交变更前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)、[SECURITY.md](SECURITY.md) 和
[AGENTS.md](AGENTS.md)。所有变更通过 Pull Request 进入 `main`。
