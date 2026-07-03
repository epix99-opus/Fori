VERDICT: CONDITIONAL_PASS

SUMMARY
FORI-043 已把定价模块的 PG 模型、API、三角色差异化输出、D-tier 规范、OpenClaw SSE、以及原型增强项拆得足够细，E1-E13 也大多是功能性变更，不是纯视觉修饰。
当前主要问题不在“覆盖不够”，而在“权威定义冲突”和“分层边界不清”两个结构点；这两处不修正，后续实现会把文档矛盾直接带进代码。

FINDINGS
blocker - `docs/PRICING_MATCHING.md §2.4` 的 `PriceAssessment` 只定义到 `generatedAt`，而 FORI-043 在 §3、§4.2、§7.2 中新增了 `sampleCount`、`expiresAt`、`viewerRole`、`roleView`，同时又声称“严格对齐”。这会形成两套不可同时满足的响应契约，影响共享类型、API client 和后续评审。必须先明确是“扩展响应包裹层”还是“更新 SSOT”，不能两边各写一套。
blocker - §6 的 `price-eval` 说明与 ADR-006 的三层解耦存在冲突风险。文档把 `services/agents/price-eval/` 写成“通过 OpenClaw 框架接入”，又把 SSE 适配器落在 `apps/api/adapters/openclaw.py`；但 ADR-006 明确要求业务 Agent 不直接依赖 OpenClaw/Hermes SDK 或适配器，框架调用只能留在平台内核/适配层内部。当前写法不足以保证实现时不越界。
major - 三角色隔离的“怎么不泄漏”没有被写成服务器端约束。§4.1 的矩阵和 `roleView` 类型能说明可见性意图，但 `hiddenFields` 只是客户端声明，`roleView: BuyerRoleView | SellerRoleView | AgentRoleView` 也不是可判别类型；文档没有明确各角色到底序列化哪些字段会被省略、哪些字段永远不返回。对于卖家底价、买家预算、佣金细节这类敏感信息，这个缺口会变成实现阶段的数据泄漏风险。
minor - PG 模型的 seed/bootstrap 还不完整。`price_tiers` 和 `price_factors` 有种子数据，但 `communities` 没有最小可运行的初始化数据或 fixture 说明，而文档示例和验收场景又依赖 `community-001`、`D-tier` 样本与趋势数据。没有这层 bootstrap，Wave 1 的本地联调和冒烟验证会多出一轮手工准备。

REQUIRED_CHANGES
1. 统一 `PriceAssessment` 口径。要么把 FORI-043 的新增字段纳入 SSOT 并同步所有派生文档，要么把这些字段移到独立的 `PriceAssessmentResponse` 包装层，保留 `PriceAssessment` 作为基础对象。
2. 重写 §6 的职责边界。`PriceEvalAgent` 只能保留业务计算职责，OpenClaw/Hermes 的接入、调度、SSE 序列化必须明确归属平台内核/适配层，不能让业务 Agent 直接“接入框架”。
3. 补充按 `viewer_role` 的服务器端脱敏/序列化规则。建议把响应拆成可判别的角色类型，或明确每个角色返回的字段白名单，避免只靠 `hiddenFields` 做前端遮罩。
4. 补一个最小 `communities` 种子集或测试 fixture 说明，至少覆盖一条可评估样本和一条 D-tier 样本，保证 Wave 1 能按文档直接跑通。

APPROVED_FOR_IMPLEMENTATION: no
