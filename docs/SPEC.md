# Fori 项目工程规范 (SPEC)

> 本文件是 Fori 项目的工程约束性规范，所有 Agent 必须遵守。冲突时以本文件为准。
> 最后更新: 2026-07-01

## 一、协作模型：设计-评审-执行-验证

### 1.1 四阶段分工

每个功能单元必须完整走完四个阶段，不得跳过：

| 阶段 | 负责人 | 产出 | 验收标准 |
|------|--------|------|----------|
| **设计 (Design)** | Claude Code | 设计文档（接口定义、数据结构、交互方案） | 设计文档通过 Hermes 评审 |
| **评审 (Review)** | Claude Code（与设计者不同会话）或 Hermes | 评审意见 + 设计修订 | 评审意见 resolved，设计冻结 |
| **执行 (Execute)** | Codex | 代码实现 + 单元测试 | 编译通过、测试通过、lint 通过 |
| **验证 (Verify)** | Hermes | 验证报告（功能/规范/目标对齐） | 全部检查项通过 |

### 1.2 禁止串联作业

- 设计者不得同时执行自己设计的任务（设计→评审要换会话/换 Agent）
- 执行者不得自验（Codex 写完代码，Hermes 验证）
- 评审者不得替设计者修改设计（只出评审意见，设计者改）

### 1.3 阶段流转规则

```
Design → Review → [Pass] → Execute → Verify → [Pass] → Done
                ↓                       ↓
              [Fail]                  [Fail]
                ↓                       ↓
          返回 Design              返回 Execute (附 bug 报告)
```

## 二、任务深度细分规范

### 2.1 任务颗粒度

每个任务必须满足：
- **单一职责**：一个任务只做一件事
- **可验证**：有明确的通过/不通过标准
- **可估算**：预计执行时间 < 30 分钟（Claude Code/Codex 单次调用）
- **有依赖**：明确前置任务 ID

### 2.2 任务卡片格式

每个任务必须有完整的 spec 卡片：

```markdown
### FORI-XXX: 任务标题

**目标**: 一句话描述这个任务要产出什么
**角色**: Design | Review | Execute | Verify
**负责人**: Claude Code (epix) | Codex (woot) | Hermes
**前置依赖**: FORI-XXX (无则填"无")

**输入**:
- 文档/文件列表
- 参考标准

**产出**:
- 文件路径
- 格式要求

**验收标准** (全部满足才算完成):
- [ ] 标准 1
- [ ] 标准 2

**验证方法**:
- 自动化: 命令/脚本
- 人工: Hermes 逐项检查

**禁止**:
- 不得做 XXX
- 不得引入 MVP 降级
```

### 2.3 任务编号规则

- `FORI-0XX`: 阶段任务（00=spec, 01-09=设计, 10-19=评审, 20-29=执行, 30-39=验证）
- 每个阶段任务可拆子任务: `FORI-0XX.A`, `FORI-0XX.B`

## 三、Claude Code 最佳实践

### 3.1 派发规范

```bash
# 设计类任务：给足上下文和约束
claude -p "你是 Fori 的[角色]。阅读 [输入文件]。
任务：[具体任务]。
约束：[禁止事项]。
产出：写入 [文件路径]，格式 [要求]。
验收：[验收标准]。
完成后: git add [文件] && git commit -m 'type: description [claude]' && git push" \
  --allowedTools "Read,Write,Bash" \
  --max-turns 30 \
  --dangerously-skip-permissions < /dev/null
```

### 3.2 评审类任务（换会话）

```bash
# 评审必须用新会话，不能 --continue
claude -p "你是 Fori 的技术评审。阅读 [待评审文件] 和 [PRD/架构文档]。
评审维度：
1. 需求覆盖：PRD 中的功能点是否全部覆盖
2. 技术合理性：架构决策是否合理
3. 一致性：与已有设计文档是否矛盾
4. 可执行性：开发团队能否据此实现
5. 安全合规：是否有安全/合规风险

产出评审意见写入 docs/reviews/REVIEW-XXX.md，格式：
- VERDICT: PASS | CONDITIONAL_PASS | FAIL
- FINDINGS: 逐条列出问题
- REQUIRED_CHANGES: 必须修改的项
- SUGGESTIONS: 建议优化项" \
  --allowedTools "Read,Write" \
  --max-turns 15 < /dev/null
```

