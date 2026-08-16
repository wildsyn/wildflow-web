# WildFlow M1 产品壳 TDD 证据

日期：2026-08-17。

## RED

- 先定义品牌名称、版本、首页、模型目录、登录、控制台、Harness 和文档入口契约；
- 命令：`bun test src/config/wildflow-product.test.ts`；
- 结果：失败，`./wildflow-product` 尚不存在；
- checkpoint：`e05a9e08`。

## GREEN 目标

- 固定野生流动 1.0 的 M1 路由常量和缺省导航；
- 首页缺省内容不再把产品描述为 New API；
- 新增 Harness 兼容入口，但明确安装包、Plugin 和公开知识库尚未发布；
- 排行默认关闭，支付、返利和签到不进入新增信息架构；
- 保留 New API 用户可见署名和源码链接。
