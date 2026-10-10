# ApricityUI / KubeJS UI 适配记录

本项目的交互 UI 主要由 `kubejs/client_scripts/ui/*.js` 驱动，HTML/CSS 放在 `apricity/kubejs/*.html`。当前实际安装版本是 `ApricityUI-forge-1.20.1-1.2.5.3.jar`（本地构建版本；官方公开更新记录未标注 `.3` 补丁差异）。下方 1.2.2-hotfix1、1.2.4-hotfix 的兼容点为历史观察，升级后未逐一复验。已知 1.2.4-hotfix 自身 bug：每 tick 报 `NoSuchMethodException: CompoundTag.putString` 的 LocalStorage 持久化反射错误（不影响容器交互）。

## 关键入口

- 搓脚/泡脚 WorldWindow：`kubejs/client_scripts/ui/foot_ui.js`
- 泡脚显示页：`apricity/kubejs/footsoak.html`
- 手机 UI：`apricity/kubejs/phone.html`
- 手机客户端同步：`kubejs/client_scripts/ui/phone_ui.js`
- 体力 HUD：`kubejs/client_scripts/ui/stamina_hud.js`、`apricity/kubejs/stamina_hud.html`
- 体力服务端：`kubejs/server_scripts/stamina.js`
- 开店方块配置容器 Screen：`apricity/kubejs/pathfinder_config.html`，服务端打开+绑定 `kubejs/server_scripts/pathfinder/pfBlockHandler.js`，关闭转发 `kubejs/server_scripts/pathfinder/pfConfigUiHandler.js`，客户端关闭 `kubejs/client_scripts/ui/pathfinder_config_ui.js`
- 稀客好感度列表 Screen：`apricity/kubejs/rare_affection.html`（`mode=browser`+`intercept`），客户端 `kubejs/client_scripts/ui/rare_affection_ui.js`，服务端 `kubejs/server_scripts/pathfinder/pfConfigUiHandler.js`（事件 `pf_rare_affection_open` → `pf_rare_affection_data`），好感度/掉落逻辑 `kubejs/server_scripts/pathfinder/pfRareAffection.js`，配置在 `pfCustomerTypes.js`。数据流同 phone：服务端 `sendData` JSON → 客户端存 `global.pfRareAffectionView` → 页面脚本轮询读 `global` 渲染。列表/详情图标用 AUI `<item>` 扩展元素渲染真实手办物品 `touhou_little_maid:garage_kit{EntityInfo:{ModelId:"<模型后缀>"}}`：`<item>` 的文本内容即物品表达式，支持 `物品id{SNBT}`（AUI 内部用 `TagParser` 解析），可 `createElement('item')` 后设 `textContent` 动态生成；扩展元素无固有尺寸，必须显式给 CSS `width/height`。

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

## 容器 Screen（真实物品槽位）

`pathfinder_config.html`（开店方块配置）是本项目第一个真实容器 Screen，能同步物品槽位、显示玩家背包、双向移动物品。要点：

- 真实容器只能服务端打开：`ApricityUI.menu(player, path).bind(function (binding) { ... })`。`screen(path)` 等 UI-only 方式打开的槽位全是展示型（看得见点不动）。
- **容器页面 viewport 必须用 `mode=browser`，绝对不要用 `mode=gui`**（1.2.4-hotfix 实测）：gui 模式下容器 Screen 会每帧 resize → 反复 init 重建 Document（日志每帧刷 `refresh complete` + `first commit generation=1`，generation 始终为 1），槽位绑定稳不住，物品「看得见、拖不动」。browser 视口稳定、无此问题，也是 AUI 容器文档最小示例用的模式。界面偏小用 zoom 放大（`mode=browser,zoom=1.4`），槽位 `--aui-slot-size: 40px`；不要为了放大改回 gui。另：AUI 1.2.4 不支持 `text-shadow`（日志刷 `[AUI CSS] unsupported property ignored`），别用。
- **容器页面绝对不要加 `<meta name="aui-mouse-events" content="intercept">`**：intercept 会让命中区域的鼠标事件不再传给 Minecraft 输入，而槽位的点击/拖拽/shift-click 全靠 MC 菜单处理——一旦 intercept，物品就「看得见、点不动、拿不到鼠标上」。AUI 容器文档最小示例的 head 里也没有该 meta；不加 intercept 时 HTML 元素（如关闭按钮）的 click 事件照样派发。这是容器 Screen 与普通 Screen/Overlay（phone.html 需要 intercept）最大的区别。
- `binding` 数据源：`player()`（固定 36 格背包）、`saveddata(name, cap)`（世界级持久库存）、`blockEntity(pos)`（方块 ITEM_HANDLER 或 KubeJS 方块实体 inventory）、`entity(id)`。第一个非玩家绑定自动成为 primary，决定 shift-click 主方向。
- HTML 容器 id 固定且必须与绑定方法对应：`player()`→`id="player"`、`saveddata()`→`id="saved_data"`、`blockEntity()`→`id="block_entity"`、`entity()`→`id="entity"`；对不上槽位就退化成展示型。
- 玩家背包用空容器 + `layout="preset:player"` 自动排成原版 36 格；当前开店方块配置库存固定为 9×3＝27 格，方块注册使用 `entityInfo.inventory(9, 3)`，服务端使用 `binding.blockEntity(blockPos, 27)`，HTML 使用 `<container id="block_entity" bind="block_entity" size="27">`。三处容量必须同步。真实槽位由 AUI 渲染 MC 风格外观，CSS 只需控布局（grid）和尺寸（`--aui-slot-size`）。
- 不要在 server script 中通过 `blockEntity.inventory.kjs$getSlots()` 检查容量。Rhino/KubeJS 会把该字段适配成物品列表视图，不暴露这个 Java 接口方法；调用会令右键事件在打开菜单前异常退出。容量以注册、绑定和 HTML 三处的固定27格契约为准。
- 容器 CSS 严格遵循文档最小示例：`container { display: grid; gap: 2px; width: max-content; --aui-slot-size: Npx; }`。配置容器再加 `grid-template-columns: repeat(列数, Npx)` 排成矩阵；**玩家背包容器只靠 `preset:player` 排列，不要给它设 `grid-template-columns` 或 `padding`/`border`/`background` 盒样式**，否则干扰 preset 自动布局（文档「背包位置乱」条目警告：别按自然顺序排网格）。
- 关闭容器 Screen 用客户端 `ApricityUI.closeScreen()`；`removeDocument` 只对 Overlay 有效、对容器 Screen 无效。当前配置物品由 KubeJS 方块实体 inventory 保存进方块实体 NBT，无需手动保存。
- 当前配置库存是同一方块实体上的共享 `Container`。多名玩家同时打开同一方块时，由 Minecraft 服务端菜单同步同一份槽位状态，不建立玩家私有副本，也不在关闭界面时整份覆盖库存，行为与原版共享容器一致。
- 页面脚本（HTML 内 JS）没有全局 `player`，要先 `var McClient = Java.loadClass("net.minecraft.client.Minecraft")` 再 `McClient.getInstance().player` 获取，判空后 `player.sendData(...)`。

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
