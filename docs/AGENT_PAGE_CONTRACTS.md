# Fori 全站 Agent 页面契约（OpenClaw）

> **版本**: 1.0 · 2026-07-02  
> **任务**: FORI-092  
> **框架**: OpenClaw（主）/ Hermes（兜底）

---

## 1. 通用 Agent 助手契约

### 1.1 三模态输入

| 模态 | 入口 | 处理 Agent | 输出 |
|------|------|-----------|------|
| 文字 | FAB 文本框 | 路由 Agent | 结构化卡片 |
| 语音 | FAB 麦克风 | ASR → 路由 Agent | 同上 + 语音回放 |
| 拍摄 | FAB 相机 | Vision Agent | OCR/识图 + 建议 |

### 1.2 通用输出 Schema

```typescript
interface AgentResponse {
  sessionId: string;
  pageContext: string;  // 路由 path
  intent: string;
  blocks: Array<
    | { type: "text"; content: string }
    | { type: "listing_card"; listingId: string }
    | { type: "price_chart"; communityId: string }
    | { type: "action"; label: string; href: string }
  >;
  confidence: number;
}
```

---

## 2. 36 路由 Agent 契约摘要

| 路由 | 业务 Agent | 典型意图（输入） | 输出 |
|------|-----------|-----------------|------|
| `/` | 推荐 Agent | 「附近有什么好房」 | 房源卡片流 |
| `/home` | 推荐 Agent | 「改善型怎么规划」 | 买卖联动方案 |
| `/search` | 搜索 Agent | 「中关村三居室」 | 筛选条件 + 结果 |
| `/explore/search` | 搜索 Agent | 同上 | 同上 |
| `/auth/login` | 认证 Agent | 「为什么要实名」 | 分级说明卡片 |
| `/auth/kyc` | 信用认证 Agent | 「上传身份证」 | OCR 预填 + 进度 |
| `/price` | 价格评估 Agent | 「估价多少」 | 选小区引导 |
| `/price/[communityId]` | 价格评估 Agent | 「因子拆解」 | 图谱 + 文字解释 |
| `/explore/dict` | 字典共建 Agent | 「这个小区怎么样」 | 小区摘要卡 |
| `/explore/dict/[id]` | 字典共建 Agent | 「楼栋分布」 | 楼栋列表 |
| `/explore/dict/[id]/edit` | 字典共建 Agent | 「帮我填物业信息」 | 字段建议 |
| `/explore/map` | 搜索 Agent | 「地图找学校旁」 | 地图标记 |
| `/listing/[id]` | 匹配 Agent | 「能砍价吗」 | 公允区间 |
| `/publish/listing` | 字典共建 Agent | 拍照识别户型 | OCR 户型 |
| `/publish/buyer-need` | 匹配 Agent | 「帮我写需求」 | 需求草稿 |
| `/match` | 匹配 Agent | 「响应这个客源」 | 确认/拒绝 |
| `/messages` | 沟通 Agent | 「生成回复」 | 话术建议 |
| `/workspace/agent` | 工作台 Agent | 「今日待办」 | 任务清单 |
| `/workspace/agent/listings` | 字典共建 Agent | 「哪些待核验」 | 列表 |
| `/workspace/agent/buyers` | 匹配 Agent | 「跟进建议」 | 跟进脚本 |
| `/workspace/agent/matches` | 匹配 Agent | 「4h 内响应」 | 倒计时+模板 |
| `/workspace/agent/stats` | 分析 Agent | 「本月成交」 | 图表解读 |
| `/workspace/store` | 门店 Agent | 「成员业绩」 | 报表 |
| `/workspace/media/generate` | 素材 Agent | 「生成短视频」 | 任务队列 |
| `/workspace/media/manage` | 素材 Agent | 「分发到抖音」 | 渠道状态 |
| `/profile/me` | 账户 Agent | 「信用怎么提升」 | 建议列表 |
| `/profile/settings` | 账户 Agent | 「通知设置」 | 跳转 |
| `/profile/credit` | 信用认证 Agent | 「扣分原因」 | 明细 |
| `/profile/agent-cert` | 信用认证 Agent | 「认证进度」 | 步骤 |
| `/profile/transactions` | 交易 Agent | 「交易进度」 | 状态摘要 |
| `/profile/transactions/*/evidence` | 公证 Agent | 「下载公证书」 | 文件链接 |
| `/transaction/[id]` | 交易 Agent | 「下一步做什么」 | 操作引导 |
| `/marketing/generate` | 素材 Agent | re-export | 同上 |
| `/marketing/manage` | 素材 Agent | re-export | 同上 |

---

## 3. FAB 铺开规格（FORI-093）

| 优先级 | 页面 | 默认意图 |
|--------|------|---------|
| P0 | dict, listing, price, match, publish/* | 已实现 dict |
| P1 | home, search, workspace/agent/*, transaction | 全站 |
| P2 | profile/*, auth/* | 帮助型 |

**组件**: `prototype/components/AgentAssistFab.tsx`  
**扩展**: 传入 `pageContext` + `suggestedPrompts[]`

---

## 4. OpenClaw 任务编排

```
用户输入 → 框架适配层 → 意图路由 → 业务 Agent → 平台内核（权限/脱敏）→ 响应
```

- 高吞吐：价格测算、素材生成 → 异步队列
- 实时：搜索、问答 → 同步 <3s
- 失败：Hermes 兜底编排 或 降级为 FAQ

---

*FORI-092 · Agent 页面契约*
