---
kind: logging_system
name: Minecraft 整合包日志系统（KubeJS console.log + Forge/FML 日志）
category: logging_system
scope:
    - '**'
source_files:
    - logs/kubejs/client.log
    - logs/kubejs/server.log
    - logs/kubejs/startup.log
    - config/fml.toml
    - kubejs/client_scripts/ui/foot_ui.js
    - kubejs/client_scripts/ui/stamina_hud.js
    - kubejs/server_scripts/pathfinder/pfCustomerTypes.js
    - kubejs/server_scripts/pathfinder/pfBedBreakHandler.js
    - kubejs/server_scripts/item/fasciaGunHandler.js
    - kubejs/server_scripts/auratip_triggers.js
---

## 1. 使用的系统与框架

本仓库是一个基于 Forge 1.20.1 的 Minecraft 整合包，**没有自定义 Java 代码中的结构化日志框架**。日志输出由以下两层构成：

- **Forge / FML 运行时日志**：由 Forge 自身写入根目录 `logs/`，包括按日期分片压缩的滚动日志（如 `logs/2026-03-22-15.log.gz`）、`latest.log`、`debug.log`、`aui.log`、`sdmengineinit.log` 等。
- **KubeJS JavaScript 脚本日志**：通过 JS 原生的 `console.log()` 输出，被 KubeJS/Rhino 引擎捕获并写入 `logs/kubejs/client.log`、`logs/kubejs/server.log`、`logs/kubejs/startup.log`。

此外，根目录下还存在 JVM 崩溃转储（`hs_err_pid*.log`、`replay_pid*.log`），以及 `CustomSkinLoader/CustomSkinLoader.log` 和 `authlib-injector.log` 等第三方组件日志。

## 2. 关键文件与位置

- `logs/` — Forge/FML 主日志目录，包含大量按 `YYYY-MM-DD-N.log.gz` 命名的滚动归档。
- `logs/kubejs/client.log` — KubeJS 客户端脚本加载与运行日志。
- `logs/kubejs/server.log` — KubeJS 服务器端脚本加载与运行日志。
- `logs/kubejs/startup.log` — KubeJS 启动阶段日志。
- `config/fml.toml` — Forge Mod Loader 配置（当前未显式调整日志级别）。
- `kubejs/client_scripts/**` — 客户端 KubeJS 脚本，使用 `console.log("[FOOT-UI] ...")` 等前缀输出调试信息。
- `kubejs/server_scripts/**` — 服务端 KubeJS 脚本，同样使用 `console.log("[PF-CUSTOMER] ...")` 等带模块前缀的输出。

## 3. 架构与约定

### 3.1 日志分类（按来源）

| 来源 | 输出文件 | 内容 |
|---|---|---|
| Forge/FML | `logs/<date>-N.log.gz`, `latest.log`, `debug.log` | 模组加载、事件、异常堆栈 |
| KubeJS 客户端 | `logs/kubejs/client.log` | 客户端脚本加载、Java 类加载、`console.log` |
| KubeJS 服务端 | `logs/kubejs/server.log` | 服务端脚本加载、配方注册、`console.log` |
| KubeJS 启动 | `logs/kubejs/startup.log` | 启动阶段初始化信息 |
| CustomSkinLoader | `CustomSkinLoader/CustomSkinLoader.log` | 皮肤加载器日志 |
| 其他第三方 | `aui.log`, `sdmengineinit.log`, `authlib-injector.log` | 对应模组日志 |

### 3.2 KubeJS 脚本日志约定

所有 KubeJS 脚本统一使用原生 `console.log()`，并通过**方括号模块前缀**区分来源，例如：

- `[PF-*]` — Pathfinder 泡脚系统相关（`pathfinder/pfCustomerTypes.js`、`pathfinder/pfMain.js`、`pathfinder/pfBedBreakHandler.js` 等）。
- `[FASCIA-GUN]` — 筋膜枪物品处理（`item/fasciaGunHandler.js`）。
- `[ATIP]` / `[ATIP-CLIENT]` — AuraTip 教学提示（`auratip_triggers.js`、`client_scripts/auratip/auratip_tips.js`）。
- `[FOOT-UI]` / `[PHONE-UI]` / `[STAMINA-HUD]` — ApricityUI 客户端 UI 子系统（`client_scripts/ui/*.js`）。
- `[BACKPACK-INIT]`、`[GACHA]`、`[SOAK-WATER-CREATE]`、`[RELIC-RECIPE]` 等 — 各功能模块的初始化与关键流程。

这些日志行在 `logs/kubejs/server.log` 中表现为 KubeJS 自身的 `[INFO]` 级别条目，格式为：

```
[HH:MM:SS] [INFO] <file_path>#<line>: <module-prefix> <message>
```

例如：
```
[00:17:48] [INFO] pathfinder/pfCustomerTypes.js#837: [PF-CUSTOMER] 顾客类别表已加载，活跃类别: ningen, yousei, oni, tsukikou（含评价加权系统）
```

### 3.3 日志级别策略

- **无自定义 Logger 抽象**：脚本直接调用 `console.log()`，没有统一的 log level、sink 或格式化层。
- **默认 INFO 级别**：KubeJS 将所有 `console.log` 输出到对应 channel 的 INFO 级别；错误/警告由 Forge 的 recipe 解析器以 `[WARN] Failed to parse recipe ...` 形式输出。
- **调试日志**：部分脚本（如 `pfBedBreakHandler.js`）使用 `[DEBUG-BEDBREAK]` 前缀输出详细调试信息，但并未配合任何开关控制其输出量。
- **无结构化字段**：日志是纯文本字符串拼接，没有 JSON 或键值对结构。

### 3.4 日志轮转与保留

- Forge 自动将主日志按日期+序号进行 gzip 压缩归档（`logs/2026-03-22-15.log.gz` 等），数量众多，表明整合包长期运行且频繁重启。
- `latest.log` 是当前活动日志，`debug.log` 是 debug 模式日志。
- `crash-reports/` 目录集中保存了所有崩溃报告（`crash-YYYY-MM-DD_HH.MM.SS-client.txt` 等），由 Forge 自动生成。

## 4. 约定与约束

- **观察到的约定**：
  - KubeJS 脚本通过 `console.log()` 输出，并使用 `[MODULE-PREFIX]` 方括号前缀标识来源模块。
  - 客户端脚本位于 `kubejs/client_scripts/`，服务端脚本位于 `kubejs/server_scripts/`，分别输出到 `logs/kubejs/client.log` 与 `logs/kubejs/server.log`。
  - 模块初始化成功时输出形如 `[MODULE] 模块已加载` 的信息；失败路径通常附带 `: " + e` 的错误信息。
  - Forge/FML 主日志按日期分片并 gzip 压缩，保存在 `logs/` 下。

- **不存在强制约束**：仓库中没有统一的 logger 封装、日志级别枚举、配置文件化的日志开关，也没有 lint 规则强制日志格式。日志风格完全依赖开发者自觉遵循上述前缀约定。

- **`config/fml.toml` 未启用额外日志选项**：当前 Forge 配置文件中没有设置 `debug=true` 或其他日志级别参数，仅保留了窗口、线程数等基础项。

## 5. 总结

该整合包的「日志系统」本质上是 **Forge/FML 原生日志 + KubeJS 的 `console.log` 直写**，没有引入额外的日志库或结构化日志框架。日志的可读性依赖于脚本作者约定的 `[MODULE-PREFIX]` 命名风格，而非任何运行时机制。新增日志点应遵循现有前缀命名惯例，并将调试信息放入 `logs/kubejs/{client,server}.log` 对应通道。