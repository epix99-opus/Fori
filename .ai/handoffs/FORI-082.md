# Handoff — FORI-082

> **状态**: ready  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-082-dict-disclosure-spec`  
> **预估配额**: ~25 msg  
> **前置**: 建议 FORI-080 草稿可读（可并行）

---

## 角色

Fori **产品设计专家**（Claude Code）。任务类型：**设计**。

## 输入

- 评审项 3：SUUMO 式规范化、地图/列表/卡片、差异化呈现、保密隔离
- `docs/PRD.md` §3.1 模块一、§1.4 权限模型
- `prototype/app/explore/dict/page.tsx`（FORI-083/084 已实现部分）

## 任务

**任务 ID**: FORI-082  
**标题**: 楼盘字典 SUUMO 式披露规范

### 目标

在 `docs/UI_DESIGN.md` 新增 **§字典披露规范（R2-082）**：
1. 参照 SUUMO 的字段分组模板（基本信息 / 建筑 / 设备 / 环境 / 交易信息）
2. 五档浏览者可见性矩阵（guest/phone/kyc/agent/staff）— 与 `prototype/lib/viewer-role.ts` 对齐或扩展
3. 保密字段处理规则（房号、业主、成交价、原始证件）
4. 地图/列表/卡片三态信息密度差异说明

### 验收标准

- [ ] 字段分组表 ≥30 字段
- [ ] 与 PRD §1.4 权限矩阵一致
- [ ] 含 Mermaid：浏览者身份 → 可见字段集
- [ ] revision note 标注 R2-082
- [ ] commit：`docs: SUUMO-style dict disclosure spec [claude]`
