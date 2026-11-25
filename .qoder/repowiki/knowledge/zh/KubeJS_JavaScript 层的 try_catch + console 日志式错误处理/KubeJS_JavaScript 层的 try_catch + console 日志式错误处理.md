---
kind: error_handling
name: KubeJS/JavaScript 层的 try/catch + console 日志式错误处理
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/server_scripts/powerfuljs/fe_utils.js
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/client_scripts/ui/rare_affection_ui.js
    - kubejs/client_scripts/ui/stamina_hud.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - kubejs/client_scripts/ui/fade_test_ui.js
    - kubejs/client_scripts/ui/character_gallery_ui.js
    - kubejs/server_scripts/tutorial_cmd.js
    - kubejs/server_scripts/fade_test_cmd.js
---

## 1. 使用的系统/方法

本仓库是 Minecraft Forge/NeoForge 整合包，业务逻辑主要由 KubeJS（Rhino JavaScript）脚本编写。仓库中**没有自定义的错误类型、错误码枚举、panic/recover 或中间件框架**。错误处理完全依赖：
- JavaScript 原生 `try { ... } catch (e) { ... }`；
- Rhino/KubeJS 提供的 `console.log` / `console.warn` / `console.error`；
- 对 ApricityUI Java API 的调用进行包裹，以规避 Rhino ↔ Java 互操作抛出的异常。

服务器端与客户端脚本采用相同的模式：在可能失败的边界（网络数据接收、Java API 调用、JSON 解析、文件读取）用 try/catch 包裹，失败时记录带模块前缀的日志并返回安全默认值，而不是向上抛出。

## 2. 关键文件

- `kubejs/server_scripts/powerfuljs/fe_utils.js`：FE 电力工具函数集中封装了 `pfConsumeFE`、`pfGetItemFE`、`pfGetItemMaxFE`，全部通过 try/catch 捕获 Capability 访问异常，失败返回 `false` 或 `0`。
- `kubejs/client_scripts/ui/phone_ui.js`：`NetworkEvents.dataReceived('phone_settings_sync' | 'phone_ratings_sync')` 回调内统一 try/catch，失败打印 `[PHONE-UI] ...失败:`。
- `kubejs/client_scripts/ui/rare_affection_ui.js`：显式注释说明“读 global 中 null 值会抛 Rhino NPE 中断脚本加载”，因此用顶层 try/catch 初始化 `global.pfRareAffectionView = ""`，避免脚本启动阶段崩溃。
- `kubejs/client_scripts/ui/stamina_hud.js`：Overlay 生命周期（创建、tick 更新、登出清理）多处 try/catch，包括 `ApricityUI.removeDocument`、`player.sendData`、`setTextContent` 等 Java 调用。
- `kubejs/client_scripts/ui/pathfinder_config_ui.js`、`fade_test_ui.js`、`character_gallery_ui.js`：UI 打开/关闭路径均包裹 try/catch，失败输出 `[PF-CONFIG-UI]` / `[FADE-TEST]` / `[PF-GALLERY-UI]` 前缀日志。
- `apricity/kubejs/fonts/` 下的 HTML 页面（如 `stamina_hud.html`、`rare_affection.html`）由 ApricityUI Overlay 渲染，其 JS 也使用 try/catch 兜底 DOM 操作。

## 3. 架构与约定

### 3.1 服务端 → 客户端通信的错误边界

服务端通过 `ServerEvents.commandRegistry` 注册指令（如 `/playgif`、`/fadetest`），指令执行体直接调用 `player.sendData(...)`，不做额外校验——若玩家为空则提前 return 0。真正的错误处理发生在客户端侧的 `NetworkEvents.dataReceived` 回调中，每个回调独立 try/catch，保证单个消息解析失败不会阻断其他消息。

### 3.2 日志前缀约定

所有 console 输出都带模块级方括号前缀，便于在 `logs/latest.log` 中过滤：
- `[PF-FE]` — FE 电力工具
- `[PHONE-UI]` — 手机 UI
- `[PF-RARE-UI]` — 稀客好感度 UI
- `[STAMINA-HUD]` — 体力 HUD
- `[PF-GALLERY-UI]` — 人物图鉴 UI
- `[FADE-TEST]` — 渐隐测试页
- `[MAID-STATS]` — 女仆统计
- `[TUTORIAL]` — 教学 overlay

### 3.3 返回值语义

- 工具函数（如 `pfConsumeFE`）失败返回 `false`，调用方据此判断是否继续。
- 数值型工具（`pfGetItemFE`、`pfGetItemMaxFE`）失败返回 `0`。
- UI 打开/关闭失败不抛异常，仅记录日志，界面保持原状。

### 3.4 资源清理

所有涉及 `ApricityUI.removeDocument`、`ApricityUI.createDocument`、`player.sendData` 的地方都用 try/catch 包裹，并在 `ClientEvents.loggedOut` / `loggedIn` 钩子中主动清理，防止脚本重载后残留旧文档导致显示异常。

## 4. 约定与约束

- **观察到的约定**：
  - 所有可能抛出异常的代码块（网络回调、Java API 调用、JSON 解析、DOM 操作）都被 `try { ... } catch (e) { ... }` 包裹。
  - 错误信息通过 `console.log` / `console.warn` / `console.error` 输出，并以 `[MODULE-NAME]` 前缀开头。
  - 对全局状态（如 `global.pfPhoneSettings`、`global.pfRareAffectionView`）的读写前先做空值检查，避免 Rhino 对 null 字段访问抛 NPE。
  - 登出/重连/脚本重载时主动清理 ApricityUI 文档和全局变量。

- **可验证的规则**：
  - `kubejs/server_scripts/powerfuljs/fe_utils.js` 中的三个导出函数（`pfConsumeFE`、`pfGetItemFE`、`pfGetItemMaxFE`）内部均包含 try/catch，且失败分支返回布尔值或数字默认值，这是该文件的强制行为。
  - `kubejs/client_scripts/ui/rare_affection_ui.js` 第 18–22 行的顶层 try/catch 用于修复历史遗留的 `null` 键，确保脚本加载阶段不因 Rhino NPE 中断。

- **未发现的机制**：
  - 仓库中没有定义统一的错误类、错误码表、错误传播通道或全局错误处理器。
  - 没有 panic/recover 等价物（Rhino 不支持）。
  - 没有中间件层拦截和处理错误。
  - 没有结构化日志库（如 log4j、pino），仅使用 KubeJS 内置的 console API。

综上，该仓库的错误处理是一种**分散的、基于 try/catch + console 日志的防御式编程风格**，适用于 KubeJS 脚本规模，但不提供跨模块的统一错误抽象。