# Fori 任务分解总表

> 每个任务都有完整 spec：目标、角色、依赖、输入、产出、验收标准、验证方法。
> 遵循 设计→评审→执行→验证 四阶段分工。

---

## 第一阶段：产品设计层 (Design Phase)

### FORI-010: PRD 深度评审
**目标**: 评审 docs/PRD.md 的完整性、需求覆盖率、一致性
**角色**: Review
**负责人**: Claude Code (epix, 新会话)
**前置依赖**: FORI-002 (已完成)

**输入**:
- docs/PRD.md
- docs/INITIAL_REQUIREMENTS.md
- docs/SPEC.md §5.3 设计禁止项

**产出**: docs/reviews/REVIEW-010-PRD.md

**验收标准**:
- [ ] 初始需求中六大模块的每个功能点在 PRD 中都有对应描述
- [ ] 无 MVP 降级表述
- [ ] 无 TBD/待定/暂不考虑
- [ ] 每个功能点有输入输出定义
- [ ] 用户角色定义完整（五类角色）
- [ ] 评审文件包含 VERDICT + FINDINGS + REQUIRED_CHANGES

**验证方法**: Hermes 逐项检查评审文件的 FINDINGS 是否全部 resolved

**禁止**: 评审者不得修改 PRD 原文

---

### FORI-011: 架构设计评审
**目标**: 评审 docs/ARCHITECTURE.md 的技术合理性、与 PRD 一致性
**角色**: Review
**负责人**: Claude Code (epix, 新会话)
**前置依赖**: FORI-003 (已完成), FORI-010

**输入**:
- docs/ARCHITECTURE.md
- docs/PRD.md
- docs/SPEC.md §5.1 技术栈锁定

**产出**: docs/reviews/REVIEW-011-ARCH.md

**验收标准**:
- [ ] 技术栈选型与 SPEC §5.1 一致
- [ ] 三层解耦架构有详细接口定义
- [ ] 六大 Agent 有输入输出接口和核心算法
- [ ] 数据模型 ER 图完整
- [ ] 高并发/高可用方案有具体参数
- [ ] 有 ADR 记录
- [ ] 评审文件包含 VERDICT + FINDINGS + REQUIRED_CHANGES

**验证方法**: Hermes 逐项检查

**禁止**: 评审者不得修改架构文档原文

---

### FORI-012: 页面交互设计评审
**目标**: 评审 docs/UI_DESIGN.md 的页面覆盖率、交互完整性
**角色**: Review
**负责人**: Claude Code (epix, 新会话)
**前置依赖**: FORI-004 (完成后)

**输入**:
- docs/UI_DESIGN.md
- docs/PRD.md
- docs/ARCHITECTURE.md

**产出**: docs/reviews/REVIEW-012-UI.md

**验收标准**:
- [ ] PRD 中每个功能模块都有对应页面或入口
- [ ] 每个页面有布局、交互流程、数据展示、状态处理
- [ ] 信息架构完整（导航、层级树、权限矩阵）
- [ ] 全局设计规范（色彩、字体、间距、组件）
- [ ] 关键流程有 Mermaid 流程图
- [ ] 评审文件包含 VERDICT + FINDINGS + REQUIRED_CHANGES

**验证方法**: Hermes 逐项检查

**禁止**: 评审者不得修改 UI 设计文档原文

---

## 第二阶段：原型层 (Prototype Phase)

### FORI-020: 原型脚手架搭建
**目标**: 创建原型项目的目录结构和技术基础
**角色**: Execute
**负责人**: Codex (woot)
**前置依赖**: FORI-012 (评审通过)

**输入**:
- docs/UI_DESIGN.md §二 全局设计规范
- docs/ARCHITECTURE.md §2 技术栈选型
- docs/SPEC.md §5.1 技术栈锁定

**产出**: prototype/ 目录下的 Next.js 项目

**验收标准**:
- [ ] Next.js 14 App Router 项目初始化
- [ ] Tailwind CSS 配置完成
- [ ] shadcn/ui 安装配置
- [ ] 色彩系统、字体系统、间距系统配置到 Tailwind
- [ ] 通用组件创建（Button、Card、Input、Toast、Skeleton）
- [ ] 移动端视口配置 (375px 基准)
- [ ] `npm run dev` 能正常启动

**验证方法**: Hermes 执行 `npm run build` 验证编译

**禁止**: 不得安装 PRD/架构文档之外的依赖

