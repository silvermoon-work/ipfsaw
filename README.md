# ipfsaw（发布候选）

`ipfsaw@0.1.0-rc.0` 是独立的无 scope CLI 薄入口，唯一运行时依赖为准确的
`@silvermoon-work/ipfsaw@0.1.0-rc.0`。它只将原始用户参数交给主包的
`main` 并沿用其退出码，不复制预览、registry、IPFS、浏览器或信号处理逻辑。
本仓不提供额外库 API，不二次执行 npx，也不以子进程包装主包。

**当前准备发布 `0.1.0-rc.0`，尚未发布该版本。** 包已解除 private；
准确的 scoped 主包可从本机配置的 registry 获取，但不代表无 scope alias
已完成 registry 验收。真实发布仍需要准确版本、提交及明确授权。

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
记录在 `minimumReleaseAgeExclude`。发布门禁按本次指定的准确版本
`@silvermoon-work/devtool.publish-gate@0.1.0-rc.4` 安装，同样仅对该版本
保留安装时生成的冷却期例外。其他包的冷却策略不变；这不是全局关闭供应链检查，
也不授权自动扩展到后续版本。

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

| 命令                 | 职责                                                  |
| -------------------- | ----------------------------------------------------- |
| `pnpm build`         | 清理自有 dist，再生成 ESM bin、声明与两种 maps        |
| `pnpm typecheck`     | 严格检查源码、测试及 Vitest 配置                      |
| `pnpm lint`          | 源码／测试 type-aware ESLint，JS 配置与脚本基础 lint  |
| `pnpm format-check`  | 只读格式检查                                          |
| `pnpm format`        | 显式格式化，非只读操作                                |
| `pnpm test`          | 单次运行受控 mock 测试，不开启 watch                  |
| `pnpm test-coverage` | 包含所有源码，四项全局门限均为 90%                    |
| `pnpm lint-package`  | publint 默认打包检查，warnings／errors 均失败，不发布 |
| `pnpm check`         | 顺序执行格式、构建、类型、lint、覆盖及包检查          |

默认测试只证明薄入口精确委派、等待完成及退出码传播；mock 不是完整主包或
registry 验收。`lint-package` 直接运行 `publint --strict`，
warnings／errors 均失败，使用默认打包检查但不发布，也不替代最终交付 tarball
的独立验证。任一步失败均传播
为非零结果，不调整覆盖率来掩盖。

脚手架采用 okr-agent 的直接工具命令思路，但本仓只有一个包：不引入 Turbo、
catalog、子包发现、跨包依赖排序或发布映射。Vitest 自动读取根目录配置；
`check` 通过 `&&` 在首个失败处停止，`build` 用 rimraf 清除自有 `dist` 后运行
tsc。不保留自定义脚本、命令分发器或空壳入口；包检查直接使用 publint，
不再将当前 alias 的名称、版本或源码文本写死为通用脚手架门禁。

直接命令支持工具原生参数，例如 `pnpm test test/bin.test.ts`。这项工程实验
已获用户确认，但仍与未更新的 `AGENTS.md` 固定 Node 入口规则存在冲突；
本次不修改该标准，也不声称通过仍要求旧接口的 Check。

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

已按用户授权将 `0.1.0-rc.0` 准备为公开发布候选，设置 `private: false`。
发布前仍须确认准确主干提交、真实依赖可用性、准确 SHA 远端质量检查，
以及 npm Trusted Publishing；准备候选不等于授权推送发布 tag。

已参考 OKR Agent 配置 [发布 Workflow](./.github/workflows/publish-npm.yaml)，
根目录 [deliverable.yaml](./deliverable.yaml) 声明唯一 npm 交付包。
固定安装的 `@silvermoon-work/devtool.publish-gate@0.1.0-rc.4` 通过
`prepublishOnly: publish-gate check` 验证发布上下文，不使用本仓自制发布器。
这项接入延续直接工具命令实验，与 `AGENTS.md` 的固定 release 入口和
tarball publisher 约定存在差异，不宣称满足该旧接口。

- 仅 `ipfsaw@<version>` tag push 触发真实发布路径；手动 workflow_dispatch
  固定选择 `ipfsaw`，且始终 dry-run。
- Workflow 完整检出历史、安装锁定依赖、选择唯一交付包并构建，再通过原生
  pnpm 目录发布调用生命周期门禁；不在发布流程重跑完整 CI。
- 门禁验证准确 SHA 的成功 main-push CI、全部兼容矩阵和聚合门禁，
  同时核对 main 祖先关系、tag／版本、registry 状态和运行时依赖可用性。
- GitHub 需要配置 `npm` environment，并在 npm 为 `ipfsaw` 配置绑定当前仓库、
  `publish-npm.yaml` 和 `npm` environment 的 Trusted Publisher。Workflow 仅授予
  contents/actions 读取与 id-token 写入权限，不配置 npm token。
- 完成独立 consumer 验证、准确 SHA 的 main-push CI 和远端配置后，
  可对同一 SHA 手动触发 dry-run；dry-run 成功也不证明 npm 已授予真实发布权限。
  仍需另行授权准确版本和 SHA，才能推送 `ipfsaw@0.1.0-rc.0` tag。

稳定 `X.Y.Z` 使用 `latest`；`X.Y.Z-rc.n` 仅使用 `rc`。未经明确授权，不发布、
推送 release tag、改 dist-tag 或上传制品。不得使用长期 npm token。

## License

MIT，见 [LICENSE](./LICENSE)。
