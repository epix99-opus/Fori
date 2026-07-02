# FORI-030 全案审查评估任务 Prompt

## 角色
你是 Fori 项目的资深审查专家。你的任务是对整个项目从需求到原型进行端到端审查评估。

## 背景
Fori 是新一代房产交易中介生态平台。项目已完成以下阶段：
- FORI-002: PRD 深度生成 (docs/PRD.md)
- FORI-003: 架构设计文档 (docs/ARCHITECTURE.md)
- FORI-004: 移动端Web App UI/UX设计 (docs/UI_DESIGN.md)
- FORI-010/011/012: 三项设计评审 (CONDITIONAL_PASS)
- FORI-013/014: 修订复审 (PASS)
- FORI-020: 原型脚手架 (Next.js 14 + Tailwind + shadcn/ui)
- FORI-021: 21个移动端页面原型实现
- FORI-022: 原型集成验证 (PASS, TabBar路由+死链已修复)

## 审查范围（必须全部读取）
1. `docs/INITIAL_REQUIREMENTS.md` — 初始需求
2. `docs/PRD.md` — 产品需求文档
3. `docs/ARCHITECTURE.md` — 架构设计
4. `docs/UI_DESIGN.md` — UI/UX 设计
5. `docs/SPEC.md` — 技术规范
6. `prototype/` — 原型代码目录（重点检查 app/ 和 components/）

## 审查维度
1. **需求覆盖率**: INITIAL_REQUIREMENTS.md 中的每一条需求是否在 PRD.md 中有对应覆盖
2. **PRD→架构一致性**: PRD 定义的功能模块是否在 ARCHITECTURE.md 中有对应架构支撑
3. **架构→UI一致性**: 架构定义的页面/路由是否在 UI_DESIGN.md 中有对应设计
4. **UI→原型一致性**: UI_DESIGN.md 中设计的页面是否在 prototype/ 中有对应实现
5. **MVP降级检查**: 是否存在需求被不合理降级或遗漏的情况
6. **技术一致性**: 原型代码是否遵循 SPEC.md 定义的技术栈和规范
7. **质量检查**: 原型代码结构、组件复用、路由完整性

## 产出要求
将审查报告写入 `docs/reviews/REVIEW-030-FINAL.md`，必须包含以下结构：

```markdown
# FORI-030: 全案审查评估报告

## Meta
- 审查者: Claude Code
- 日期: 2026-07-01
- 范围: 需求→PRD→架构→UI→原型 端到端

## VERDICT: [PASS / CONDITIONAL_PASS / FAIL]

## 审查摘要
[一段话总结整体评估结论]

## FINDINGS

### F1: [发现标题]
- **严重级别**: [Critical / Major / Minor / Info]
- **维度**: [需求覆盖/PRD→架构/架构→UI/UI→原型/MVP降级/技术一致性/质量]
- **描述**: [详细描述]
- **证据**: [具体文件、行号、章节引用]

[每个发现一个子节，按严重级别排序]

## REQUIRED_CHANGES
[仅当 VERDICT 非 PASS 时列出必须修改项]
1. [修改项描述 + 责任人建议]

## 审查清单
| 维度 | 状态 | 说明 |
|------|------|------|
| 需求覆盖率 | ✅/⚠️/❌ | ... |
| PRD→架构一致性 | ✅/⚠️/❌ | ... |
| 架构→UI一致性 | ✅/⚠️/❌ | ... |
| UI→原型一致性 | ✅/⚠️/❌ | ... |
| MVP降级检查 | ✅/⚠️/❌ | ... |
| 技术一致性 | ✅/⚠️/❌ | ... |
| 质量检查 | ✅/⚠️/❌ | ... |

## 需求覆盖矩阵
| 需求项 (INITIAL_REQUIREMENTS) | PRD覆盖 | 架构覆盖 | UI覆盖 | 原型覆盖 | 状态 |
|------|------|------|------|------|------|
| ... | ... | ... | ... | ... | ✅/⚠️/❌ |
```

## 约束
- 只读取文件和写入审查报告，不修改任何源代码或设计文档
- 每个发现必须有具体证据（文件路径+章节/行号）
- VERDICT 必须基于证据，不得主观臆断
- 如果发现问题，REQUIRED_CHANGES 必须可操作、可验证
