---
kind: logging_system
name: KubeJS 控制台日志与 Forge/模组日志输出体系
category: logging_system
scope:
    - '**'
source_files:
    - kubejs/README.txt
    - kubejs/powerfuljs_fe_guide.md
    - logs/kubejs/client.log
    - logs/kubejs/server.log
    - logs/kubejs/startup.log
    - CustomSkinLoader/CustomSkinLoader.log
---

## 1. 使用的系统与框架

本仓库是一个 Minecraft 1.20.1 Forge 整合包，**没有自定义的日志框架或结构化日志库**。日志由以下来源产生：

- **Forge / KubeJS 自身**：通过 Forge 的 `FML` 日志系统输出 `[INIT]`、`[INFO]` 等带时间戳和线程名的行，写入 `logs/` 目录。
- **KubeJS JavaScript 脚本**：统一使用浏览器/Node 风格的 `console.log(...)` 进行调试输出，由 KubeJS 引擎捕获并转译为 Forge 日志。
- **第三方模组**（如 CustomSkinLoader）：各自自带 Java Logger，输出到独立文件（如 `CustomSkinLoader/CustomSkinLoader.log`）。

项目未引入任何第三方 JS 日志库（如 Winston、Pino、log4js），也没有封装统一的 logger 模块。所有业务日志都是直接调用 `console.log`。

## 2. 关键文件与位置

- `kubejs/README.txt`：官方说明文档，明确指引“你可以在 logs/kubejs/ 目录中找到特定类型的日志”。
- `logs/kubejs/client.log`：客户端 KubeJS 脚本日志（包含脚本加载、Java class 加载、`console.log` 输出）。
- `logs/kubejs/server.log`：服务端 KubeJS 脚本日志。
- `logs/kubejs/startup.log`：启动阶段 KubeJS 日志。
- `logs/latest.log`、`logs/debug.log`、`logs/2026-**-*.log.gz`：Forge/Minecraft 主日志（按日期分片压缩）。
- `CustomSkinLoader/CustomSkinLoader.log`：CustomSkinLoader 模组的独立日志。
- `kubejs/powerfuljs_fe_guide.md`：PowerfulJS FE 系统的调试日志约定文档，记录 `[PF-FE]`、`[PF-NETWORK]` 等前缀。

## 3. 架构与约定

### 3.1 日志分类（按 KubeJS 生命周期）

KubeJS 将日志分为三类文件：
- `startup.log` — 启动阶段脚本（`startup_scripts/`）产生的日志。
- `client.log` — 客户端脚本（`client_scripts/`）产生的日志。
- `server.log` — 服务端脚本（`server_scripts/`）产生的日志。

这是 KubeJS 引擎自动按脚本目录分流的结果，并非项目自行配置。

### 3.2 业务日志格式约定

业务代码中的 `console.log` 遵循一个**非强制但高度一致的前缀约定**：用方括号包裹子系统名作为消息头，便于在大量日志中过滤。已观察到的前缀包括：

| 前缀 | 含义 | 示例文件 |
|---|---|---|
| `[PF-GALLERY-UI]` | 人物图鉴 UI | `client_scripts/ui/character_gallery_ui.js` |
| `[FADE-TEST]` | 渐隐测试页 | `client_scripts/ui/fade_test_ui.js` |
| `[FOOT-UI]` / `[FOOT-UI-DATA]` | 泡脚 UI | `client_scripts/ui/foot_ui.js` |
| `[PF-CONFIG-UI]` | 寻路配置 UI | `client_scripts/ui/pathfinder_config_ui.js` |
| `[PHONE-UI]` | 手机 UI | `client_scripts/ui/phone_ui.js` |
| `[PF-RARE-UI]` | 稀客好感度 UI | `client_scripts/ui/rare_affection_ui.js` |
| `[STAMINA-HUD]` | 体力 HUD | `client_scripts/ui/stamina_hud.js` |
| `[PF-NETWORK]` | 网络/搓脚逻辑（文档约定） | `powerfuljs_fe_guide.md` |
| `[PF-FE]` | FE 电力工具函数（文档约定） | `powerfuljs_fe_guide.md` |
| `[PowerfulJS]` | PowerfulJS 插件初始化（文档约定） | `powerfuljs_fe_guide.md` |

### 3.3 错误处理模式

错误路径普遍采用“成功/失败”双分支 + `console.log` 打印异常对象：
```javascript
console.log("[PF-GALLERY-UI] 打开人物图鉴失败: " + e)
```
未发现 `try/catch` 之外的结构化错误上报机制；异常信息直接以字符串拼接形式输出。

### 3.4 Forge 层日志

Forge 自身的日志位于 `logs/` 根目录，文件名形如 `2026-10-07-18.log.gz`，按日期+序号滚动压缩。`latest.log` 是当前会话的软链接/副本。这些日志由 Forge/FML 自动管理，项目未对其进行自定义轮转策略。

## 4. 约定与约束

- **约定（描述性）**：所有 KubeJS 业务日志使用 `console.log`，并以 `[SUBSYSTEM]` 方括号前缀开头，便于 grep 过滤。
- **约定（描述性）**：日志按 KubeJS 生命周期分流到 `logs/kubejs/{client,server,startup}.log`。
- **约定（描述性）**：错误路径统一输出“操作名称 + 失败: “ + 异常对象的形式。
- **约定（描述性）**：`powerfuljs_fe_guide.md` 为 FE 子系统定义了 `[PF-FE]`、`[PF-NETWORK]`、`[PowerfulJS]` 三个日志前缀，作为该子系统的开发约定。
- **约束（由 KubeJS 引擎强制执行）**：`client_scripts/` 下的脚本输出进入 `logs/kubejs/client.log`，`server_scripts/` 进入 `server.log`，`startup_scripts/` 进入 `startup.log`——这是 KubeJS 的分流行为，无法被业务代码绕过。
- **约束（由 README.txt 声明）**：`kubejs/README.txt` 明确告知用户“你可以在 logs/kubejs/ 目录中找到特定类型的日志”，这是面向使用者的正式约定。
- **无约束**：仓库中没有 lint 规则、ESLint 配置或 CI 检查来强制日志前缀风格或禁止裸 `console.log`；是否使用前缀完全依赖开发者自觉。
- **无结构化字段**：日志是纯文本，没有 JSON 结构化字段、traceId、level 字段等结构化日志能力。

## 5. 总结

这是一个**基于 KubeJS 原生 `console.log` 的轻量级日志方案**，没有自定义 logger 抽象。日志组织主要依赖 KubeJS 引擎按脚本类型分流到 `logs/kubejs/` 下三个文件，业务侧通过 `[PREFIX]` 前缀约定实现可搜索性。第三方模组（CustomSkinLoader 等）各自维护自己的日志文件。整体属于“约定优于配置”的简单实践，适合整合包规模的项目。