---
kind: logging_system
name: Minecraft Forge/ModLauncher 日志系统（整合包视角）
category: logging_system
scope:
    - '**'
source_files:
    - logs/latest.log
    - logs/debug.log
    - logs/kubejs/client.log
    - logs/kubejs/server.log
    - logs/kubejs/startup.log
    - logs/aui.log
    - logs/sdmengineinit.log
    - config/fml.toml
    - kubejs/config/common.properties
    - kubejs/config/client.properties
    - defaultconfigs/dimdungeons-server.toml
    - CustomSkinLoader/CustomSkinLoader.log
---

## 1. 使用的系统与框架

本仓库是一个 Minecraft 1.20.1 Forge 整合包，**没有自定义的日志框架或结构化日志库**。日志由 Forge / ModLauncher 运行时统一输出，格式遵循 FML 标准：

`[时间戳] [线程]/[LEVEL] [来源/LOGGER]: 消息`

例如 `latest.log` 中的行：
- `[main/INFO] [cpw.mods.modlauncher.Launcher/MODLAUNCHER]: ...`
- `[Render thread/WARN] [Embeddium-MixinTaintDetector/]: ...`
- `[modloading-worker-0/INFO] [KubeJS/]: Loaded common.properties`

日志级别使用 Java Util Logging 风格的枚举：`INFO`、`WARN`、`ERROR`（未见 `DEBUG` 级别的常规业务日志）。

## 2. 关键文件与位置

| 路径 | 作用 |
|---|---|
| `logs/latest.log` | 当前运行会话的主日志（未压缩），包含 Forge/ModLauncher/KubeJS/各 mod 的输出 |
| `logs/2026-MM-DD-N.log(.gz)` | 按日期+序号归档的历史日志（大量 `.gz` 压缩归档） |
| `logs/debug.log` / `logs/debug-N.log.gz` | Forge debug 日志（独立于 latest.log） |
| `logs/kubejs/client.log`、`server.log`、`startup.log` | KubeJS 脚本自身的日志分流 |
| `logs/aui.log` | ApricityUI 模块的独立日志 |
| `logs/sdmengineinit.log` | SDMEngine 初始化日志 |
| `CustomSkinLoader/CustomSkinLoader.log` | CustomSkinLoader 子进程的独立日志 |
| `config/fml.toml` | Forge/FML 运行时配置（含窗口、线程等选项，无显式日志级别开关） |
| `kubejs/config/common.properties` | KubeJS 通用属性（`hideServerScriptErrors`、`announceReload` 等影响日志可见性） |
| `kubejs/config/client.properties` | KubeJS 客户端 UI 颜色（`fmlLogColor`、`fmlMemoryColor`） |
| `defaultconfigs/dimdungeons-server.toml` | 第三方 mod 的日志级别示例（`logLevel = "error"`，可选 `all`/`warn`/`error`） |
| `crash-reports/crash-*.txt` | CrashReport（非普通日志，但属于诊断输出） |

## 3. 架构与约定

- **单进程主日志**：所有 mod（Forge、KubeJS、Embeddium、Oculus、FTB、SDMShop 等）共享 `latest.log`，通过方括号中的 logger 名称区分来源。
- **按日归档**：历史日志以 `YYYY-MM-DD-N.log(.gz)` 命名并 gzip 压缩，由 PCL/Forge 自动轮转。
- **子系统分离**：KubeJS 将自身日志写入 `logs/kubejs/{client,server,startup}.log`；APRICITYUI 写 `aui.log`；SDMEngine 写 `sdmengineinit.log`；CustomSkinLoader 有独立 `CustomSkinLoader.log`。
- **Crash 报告**：崩溃堆栈单独写入 `crash-reports/crash-YYYY-MM-DD_HH.MM.SS-(client|server|fml).txt`，另有 `hs_err_pid*.log`（JVM 崩溃）和 `replay_pid*.log`。
- **Telemetry**：`logs/telemetry/` 目录存在（用于某些 mod 的性能遥测），但仓库中为空。
- **KubeJS 脚本层**：未发现整合包内自定义 JS 调用 `console.log` 或 KubeJS Logger API 的代码片段；KubeJS 日志主要由其内部加载流程产生（如 `Loaded client.properties`、`Found plugin source ...`）。

## 4. 约定与约束

- **日志级别策略**：整合包本身未设置全局日志级别；默认使用 Forge/ModLauncher 的 INFO 级别。仅第三方 mod（如 dimdungeons）在自身 config 中提供 `logLevel` 字段（`all`/`warn`/`error`）来抑制噪音。
- **KubeJS 错误可见性**：`kubejs/config/common.properties` 中 `hideServerScriptErrors=false` 表示服务器端脚本错误默认显示在日志中；`announceReload=true` 会在 reload 时打印通知。
- **颜色主题**：`kubejs/config/client.properties` 通过 `fmlLogColor=ECEFF4`、`fmlMemoryColor=ECEFF4` 控制 KubeJS 菜单中 FML 日志的颜色。
- **无结构化字段**：日志为纯文本，无 JSON 结构化字段、无 traceId/spanId、无统一的 key-value 字段——这是 Minecraft Forge 生态的固有限制。
- **无自定义 sink**：整合包未引入 Log4j2、SLF4J、Lombok Logger 等外部日志框架，也未编写任何日志门面或适配器代码。

总结：这是一个典型的 Minecraft Forge 整合包日志体系——依赖 Forge/ModLauncher 的原生日志输出，按日期归档到 `logs/`，KubeJS 等子系统可写独立日志文件，但没有应用层自定义的日志框架或结构化规范。