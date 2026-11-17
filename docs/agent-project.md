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
- 本仓一个根包，`pnpm-workspace.yaml` 没有子成员；它只承载严格安装策略，
  不声称构成多项目测试 runner。
- 完整门禁为 `pnpm check`：format-check → build → typecheck → lint →
  test-coverage → lint-package，通过直接 pnpm 命令串联，失败立即传播。
- 用户明确批准学习 okr-agent 的直接工具命令实验，删除固定空壳脚本、
  命令分发器及只检查旧接口的 check-scripts。原样保留标准 `AGENTS.md`；
  其固定 Node 入口规则与本次实验存在公开冲突，不宣称通过旧 Check，
  不修改 Check 作者代码、测试或资产来掩盖差异。
- 本仓是单包，不引入 Turbo、catalog、子包发现、跨包依赖排序或发布映射。
  Vitest 从根目录自动发现配置；build 用 rimraf 清理自有 dist 后运行 tsc。
  不保留自定义工具脚本；lint-package 直接运行 publint，命令接受原生工具参数。

## Candidates and release

- 准确的 `@silvermoon-work/ipfsaw@0.1.0-rc.0` 已可通过本机配置的 registry 获取。
  安装不使用本地 tarball override；锁文件与最终 packed manifest 保留准确 semver。
- 用户明确批准该准确主包版本的 `minimumReleaseAgeExclude` 单版本例外，
  不扩展到其他依赖或后续版本，不关闭其他供应链检查。
- 发布门禁固定依赖已发布的 `@silvermoon-work/devtool.publish-gate@0.1.0`；
  按用户指定准确版本安装，保留 pnpm 自动生成的该单版本冷却期例外。
- `lint-package` 仅执行标准包检查，不再将当前 alias 的身份、准确版本、
  已安装依赖或源码文本写死为通用脚手架门禁；准确交付仍须最终 tarball
  和独立 consumer 的真实验证。
- `pnpm lint-package` 直接运行 `publint --strict`，
  warnings／errors 均失败；使用默认打包检查但不发布，不替代最终交付 tarball 验证。
  整合者审查后负责最终交付的一次性 pack、独立 consumer 的真实主包联调和原生浏览器验收。
- 用户已授权准备 `ipfsaw@0.1.0-rc.0`，当前设置 `private: false`；
  已参考 OKR Agent 接入 `publish-npm.yaml`、
  根目录 `deliverable.yaml` 和 `prepublishOnly: publish-gate check`。
  沿用原生 pnpm 目录发布，不引入自制发布器；这与 `AGENTS.md` 的固定 release
  入口和 tarball publisher 约定存在公开差异，不宣称通过旧接口。
- 发布 Workflow 仅接受 `ipfsaw@<version>` tag，手动触发固定目标且只 dry-run；
  准备发布不等于授权推 tag。用户负责配置 npm Trusted Publisher，
  仍需确认 `npm` environment、准确 alias 交付验证及准确 SHA 的 main-push CI。
  获准准确版本和 SHA 前，不 publish、push tag、改 dist-tag 或上传制品。
- PR/main CI 覆盖默认开发 Node 与 22.15.0 / 24.11.1 的完整检查和真实 CLI
  help/version 冒烟；聚合门禁要求默认及全部兼容矩阵成功。准确 SHA 的远端成功
  证据仍是发布前置条件，不得用本地检查替代或用 mock 主包假装完成真实交付。
