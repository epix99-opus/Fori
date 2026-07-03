# Handoff — FORI-081

> **状态**: ready  
> **目标 Agent**: Claude Code @ epix  
> **分支**: `claude/fori-081-role-ux-matrix`  
> **预估配额**: ~30 msg（Layer A）  
> **前置**: 可与 FORI-080 并行

---

## 角色

Fori **UX/产品设计专家**（Claude Code）。任务类型：**设计**。

## 输入

- `.ai/handoffs/Human/Fori平台原型评审意见.md` 评审项 2
- `docs/reviews/REVIEW-UX-USER-PERSPECTIVE.md`
- `docs/UI_DESIGN.md`
- `docs/PRD.md` §2 用户角色

## 任务

**任务 ID**: FORI-081  
**标题**: 全角色功能与交互清单

### 目标

产出 `docs/ROLE_UX_MATRIX.md`，覆盖四类使用者 + **平台工作人员**：
- 经纪人、平台工作人员、意向购房者、意向卖房者（改善型双重身份注明）

每个角色包含：
1. 核心旅程（≥5 步）
2. 每页应呈现内容
3. 引导词/CTA 文案建议
4. 交互方式（点击/表单/Agent）
5. 异常与空状态

并修订 `docs/UI_DESIGN.md`：在文首增加「修订 R2-081」说明 + 链到矩阵文档（**不删除**原有 21 页规格）。

### 验收标准

- [ ] 每角色 ≥10 条可测试交互条目
- [ ] 平台工作人员有明确职责页或后台入口定义
- [ ] UI_DESIGN 含 revision note
- [ ] commit：`docs: role UX matrix human review R2 [claude]`
