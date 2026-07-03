# Review Handoff — FORI-041

## 角色
你是 Fori 项目的**独立技术评审**（与设计者不同会话）。任务类型：**评审 (Review)**。

## 评审原则
- 只读取待审文件 + 参考文档，**不修改**被审设计原文
- 每个发现必须有证据（文件路径 + 章节/行号）
- 产出 VERDICT 必须基于证据，不得主观臆断

## 任务
**任务 ID**: FORI-041-REVIEW
**评审对象**:
- `docs/adr/ADR-009-prototype-to-production-migration.md`
- `docs/execution/REPO_LAYOUT.md`
- `docs/ARCHITECTURE.md` §12-13 增补

**参考标准**:
- `docs/execution/MVP_SLICE.md` Wave 0
- `docs/SPEC.md` §5.1
- `prototype/` 实际路由与组件
- `docs/reviews/MULTI_AGENT_COLLABORATION_REDESIGN.md` D4 要求

### 评审维度
1. 需求覆盖：MVP_SLICE Wave 0 目标结构是否覆盖
2. 技术合理性：一次性迁移 vs 其他选项
3. 一致性：与 ARCHITECTURE/SPEC 是否矛盾
4. 可执行性：FORI-042 Codex 能否据此脚手架
5. 安全合规：房产交易场景风险
6. MVP 降级检查：是否存在不合理 scope 削减

### 产出要求
写入 `docs/reviews/REVIEW-041-ADR-MIGRATION.md`，必须包含 VERDICT (PASS/CONDITIONAL_PASS/FAIL)、FINDINGS、REQUIRED_CHANGES、SUGGESTIONS。

### 约束
- **只允许** Read + Write（写评审文件）
- **禁止** Bash、修改被审原文
- **禁止** `--dangerously-skip-permissions`

### Git
```bash
git add docs/reviews/REVIEW-041-ADR-MIGRATION.md
git commit -m "review: FORI-041 ADR migration verdict [claude]"
```
