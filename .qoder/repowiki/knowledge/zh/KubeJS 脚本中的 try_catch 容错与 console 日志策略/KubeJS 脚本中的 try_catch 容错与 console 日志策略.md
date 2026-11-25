---
kind: error_handling
name: KubeJS 脚本中的 try/catch 容错与 console 日志策略
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/startup_scripts/relic/relic.js
    - kubejs/startup_scripts/item/oil/oil.js
    - kubejs/startup_scripts/tooltip.js
    - kubejs/client_scripts/ui/rare_affection_ui.js
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - kubejs/client_scripts/ui/stamina_hud.js
    - kubejs/client_scripts/ui/character_gallery_ui.js
    - kubejs/client_scripts/ui/fade_test_ui.js
    - apricity/kubejs/assets/skyfootspa/animations/barefoot_sleep.js
---

## 概述

本仓库是一个基于 KubeJS（Minecraft 1.20.1 Forge）的整合包，业务逻辑几乎全部以 JavaScript 脚本实现。仓库中没有自定义 Java 错误类型、异常类或统一的错误码体系；错误处理表现为：**在关键回调中用 `try/catch` 包裹调用，失败时通过 `console.log` / `console.warn` / `console.error` 输出带模块前缀的日志，并让事件总线继续运行**。

## 使用的系统/模式

- **语言层**：Rhino JS（KubeJS 引擎），没有 `throw new Error(...)` 形式的结构化异常对象被抛出到上层——所有异常都是运行时抛出的 JS 异常（如 NPE、类型不匹配等）。
- **框架层**：Forge/KubeJS 事件总线（`StartupEvents`、`ClientEvents`、`NetworkEvents.dataReceived`、Curios API 钩子）。每个钩子回调都被单独 `try/catch` 保护，保证单个遗物/UI 的错误不会中断整个事件总线。
- **日志层**：仅使用 Rhino 的 `console.log` / `console.warn` / `console.error`，没有引入任何第三方日志库。

## 关键文件与位置

| 文件 | 作用 |
|---|---|
| `kubejs/startup_scripts/relic/relic.js` | 遗物注册，对 Curios 的 onEquip/onUnequip/canEquip/canUnequip 四个钩子分别 `try/catch`，失败时 `console.error` 并返回默认值（`true`） |
| `kubejs/startup_scripts/item/oil/oil.js` | 空 tag 检测，使用 `console.warn` 告警 |
| `kubejs/startup_scripts/tooltip.js` | ApricityUI 文档创建失败时 `console.error`，HTML 缺少 `#tooltip` 节点时 `console.error` |
| `kubejs/client_scripts/ui/rare_affection_ui.js` | 稀客好感度 UI，注释明确说明“读 global 中 null 值会直接抛 Rhino NPE 中断脚本加载”，用外层 `try/catch` 兜底并修复历史遗留 null |
| `kubejs/client_scripts/ui/phone_ui.js` | 手机设置/评价数据同步，每个 `dataReceived` 回调独立 `try/catch`，登出清理也 `try/catch` |
| `kubejs/client_scripts/ui/pathfinder_config_ui.js` | 配置界面关闭，`closeScreen()` 和登出清理均 `try/catch` |
| `kubejs/client_scripts/ui/stamina_hud.js` | 体力 HUD，Overlay 创建/更新失败时 `console.log` 记录 |
| `kubejs/client_scripts/ui/character_gallery_ui.js`、`fade_test_ui.js` | 图鉴/测试页打开失败时 `console.log` 记录 |
| `apricity/kubejs/assets/skyfootspa/animations/barefoot_sleep.js` | 客户端动画资源，同样用 `try/catch` 包裹读取 |

## 架构约定与设计决策

1. **每个事件回调自保护**：`relic.js` 中对 Curios 的四个钩子各自独立 `try/catch`，注释写明“任一步骤抛错都不能中断 Curios 事件总线”。这是仓库中最明确的约束性约定。
2. **失败降级而非传播**：`canEquip` / `canUnequip` 捕获异常后返回 `true`（允许装备），而不是向上抛出，保证模组可用性优先于校验逻辑。
3. **全局状态初始化防御 null**：`rare_affection_ui.js` 显式把 `global.pfRareAffectionView` 初始化为空字符串，注释解释原因是“Rhino NPE 会中断脚本加载”；`phone_ui.js` 用 `global.pfPhoneSettings = global.pfPhoneSettings || {}` 做惰性初始化。
4. **登出清理统一兜底**：所有 UI 脚本都在 `ClientEvents.loggedOut` 中尝试释放资源（`removeDocument` / `closeScreen`），并用 `try/catch` 包裹，避免登出本身成为崩溃点。
5. **日志带模块标签**：所有错误/警告日志都带 `[PF-RARE-UI]`、`[PHONE-UI]`、`[STAMINA-HUD]`、`[RELIC-EQUIP]`、`[TOOLTIP]` 等前缀，便于从 `logs/latest.log` 中过滤。
6. **无统一错误类型**：没有定义共享的 `Error` 子类、错误码枚举或错误中间件；错误信息直接拼接 `e.toString()` 输出。
7. **无 panic/recover**：JavaScript 侧不使用 `panic`/`recover`（那是 Go 概念），也没有 `finally` 块——清理逻辑放在独立的 `loggedOut` 事件中。

## 观察到的约定与约束

- **约定（描述性）**：每个 `NetworkEvents.dataReceived` 处理器都用 `try/catch` 包裹，失败时 `console.log` 输出“XX失败: “ + e。
- **约定（描述性）**：Curios 钩子中自定义逻辑用 `try/catch` 包裹，异常时 `console.error` 并返回安全默认值（`true`）。
- **约定（描述性）**：对 `global.*` 的读写前做存在性检查或 `try/catch`，以避免 Rhino 对 null 字段访问抛 NPE 导致脚本加载中断。
- **约定（描述性）**：日志消息统一采用 `[MODULE-NAME]` 方括号前缀格式。
- **约束（由代码体现）**：`relic.js` 中 `canEquip` / `canUnequip` 的 catch 分支固定返回 `true`，即“校验失败时默认允许装备”，这是该文件的强制行为。
- **约束（由代码体现）**：UI 关闭操作（`closeScreen` / `removeDocument`）在正常流程和 `loggedOut` 流程中都必须 `try/catch`，否则可能阻止登出。

## 结论

该仓库的错误处理是**轻量级、分散式的**：没有跨模块的错误类型或中间件，而是依赖 KubeJS/Rhino 的原生异常机制，在每个易错回调处用 `try/catch` 隔离，并通过带标签的 `console` 日志进行诊断。核心设计目标是“单点故障不拖垮事件总线”，而非结构化错误传播。