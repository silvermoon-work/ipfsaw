# ipfsaw（私有开发候选）

`ipfsaw@0.1.0-rc.0` 是独立的无 scope CLI 薄入口，唯一运行时依赖为准确的
`@silvermoon-work/ipfsaw@0.1.0-rc.0`。它只将原始用户参数交给主包的
`main` 并沿用其退出码，不复制预览、registry、IPFS、浏览器或信号处理逻辑。
本仓不提供额外库 API，不二次执行 npx，也不以子进程包装主包。

**当前保持 private，未在本轮发布。** 本地候选验证不等于 registry 中的
`npx ipfsaw` 体验已完成，也不证明 registry 上任何同名或同版本包存在或不存在。
主包与 alias 的发布都需准确版本、提交及明确授权；本仓不配置占位发布 CI。

## 开发安装：显式主包候选

开发使用 `.node-version` 的 Node `26.13.1` 与 packageManager 指定的 pnpm
`11.28.12`。只有一个根包，没有子 workspace。先向主实现维护者取得准确主包
候选 tarball，将其复制到忽略的 `.artifacts/scoped-main.tgz`；不要使用 stub、
workspace 源码链接或其他未知版本替代。

本轮约定 SHA-256：

```text
766a1fe8db0af60ff00bca5e67a87617551c0d17f55de02232336b45a6994db8
```

PowerShell 示例（在本仓根目录）：

```powershell
New-Item -ItemType Directory .artifacts
Copy-Item <approved-scoped-candidate.tgz> .artifacts/scoped-main.tgz
node scripts/verify-candidate.mjs
pnpm install
pnpm install --frozen-lockfile
pnpm check
node dist/bin.js --help
```

`verify-candidate` 无第三方依赖，可以在安装前运行；缺文件或 SHA-256 不匹配
会失败。新候选需要显式更新开发 override、对应锁文件完整性及受控 hash，
不能随意替换文件后继续复用旧证据。

`pnpm-workspace.yaml` 的本地开发 override 仅把根 manifest 中的准确 semver
解析到上述相对文件。锁文件记录相对开发 tarball 和完整性，**不是 registry
安装成功的证据**。manifest 的唯一运行时依赖仍必须是字符串 `0.1.0-rc.0`。
`.artifacts/` 不入 Git、不进入交付 allowlist；其他机器必须先取得并核验同一
候选，冻结安装不会自动下载未交接的本地 tarball。

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

| 命令                    | 职责                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| `pnpm verify-candidate` | 核验准确 scoped 开发 tarball SHA-256                             |
| `pnpm build`            | 清理自有 dist，再生成 ESM bin、声明与两种 maps                   |
| `pnpm typecheck`        | 严格检查源码、测试及 Vitest 配置                                 |
| `pnpm lint`             | 源码／测试 type-aware ESLint，JS 配置与脚本基础 lint             |
| `pnpm format-check`     | 只读格式检查                                                     |
| `pnpm format`           | 显式格式化，非只读操作                                           |
| `pnpm test`             | 单次运行受控 mock 测试，不开启 watch                             |
| `pnpm test-coverage`    | 包含所有源码，四项全局门限均为 90%                               |
| `pnpm check-scripts`    | 检查 scripts 与固定入口一对一、无额外参数                        |
| `pnpm lint-package`     | 检查身份、准确依赖、allowlist、bin 与 maps；publint 文件系统检查 |
| `pnpm check`            | 顺序执行候选、格式、构建、类型、lint、覆盖、脚本及包检查         |

默认测试只证明薄入口精确委派、等待完成及退出码传播；mock 不是完整主包或
registry 验收。`lint-package` 使用 publint 公共 API 的 `pack:false`，warnings／errors 均失败，不在门禁
里偷偷生成或发布 tarball。任一步失败均传播为非零结果，不调整覆盖率来掩盖。

## 与独立 consumer 的双 tarball 验证不同

开发 override 只服务本仓源码和工具链。最终检查应先审阅源码，再由整合者以
禁用生命周期钩子的方式只打包一次 alias 候选：

```powershell
pnpm build
pnpm --config.ignore-scripts=true pack --out <exact-alias-candidate.tgz>
```

交付 allowlist 仅含 `dist`、`src`、README 与 LICENSE，另含 npm 必需 manifest；
不包含 workspace 配置、本地 override、开发 tarball、测试或工具脚本。
整合者必须检查**实际 packed manifest** 的主包运行时依赖仍精确为
`0.1.0-rc.0`，且没有 `file:`、`workspace:` 或机器路径。若 pnpm 改写了依赖，
应先报告并修正打包方案，不能修改最终 tarball 来伪造证据。

独立新 consumer 同时取得准确主包和 alias tarball、各自 hash；消费者自己的
显式 override 应将所有主包引用固定到该准确 tarball，不能假定顶层 file
安装会自动满足 alias 下层 semver。随后核验无 workspace 链接、真实 CLI 的
帮助／参数／JSON／错误／信号／关闭语义一致，再进行原生浏览器场景。消费
目录的 override 不是 alias 交付依赖的一部分。该联调及最终 alias tarball
身份由整合会话独立提供，本仓 mock 测试不替代这些结果。

## 发布边界

本轮没有自动 release 脚本、远端制品上传或未发布主包的假成功 CI。未来启用
发布前必须另行完成准确版本和主干提交授权、真实依赖可用性、准确 SHA 远端
质量检查、Trusted Publishing 与发布映射配置。保持 private 直到获准，不
把此 README 的示例视为发布命令授权。

## License

MIT，见 [LICENSE](./LICENSE)。
