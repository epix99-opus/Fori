# REVIEW-041 — ADR-009 原型迁移 + 仓库布局评审

| 字段 | 内容 |
|------|------|
| **评审 ID** | REVIEW-041-ADR-MIGRATION |
| **评审对象** | `docs/adr/ADR-009-prototype-to-production-migration.md`、`docs/execution/REPO_LAYOUT.md`、`docs/ARCHITECTURE.md §12-13 增补` |
| **评审人** | Claude Code（独立会话，非设计者） |
| **日期** | 2026-07-02 |
| **参考标准** | `docs/execution/MVP_SLICE.md`、`docs/SPEC.md §5.1`、`prototype/`、`docs/reviews/MULTI_AGENT_COLLABORATION_REDESIGN.md` D4 要求 |
| **结论** | **CONDITIONAL_PASS** |

---

## VERDICT

**CONDITIONAL_PASS**

核心迁移策略（Option A 一次性迁移）技术合理、论证充分，路由映射准确，安全合规分期恰当，MVP 六大模块完整保留，D4 门禁要求基本满足。存在 1 项 HIGH 必改项（`prototype/components/ui/` 未覆盖）会直接阻断 FORI-042 Codex 执行，以及 1 项 MEDIUM 必改项（messages 页面 Wave 分配矛盾）。两项修复后可升级为 PASS。

---

## FINDINGS

### F-01 【HIGH】`prototype/components/ui/` 子目录未纳入迁移规划

**证据**：
- `prototype/components/` 实际结构（`ls` 验证）：除 11 个自定义原语组件和 `PwaRuntime.tsx` 外，还存在 `ui/` 子目录，内含 shadcn/ui 生成文件：
  ```
  prototype/components/ui/
  ├── button.tsx
  ├── card.tsx
  ├── input.tsx
  ├── label.tsx
  ├── skeleton.tsx
  ├── tabs.tsx
  └── toast.tsx
  ```
- ADR-009 §5.1（`prototype/components/**` → `packages/ui/src/**`）仅列举自定义大写组件，未提及 `ui/` 子目录。
- REPO_LAYOUT.md `packages/ui/src/` 目录树同样不包含 shadcn/ui 原始文件。

**影响**：自定义组件（如 `Button.tsx`）必然通过 `import { Button } from './ui/button'` 引用 shadcn/ui 基础件。若 FORI-042 仅迁移 `components/*.tsx`，迁移后 `packages/ui/src/Button.tsx` 的 import 路径将断裂，导致 `tsc --noEmit` 失败，L1 构建门禁无法通过。

---

### F-02 【MEDIUM】`messages/page.tsx` Wave 分配在两份文档中矛盾

**证据**：
- ADR-009 §4.1 标题「基础框架路由（Wave 0）」包含 `app/messages/page.tsx`，归属 Wave 0。
- REPO_LAYOUT.md 目录树 `apps/web/app/messages/` 标注 `# 消息中心 [Wave 3]`。
- `docs/execution/MVP_SLICE.md` Wave 3 明确描述「匹配闭环（M2）」，消息中心属于 Wave 3 业务模块范畴。

**影响**：FORI-042 Codex 以这两份文档为脚手架依据，分配矛盾将导致生成的目录注释与 ADR 路由映射表不一致，引发下游 Wave 1 验证报告中的路由覆盖判断混乱。

---

### F-03 【LOW】MVP_SLICE.md 中 FORI-041 产出引用 ADR-007（已过时）

**证据**：
- `docs/execution/MVP_SLICE.md` §3 表格中 FORI-041 产出列写「`docs/adr/ADR-007-*.md`」。
- 实际产出为 `docs/adr/ADR-009-prototype-to-production-migration.md`（ADR-009）。
- ADR-009 §13 编号说明解释了编号从 009 起的原因（001–008 内联于 ARCHITECTURE.md §12）。

**影响**：文档交叉引用失效，对后续 Wave 任务 handoff 读取 MVP_SLICE.md 时产生误导，不影响 FORI-042 执行但降低文档可信度。

---

### F-04 【LOW】`MIGRATION-TAILWIND4.md` 内容不足以支撑 FORI-042 自动执行

**证据**：
- ADR-009 §6 多次引用「参照 `docs/MIGRATION-TAILWIND4.md`」作为 Tailwind 3→4 升级的详细依据。
- 实际文件（验证：24 行、8 个高层步骤）无具体 CSS class 映射表、无 `@theme` 变量对照、无 shadcn/ui 兼容性注意事项。
- 文件范围描述为「原型内升级」（"Upgrade dependencies in `prototype/package.json`"），而 ADR-009 语境是迁移到 `apps/web` 时升级，存在范围错位。

**影响**：FORI-042 Codex 执行 Tailwind 升级时缺少机器可读的映射规则，升级质量依赖 Codex 自行推断，增加视觉回退风险。

---

### F-05 【LOW】Mock 数据层废弃计划与实际结构不匹配

