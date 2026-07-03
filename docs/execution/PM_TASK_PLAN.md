# Fori 产品开发 PM + 任务分配计划

> **版本**: 1.1 · 2026-07-02（FORI-043 设计 handoff 就绪）  
> **Sprint**: Round2 全部完成 + D4 Wave1 定价 API 设计就绪待实现

---

## 1. 当前 Sprint 目标

| 里程碑 | 状态 | 交付 |
|--------|------|------|
| 人类评审 R2 交叉换位 | ✅ | ROUND2_R1/R2_MERGED |
| R3 Minor 清零 | ✅ PASS | ROUND2_R3_MERGED |
| 集成合并 | ✅ | `cursor/fori-060-integration` |
| **FORI-043 设计** | ✅ | `docs/execution/FORI-043_DESIGN.md` + handoff |
| D4 Wave1 定价 API 实现 | ⏳ Codex 待派发 | FORI-043（`.ai/handoffs/FORI-043-implement.md`） |
| D4 Wave1 Agent 接入 | ⏳ | FORI-044/045（依赖 043 完成） |
| Human 原型复审 | 待 | `/home`、`/price/community-001`、`/match` |

---

## 2. 任务看板 FORI-080~095

| ID | 标题 | Owner | P | 状态 | 依赖 |
|----|------|-------|---|------|------|
| FORI-080 | 主功能清单 | Claude | P0 | ✅ done | — |
| FORI-081 | 全角色交互矩阵 | Claude | P0 | ✅ done | — |
| FORI-082 | SUUMO 披露规范 | Claude | P0 | ✅ done | — |
| FORI-083 | 字典三态切换 | Cursor | P0 | ✅ done | 082 |
| FORI-084 | 角色脱敏 | Cursor | P0 | ✅ done | 081 |
| FORI-085 | 登录分级矩阵 | Cursor | P0 | ✅ done | 081 |
| FORI-086 | 共建单位裂变设计 | Claude | P1 | ✅ done | 082 |
| FORI-087 | 贡献账本 UI | Codex | P1 | ✅ done | 086 |
| FORI-088 | 分成瀑布图 | Codex | P1 | ✅ done | 086 |
| FORI-089 | 定价撮合方案 | Claude | P1 | ✅ done | — |
| FORI-090 | 价格三角色 | Codex | P1 | ✅ done | 089 |
| FORI-091 | 撮合状态机 | Codex | P1 | ✅ done | 089 |
| FORI-092 | Agent 页面契约 | Claude | P1 | ✅ done | — |
| FORI-093 | Agent FAB | Cursor/Codex | P1 | ✅ done | 092 |
| FORI-094 | 文档治理 CANON | Cursor | P2 | ✅ done | — |
| FORI-095 | R2 协作复盘 | Hermes | P2 | queued | 094 |

---

## 3. 交叉换位日程（未来 2 周）

| 日期窗口 | 轮次 | 设计者 | 评审者 | 内容 |
|----------|------|--------|--------|------|
| 07-02 ✅ | R1 | Claude/Cursor | Codex | 设计包 |
| 07-02 ✅ | R2 | Codex | Claude/Cursor | 实现 |
| 07-02 ✅ | R3 | Claude/Cursor | Cursor | 纠错+付费墙 |
| 07-03~05 | D4-W1a | Claude | Codex | FORI-043 定价 API 设计 |
| 07-06~08 | D4-W1b | Codex | Claude | FORI-044/045 实现 |
| 07-09~12 | D4-W2 | Claude | Codex | 字典 API Wave2 |

---

## 4. 配额感知派发日历

**Layer A 窗口**: 5h 滚动 · Claude 45 msg · Codex 300 min

| 时段 (PDT) | Agent | 任务类型 | 备注 |
|------------|-------|----------|------|
| 09:00–14:00 | Codex woot | 实现/测试 | 主节点 |
| 14:00–19:00 | Claude epix | 设计/ADR | **需 auth 恢复** |
| 19:00–22:30 | Cursor | 合并/评审后备 | 不限额 |
| 22:30 重置 | Claude | 日配额刷新 | |
| 00:29 重置 | Codex | 日配额刷新 | |

**门控**: 每次派发前 `quota-check.sh`；Claude auth 见 AUTH_PERSISTENCE.md。

---

## 5. 协作 vs 单 Agent 证明

| 维度 | 多 Agent（本 Sprint） | 单 Cursor |
|------|----------------------|-----------|
| 设计深度 | Claude ADR-009 + 4 份 R2 设计 doc | 文档质量不稳定 |
| 实现吞吐 | Codex woot 5 项 R2 并行不阻塞 epix | Cursor 串行 |
| 对抗评审 | Codex 评 R1、Claude/Cursor 评 R2/R3 | 自审盲区 |
| 配额 | 分层路由，Claude 401 时 Cursor 后备 | 无编排 |
| 产出 | 105 文件合并、33 路由 build、CANON SSOT | 仅代码无治理 |
| 可复用 | CAMA CROSS_SWAP_PLAYBOOK | 一次性 |

**量化**: R2 实现 5 任务（FORI-087~093）Codex ~12min；设计 4 文档 Claude/Cursor；3 轮 VERDICT 可追溯。

---

## 6. 下一步行动

1. **Human**: 预览 `prototype` → `/home`、`/explore/dict`、`/price/community-001`（Round 2 验收）
2. **Cursor**: 合并 `claude/fori-043-human-review-design` → `main`（本轮设计）
3. **Codex**: 派发 FORI-043（`.ai/handoffs/FORI-043-implement.md`）实现定价 + 撮合 API
4. **Human**: `claude auth login`（epix 一次）→ 恢复 headless 编排（FORI-044/045 用）

### 门控命令

```bash
# 派发前
.ai/orchestration/scripts/quota-check.sh codex || exit 1

# 验收后
cd apps/api && python -m pytest tests/test_pricing_smoke.py -v
cd packages/shared && npx tsc --noEmit
```

---

*PM 计划 · 2026-07-02*
