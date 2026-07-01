## VERDICT: CONDITIONAL_PASS

架构设计整体覆盖 PRD 的六大核心模块，并与 SPEC §5.1 锁定的主技术栈基本一致：Next.js 14、FastAPI、PostgreSQL/PostGIS/TimescaleDB、Redis、Kafka、Elasticsearch、ACK/K8s、OpenClaw + Hermes 均已纳入。三层解耦、六大 Agent、ER、并发、高可用、部署、安全、ADR 均有专章。

但当前版本仍存在若干必须修正的问题，主要集中在 PRD/SPEC 口径冲突、三层依赖方向、核心数据实体完整性、状态机一致性和高并发参数可验证性。修正后可进入执行设计。

## FINDINGS

F-001: PRD 的移动端交付形态与 ARCHITECTURE/SPEC 不一致。  
证据：`docs/SPEC.md` §5.1 锁定为 Next.js 14 App Router + PWA；`docs/ARCHITECTURE.md` ADR-001 明确选择 Next.js 14 PWA 而非原生 App；但 `docs/PRD.md` §4.4 要求移动端为 iOS / Android 原生 App + H5。该冲突会直接影响前端架构、发布渠道、活体识别/推送能力和验收标准。

F-002: 三层解耦的依赖方向存在自相矛盾，业务 Agent 仍直接持有框架适配器。  
证据：`docs/ARCHITECTURE.md` §4.3 声明业务 Agent 层只依赖平台内核层，但 `BaseAgent` 构造函数同时注入 `kernel` 和 `adapter`，且 PropertyDictAgent 示例中直接调用 `self.adapter.schedule_async(...)`。这会让业务 Agent 知道框架调度接口，削弱“框架升级或切换时业务层零改动”的目标。

F-003: ER 图未完整显式建模评审要求中的“公证、信用、价格评估”等核心实体。  
证据：ER 图包含 `EVIDENCE_RECORD` 和 `PRICE_SNAPSHOT`，`USER` 上有 `credit_score` 字段，但缺少可承载业务生命周期的 `NOTARY_INSTITUTION` / `NOTARY_TASK` / `CREDIT_PROFILE` / `CREDIT_EVENT` / `PRICE_EVALUATION` / `PRICE_FACTOR` / `PRICE_REPORT` 等实体。按评审要求，“公证、信用、价格评估”应作为实体而非仅字段或结果快照存在。

F-004: 交易状态机与数据库约束不一致。  
证据：状态机定义包含 `NOTARY_REJECTED`，并允许 `NOTARY_PENDING -> NOTARY_REJECTED -> CANCELLED`；但 `transactions.status` 的 CHECK 约束未包含 `NOTARY_REJECTED`。该差异会导致合法状态迁移在数据库层写入失败。

F-005: 高并发方案方向正确，但关键参数不足，尚不能验证 PRD 的 50,000 并发用户、楼盘字典查询 10,000 TPS、匹配 5 分钟 SLA。  
证据：高并发章节提到 `max.poll.records`、Worker 并发数、Kafka Lag 触发 HPA、多级缓存和读写分离，但缺少具体取值和容量模型，例如 Kafka Topic 分区数、Consumer 并发、FastAPI worker/connection pool、PostgreSQL 连接池、Redis maxmemory/淘汰策略、ES shard/replica、k6 压测场景与通过阈值。

F-006: Redis 高可用表述需要修正。  
证据：架构写为 “Redis 7 Cluster（三主三从，Sentinel 高可用）”。Redis Cluster 与 Sentinel 通常是两套不同的高可用模式；Cluster 依赖分片和副本自动故障转移，Sentinel 主要用于非 Cluster 主从。该表述容易导致部署方案误配。

## REQUIRED_CHANGES

1. 统一 PRD、SPEC、ARCHITECTURE 对移动端形态的口径：若以 SPEC 为准，则 PRD §4.4 应改为 Next.js 14 PWA + 响应式 Web，并单独列出需要原生能力时的桥接方案；若保留原生 App，则 SPEC §5.1 和架构 ADR-001 必须重写。

2. 重构三层解耦说明：业务 Agent 只能依赖平台内核暴露的 `AgentRuntime` / `TaskScheduler` / `EventBus` 等接口，不应直接依赖 `AgentInterface` 或框架适配器。框架适配器应被平台内核封装调用。

3. 补齐 ER 图与核心表设计：至少新增公证机构/公证任务、信用档案/信用事件、价格评估结果/价格因子/评估报告等实体，并补充与用户、交易、房源、小区、存证记录的关系。

4. 对齐交易状态机、DDL CHECK 约束、状态迁移表和 Agent 任务输出，确保 `NOTARY_REJECTED` 等状态在所有层一致。

5. 增加高并发容量参数表和验证计划：给出 Kafka Topic 分区与消费者并发、API 副本与 worker 数、DB/Redis/ES 连接和分片参数、HPA 指标阈值、压测数据规模、k6/Locust 验证命令及通过标准。

6. 修正 Redis HA 表述，明确采用 Redis Cluster 还是 Sentinel 主从；若使用阿里云 Redis 集群版，则按云产品实际故障转移模型描述。

## SUGGESTIONS

1. 在 ADR 中新增“PRD 原生 App 诉求 vs SPEC PWA 锁定”的决策记录，避免后续执行阶段反复争议。

2. 为六大 Agent 增加统一任务契约表：任务名、输入 schema、输出 schema、幂等键、Topic、Partition Key、重试策略、DLQ Topic、状态表。

3. 为资金安全补充更细的权限分离：资金释放可采用双人四眼审批、操作人和审批人隔离、审批证据存证、银行回执自动对账。

4. 为安全架构补充 Cookie/JWT 的实际认证模式。如果使用 Cookie，应增加 SameSite、CSRF Token、会话固定防护；如果使用 Bearer Token，应明确存储位置和刷新策略。

5. 将 ADR 从汇总表升级为独立文件目录 `docs/adr/`，每条 ADR 单独编号，便于后续变更追踪。
