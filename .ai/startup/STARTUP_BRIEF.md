# Startup Brief — Fori
> Last updated: 2026-07-01 12:00 by @hermes
> 状态: 双 Agent 限额窗口，cron 14:15 PDT 自动续跑

## 项目状态

- 当前阶段: 原型实现 (FORI-021)
- 已完成: 设计文档(PRD+架构+UI) → 评审(CONDITIONAL_PASS) → 修订 → 复审(PASS) → 脚手架 → 原型9/21页
- 下一步: 14:15 cron 自动派发剩余12页(4组×3页) → 集成验证 → 全案审查

## 限额状态 (截至 11:52 PDT)
- Codex: LIMITED, 重置 14:08 PDT
- Claude Code: LIMITED, 重置 14:10 PDT
- 双 Agent 限额窗口: 11:52 - 14:08 PDT
- Cron job: fori-prototype-resume (job_id=2b8430b951fa), 14:15 PDT 触发

## 已完成产出

| 文件 | 行数 | 说明 |
|------|------|------|
| docs/PRD.md | 1488 | 完整产品需求文档，含覆盖矩阵+I/O定义+四方分配+合规边界 |
| docs/ARCHITECTURE.md | 2420 | 技术架构设计，含ER图+状态机+高并发参数+Agent契约表 |
| docs/UI_DESIGN.md | 1989 | 移动端UI设计，21核心页+6必需页+覆盖矩阵+流程映射 |
| docs/SPEC.md | — | 项目工程规范，四阶段协作模型+技术栈锁定 |
| docs/TASK_BREAKDOWN.md | — | 任务分解总表 |
| docs/reviews/REVIEW-010-PRD.md | — | PRD评审 CONDITIONAL_PASS |
| docs/reviews/REVIEW-011-ARCH.md | — | 架构评审 CONDITIONAL_PASS |
| docs/reviews/REVIEW-012-UI.md | — | UI评审 CONDITIONAL_PASS |
| docs/reviews/REVIEW-014-REVISION.md | — | 修订复审 PASS |
| prototype/ | — | Next.js 14脚手架+10组件+9个页面 |

## 已完成页面原型 (9/21)
1. app/page.tsx — 启动页/引导页 ✅
2. app/home/page.tsx — 首页 ✅
3. app/listing/[id]/page.tsx — 房源详情 ✅
4. app/search/page.tsx — 搜索筛选 ✅
5. app/explore/dict/page.tsx — 楼盘字典浏览 ✅
6. app/explore/dict/[communityId]/edit/page.tsx — 楼盘字典编辑 ✅
7. app/price/[communityId]/page.tsx — 房价评估 ✅
8. app/publish/listing/page.tsx — 发布房源 ✅
9. app/publish/buyer-need/page.tsx — 买家需求 ✅

## 待实现页面 (12/21) — cron 14:15 自动派发
10. app/match/page.tsx — 智能匹配推荐
11. app/profile/agent-cert/page.tsx — 经纪人入驻认证
12. app/profile/credit/page.tsx — 信用档案
13. app/transaction/[id]/page.tsx — 交易流程
14. app/profile/transactions/[txId]/evidence/page.tsx — 公证存证
15. app/marketing/generate/page.tsx — 自媒体素材生成
16. app/marketing/manage/page.tsx — 自媒体推广管理
17. app/workspace/agent/page.tsx — 经纪人工作台
18. app/workspace/store/page.tsx — 门店管理
19. app/messages/page.tsx — 消息中心
20. app/profile/page.tsx — 个人中心
21. app/profile/settings/page.tsx — 设置

## Cron Jobs
- fori-quota-watchdog (e7ae58e703ac): 每30min检测限额
- fori-prototype-resume (2b8430b951fa): 14:15一次性，自动续跑剩余页面
- claude-quota-recovery-check (41c7f77c3d70): 14:15一次性，检测Claude恢复

## 关键决策记录
1. 移动端形态: PWA + 响应式 Web (Next.js 14)
2. 节点路由: Claude Code→epix, Codex→woot
3. 分支策略: 各Agent专属分支, Cursor/Human负责合并
4. 四阶段协作: 设计(Claude)→评审(Claude新会话)→执行(Codex)→验证(Hermes)

## 教训 (本次会话)
1. 额度管理失职: 未在派发前检测剩余额度，应交替使用两Agent而非先用完一个再用另一个
2. 会话压缩未做: 长会话未主动 /compress，风险是上下文丢失
3. 下次改进: 关键节点(每组任务前后)做轻量额度检测 + 每10轮交互 /compress 一次
