---
kind: error_handling
name: KubeJS 脚本中的 try/catch + console.log 错误处理模式
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/server_scripts/powerfuljs/fe_utils.js
    - kubejs/client_scripts/ui/maid_stats_ui.js
    - kubejs/server_scripts/pathfinder/pfBasinSoakManager.js
    - kubejs/server_scripts/pathfinder/pfBedBreakHandler.js
    - kubejs/server_scripts/pathfinder/pfBedManager.js
    - kubejs/server_scripts/pathfinder/pfNetworkHandler.js
    - kubejs/server_scripts/pathfinder/pfRareAffection.js
    - kubejs/server_scripts/pathfinder/pfSleepManager.js
    - kubejs/client_scripts/ui/foot_ui.js
---

## 1. 总体情况

本仓库是 Minecraft 1.20.1 Forge 整合包（`洗手.jar`），核心逻辑由 KubeJS（Rhino JS）脚本构成，位于 `kubejs/` 下。仓库没有自定义 Java 源码模块，因此不存在传统意义上的「异常类型体系、sentinel error、中间件」——错误处理完全体现在 KubeJS 脚本的运行时容错策略上。

## 2. 使用的机制

- **try / catch**：所有可能抛异常的 JS 调用（网络数据解析、Java class 加载、NBT 读取、命令执行等）都被包裹在 try/catch 中。
- **console.log / console.error**：作为唯一的日志输出手段，错误信息以带前缀的字符串形式写入 `logs/` 下的日志文件（如 `debug.log`、`aui.log`、`sdmengineinit.log`）。
- **crash-reports/**：Forge/FML 在 JVM 崩溃时生成的 `crash-*.txt` 与根目录的 `hs_err_pid*.log`（JVM 崩溃报告）是 Java 层错误的最终兜底产物，不属于应用代码控制范围。
- **无统一错误对象**：未发现自定义 Error 类、错误码枚举或统一的错误传播通道；每个脚本各自捕获并记录。

## 3. 关键文件与位置

- `kubejs/client_scripts/ui/phone_ui.js`：客户端 UI 网络数据接收处，对 `NetworkEvents.dataReceived` 回调做 try/catch，失败时 `console.log("[PHONE-UI] 设置同步失败: " + e)`。
- `kubejs/server_scripts/powerfuljs/fe_utils.js`：FE 电力工具函数，`pfConsumeFE` / `pfGetItemFE` / `pfGetItemMaxFE` 全部用 try/catch 包裹 Capability 访问，失败返回默认值（`false` / `0`）而非抛出。
- `kubejs/client_scripts/ui/maid_stats_ui.js`：使用 `console.error('[MAID-STATS] 无法创建文档: ' + PF_MAID_STATS_DOC)` 输出 UI 初始化失败。
- `kubejs/server_scripts/pathfinder/pfBasinSoakManager.js`：批量命令执行处 `server.runCommandSilent(cmds[i])` 被 try/catch 包裹，忽略单条命令失败。
- `kubejs/server_scripts/pathfinder/pfBedBreakHandler.js`、`pfBedManager.js`、`pfNetworkHandler.js`、`pfRareAffection.js`、`pfSleepManager.js`：大量 try/catch 用于玩家/NBT/命令调用的容错。
- `kubejs/client_scripts/ui/foot_ui.js`：WorldWindow 移除队列中多处 `try { WorldWindow.removeWindow(...) } catch (e) {}` 空 catch，确保清理流程不被单个窗口删除失败阻断。
- `crash-reports/`：数百个 `crash-YYYY-MM-DD_*.txt` 文件，是 Forge/FML 自动保存的崩溃堆栈，按时间命名。
- `logs/`：按日期分卷的 `YYYY-MM-DD-N.log.gz` 以及 `debug.log`、`latest.log`、`aui.log`、`sdmengineinit.log` 等。

## 4. 观察到的约定与约束

- **网络数据回调一律 try/catch**：`phone_ui.js`、`character_gallery_ui.js`、`fade_test_ui.js`、`pathfinder_config_ui.js`、`rare_affection_ui.js` 等客户端 UI 脚本对 `NetworkEvents.dataReceived` 回调统一包裹 try/catch，避免一条损坏的数据导致整个事件循环中断。
- **可选 Capability 访问返回安全默认值**：`fe_utils.js` 中 `pfGetItemFE` / `pfGetItemMaxFE` 在 item 为空或缺少 Capability 时直接返回 `0`，不抛异常；`pfConsumeFE` 返回 `false` 表示失败。
- **清理操作使用空 catch**：登出清理、窗口销毁等副作用操作中普遍采用 `catch (e) {}` 空块，表明「清理失败不应影响主流程」。
- **日志前缀约定**：不同子系统使用方括号前缀区分来源，如 `[PHONE-UI]`、`[PF-FE]`、`[MAID-STATS]`，便于在 `logs/` 中 grep。
- **未观察到 throw / 自定义错误类型**：搜索 `throw new Error`、`throw new` 在本仓库 KubeJS 脚本中未见；错误通过返回值（`false` / `0` / `null`）和 console 输出传达。
- **JVM 级崩溃由 Forge 托管**：`crash-reports/` 与根目录 `hs_err_pid*.log`、`replay_pid*.log` 均由 Forge/JVM 生成，应用代码不参与其格式或收集。

## 5. 结论

该仓库的错误处理不是「架构化」的系统，而是 KubeJS 脚本层面的**分散式 try/catch + console.log 日志**模式，辅以 Forge 自带的 crash-report 机制。没有统一的错误类型、错误码、中间件或全局处理器；可观测性依赖日志前缀约定，健壮性依赖在每个外部交互点（网络、Capability、命令、NBT）就近捕获异常。