**证据**：
- REPO_LAYOUT.md §Mock 数据层淘汰计划 按文件名引用：`mock/price.ts`、`mock/properties.ts`、`mock/listings.ts`、`mock/matches.ts`、`mock/transactions.ts`、`mock/credit.ts`、`mock/materials.ts`。
- 实际 `prototype/lib/mock/` 仅包含：`index.ts`、`types.ts`（验证：Bash `ls`）。
- Mock 数据以 export 形式集中在 `index.ts`，不是按业务领域拆分的独立文件。

**影响**：按 Wave 废弃 Mock 的计划需从「按文件删除」调整为「按 export 删除」，当前表述对 FORI-042 无直接阻断作用，但会在 Wave 1+ 执行时引发混淆。

---

## 评审维度结论

### 1. 需求覆盖（MVP_SLICE Wave 0 目标结构）

| 检查点 | 结论 |
|--------|------|
| `apps/web`、`apps/api`、`packages/ui`、`packages/shared`、`services/agents/` 结构 | ✅ 完整覆盖 |
| 六大业务 Agent 占位（services/agents/ 六个子目录） | ✅ 完整，含任务链路 FORI-044/051/061/071/080 |
| Wave 0 基础路由（根页、首页、搜索、登录、个人中心等） | ✅ 8 条 page.tsx 路由 + layout + globals |
| 原型 36 条路由 → 生产 34 条路由（2 条 marketing/ 合并为 301 重定向） | ✅ 数学一致，prototype `find` 验证确认 36 条 |
| messages 页面 Wave 分配 | ⚠️ ADR 与 REPO_LAYOUT 矛盾（F-02） |

### 2. 技术合理性（一次性迁移 vs 其他选项）

Option A 论证充分：
- Option B（增量并行）维护成本分析正确，双维护风险被准确量化。
- Option C（全量重写）风险评估准确，已通过 FORI-031 评审的原型 UI 不应重写。
- Monorepo（pnpm workspaces + Turborepo）技术选型与 SPEC §5.1 锁定技术栈兼容。
- OpenAPI 契约路径（`apps/api/openapi.json` → `packages/shared/src/api/`）符合前后端类型安全设计。

**一次性迁移的核心风险**（Tailwind 4.x 升级）已识别，但缓解措施（MIGRATION-TAILWIND4.md 详细映射）实际不足（F-04）。

### 3. 一致性（与 ARCHITECTURE/SPEC）

| 检查点 | 结论 |
|--------|------|
| SPEC §5.1 技术栈锁定（Next.js 14、FastAPI、PG、Redis、Kafka、ES） | ✅ ADR 严格遵守 |
| SPEC §5.3 禁止 MVP 降级 | ✅ 六大模块全量保留，无"后续迭代"表述 |
| ARCHITECTURE.md §4.3 三层解耦（业务 Agent 禁止导入 AgentInterface） | ✅ services/agents/ 结构与 apps/api/adapters/ 正确分层 |
| apps/api/adapters/ vs services/agents/ 三层正确性 | ✅ 适配层（Tier 1）在 apps/api/，业务层（Tier 3）在 services/ |
| ADR 编号（ADR-009）与 MVP_SLICE.md 引用（ADR-007）不一致 | ⚠️ F-03 |

### 4. 可执行性（FORI-042 Codex 脚手架能力）

| 检查点 | 结论 |
|--------|------|
| 路由映射表（36→34）机器可读 | ✅ |
| 组件迁移清单（11 原语 + 1 应用级） | ✅ 清单明确 |
| `prototype/components/ui/` shadcn/ui 文件处置 | ❌ 未覆盖（F-01，阻断风险） |
| 验收 Checklist §10（15 项 L1 门禁） | ✅ 可操作 |
| Tailwind 升级具体规则 | ⚠️ MIGRATION-TAILWIND4.md 不足（F-04） |
| services/agents/ 六个 README 占位 | ✅ 有设计→执行链路表 |

### 5. 安全合规（房产交易场景风险）

| 风险点 | 处置 |
|--------|------|
| KYC 实名认证（`app/auth/kyc/`） | ✅ 分配 Wave 4，L4 Human 必审门禁 |
| 交易状态机（`app/transaction/[id]/`） | ✅ Wave 4，配合 ARCHITECTURE §6.4 状态机约束 |
| 证据链路由（`profile/transactions/[txId]/evidence/`） | ✅ Wave 4 |
| Mock 数据层防污染（隔离在 `apps/web/lib/mock/`） | ✅ 路径隔离设计合理 |
| 生产环境禁止 Mock 污染 | ✅ Wave N 逐步替换计划有据 |
| 敏感页面早期脚手架（KYC、交易页在 Wave 0 迁移为空骨架） | ✅ 骨架无实现，安全合规实现推迟至 Wave 4 |

**未发现安全合规降级风险**。

### 6. MVP 降级检查