### 3.3 关键规则

- 每次 `-p` 调用是独立会话，prompt 必须自包含
- `--max-turns` 设计类任务 30，评审类 15
- 评审任务禁止 `--dangerously-skip-permissions`（只读 + 写评审文件）
- 设计和评审不得同一会话（`--continue` 禁止用于自审）

## 四、Codex 最佳实践

### 4.1 派发规范

```bash
# 执行类任务：给精确的 spec 和验收标准
ssh woot 'cd /Users/woot/Dev/Fori && codex exec "你是 Fori 的开发者。
阅读 [设计文档] 中的 [具体章节]。
任务：[精确描述要实现什么]。
约束：
- 技术栈：[从架构文档取]
- 代码规范：[从 SPEC 取]
- 禁止：[禁止事项]
验收标准：
- [ ] [具体标准]
- [ ] [具体标准]
完成后运行：[验证命令]
完成后: git add [文件] && git commit -m \"type: description [codex]\" && git push" \
  --model gpt-5.5 < /dev/null 2>&1'
```

### 4.2 关键规则

- `< /dev/null` 必须追加（否则挂起）
- `--model gpt-5.4-mini` 用于文档/简单任务省额度
- `--model gpt-5.5` 用于复杂编码
- `--yolo` 用于 trusted 项目（Fori 已注册 trust）
- 每次调用是独立会话，prompt 必须自包含
- Codex 自报"完成"不可信，Hermes 必须验证 `git diff`

## 五、项目约束 (Spec)

### 5.1 技术栈锁定

| 层 | 技术 | 版本 | 禁止替代 |
|----|------|------|----------|
| 前端 | Next.js 14 (App Router) + PWA | 14.x | 不得用 Vue/Angular |
| 前端 UI | Tailwind CSS + shadcn/ui | latest | 不得用 Ant Design |
| 后端 | FastAPI (Python 3.12) | 0.110+ | 不得用 Django/Flask |
| 数据库 | PostgreSQL 16 + PostGIS + TimescaleDB | 16 | 不得用 MySQL |
| 缓存 | Redis 7 | 7.x | 不得用 Memcached |
| 消息队列 | Kafka | 3.6+ | 不得用 RabbitMQ |
| 搜索 | Elasticsearch 8 | 8.x | 不得用 Solr |
| 部署 | K8s (阿里云 ACK) | 1.28+ | 不得用裸机部署 |
| Agent 框架 | OpenClaw (主) + Hermes (备) | latest | 三层解耦，可切换 |

### 5.2 代码规范

- Python: ruff (lint) + mypy (type check) + black (format)
- TypeScript: eslint + prettier
- Commit: `type: description [agent]` 格式
- 分支: `codex/feature`, `claude/feature`, `hermes/feature`
- 合并: 只有 Cursor/Human 合并到 main

### 5.3 设计禁止项

- 禁止引入 MVP 理论降低设计目标
- 禁止省略 PRD 中定义的任何功能模块
- 禁止使用"先实现核心功能，后续迭代补充"等表述
- 禁止在设计文档中使用"TBD"、"待定"、"暂不考虑"
- 所有接口必须定义输入输出 schema
- 所有数据模型必须定义字段类型和约束

### 5.4 验证标准

| 阶段 | 验证项 | 验证人 |
|------|--------|--------|
| Design | 需求覆盖率 100%、技术合理性、一致性 | Hermes |
| Review | 评审意见 resolved、设计冻结 | Hermes |
| Execute | 编译通过、lint 通过、单测覆盖率 > 80% | Hermes |
| Verify | 功能测试通过、规范检查通过、目标对齐 | Hermes |
