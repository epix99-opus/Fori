# Handoff — FORI-086

> **状态**: ready（待 FORI-082 PASS）  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-086-co-creation-fission`  
> **预估配额**: ~35 msg（L2 设计）  
> **前置**: FORI-082 推荐

---

## 角色

Fori **商业机制设计专家**（Claude Code）。任务类型：**设计**。

## 输入

- 评审项 4 全文
- 初始需求：模块一 §1.2.4、模块三 §3.4、模块四
- `docs/PRD.md` 商业模式章节

## 任务

**任务 ID**: FORI-086  
**标题**: 共建共赢裂变机制完整设计

### 目标

产出 `docs/CO_CREATION_FISSION.md`：
1. 参与主体：经纪人首建/维护、业主纠错、买家评价、管理员审核
2. 贡献计量：积分、首建者标签、Top3 优先匹配权
3. 成交分成：推荐、传播、媒体、带看、全程服务各环节核算公式（Mock 参数可）
4. 状态机：提交→核验→发布→匹配→成交→结算
5. 与 Agent 分工：字典 Agent、结算 Agent 职责边界

### 验收标准

- [ ] 含分成示例演算（一笔成交）
- [ ] 含 Mermaid 状态机
- [ ] 无 MVP 降级表述
- [ ] commit：`docs: co-creation fission mechanism design [claude]`

### 后续

评审 PASS 后派发 FORI-087（Codex 原型 UI）、FORI-088（分成瀑布图）。
