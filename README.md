# ipfsaw（私有开发候选）

`ipfsaw@0.1.0-rc.0` 是独立的无 scope CLI 薄入口，唯一运行时依赖为准确的
`@silvermoon-work/ipfsaw@0.1.0-rc.0`。它只将原始用户参数交给主包的
`main` 并沿用其退出码，不复制预览、registry、IPFS、浏览器或信号处理逻辑。
本仓不提供额外库 API，不二次执行 npx，也不以子进程包装主包。

**当前保持 private，未授权发布。** 准确的 scoped 主包已可从本机配置的
registry 获取；这不代表无 scope alias 已发布或完成 registry 验收。
两包发布都需要准确版本、提交及明确授权。

## 开发安装

开发使用 `.node-version` 的 Node `26.13.1` 与 packageManager 指定的 pnpm
`11.28.12`。只有一个根包，没有子 workspace。

```text
pnpm install --frozen-lockfile
pnpm check
node dist/bin.js --help
node dist/bin.js --version
```

锁文件从 registry 解析准确的主包版本，不再依赖私下交接的开发 tarball、
本地 override 或 workspace 链接。尊重本机配置的 registry，不以其他版本或
mock 替代准确主包。

用户已明确批准仅 `@silvermoon-work/ipfsaw@0.1.0-rc.0` 的发布冷却期例外，
记录在 `minimumReleaseAgeExclude`。其他包的冷却策略不变；这不是全局关闭
供应链检查，也不授权自动扩展到后续版本。

## CLI 行为

```text
ipfsaw <document> [--data-dir <path>] [--no-open]
       [--ipfs-gateway <url>] [--content-data-dir <directory>]
ipfsaw registry add <schema-uri> <cid> [--replace] [--data-dir <path>]
ipfsaw registry list [--data-dir <path>]
ipfsaw registry remove <schema-uri> [--data-dir <path>]
```

这些行为全部由主包拥有：帮助／版本为文本；业务 stdout 单个 JSON envelope，
诊断仅 stderr；成功为 0、用法／运行故障为 1、SIGINT 为 130、SIGTERM 为 143。
预览就绪 URL 含运行能力，不能公开分享。绑定 renderer 是显式信任授权；工具
只读本地文档，不代表 CID 代码自动可信，不执行 checker 或上传文档。

应用状态目录与内容 Store 不同；`--data-dir`、`IPFSAW_DATA_DIR`、共享 Task
内容配置以及 `--ipfs-gateway`／`--content-data-dir` 的完整语义以准确主包文档
和帮助为准。本仓不重复实现配置、持久服务或错误码转换。

## 质量门禁

| 命令                     | 职责                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `pnpm verify-dependency` | 核验已安装主包身份、准确版本和 CLI export                        |
| `pnpm build`             | 清理自有 dist，再生成 ESM bin、声明与两种 maps                   |
| `pnpm typecheck`         | 严格检查源码、测试及 Vitest 配置                                 |
| `pnpm lint`              | 源码／测试 type-aware ESLint，JS 配置与脚本基础 lint             |
| `pnpm format-check`      | 只读格式检查                                                     |
| `pnpm format`            | 显式格式化，非只读操作                                           |
| `pnpm test`              | 单次运行受控 mock 测试，不开启 watch                             |
| `pnpm test-coverage`     | 包含所有源码，四项全局门限均为 90%                               |
| `pnpm check-scripts`     | 检查 scripts 与固定入口一对一、无额外参数                        |
| `pnpm lint-package`      | 检查身份、准确依赖、allowlist、bin 与 maps；publint 文件系统检查 |
| `pnpm check`             | 顺序执行依赖、格式、构建、类型、lint、覆盖、脚本及包检查         |

默认测试只证明薄入口精确委派、等待完成及退出码传播；mock 不是完整主包或
registry 验收。`lint-package` 使用 publint 公共 API 的 `pack:false`，
warnings／errors 均失败，不在门禁里偷偷生成或发布 tarball。任一步失败均传播
为非零结果，不调整覆盖率来掩盖。

PR/main CI 在开发 Node 和 Node `22.15.0`／`24.11.1` 上运行完整检查及真实
CLI 的 help/version 冒烟。始终运行的 `Release verification (v1)` 聚合门禁
要求默认任务和全部兼容矩阵成功。本地结果不替代准确 SHA 的 main-push CI。

## 独立 consumer 验证

审阅源码后，以禁用生命周期钩子的方式只打包一次 alias 候选：

```text
pnpm build
pnpm --config.ignore-scripts=true pack --out <exact-alias-candidate.tgz>
```

交付 allowlist 仅含 `dist`、`src`、README 与 LICENSE，另含 npm 必需 manifest；
不包含 workspace 配置、本地 override、开发 tarball、测试或工具脚本。
必须检查实际 packed manifest 的主包运行时依赖仍精确为 `0.1.0-rc.0`，
没有 `file:`、`workspace:` 或机器路径。不能修改最终 tarball 来伪造证据。

在独立新 consumer 以禁用生命周期钩子的方式安装 alias tarball，由 registry
解析真实主包，比较 alias 与主包的帮助、版本、参数错误及退出码。该冒烟不替代
完整浏览器、信号、关闭语义或 renderer 验收。

## 发布边界

包和包门禁仍显式要求 `private: true`。开放发布需要单独获准后同步调整这两处
保护，确认准确版本和主干提交、真实依赖可用性、准确 SHA 远端质量检查、
标准固定 release 入口与 publisher，以及 npm Trusted Publishing。
当前没有启用发布 workflow。

稳定 `X.Y.Z` 使用 `latest`；`X.Y.Z-rc.n` 仅使用 `rc`。未经明确授权，不发布、
推送 release tag、改 dist-tag 或上传制品。不得使用长期 npm token。

## License

MIT，见 [LICENSE](./LICENSE)。
