# Fori Round 2 R1 Design Adversarial Review

VERDICT: FAIL

FINDINGS

- F1 [High] 收费与分成模型与 PRD 不一致，影响后续实现与合规口径。`docs/execution/ROUND2_R1_DESIGN.md:73-78` 声称“收费获益体系”已通过 `PRD §5` 交叉引用，但 `docs/CO_CREATION_FISSION.md:83-118` 实际把成交服务费拆成平台 8%、推广 5%、信息贡献 12%、带看 25%、全程 45%、公证 5% 另计；而 `docs/PRD.md:1321-1337` 明确规定四方固定为买方、卖方、经纪人、平台，买卖双方各承担 0.5%，经纪人 80%，平台 15%，公证 5% 只是从平台服务费中列支，不是新增的用户可见分配主体。当前设计会把交易费、内部结算和公证代付混成多个用户面向的收费桶，Codex 无法按单一准绳实现。

- F2 [Medium] 评审项 5 并未在本轮设计包内完成，和“8/8 覆盖”“无删减”表述冲突。`docs/execution/ROUND2_R1_DESIGN.md:54-57` 直接把“设计开发过程管理”标成 `⏳ P2`，并说明治理文档要放到后续波次；`docs/execution/ROUND2_R1_DESIGN.md:119-121` 也把 `FORI-094/095` 放进 Wave R2-5。也就是说，本轮包实际上只覆盖了 7 个已落地评审项，治理项被延期，不能按当前文本把 8 条评审都判定为已覆盖。

- F3 [Medium] “全角色功能与交互清单”对公证机构缺少可执行契约。`docs/execution/ROUND2_R1_DESIGN.md:32-37` 声称包含“公证机构”，但 `docs/ROLE_UX_MATRIX.md:1-120` 只列了 buyer/seller/agent/staff/store_admin，没有单独的 notary/API-only 角色行；而 `docs/PRD.md:196-214` 把公证合规第三方机构定义为独立服务对象，要求标准化 API 接收核验请求、回传结果并导出存证。`docs/UI_DESIGN.md:174,179-180` 虽然说明公证机构端不提供独立 UI，但设计包没有把这个外部角色收敛成明确的 API 契约或“无 UI”说明，导致“全角色”实际上没有闭合。

- F4 [Medium] 设计包仍残留多处 `spec/queued/partial/UI only/⚠️` 状态，和“无 TBD/待定”要求不一致。`docs/FEATURE_INVENTORY.md:29-35`、`46-50`、`67`、`80`、`94-97`、`113-114` 把多个核心点标成 `spec`、`queued`、`partial`、`UI only` 或 `⚠️`，包括多人协同编辑、权责匹配、合规脱敏永久流存、优先推荐、客源分级推送、付费增值、推广数据跟踪、价格三角色输出和 Agent 助手三模态。对于本轮 handoff 来说，这些状态还不是可直接执行的验收标准，仍然属于未收敛项。

REQUIRED_CHANGES

- 1. 把 `docs/CO_CREATION_FISSION.md` 的分成模型改成与 `docs/PRD.md` 一致的单一口径：买卖双方 0.5% + 0.5%，经纪人 80%，平台 15%，公证 5% 从平台服务费里列支；如果保留内部子项，只能作为平台内部结算说明，不能作为用户面向的收费类别。
- 2. 处理 `评审项 5` 的延期表述：要么补成本轮可执行的治理设计，要么明确把它移出本轮 8/8 覆盖声明，并同步修改所有“零删减 / 100% 覆盖”措辞。
- 3. 为公证机构补一段明确的 API-only 契约说明，至少包含请求接收、结果回传、存证导出、权限边界和错误回退，不要只写“无独立 UI”。
- 4. 清理 `FEATURE_INVENTORY.md` 里所有 `spec/queued/partial/⚠️` 状态，改成可验收的行为描述或显式的 out-of-scope 标签，避免 handoff 继续带着未决项。

SUGGESTIONS

- 先把 PRD / UI / 设计包三处的收费与分成表统一成一张 canonical 表，再让实现任务引用同一份口径。
- 对 API-only 外部角色，保留一小节“无 UI、仅 API”比留空更稳妥，后续 Codex 也更容易落地。
- 在下一轮移交前做一次一致性扫描，把所有非最终状态单独列出，避免“设计完成”与“实际未收敛”同时存在。
