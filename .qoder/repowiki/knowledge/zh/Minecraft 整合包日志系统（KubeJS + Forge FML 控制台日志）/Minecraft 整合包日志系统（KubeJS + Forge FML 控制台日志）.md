---
kind: logging_system
name: Minecraft 整合包日志系统（KubeJS + Forge FML 控制台日志）
category: logging_system
scope:
    - '**'
source_files:
    - logs/latest.log
    - logs/kubejs/startup.log
    - logs/kubejs/client.log
    - logs/kubejs/server.log
    - kubejs/config/client.properties
    - kubejs/config/common.properties
    - config/fml.toml
    - CustomSkinLoader/CustomSkinLoader.log
    - logs/aui.log
    - logs/sdmengineinit.log
---

## 1. 使用的系统与框架

本仓库是一个 Minecraft Forge/NeoForge 整合包，没有自定义 Java/Kotlin 日志框架。日志由两层输出：
- **Forge/FML 运行时**：通过 `logs/latest.log`、`logs/debug.log`、`logs/<日期>-N.log.gz` 等文件输出，格式为 `[时间戳] [线程]/[级别] [来源]: 消息`。
- **KubeJS 脚本层**：使用 KubeJS 内置的 `console.log()` 与 KubeJS 自身的 INFO/WARN 输出通道，分别写入 `logs/kubejs/client.log`、`server.log`、`startup.log`。

此外还有第三方组件的独立日志：
- `CustomSkinLoader/CustomSkinLoader.log`
- `logs/aui.log`（ApricityUI 模组）
- `logs/sdmengineinit.log`
- `crash-reports/crash-*.txt`（崩溃堆栈，非普通日志）
- `hs_err_pid*.log`（JVM 崩溃报告）

## 2. 关键文件与目录

- `logs/`：Forge/FML 主日志目录，按日期分片并 gzip 压缩（如 `2026-11-14-16.log.gz`），`latest.log` 为当前会话软链接。
- `logs/kubejs/startup.log`：KubeJS 启动阶段脚本加载日志，记录每个 startup_scripts/*.js 的加载耗时、Java class 反射加载、注册事件等。
- `logs/kubejs/client.log` / `server.log`：KubeJS 客户端/服务端运行期日志。
- `kubejs/config/client.properties`、`kubejs/config/common.properties`：KubeJS 配置（可控制日志级别等）。
- `config/fml.toml`：Forge/FML 核心配置，包含 log 相关选项。
- `kubejs/startup_scripts/tooltip.js`：高频调试日志源（每约 2 秒输出一条 `[NINE-STAR] poseStack=null`）。

## 3. 架构与约定

### 3.1 Forge/FML 日志格式
每条日志遵循统一格式：
```
[DDMMMYYYY HH:MM:SS.mmm] [线程名/LEVEL] [LoggerName]: 消息
```
示例：
- `[1711月2026 00:00:00.844] [Render thread/INFO] [KubeJS Startup/]: tooltip.js#117: [NINE-STAR] poseStack=null`
- `[1711月2026 00:02:16.999] [Render thread/ERROR] [com.sighs.apricityui.ApricityUI/]: Failed to reflectively persist LocalStorage...`

级别包括 `INFO`、`WARN`、`ERROR`，线程名区分 `Render thread`、`Server thread`、`Worker-Main-1` 等。

### 3.2 KubeJS 日志分层
- **启动期**（`startup.log`）：KubeJS 自动打印 `[INIT] Loaded script ... in X s`、`Loaded Java class '...'`、脚本内 `console.log` 输出，以及 WARN 级别的弃用 API 警告（如 `blockBuilder.material(string) is no longer supported!`）。
- **运行期**（`client.log` / `server.log`）：脚本中的 `console.log(...)` 输出，通常带模块前缀如 `[PF-GALLERY-UI]`、`[PHONE-UI]`、`[STAMINA-HUD]`、`[FOOT-UI]`、`[TOOLTIP]`、`[BOSS]`、`[SOAK-WATER]` 等，用于标识来源子系统。

### 3.3 结构化字段约定
日志中通过方括号标签实现轻量结构化：
- 模块标签：`[NINE-STAR]`、`[TOOLTIP]`、`[BOSS]`、`[FOOD]`、`[CUN-WATER]`、`[ELECTROLYTE]`、`[FUMA-PROD]`、`[USED-FOOT-WATER]`、`[FUMA-LOW-PH-WASHING-WATER]`、`[AIR-STRUCTURE]`、`[HAND]`、`[MAGIC-DUST]`、`[MAGIC-INGOT]`、`[SLOT-EXPANDER]`、`[STAMINA_POTION]`、`[VOUCHER]`、`[PF-GALLERY-UI]`、`[FADE-TEST]`、`[FOOT-UI]`、`[PF-CONFIG-UI]`、`[PHONE-UI]`、`[PF-RARE-UI]`、`[STAMINA-HUD]`。
- 键值对：在消息体中以 JSON-like 形式嵌入，如 `id=boss_alice, model=touhou_little_maid:alice_margatroid, trigger=..., demandRanges={...}, satMul=0.4, satTarget=60, time=60s`。

### 3.4 日志轮转策略
- Forge 默认按天分片，同一天多次启动追加序号后缀（`2026-11-14-1.log.gz`、`2026-11-14-15.log.gz` 等）。
- 旧日志自动 gzip 压缩。
- `latest.log` 始终指向当前活动日志。

## 4. 约定与约束

- **KubeJS 脚本统一使用 `console.log()` 输出调试信息**，所有 `client_scripts/` 下的 UI 脚本均遵循此模式，并以 `[模块名]` 前缀标识来源。
- **启动期脚本通过 KubeJS 原生 INFO 通道输出注册结果**（如 `已注册物品:`、`已注册流体:`、`共自动注册 N 个召唤符物品`），便于在 `startup.log` 中追踪模组装配过程。
- **弃用 API 调用会触发 KubeJS WARN 级别告警**（如 `blockBuilder.material(string) is no longer supported! Use .soundType(SoundType) and .mapColor(MapColor) instead!`），这是 KubeJS 自身强制输出的约束。
- **高频调试日志存在性能问题**：`tooltip.js` 中每秒约 0.5 条 `[NINE-STAR] poseStack=null` 的循环日志被观察到，属于开发期遗留的高频输出，未做节流或条件开关。
- **无统一的日志门面或等级配置中心**：日志级别依赖 Forge/FML 和 KubeJS 各自的配置文件（`config/fml.toml`、`kubejs/config/*.properties`），项目内未定义自定义 logger 初始化代码。
- **错误日志直接输出完整 Java 堆栈**：如 ApricityUI 的 `Failed to reflectively persist LocalStorage` 异常以 `ERROR` 级别附带完整 `java.lang.NoSuchMethodException` 堆栈，便于定位 NBT API 不兼容问题。

## 5. 结论

该仓库的“日志系统”本质上是 **Minecraft Forge/FML 控制台日志 + KubeJS 脚本 console.log** 的组合，没有自定义日志框架、结构化日志库或集中式路由。日志组织完全依赖 Forge 的文件命名约定和 KubeJS 的脚本生命周期输出，开发者通过模块前缀标签进行语义分组。