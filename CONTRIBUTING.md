# Contributing

先阅读 [项目指导](./docs/agent-project.md) 与 [README](./README.md)。使用根
`.node-version` 和 `packageManager` 固定的版本。准确的 scoped 主包从本机配置的
registry 安装，不再需要本地开发 tarball 或 override。执行：

```sh
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` 是提交前完整本地门禁，不依赖本地候选或在线预览服务。保持
strict TypeScript、源码和测试的 type-aware lint、只读 format-check、单次测试，
以及包含所有源码的 statements／branches／functions／lines 四项全局 90%
覆盖率门限。对行为变更增加受控测试；mock 不证明 registry 或双 tarball 联调。

package scripts 直接调用标准工具，支持工具原生参数。定向测试：

```sh
pnpm test test/bin.test.ts
```

本仓不使用 monorepo 的 Turbo、catalog 或跨包调度，也不保留自定义工具脚本。
该精简已获用户确认，但与未更新的 `AGENTS.md` 固定脚本规则存在
公开冲突；不要通过修改 Check 标准或资产掩盖此差异。

`src/bin.ts` 保持三行精确委派，不增加 wrapper、argv 改写、错误捕获、库 API
或主包逻辑。维护运行时准确 semver，更新依赖时同步
锁文件并核验 Node／peer 兼容；本轮不要自行升级工具。

`pnpm lint-package` 直接运行 `publint --strict`，warnings／errors
均失败，使用默认打包检查但不发布，不检查写死的 alias 身份或源码文本；
最终交付 tarball 仍由整合者审阅后只打包
一次，再在独立新 consumer 验证实际 packed manifest 与准确双制品。禁止
stage／commit／push／发布或启动第二份 Silvermoon idea，除非任务明确授权。
本地完整门禁不是未来准确 SHA 远端 CI 或 npm Trusted Publishing 的替代品。

发布流程见 [README 的发布边界](./README.md#发布边界)。门禁固定依赖
`@silvermoon-work/devtool.publish-gate@0.1.0`，通过实际包的
`prepublishOnly` 执行；该命令要求受控 GitHub Actions 发布上下文，不是本机
离线预检命令。不要绕过生命周期、改用源码候选或配置长期 npm token。
手动 Workflow 仅 dry-run；当前 `0.1.0-rc.0` 已获准解除 private 并准备发布，
但仍需准确 SHA 的成功 main-push CI、Trusted Publisher 配置和最终 tag 授权。
本次沿用 OKR Agent 原生 pnpm 发布方式，
不声称符合 `AGENTS.md` 的旧固定 release／tarball publisher 接口。
