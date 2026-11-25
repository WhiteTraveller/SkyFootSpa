---
kind: error_handling
name: KubeJS 脚本中的 try/catch + console.log 兜底式错误处理
category: error_handling
scope:
    - '**'
source_files:
    - kubejs/client_scripts/ui/phone_ui.js
    - kubejs/client_scripts/ui/stamina_hud.js
    - kubejs/client_scripts/ui/rare_affection_ui.js
    - kubejs/client_scripts/ui/character_gallery_ui.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - kubejs/client_scripts/ui/fade_test_ui.js
    - kubejs/client_scripts/ui/foot_ui.js
    - kubejs/server_scripts/pathfinder/pfBasinSoakManager.js
    - kubejs/server_scripts/pathfinder/pfBedManager.js
    - kubejs/server_scripts/pathfinder/pfCunDrop.js
    - kubejs/server_scripts/pathfinder/pfRareAffection.js
    - kubejs/server_scripts/item/fasciaGunHandler.js
    - kubejs/server_scripts/blindbox.js
---

## 1. 使用的系统/方法

本仓库是 Minecraft 1.20.1 整合包，业务逻辑以 **KubeJS JavaScript**（Rhino 引擎）编写，前端通过 ApricityUI（`com.sighs.apricityui.ApricityUI`）渲染 HTML。仓库中**没有自定义的错误类型、错误码或统一的错误处理框架**。错误处理完全依赖：
- JavaScript 原生 `try { ... } catch (e) { ... }`
- `console.log(...)` 输出到 `logs/` 目录下的日志文件
- 函数在非法状态时返回 `null` / 空字符串

## 2. 关键文件与位置

客户端 UI 脚本集中位于 `kubejs/client_scripts/ui/`：
- `phone_ui.js` — 手机设置/评价数据同步
- `stamina_hud.js` — 体力 HUD Overlay
- `rare_affection_ui.js` — 稀客好感度界面
- `character_gallery_ui.js`、`pathfinder_config_ui.js`、`fade_test_ui.js`、`foot_ui.js` 等

服务端脚本位于 `kubejs/server_scripts/`，其中 `pathfinder/pfBasinSoakManager.js`、`pathfinder/pfBedManager.js`、`pathfinder/pfCunDrop.js`、`pathfinder/pfRareAffection.js`、`item/fasciaGunHandler.js`、`blindbox.js` 等大量使用 `return null` 作为“非错误”的失败信号。

## 3. 架构与约定

### 3.1 网络事件回调统一包裹 try/catch
所有通过 `NetworkEvents.dataReceived(...)` 注册的回调都包裹 try/catch，防止远端数据异常导致整个事件循环崩溃：
```js
NetworkEvents.dataReceived('phone_settings_sync', event => {
    try {
        let data = event.data
        global.pfPhoneSettings.pfSkipSoak = data.getInt('pfSkipSoak')
        // ...
    } catch (e) {
        console.log("[PHONE-UI] 设置同步失败: " + e)
    }
})
```
（见 `phone_ui.js` L13-L23、L26-L47；`rare_affection_ui.js` L24-L31；`stamina_hud.js` 多处）

### 3.2 ApricityUI API 调用全部 try/catch
对 `ApricityUI.createDocument` / `removeDocument` / `screen()` 等 Java 桥接调用的包装，避免 Rhino 抛出的 NPE 中断脚本加载：
```js
try {
    ApricityUI.removeDocument("kubejs/stamina_hud.html")
} catch (e) {}
```
（见 `stamina_hud.js` L97-L99、L135-L137、L145-L148；`phone_ui.js` L50-L53；`rare_affection_ui.js` L18-L22）

### 3.3 全局变量初始化防御
为避免 Rhino 读取 `global` 中 `null` 值键直接抛 NPE 中断脚本加载，代码显式用 try/catch 兜底并赋默认值：
```js
// rare_affection_ui.js L16-L22
try {
    if (!global.pfRareAffectionView) global.pfRareAffectionView = ""
} catch (e) {
    global.pfRareAffectionView = ""
}
```
登出时也保证不写 `null`：`global.pfRareAffectionView = ""`（L47）。

### 3.4 服务端函数以 `return null` 表达“无结果”
服务端路径查找、床位校验、流体注册等函数在条件不满足时直接 `return null`，由调用方判断：
```js
if (!bedPos) return null
if (blockId !== BASIN_BLOCK_ID) return null
if (!data) return null
```
（见 `pfBasinSoakManager.js` L54、L69、L80、L105、L116、L118、L138、L140、L292、L295、L300、L364；`pfBedManager.js` L247；`pfCunDrop.js` L36、L40；`pfRareAffection.js` L75；`fasciaGunHandler.js` L155、L157；`blindbox.js` L70）

### 3.5 日志前缀约定
每个模块用 `[MODULE-NAME]` 前缀区分来源，便于从 `logs/` 中过滤：
- `[PHONE-UI]`、`[STAMINA-HUD]`、`[PF-RARE-UI]`、`[PF-GALLERY-UI]`、`[FADE-TEST]`、`[FOOT-UI]`、`[FOOT-UI-DATA]`、`[PF-CONFIG-UI]`

### 3.6 资源清理兜底
登录/登出/切换界面时，先 try/catch 移除旧文档再创建新文档，避免脚本重载或重登后出现“孤儿 Overlay”叠加显示冻结数值的问题（见 `stamina_hud.js` L93-L117 注释说明）。

## 4. 约定与约束

- **没有自定义 Error 子类或错误码枚举**：所有异常都是 Rhino/Java 原生的 `Error`，仅通过 `console.log` 文本消息传递。
- **没有 panic/recover 语义**：JavaScript 层不存在 `throw` 主动抛出业务错误的模式（grep 未匹配到 `throw new`），而是以 `return null` 和 try/catch 静默降级为主。
- **网络回调必须 try/catch**：这是实际被反复复现的约定（至少 6 个 UI 文件遵循），目的是让单个数据包解析失败不影响其他事件。
- **全局变量不得为 null**：`rare_affection_ui.js` 的注释明确记录“读 global 中 null 值键会直接抛 Rhino NPE 中断脚本加载”，因此初始化与登出清理都强制赋 `""`。
- **日志级别统一为 `console.log`**：未发现 `console.error` / `console.warn` 的使用，所有错误信息都以普通日志级别输出。
- **客户端与服务端职责分离**：客户端负责 UI 展示与本地状态缓存（`global.pfPhoneSettings`、`global.pfRareAffectionView`），服务端负责权威数据计算并通过 `sendData` 推送；错误不会跨进程传播，仅在各自侧被捕获并记录。

## 5. 结论

该仓库的错误处理是**去中心化的、基于 try/catch 与 console.log 的防御式编程风格**，核心目标是保证 KubeJS 脚本在模组版本升级、配置缺失或网络数据异常时仍能继续运行，而不是结构化地分类、上报或恢复错误。这与 Minecraft 整合包脚本的轻量定位一致——错误即日志，失败即降级。