---

### FORI-021.A ~ 021.U: 21 个页面原型实现
**目标**: 按 UI_DESIGN.md 逐页实现移动端原型
**角色**: Execute
**负责人**: Codex (woot)
**前置依赖**: FORI-020 (脚手架完成)

每个页面是一个独立子任务，spec 卡片格式相同：

**输入**: docs/UI_DESIGN.md 中对应页面的设计描述
**产出**: prototype/app/xxx/page.tsx

**通用验收标准**:
- [ ] 页面布局与 UI_DESIGN.md 描述一致
- [ ] 使用 Mock 数据（不接真实 API）
- [ ] 响应式适配 375px 宽度
- [ ] 空状态/加载状态/错误状态都有处理
- [ ] 组件复用脚手架中的通用组件
- [ ] TypeScript 类型完整

**子任务列表**:
- FORI-021.A: 启动页/引导页
- FORI-021.B: 首页（房源推荐流）
- FORI-021.C: 房源详情页
- FORI-021.D: 搜索筛选页
- FORI-021.E: 楼盘字典浏览页
- FORI-021.F: 楼盘字典编辑页（共建）
- FORI-021.G: 在地分层房价评估页
- FORI-021.H: 发布房源页（房东）
- FORI-021.I: 买家需求发布页
- FORI-021.J: 智能匹配推荐页
- FORI-021.K: 经纪人入驻/认证页
- FORI-021.L: 信用档案页
- FORI-021.M: 交易流程页
- FORI-021.N: 公证存证页
- FORI-021.O: 自媒体推广素材生成页
- FORI-021.P: 自媒体推广管理页
- FORI-021.Q: 经纪人工作台
- FORI-021.R: 门店管理页
- FORI-021.S: 消息中心
- FORI-021.T: 个人中心
- FORI-021.U: 设置页

**验证方法**: Hermes 逐页截图比对 UI_DESIGN.md

---

### FORI-022: 原型集成验证
**目标**: 验证所有页面的导航跳转、整体可用性
**角色**: Verify
**负责人**: Hermes
**前置依赖**: FORI-021.A ~ 021.U 全部完成

**产出**: docs/reviews/VERIFY-022-PROTOTYPE.md

**验收标准**:
- [ ] 底部 Tab 导航正常
- [ ] 页面间跳转关系与 UI_DESIGN.md 流程图一致
- [ ] 六大模块的入口都能到达
- [ ] 五类角色的页面权限能区分
- [ ] `npm run build` 无报错
- [ ] Lighthouse 移动端评分 > 80

**验证方法**: Hermes 执行 build + 截图验证

---

## 第三阶段：全案审查 (Final Review)

### FORI-030: 全案审查评估
**目标**: 从需求到原型的端到端审查
**角色**: Review
**负责人**: Claude Code (epix, 新会话)
**前置依赖**: FORI-010, 011, 012, 022 全部通过

**输入**:
- docs/INITIAL_REQUIREMENTS.md
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/UI_DESIGN.md
- docs/SPEC.md
- prototype/ (全部代码)

**产出**: docs/reviews/REVIEW-030-FINAL.md

**验收标准**:
- [ ] 初始需求 100% 覆盖（逐条对照）
- [ ] PRD → 架构 → UI → 原型 一致性链路完整
- [ ] 无 MVP 降级
- [ ] 无设计断点
- [ ] 技术栈与 SPEC 一致
- [ ] 评审文件包含 VERDICT + FINDINGS + REQUIRED_CHANGES

**验证方法**: Hermes 检查评审 VERDICT 是否 PASS

---

## 第四阶段：开发 (Development Phase)

### FORI-040+: 开发任务
**说明**: 全案审查通过后，按模块拆分开发任务。每个模块遵循 设计→评审→执行→验证 四阶段。
具体任务在全案审查通过后根据评审意见细化和派发。

---

## 任务依赖图

```
FORI-002 (PRD) ✅
    ↓
FORI-010 (PRD评审)
    ↓
FORI-003 (架构) ✅
    ↓
FORI-011 (架构评审)
    ↓
FORI-004 (UI设计) 🔄
    ↓
FORI-012 (UI评审)
    ↓
FORI-020 (原型脚手架)
    ↓
FORI-021.A~U (21个页面) ← 可批量并行
    ↓
FORI-022 (原型集成验证)
    ↓
FORI-030 (全案审查)
    ↓
FORI-040+ (开发)
```
