# Current Task Plan

## Meta
| Field | Value |
|-------|-------|
| Task ID | FORI-083 ~ FORI-085 |
| Title | 人类评审 Round 2 · Wave R2-1 原型 P0 |
| Status | completed |
| Owner | cursor |
| Branch | `cursor/fori-050-review-round2` |

## Checklist
- [x] 研读人类评审 8 条 + 初始需求对照
- [x] 产出 `docs/execution/REVIEW_HUMAN_ROUND2_TASKS.md`（16 任务）
- [x] FORI-083: 字典卡片/列表/地图三态切换
- [x] FORI-084: `viewer-role` 五档脱敏 + 字典页演示
- [x] FORI-085: 登录页分级可见矩阵
- [x] Handoff: FORI-080, 081, 082, 086, 089
- [x] 更新 TASK_BREAKDOWN / manifest / PRD·UI_DESIGN revision notes
- [ ] FORI-080~082, 089: Claude 设计 Wave R2-0（待派发）
- [ ] FORI-043: 定价 API（D4 Wave 1，与 FORI-089 衔接）

## Breakpoint
- Step completed: Round 2 任务分解 + P0 原型三项已实现并 build 验证
- Current state: **Wave R2-0 设计派发就绪** — 优先 FORI-080/081/082/089 并行 Claude
- 人类合并: 待审 `cursor/fori-050-review-round2`
- 配额: 派发 Claude 前执行 `quota-check.sh claude`

## Decisions & Memory
- 2026-07-02: Round 2 任务编号 FORI-080~095，与 MVP_SLICE FORI-050~052 互补
- 2026-07-02: P0 原型由 Cursor 直改；设计缺口交 Claude；后端/API 交 Codex
- 2026-07-02: `AgentAssistFab` 已加字典页，全站铺开留 FORI-093

## Next Actions
1. Human 审阅 `docs/execution/REVIEW_HUMAN_ROUND2_TASKS.md`
2. 派发 FORI-080/081/082/089（Claude，quota-check 后）
3. FORI-082 PASS 后 Codex 执行 FORI-087/088/090/091
4. 合并 `cursor/fori-050-review-round2` → main（Human/Cursor）