| 检查点 | 结论 |
|--------|------|
| 六大模块全量保留 | ✅ M1–M6 均有路由与 Agent |
| 禁止 TBD/暂不考虑 | ✅ ADR 文档无此类表述 |
| 原型 36 条路由全量迁移（含合并说明） | ✅ |
| SPEC §5.3 精神遵守 | ✅ |

**未发现 MVP 范围削减**。

---

## REQUIRED_CHANGES

### RC-1【HIGH，阻断 FORI-042】补充 `prototype/components/ui/` 迁移路径

**修改目标**：`docs/adr/ADR-009-prototype-to-production-migration.md` §5 或新增 §5.5

**内容要求**：明确说明 `prototype/components/ui/*.tsx`（shadcn/ui 生成文件）的三选一处置方案，并选定一个：

- **方案 A（推荐）**：将 `prototype/components/ui/` 整体迁移至 `packages/ui/src/ui/`，更新所有自定义组件中的相对导入路径（`./ui/button` → `./ui/button` 保持不变，但基路径变为 packages/ui/src/）。
- **方案 B**：在 `apps/web/` 内以 shadcn/ui CLI 重新生成（`npx shadcn add`），不依赖原型文件。
- **方案 C**：保留 `apps/web/components/ui/`，自定义原语组件（`packages/ui/src/`）通过 `apps/web/components/ui/` 中的 re-export 访问 shadcn/ui。

验收标准：FORI-042 Codex 可无歧义地执行，`packages/ui tsc --noEmit` 通过。

---

### RC-2【MEDIUM，文档一致性】统一 `messages/page.tsx` Wave 分配

**修改目标**：ADR-009 §4.1 或 REPO_LAYOUT.md 目录注释，选择其一并同步到两份文档。

**建议**：
- 若 messages 页面属于「基础 Tab 导航 Shell」（Tab Bar 中的一项），在 Wave 0 中创建空骨架（仅 UI，无 API 接线）是合理的——将 ADR §4.1 中的说明补充「Wave 0 仅建空骨架页，实质功能 Wave 3 接线」，并更新 REPO_LAYOUT.md 注释为 `# 消息中心 [Wave 0 空骨架 / Wave 3 接线]`。
- 若 messages 完全属于 Wave 3：从 ADR §4.1（Wave 0）移除，加入 ADR §4.4（Wave 3）。

---

## SUGGESTIONS

### S-01 扩充 `MIGRATION-TAILWIND4.md` 为 Codex 可执行的映射表

建议新增：
1. 具体 CSS class 变更对照表（`text-primary` → `text-[--color-primary]` 等）
2. `@theme` 指令替换 `extend.colors` 的示例代码
3. 明确作用范围：**apps/web**（非 prototype），与 ADR-009 §6 语境对齐

### S-02 更新 MVP_SLICE.md 中的 ADR 引用

`docs/execution/MVP_SLICE.md` §3 表格 FORI-041 产出列：
- 当前：`docs/adr/ADR-007-*.md`
- 修改为：`docs/adr/ADR-009-prototype-to-production-migration.md`

### S-03 澄清 Mock 数据层文件命名

REPO_LAYOUT.md §Mock 数据层淘汰计划 建议修改表述，将「废弃 `mock/price.ts`」改为「废弃 `apps/web/lib/mock/index.ts` 中的 price 相关 export」，或建议 FORI-042 在迁移 mock 时按领域拆分为独立文件（price.ts、properties.ts 等），以便按计划逐步废弃。

---

## 可执行性评级

FORI-042 Codex 依据当前文档可执行的比例：

| 模块 | 可执行度 |
|------|---------|
| 目录骨架创建（REPO_LAYOUT.md 目录树） | ✅ 100% |
| 路由迁移（36→34 条路由） | ✅ 100% |
| 自定义组件迁移（11 个原语） | ⚠️ 70%（shadcn/ui 依赖路径未解决）|
| Tailwind 3→4 升级 | ⚠️ 60%（映射规则不足）|
| Agent 占位（services/agents/ 六个 README） | ✅ 100% |
| apps/api Python 骨架 | ✅ 100% |
| 验收 Checklist 执行 | ✅ 100% |

**加权综合评估**：约 85% 可执行。RC-1 修复后可达 95%+。

---

## 总结

ADR-009 是结构完整、逻辑严密的迁移决策文件，技术选型与架构约束一致，MVP 六大模块完整保留，安全合规分期合理，FORI-042 Codex 总体可执行。核心风险集中在：

1. **RC-1**（HIGH）：`prototype/components/ui/` 未处置 → 直接导致迁移后 import 路径断裂。
2. **RC-2**（MEDIUM）：messages 页面 Wave 分配矛盾 → 下游文档一致性风险。

两项修复完成后，ADR-009 + REPO_LAYOUT.md 可作为 FORI-042 脚手架的完整规范依据，评级升至 **PASS**。

---

*REVIEW-041-ADR-MIGRATION · Claude Code 独立评审 · 2026-07-02*
