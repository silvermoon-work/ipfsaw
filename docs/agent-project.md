# Project Guidelines

## Scope

- 这是独立单包 `ipfsaw` alias，明确使用无 scope npm 名；主 monorepo 的
  `@silvermoon-work/*` workspace 命名规则不适用于此仓。
- 唯一运行时依赖是 `@silvermoon-work/ipfsaw` 的准确 `0.1.0-rc.0`。
  `src/bin.ts` 只 import 其 `/cli` 的 main 并设置原样返回退出码；没有库 API。
- 不复制主实现、不在 alias 建立另一个 Idea；生命周期由主仓 ipfsaw Idea 管理。

## Development

- Node 固定 `26.13.1`，pnpm 固定 `11.28.12`。本轮主代理于 2026-11-16
  21:20 后核对 [Node 官方 index](https://nodejs.org/dist/index.json) 和
  [官方 schedule](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json)，
  共同确认最高稳定受支持 LTS。以后维护版本仍须按根标准取得一小时内新证据。
- 开发工具精确复用主仓已经验证的兼容稳定版本；不要隐式升级。
  TypeScript `6.0.3` 在 typescript-eslint `8.72.2` 声明的 `<6.1.0` peer 范围内；
  ESLint `10.15.0` 在其 `^10.0.0` peer 内，Vitest／coverage-v8 同为 `5.1.0`。
  所选工具支持开发 Node `26.13.1`；消费者最低 `>=22.15.0` 不代表能运行全部开发工具。
- 严格 TS 与 type-aware ESLint 覆盖 src、test 及 TS 配置；脚本和 JS 配置也 lint。
  默认单次 Vitest，覆盖 include 全部 src，四项 global thresholds 显式为 90。
- 本仓一个根包，`pnpm-workspace.yaml` 没有子成员；它只承载严格安装策略及
  明确的本地开发 override，不声称构成多项目测试 runner。
- 完整门禁为 `pnpm check`：verify-candidate → format-check → build → typecheck
  → lint → test-coverage → check-scripts → lint-package，失败立即传播。
- 固定 scripts 一对一，无冒号、无额外参数；共享实现位于 scripts/lib。

## Candidates and release

- `pnpm-workspace.yaml` 的相对 override 与锁文件完整性只用于主包当前未发布
  开发候选；package.json 及最终 packed manifest 运行时依赖必须保留准确 semver。
- 开发输入 `.artifacts/scoped-main.tgz` 不入库，安装前核验 README 明确的 SHA-256。
  不把候选未发布推断成 registry 的同名版本不存在；未执行 registry 交付验证。
- `pnpm lint-package` 的 publint 使用公共 API `pack:false`，warnings／errors 均失败；不生成最终 tarball。
  整合者审查后负责一次性 pack、独立双 tarball 联调和原生浏览器验收。
- 当前包 private，无发布脚本／workflow。缺少精确主包 registry 交付与发布授权，
  不搭建假成功 CI，不 publish、push tag、改 dist-tag 或上传制品。
- 后续实现 CI 时必须同步文档、锁定依赖准备与实际 PR/main 覆盖；不得移除
  质量门禁或用 mock 主包假装完成真实交付。
