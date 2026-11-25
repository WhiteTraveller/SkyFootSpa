---
kind: logging_system
name: 日志系统 — Forge/ModLauncher 默认输出 + KubeJS 独立日志（无自定义日志框架）
category: logging_system
scope:
    - '**'
source_files:
    - logs/debug.log
    - logs/latest.log
    - logs/kubejs/client.log
    - logs/kubejs/server.log
    - logs/kubejs/startup.log
    - logs/aui.log
    - logs/sdmengineinit.log
    - config/fml.toml
    - config/forge-client.toml
    - CustomSkinLoader/CustomSkinLoader.log
---

## 概述

本仓库是 Minecraft 1.20.1 Forge 整合包（非 Java 工程），没有自研的日志框架或结构化日志中间件。日志由 Forge / ModLauncher 运行时与 KubeJS 各自产生，分别写入 `logs/` 目录。

## 使用的系统与框架

- **Forge / ModLauncher**：通过 `cpw.mods.modlauncher.Launcher`、`net.minecraftforge.fml.loading.FMLServiceProvider`、`mixin` 等 logger 输出启动期日志，级别为 `INFO` / `DEBUG`。
- **KubeJS**：独立的 JS 脚本引擎，自带 `[INIT]` / `[INFO]` 级别的日志子系统。
- **CustomSkinLoader**：单独在根目录生成 `CustomSkinLoader.log`。
- **APRICITYUI (ApricityUI)**：Java 模组，在 `logs/aui.log` 输出自身日志。

## 关键文件与位置

| 路径 | 内容 |
|---|---|
| `logs/debug.log` | Forge/ModLauncher 主进程日志（含大量 `DEBUG` 级 mod 扫描、Mixin、GL 初始化信息） |
| `logs/latest.log` | 当前会话的 Forge 主日志（符号链接/软链接指向最新） |
| `logs/2026-XX-XX-N.log.gz` | 按日期+序号归档的压缩日志轮转文件 |
| `logs/kubejs/client.log` | KubeJS 客户端脚本加载与运行日志 |
| `logs/kubejs/server.log` | KubeJS 服务端脚本日志 |
| `logs/kubejs/startup.log` | KubeJS 启动阶段日志 |
| `logs/aui.log` | ApricityUI 模组日志 |
| `logs/sdmengineinit.log` | SDMEngine 初始化日志 |
| `config/fml.toml` | Forge 配置（未包含日志级别设置项） |
| `config/forge-client.toml` | Forge 客户端配置（仅含 `showLoadWarnings = true`，与日志无关） |
| `CustomSkinLoader/CustomSkinLoader.log` | CustomSkinLoader 插件日志 |

## 架构与约定

### 1) Forge / ModLauncher 日志

- 格式遵循 ModLauncher 标准：`[时间戳] [线程]/[LEVEL] [logger.name/MODID]: 消息`。
- 示例行：
  ```
  [1311月2026 20:02:54.638] [main/INFO] [cpw.mods.modlauncher.Launcher/MODLAUNCHER]: ModLauncher running: args [...]
  [1311月2026 20:02:54.699] [main/DEBUG] [net.minecraftforge.fml.loading.FMLPaths/CORE]: Path GAMEDIR is E:\Minecraft\pcl\.minecraft\versions\洗手
  ```
- 日志级别以 `INFO` / `DEBUG` 为主；未发现 `WARN` / `ERROR` 级别的常规业务日志。
- 日志输出到 `logs/debug.log`，并由 Forge 自动按日期和序号进行 `.log.gz` 归档轮转。

### 2) KubeJS 日志

- 位于 `logs/kubejs/`，按运行环境拆分为 `client.log`、`server.log`、`startup.log`。
- 格式：`[HH:mm:ss] [LEVEL] 消息`，例如：
  ```
  [20:03:16] [INIT] KubeJS 2001.6.5-build.26; MC 2001 forge
  [20:03:16] [INFO] Loaded script client_scripts:tooltip/cunBlockTooltip.js in 0.002 s
  ```
- KubeJS 脚本中的调试输出使用 `console.log` 风格（如 `tooltip/relicTooltip.js#39: 0.0`），被 KubeJS 捕获并带文件名与行号前缀。
- 未见 KubeJS 侧的自定义 logger 封装或结构化字段。

### 3) 其他模组日志

- `logs/aui.log`：ApricityUI 模组的独立日志。
- `CustomSkinLoader/CustomSkinLoader.log`：皮肤加载器插件日志。
- `logs/sdmengineinit.log`：SDMEngine 初始化日志。

## 约定与约束

- **日志位置固定**：所有运行时日志统一落在 `logs/` 目录，按来源子目录划分（`kubejs/` 等）。
- **日志轮转**：Forge 自动生成 `YYYY-MM-DD-N.log.gz` 格式的归档文件，新会话从 `debug.log` / `latest.log` 开始。
- **无自定义日志框架**：仓库内不存在 `log/`、`logging/` 等源码目录，也没有对 SLF4J / Logback / Log4j2 等第三方日志库的自定义初始化代码；日志行为完全由 Forge/ModLauncher/KubeJS 默认实现决定。
- **无结构化字段**：日志为纯文本，不包含 JSON、键值对等结构化字段。
- **日志级别策略**：未发现项目级的日志级别配置文件；`config/fml.toml` 中无日志相关选项，`config/forge-client.toml` 仅暴露 `showLoadWarnings`（渲染警告显示开关）。实际日志级别由 Forge/ModLauncher 默认值控制。
- **KubeJS 调试输出**：脚本调试信息通过 KubeJS 内置 console 输出，带有 `filename.js#line:` 前缀，便于定位脚本问题。

## 结论

该整合包的“日志系统”本质上是 Forge/ModLauncher 与 KubeJS 两个独立日志源的简单叠加，没有跨模块的统一 logger 抽象、没有结构化日志、没有自定义 sink 路由。若需要扩展日志能力，应直接基于 Forge 的 ModLogger 或 KubeJS 的 console API 新增对应输出。