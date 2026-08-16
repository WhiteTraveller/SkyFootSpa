# ApricityUI / KubeJS UI 适配记录

本项目的交互 UI 主要由 `kubejs/client_scripts/ui/*.js` 驱动，HTML/CSS 放在 `apricity/kubejs/*.html`。当前适配目标是 `ApricityUI-forge-1.20.1-1.2.2-hotfix1.jar`。

## 关键入口

- 搓脚/泡脚 WorldWindow：`kubejs/client_scripts/ui/foot_ui.js`
- 泡脚显示页：`apricity/kubejs/footsoak.html`
- 手机 UI：`apricity/kubejs/phone.html`
- 手机客户端同步：`kubejs/client_scripts/ui/phone_ui.js`
- 体力 HUD：`kubejs/client_scripts/ui/stamina_hud.js`、`apricity/kubejs/stamina_hud.html`
- 体力服务端：`kubejs/server_scripts/stamina.js`

## ApricityUI 1.2.2-hotfix1 兼容点

- `WorldWindow` 类路径是 `com.sighs.apricityui.world.WorldWindow`。
- 优先使用 `ApricityUI.createWorldWindow(...)` 创建窗口，不要继续使用旧路径 `com.sighs.apricityui.instance.WorldWindow`。
- Rhino 调用 Java 重载时，`createWorldWindow(path, Vec3, number, number, number)` 会在 `(Vec3,int,float,float)` 和 `(Vec3,float,float,int)` 之间产生歧义。需要避免 5 参数 number 调用，或显式装箱/指定重载。
- 不要用 `new WorldWindow(path, pos, JavaFloat.valueOf(...), JavaFloat.valueOf(...), JavaInteger.valueOf(...))` 尝试创建透明小按钮窗口；该构造器在 Rhino 下仍可能产生重载歧义。当前泡脚交互采用单 WorldWindow，并只在 `#soakBtn` 上绑定右键事件。
- AUI 的 HTML/CSS 热加载只能刷新页面资源；`kubejs/client_scripts` 改动必须重启客户端或完整重载客户端脚本。

## 鼠标拦截

`<meta name="aui-mouse-events" content="intercept">` 会让 AUI 在命中文档区域时接管鼠标事件。该版本没有“只拦截点击但放行滚轮”的 meta 值；命中文档时滚轮也可能被吞，导致玩家不能切换物品。

泡脚 UI 的处理策略：

- `footsoak.html` 负责背景、水桶贴图、进度显示和水桶按钮命中，声明 `aui-mouse-events=intercept`。
- `foot_ui.js` 只创建一个泡脚 WorldWindow，并只把 `foot_click_soak` 绑定到 `window.document.getElementById("soakBtn")`。
- 不要把 `foot_click_soak` 绑定到整张 `footsoak.html` 或 `soakContainer`，否则整张泡脚页面都会响应右键。

## 泡脚显示状态

当前取舍是：未泡脚状态只显示水桶贴图，不强求默认文字提示。只有服务端开始泡脚后，才切换到：

```text
开始泡脚
```

并显示倒计时进度条。不要为了默认文案额外叠加深色背景条；AUI 1.2.2-hotfix1 下文字和背景的绘制顺序容易出现不符合浏览器预期的结果。

## Phone 弹窗

`phone.html` 是 Screen 类型 UI，由 `kubejs/server_scripts/phone.js` 调用 `ApricityUI.openScreen(player, 'kubejs/phone.html', null)` 打开。

Gensyo 和抽卡弹窗注意点：

- 不要依赖 `transform: translate(-50%, -50%)` 做命中关键区域的定位，AUI 新版本里可能出现视觉位置和鼠标命中位置不一致。
- 使用全屏 overlay + flex 居中，卡片自身使用 `position: relative`。
- 弹窗显示时显式设置 `pointer-events: auto`，隐藏时设置 `pointer-events: none`。
- 右侧手机主体层级应低于弹窗层级，避免弹窗可见但按钮点不到。
- 抽卡补给数量如 `x 20` 需要 `white-space: nowrap`，防止被拆行。

## 体力 HUD 同步

体力值存储在 `player.persistentData["pfStamina"]`，服务端通过 `stamina_sync` 推给客户端。

必须通过以下 API 改体力：

- `global.pfConsumeStamina(player, amount)`
- `global.pfRestoreStamina(player, amount)`

这两个 API 会立即同步 HUD。自动恢复体力在写入 `pfStamina` 后也必须调用同步函数，否则 HUD 数字会滞后。客户端 HUD 在创建或重新显示时应主动发送 `stamina_request`，收到 `stamina_sync` 后立即刷新数字和进度条。

## 调试建议

- 查 UI 脚本错误：`rg -n "FOOT-UI|STAMINA-HUD|PHONE|createWorldWindow|ambiguous|Error in 'ClientEvents.tick'" logs/latest.log logs/debug.log logs/aui.log`
- 查 AUI 文档加载：`rg -n "footsoak|phone.html|stamina_hud|AUI Document" logs/aui.log`
- 若日志出现 `createWorldWindow ... ambiguous`，说明 Rhino 重载选择失败，优先检查是否用了 5 参数 number 调用。
- 若改了 `client_scripts` 后游戏内无变化，先确认日志里出现了当前脚本版本标识，再判断 UI 行为。
