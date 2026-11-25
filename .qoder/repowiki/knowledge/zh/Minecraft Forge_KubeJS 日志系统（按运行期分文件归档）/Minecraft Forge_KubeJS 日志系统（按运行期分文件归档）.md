---
kind: logging_system
name: Minecraft Forge/KubeJS 日志系统（按运行期分文件归档）
category: logging_system
scope:
    - '**'
source_files:
    - logs/
    - logs/kubejs/startup.log
    - logs/kubejs/server.log
    - logs/kubejs/client.log
    - config/fml.toml
    - kubejs/config/common.properties
    - CustomSkinLoader/CustomSkinLoader.log
---

## 1. 使用的框架与工具

本仓库是一个基于 **Forge 1.20.1 + KubeJS** 的 Minecraft 整合包，没有引入独立的 Java 日志框架（如 Log4j、SLF4J）。日志由 Forge 运行时和 KubeJS 引擎各自输出：

- **Forge/FML 日志**：由 Forge 自身写入 `logs/` 根目录，文件名形如 `2026-XX-XX-N.log(.gz)`，并按日期+序号滚动压缩。
- **KubeJS 日志**：由 KubeJS 引擎写入 `logs/kubejs/`，分为三个固定文件：`startup.log`、`server.log`、`client.log`，分别对应启动阶段、服务端脚本、客户端脚本的输出。
- **CustomSkinLoader 日志**：位于 `CustomSkinLoader/CustomSkinLoader.log`，是第三方 Mod 自带的独立日志。
- **崩溃报告**：位于 `crash-reports/`，由 Forge 自动生成，命名形如 `crash-YYYY-MM-DD_HH.MM.SS-client.txt` / `-server.txt` / `-fml.txt`。

## 2. 关键文件与位置

| 路径 | 作用 |
|---|---|
| `logs/` | Forge 主日志目录，按日期+序号滚动，已 `.gz` 压缩归档 |
| `logs/latest.log` | 当前正在写入的 Forge 日志软链接/副本 |
| `logs/debug.log` | 调试级 Forge 日志（存在多个 `debug-N.log.gz`） |
| `logs/kubejs/startup.log` | KubeJS 启动阶段脚本日志 |
| `logs/kubejs/server.log` | KubeJS 服务端脚本日志 |
| `logs/kubejs/client.log` | KubeJS 客户端脚本日志 |
| `config/fml.toml` | Forge/FML 配置入口（未包含日志级别相关字段） |
| `kubejs/config/common.properties` | KubeJS 通用属性，含 `announceReload=true`、`hideServerScriptErrors=false`、`startupErrorGUI=true` 等影响日志/错误可见性的开关 |
| `CustomSkinLoader/CustomSkinLoader.log` | CustomSkinLoader 插件的独立日志 |

## 3. 架构与约定

- **无自定义日志门面**：项目代码（KubeJS JS 脚本、资源包、配置文件）中未见对结构化日志库的引用；日志输出主要由 Forge 和 KubeJS 引擎在内部完成。
- **按运行期分流**：KubeJS 将日志按生命周期拆分为 startup / server / client 三类，便于区分不同阶段的脚本行为。
- **按日期滚动归档**：Forge 日志以 `YYYY-MM-DD-N.log` 命名并自动 gzip 压缩，保留历史会话。
- **崩溃与异常分离**：崩溃堆栈单独进入 `crash-reports/`，与常规 `logs/` 分开，避免混淆。
- **KubeJS 错误可见性**：`common.properties` 中 `hideServerScriptErrors=false` 表示服务器端脚本错误默认不隐藏；`startupErrorGUI=true` 表示启动期错误会弹出 GUI 提示。

## 4. 约定与约束

- **日志位置约定**：所有 Forge 日志统一输出到 `logs/`，KubeJS 日志统一输出到 `logs/kubejs/`——这是 Forge/KubeJS 的默认行为，而非本项目自定义。
- **KubeJS 脚本错误处理**：通过 `kubejs/config/common.properties` 控制：`hideServerScriptErrors=false` 使服务端脚本错误可见，`announceReload=true` 会在重载时打印通知日志。
- **无结构化字段规范**：仓库内未发现统一的 JSON/键值对结构化日志格式或字段命名约定；日志内容基本为 Forge/KubeJS 引擎生成的纯文本行。
- **无自定义日志级别策略**：未在 `fml.toml` 或 `common.properties` 中发现针对日志级别（DEBUG/INFO/WARN/ERROR）的全局开关，日志过滤依赖 Forge 自身的控制台/文件输出机制。