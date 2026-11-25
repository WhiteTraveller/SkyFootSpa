---
kind: error_handling
name: KubeJS 脚本的错误处理：try/catch + console 日志，无统一错误类型
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/startup_scripts/serveHooks.js
    - kubejs/startup_scripts/relic/relicTags.js
    - kubejs/startup_scripts/relic/relic.js
    - kubejs/startup_scripts/tooltip.js
    - kubejs/client_scripts/ui/rare_affection_ui.js
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - kubejs/client_scripts/ui/character_gallery_ui.js
    - kubejs/client_scripts/ui/maid_stats_ui.js
    - kubejs/server_scripts/pathfinder/pfNetworkHandler.js
    - kubejs/server_scripts/pathfinder/pfBasinSoakManager.js
    - kubejs/server_scripts/pathfinder/pfBedBreakHandler.js
    - kubejs/server_scripts/pathfinder/pfBossManager.js
    - kubejs/server_scripts/pathfinder/pfSleepManager.js
    - kubejs/server_scripts/pathfinder/pfSoakWaterEffects.js
    - kubejs/server_scripts/backpack/maid_stats.js
---

## 1. 系统/方法

本仓库是 Minecraft 1.20.1 Forge + KubeJS 整合包，业务逻辑全部以 JavaScript（Rhino）脚本编写。代码库中**没有自定义的异常类、错误码枚举或统一的错误传播框架**。错误处理完全依赖：
- `try { ... } catch (e) { ... }` 包裹易失败调用；
- `console.log / console.warn / console.error` 输出到 `logs/latest.log` 等日志文件；
- 启动期校验通过 `throw new Error(...)` 直接中断。

没有发现任何 `panic/recover`、中间件式错误处理器、全局 uncaught exception handler 或结构化错误对象。

## 2. 关键文件

| 文件 | 作用 |
|---|---|
| `kubejs/startup_scripts/serveHooks.js` | Serve 点击结算 hook 框架，集中捕获每个 hook 抛出的异常并 `console.log('[SERVE-HOOK] hook error: ' + e)`，避免单个 hook 崩溃主流程 |
| `kubejs/startup_scripts/relic/relicTags.js` | 唯一使用 `throw new Error(...)` 的位置，对九宫格/十字格坐标做边界校验 |
| `kubejs/client_scripts/ui/rare_affection_ui.js` | 客户端 UI 数据接收与页面打开的统一 try/catch 模板 |
| `kubejs/server_scripts/pathfinder/pfNetworkHandler.js` | 网络事件分发，多处 try/catch 包裹命令执行与同步逻辑 |
| `kubejs/server_scripts/pathfinder/pfBasinSoakManager.js` | 泡脚管理器，吞掉 `runCommandSilent` 和 NBT 读取异常 |
| `kubejs/server_scripts/backpack/maid_stats.js` | 女仆背包/属性计算，大量 try/catch 包裹 JSON 解析与数值转换 |
| `kubejs/startup_scripts/relic/relic.js` | 遗物装备/卸载回调，用 `console.error` 记录每个回调异常 |
| `kubejs/startup_scripts/tooltip.js` | Tooltip 文档创建失败时 `console.error` 并回退 |

## 3. 架构与约定

### 3.1 Hook 框架作为“伪中间件”
`serveHooks.js` 暴露三个全局 API：
```js
global.serveClickHooks = global.serveClickHooks || []
global.registerServeClickHook(hookFn)
global.runServeClickHooks(ctx)
```
`runServeClickHooks` 遍历已注册的 hook，逐个 try/catch，并在 hook 返回 `ctx.cancel` 时短路后续 hook。这是仓库里最接近“中间件”的结构，但仅用于 Serve 结算扩展点，并非通用错误处理机制。

### 3.2 客户端 UI 层：每处交互独立 try/catch
所有 `client_scripts/ui/*.js` 遵循同一模式：在 `NetworkEvents.dataReceived` 回调和 `screen()` 调用外层包裹 try/catch，失败时 `console.log("[PF-*] ... 失败: " + e)`，不向上抛出。例如 `rare_affection_ui.js`、`phone_ui.js`、`pathfinder_config_ui.js`、`character_gallery_ui.js`、`fade_test_ui.js`、`maid_stats_ui.js`。

### 3.3 服务端 pathfinder 子系统：静默吞错为主
`server_scripts/pathfinder/` 下几乎所有可能失败的 I/O 调用都被空 `catch` 包裹：
- `pfBasinSoakManager.js`：`runCommandSilent` 失败、NBT 字段缺失；
- `pfBedBreakHandler.js`：玩家消息发送失败；
- `pfBossManager.js`：按 UUID 取玩家失败；
- `pfSleepManager.js`：实体停止睡眠失败；
- `pfSoakWaterEffects.js`：NBT 回写、水效果回调失败。
这些 catch 体多为空 `{}`，即**静默忽略**，不记录日志。

### 3.4 启动期校验：直接 throw
`relicTags.js` 中的 `getNineGrid` / `getTenGrid` / `checkIfInBottom` 在中心编号越界时 `throw new Error('格子编号必须在 0-N 之间')`。由于这些函数在 startup 阶段被调用，异常会直接导致整合包加载失败——属于**配置校验型错误**，而非运行时可恢复错误。

### 3.5 日志分级约定
- `console.log`：常规调试信息，带模块前缀如 `[FOOT-UI]`、`[PF-RARE-UI]`、`[MAID-STATS]`、`[TOOLTIP]`、`[RELIC-EQUIP]`；
- `console.warn`：可恢复的异常分支，如 JSON 解析失败、tag 为 null、请求未找到实体；
- `console.error`：不可恢复的初始化失败，如 ApricityUI 文档创建失败、tooltip 元素缺失。

## 4. 约定与约束（描述性）

- **没有统一的错误类型**：未发现自定义 Error 子类、错误码常量文件或错误传播契约。
- **客户端 UI 错误一律本地消化**：`client_scripts/ui/*.js` 中所有 try/catch 都不重新抛出，也不向服务端上报，仅写入日志。
- **服务端 pathfinder 子系统倾向静默失败**：大量空 `catch {}` 包裹 `runCommandSilent`、NBT 读取、实体查找等操作，使单步失败不影响整体流程。
- **hook 框架保证隔离**：`serveHooks.js` 的 `runServeClickHooks` 确保某个 hook 抛异常不会中断其他 hook 的执行。
- **启动期参数校验走 throw**：仅在 `startup_scripts/relic/relicTags.js` 中对网格坐标做显式范围检查并抛 `Error`。
- **日志前缀约定**：各模块使用方括号前缀标识来源（`[PF-*]`、`[MAID-*]`、`[SERVE-*]`、`[RELIC-*]`、`[TOOLTIP]`），便于从 `logs/` 中过滤。
- **无全局异常处理器**：仓库中没有 `process.on('uncaughtException')`、`ScriptEngine` 级别的异常拦截器或 AOP 式错误中间件。

## 5. 结论

该仓库的 error_handling 处于**非常原始的状态**：没有框架、没有类型、没有统一策略，只有分散的 try/catch 和带模块前缀的 console 日志。唯一的“架构化”部分是 `serveHooks.js` 提供的 hook 注册/执行框架，但它只解决 hook 间隔离问题，不解决错误分类、上报或恢复。