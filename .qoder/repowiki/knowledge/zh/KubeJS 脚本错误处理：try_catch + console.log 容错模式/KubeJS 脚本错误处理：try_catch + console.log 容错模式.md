---
kind: error_handling
name: KubeJS 脚本错误处理：try/catch + console.log 容错模式
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/startup_scripts/serveHooks.js
    - kubejs/server_scripts/auratip_triggers.js
    - kubejs/server_scripts/pathfinder/pfMain.js
    - kubejs/server_scripts/pathfinder/pfBedBreakHandler.js
    - kubejs/server_scripts/pathfinder/pfBedManager.js
    - kubejs/server_scripts/pathfinder/pfBasinSoakManager.js
    - kubejs/server_scripts/item/fasciaGunHandler.js
    - kubejs/server_scripts/backpack/backpackInit.js
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/client_scripts/ui/stamina_hud.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - kubejs/client_scripts/ui/character_gallery_ui.js
    - kubejs/client_scripts/ui/foot_ui.js
---

## 1. 总体方案

本仓库是 Minecraft Forge 1.20.1 整合包，业务逻辑以 KubeJS JavaScript 脚本实现（`kubejs/server_scripts/`、`kubejs/startup_scripts/`、`kubejs/client_scripts/`）。仓库内**没有自定义异常类型、错误码枚举、统一错误对象或中间件框架**。错误处理采用最朴素的 JS 原生 `try { ... } catch (e) {}` 配合 `console.log(...)` 输出日志的模式，核心思想是「容错优先」——在可能失败的 I/O、NBT 读取、网络调用、第三方 API 调用周围包裹 try/catch，捕获后记录一行日志并继续执行，而不是中断主循环。

## 2. 关键文件与位置

- **服务端 Hook 框架**：`kubejs/startup_scripts/serveHooks.js`
  - 定义 `global.registerServeClickHook` / `global.runServeClickHooks`，对每个 hook 函数单独 try/catch，并把错误通过 `console.log('[SERVE-HOOK] hook error: ' + e)` 输出。这是仓库中唯一一处集中式 hook 调度器，也是错误传播的边界。
- **AuraTip 教学触发器**：`kubejs/server_scripts/auratip_triggers.js`
  - 使用全局状态机 `global.aTip.stageKey = "aTipTeaching.stage"` 驱动教学流程；对缺失的 `TipTriggers` API 做 `typeof` 检查并 `console.log("[ATIP] TipTriggers is undefined for " + id)`；对可选 NBT 字段访问用 try/catch 包裹（第 163–170 行）。
- **Pathfinder 子系统**：`kubejs/server_scripts/pathfinder/pfMain.js` 作为每 tick 主循环入口，本身不直接 try/catch，而是委托给子模块（`pfSoakManager`、`pfSleepManager`、`pfMovement` 等），各子模块内部自行包裹风险操作。
- **客户端 UI 脚本**：`kubejs/client_scripts/ui/phone_ui.js`、`stamina_hud.js`、`pathfinder_config_ui.js`、`character_gallery_ui.js`、`foot_ui.js` 等，大量使用 try/catch 包裹 UI 初始化、数据同步、Overlay 创建等操作，失败时打印 `[PHONE-UI]` / `[STAMINA-HUD]` / `[PF-GALLERY-UI]` / `[FOOT-UI]` 前缀日志。
- **物品钩子**：`kubejs/server_scripts/item/fasciaGunHandler.js`、背包初始化 `backpackInit.js`、床破坏处理 `pathfinder/pfBedBreakHandler.js`、床管理 `pathfinder/pfBedManager.js`、泡脚盆管理 `pathfinder/pfBasinSoakManager.js` 等，均遵循同一模式。

## 3. 架构与约定

### 3.1 分层容错
- **顶层主循环**（如 `pfMain.js` 的 `global.pathfinderTick`）不做 try/catch，依赖子模块自保；一旦某个子模块抛出未捕获异常，会中断该 tick 的后续处理。
- **Hook 层**（`serveHooks.js` 的 `runServeClickHooks`）是显式的隔离点：逐个 hook 包裹 try/catch，一个 hook 抛错不会阻止其他 hook 执行。
- **回调/事件处理器**（如 `ServerEvents.tick`、`ServerEvents.commandRegistry` 注册的命令）内部再套一层 try/catch，保证事件回调自身崩溃不影响 MC 主线程。

### 3.2 日志前缀约定
所有 `console.log` 都带模块前缀，便于定位：
- `[ATIP]` — AuraTip 教学系统
- `[PF]` / `[PF-SLEEP]` / `[PF-GALLERY-UI]` / `[PF-CONFIG-UI]` — Pathfinder 子系统
- `[PHONE-UI]` — 手机 UI
- `[STAMINA-HUD]` — 体力 HUD
- `[FOOT-UI]` / `[FOOT-UI-DATA]` — 泡脚 UI
- `[SERVE-HOOK]` — serve hook 框架

### 3.3 防御性编程
- 对可选 API 先做 `typeof X !== "undefined" && typeof X === "function"` 检查（见 `auratip_triggers.js` 的 `canClose()`）。
- 对 NBT 字段读取用 try/catch 包裹，避免缺少字段导致崩溃（`findActionPlayer`、`pfBedManager`、`pfBedBreakHandler` 多处）。
- 对玩家实体存在性做空值判断后再调用（如 `player.tell` 包裹 try/catch）。

### 3.4 无统一错误类型
仓库中没有定义任何自定义 Error 子类、错误码常量或错误聚合对象。错误信息全部以字符串形式拼接到 `console.log` 中，由用户从 `logs/` 目录下的日志文件中排查。

## 4. 约定与约束

- **观察到的约定**：
  - 所有 `catch` 块要么 `console.log` 错误信息，要么空捕获（`catch (e) {}`）用于忽略可预期失败（如 NBT 字段不存在）。
  - 客户端 UI 初始化代码普遍被 try/catch 包裹，确保 UI 加载失败不会阻止游戏启动。
  - 服务端 tick 级回调中的副作用（发消息、改 NBT）通常各自 try/catch，避免单条消息发送失败拖垮整个 tick。
  - 日志统一走 `console.log`，没有引入结构化日志库或分级日志。
- **非强制约束**：未发现 lint 规则、CI 校验或文档强制要求某种错误处理方式；上述模式是代码实际呈现出的惯例，而非被工具链强制执行的规范。
- **已知缺口**：没有 panic/recover（JS 无此概念）、没有中间件式错误传播、没有错误上报机制；严重错误最终表现为 Minecraft crash report（仓库根下 `crash-reports/` 有大量历史崩溃报告）和 Java `hs_err_pid*.log`。

## 5. 结论

该仓库的错误处理是「分散式容错」：每个脚本模块自行决定哪些操作需要 try/catch，并以带前缀的 `console.log` 输出诊断信息。这种模式简单直接，适合 KubeJS 脚本规模，但缺乏统一的错误抽象、错误恢复策略和错误上报通道。新增功能应沿用现有模式——对可能失败的外部调用包裹 try/catch，使用模块前缀的日志输出，并在 Hook 层保持「单个 hook 失败不阻断其他 hook」的语义。