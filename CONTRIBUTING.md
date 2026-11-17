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

固定 package scripts 必须对应 `node scripts/<same-name>.mjs`，不接受额外
参数，公共实现放 `scripts/lib/`。定向测试可以显式运行：

```sh
pnpm exec vitest run --root . --config vitest.config.ts test/bin.test.ts
```

`src/bin.ts` 保持三行精确委派，不增加 wrapper、argv 改写、错误捕获、库 API
或主包逻辑。维护运行时准确 semver，更新依赖时同步
锁文件并核验 Node／peer 兼容；本轮不要自行升级工具。

`pnpm lint-package` 是不打包的文件系统检查；最终打包由整合者审阅后只做
一次，再在独立新 consumer 验证实际 packed manifest 与准确双制品。禁止
stage／commit／push／发布或启动第二份 Silvermoon idea，除非任务明确授权。
本地完整门禁不是未来准确 SHA 远端 CI 或 npm Trusted Publishing 的替代品。
