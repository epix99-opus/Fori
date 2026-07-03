# FORI-096 · Round 3 设计包

> **派发**: Cursor 后备（Claude epix auth_error）  
> **日期**: 2026-07-02  
> **分支**: `cursor/fori-060-integration`

## 任务

R3 设计修订：M1-12 纠错入口、M3-10 付费墙 Mock、FORI-094 治理

## 设计规格

### M1-12 业主/买家纠错入口

| 项 | 规格 |
|----|------|
| 页面 | `explore/dict/[communityId]/page.tsx` |
| CTA | 「发现信息有误？提交纠错」 |
| 目标 | `edit?intent=correction` |
| 说明文案 | 业主/买家纠错 → 审核 → 贡献积分 |

### M3-10 付费墙 Mock

| 项 | 规格 |
|----|------|
| 页面 | `price/[communityId]/page.tsx` |
| 触发 | 底部「深度报告 ¥29」 |
| 交互 | BottomSheet → 微信/支付宝 Mock → 解锁报告 |
| 对照 | UI_DESIGN §7.2 |

### FORI-094 治理

| 产出 | `docs/CANON.md` |
|------|-----------------|
| 内容 | 文档层级 SSOT、supersede 表、编排路径 |

## 验收

- [x] 设计规格可执行
- [x] 与 ROUND2_R2 REQUIRED_CHANGES 对齐
- [x] 无 TBD

## 实现派发

→ FORI-097 Codex/Cursor 实现于 `cursor/fori-060-integration`
