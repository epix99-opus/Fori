# Handoff — FORI-080

> **状态**: ready  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-080-feature-inventory`  
> **预估配额**: ~25 msg（Layer A，设计 L2）  
> **前置**: 无

---

## 角色

你是 Fori 项目的**架构/设计专家**（Claude Code）。任务类型：**设计 (Design)**。  
评审须由**新会话**执行，禁止自审。

## 项目上下文（启动必读）

1. `AGENTS.md`
2. `.ai/handoffs/Human/Fori房地产智能中介交易平台初始需求.md`
3. `.ai/handoffs/Human/Fori平台原型评审意见.md` 评审项 1
4. `docs/execution/REVIEW_HUMAN_ROUND2_TASKS.md`

## 任务

**任务 ID**: FORI-080  
**标题**: 主功能清单（无删减、分级）  
**人类评审原文**: 「对照初始需求，完整梳理并维护……核心目标与模块功能，不得有任何遗漏……不得删减任何功能，仅可对功能进行丰富」

### 目标

产出 `docs/FEATURE_INVENTORY.md`：将初始需求六大模块 + 价值闭环**逐条**映射为功能条目，每条标注：
- 模块归属
- 优先级 P0/P1/P2
- 设计状态 / 原型状态 / 生产状态
- 关联 PRD 章节

### 约束

- **禁止删减**任何初始需求功能点
- 允许丰富子功能，须标注 `[ENRICHED]`
- 中文撰写
- 不得修改 PRD 原文

### 验收标准

- [ ] 初始需求每个 § 小节至少 1 条功能 ID
- [ ] 含追溯表：功能 ID → 初始需求段落 → PRD § → 原型路由
- [ ] 无 TBD/待定
- [ ] commit：`docs: master feature inventory from human review R2 [claude]`

### 派发前

```bash
.ai/orchestration/scripts/quota-check.sh claude
```
