# ApricityUI / KubeJS UI 适配记录

本项目的交互 UI 主要由 `kubejs/client_scripts/ui/*.js` 驱动，HTML/CSS 放在 `apricity/kubejs/*.html`。当前实际安装版本是 `[晴雪UI] ApricityUI-forge-1.20.1-1.2.7.jar`，已由 mods 文件与运行日志核对。此前使用 1.2.5.3 本地构建版本；下方 1.2.2-hotfix1、1.2.4-hotfix 的兼容点为历史观察，升级后未逐一复验。已知 1.2.4-hotfix 自身 bug：每 tick 报 `NoSuchMethodException: CompoundTag.putString` 的 LocalStorage 持久化反射错误（不影响容器交互）。

## 关键入口

- 搓脚/泡脚 WorldWindow：`kubejs/client_scripts/ui/foot_ui.js`
- 泡脚显示页：`apricity/kubejs/footsoak.html`
- 手机 UI：`apricity/kubejs/phone.html`
- 手机客户端同步：`kubejs/client_scripts/ui/phone_ui.js`
- 体力 HUD：`kubejs/client_scripts/ui/stamina_hud.js`、`apricity/kubejs/stamina_hud.html`
- 体力服务端：`kubejs/server_scripts/stamina.js`
- 开店方块配置容器 Screen：`apricity/kubejs/pathfinder_config.html`，服务端打开+绑定 `kubejs/server_scripts/pathfinder/pfBlockHandler.js`，关闭转发 `kubejs/server_scripts/pathfinder/pfConfigUiHandler.js`，客户端关闭 `kubejs/client_scripts/ui/pathfinder_config_ui.js`
- 稀客好感度列表 Screen：`apricity/kubejs/rare_affection.html`（`mode=browser`+`intercept`），客户端 `kubejs/client_scripts/ui/rare_affection_ui.js`，服务端 `kubejs/server_scripts/pathfinder/pfConfigUiHandler.js`（事件 `pf_rare_affection_open` → `pf_rare_affection_data` + `pf_rare_affection_open_ui`，客户端收 open_ui 后直接 `screen()` 替换当前界面（**不要先 closeScreen()**：`setScreen(null)` 触发原版 grabMouse 把光标瞬移到屏幕中心；旧界面 `removed()` 会自动通知服务端关容器，图鉴页同口径），**出 UI 方式与人物图鉴统一为客户端 screen() 普通 Screen**，2026-10 起不再用服务端 menu 容器宿主），好感度/掉落逻辑 `kubejs/server_scripts/pathfinder/pfRareAffection.js`，配置在 `pfCustomerTypes.js`。**隐藏默认滚动条只能用 `#listBox::-webkit-scrollbar{display:none}`，禁用 `scrollbar-width:none`**——1.2.7 该属性使 ScrollModel.isScrollbarHidden 查 `scrollbarPseudoStyles` 表，元素无 ::-webkit-scrollbar 伪样式时表为 null，渲染线程 NPE 崩客户端（crash-2026-10-19_01.21.56 实锤）。数据流：服务端 `sendData` JSON → 客户端存 `global.pfRareAffectionView` → 页面脚本轮询读 `global` 渲染。2026-10 按 `稀客.html` 设计稿重做为图鉴同系视觉：gallery_paper 底 + 双页签（角色页签回 `pf_character_gallery_open`）+ 左栏卡片网格一行三个（flex wrap、167×282 卡框 `rare_card.png`——设计稿原图含占位灰色手办，已由 `local/clean-rare-card.cjs` 按“不透明像素中值卡面色+逐行回填”清除，备份 `rare_card_src.png`；手办 `<item>` scale15 + 姓名 18px + 小爱心 25×24（`rare_heart_s*`）、选中态叠橙色渐变层 `rare_sel.png`（设计稿 rgba(200,112,0) 0→42% 渐变的实图化）、容器 529×765 可滚动（529=3×167+2×12+4 余量，规避 AUI flex wrap 恰满换行临界 bug）；手办/掉落物品均无槽框底图，rare_row/rare_row_active 仅用于右栏报酬档条）+ 竖笔刷分隔 + 右栏详情（姓名/爱心/数值、种族/初登场/出现维度、简介、报酬四档条+物品+数量徽章，rare_row/rare_row_active 仅用于报酬档条）；布局沿用图鉴 layoutPage 等比换算与显式 z-index、resize 判空自摘。列表/详情图标仍用 AUI `<item>` 扩展元素渲染真实手办物品 `touhou_little_maid:garage_kit{EntityInfo:{ModelId:"<模型后缀>"}}`（textContent 即物品表达式，支持 `物品id{SNBT}`；扩展元素无固有尺寸，宽高与 transform:scale 由 layoutPage 写入）。行/档/掉落槽显隐与选中态存 state 数组由 layoutPage 统一写内联样式（避免 place 与状态互盖）；不用 firstChild/children（空白文本节点不可靠）。爱心素材 rare_heart.png（设计稿）/rare_heart_empty.png（灰度派生）。静态槽位预渲染 + getElementById 填充，不动态增删节点。页签层级按设计稿为纸面盖页签（`.tab` z0、`#paper` z1），非当前页签沉到纸底只露一截（图鉴页同）。动画：入场为整页从 -24px 下移落位（JS 逐帧 ~30fps、只写 stage top 单属性、一次性 220ms；opacity 淡入按需求弃用，AUI 忽略 transform 故不用 CSS 位移关键帧）；hover 上移 4px 即时落位；点击 +10→0 上移归位用 JS 逐帧但**每帧只写单个行元素 style、间隔 33ms**——早期实现每帧重写 stage top/opacity 与整行 8 个元素且 16ms 间隔，触发全页重排导致明显卡顿，已废弃。
- 人物图鉴 Screen：`apricity/kubejs/character_gallery.html`（`mode=browser`+`intercept`），客户端 `kubejs/client_scripts/ui/character_gallery_ui.js`，服务端 `kubejs/server_scripts/pathfinder/pfConfigUiHandler.js`（事件 `pf_character_gallery_open` → `pf_character_gallery_open_ui`）。静态数据内嵌页面脚本，保留 6 位角色（灵梦/爱丽丝/早苗/燐/勇仪/荷取）与 15 条剧情。按 `角色.html` 设计稿改为顶部横向 `<texture src="RL">` 头像、左侧中英文姓名/种族/初登场/所属势力/能力、中央透明立绘、右侧简介与回想；点击立绘仍打开原 `*_card.png` 完整卡片，回想仍发送 `pf_gallery_play_dialogue`，稀客页签复用 `pf_rare_affection_open`。原稿纸纹及四角纹样合成为 `gallery_paper.png`，页签、笔刷、透明立绘均以本地 `gallery_*.png` 引用。`layoutPage()` 按 1920×1213 基准和逻辑视口等比换算坐标、字体、图片双维度，在 resize 时重新布局，不用 transform/grid/object-fit；大图遮罩用 absolute + flex，隐藏时移出视口并设置 `pointer-events:none`。z-index 坑（1.2.7 实测）：`position:absolute` 且 `z-index:auto` 的元素会被绘制在 `z-index:0` 兄弟元素之下（与浏览器树序不同）；本页纸纹底图 `#paper` 是 `z-index:0`，曾导致无显式 z-index 的左侧资料与右上简介被底图盖住，故 `.placed` 统一显式 `z-index:1`、底图用 id 选择器压回 0。resize 监听坑（1.2.7 实测，crash-2026-10-18_12.02.10）：Screen 关闭或文档重建后 AUI 仍会向旧 window 监听器派发 resize，脚本在死文档上抛异常会经 `Window.fireResizeEvent → Client.tick` 直接崩客户端；页面脚本的 resize 回调必须先判 `getElementById` 节点存在并在节点消失时自摘监听。字体与遮挡：中文用 ZhaohuaMinB Black（朝華標題B.ttf）、英文名用 KingHwaOldSong（京華老宋体v3.0.ttf），已拷入 `apricity/kubejs/fonts/` 并以 `@font-face` 注册（写法对齐 ore 主题：相对页面目录的 `url("fonts/xxx.ttf") format("truetype")`）；立绘底部渐隐遮罩已按需求移除（立绘由容器 overflow 裁掉底部 1/4 直接收尾，无渐隐）；如后续再加，AUI 1.2.7 下唯一可行路线是“叠 div 纸色 rgba 渐变”（mask-image 合成黑盒、mix-blend-mode 无混合实现、烘焙 PNG 需重启，均已实测/解包取证）。早苗立绘由 `local/refresh-sanae.cjs` 从资源包 `kochiya_sanae/illust.png + face/default.png` 合成裁切（206×313，2026-10-18 由旧 206×317 刷新）；改 PNG 需重启游戏才生效（AUI 图片缓存不随 autoReload 失效）。
- 九宫格星标（袜子）：**不用 AUI**，改原版渲染。`kubejs/startup_scripts/tooltip.js` 在 `ScreenEvent$Render$Post` 中以悬停槽为基准取 ±18px 的 8 个邻槽，用 `RenderSystem` + `GuiComponent.blit` 把 `kubejs:textures/gui/nine_star.png`（256×256、星占左上 18×18，配合 6 参数 blit 避免 Rhino 重载歧义）画在邻槽屏幕坐标上。原因：AUI 文档中 position:fixed 元素（即使带 translateZ/子元素背景）实测不绘制，而 tooltip 的 #tooltip 能显示属特例，不可复用其叠层思路。

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

- 背景为工作盆素材 `soak_basin.png`；桶点击区域 `soakBtn` 为桶贴图 16x16 放大 3 倍（48x48）：未泡脚显示空桶 `bucket_empty.png`，泡脚中显示水桶 `bucket_water.png`（`src` 属性切换）。
- 未泡脚：桶下方两行引导文本「在工作盆内放入泡脚水 / 进行泡脚」；泡脚中：文本改为单行「泡脚中」并显示倒计时进度条。
- 文本更新必须走 `textContent`；AUI 1.2.2-hotfix1 下 `innerText` 赋值不生效（旧版「开始泡脚」因此从未显示）。
- 不要为了文案额外叠加深色背景条；AUI 1.2.2-hotfix1 下文字和背景的绘制顺序容易出现不符合浏览器预期的结果。

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

## Overlay 被 MC 界面遮挡（AUI 1.3.1）

`ApricityUI.createDocument` 会把文档设为 `reloadPersistent=true`，这类文档除了在 HUD 阶段（`RenderGuiEvent.Post`）绘制，还会在 `ScreenEvent.Render.Post` 里重绘到背包、任务书等任意界面上方。HUD 类 Overlay 要在 MC 界面下层时，创建后调用 `doc.setReloadPersistent(false)`（见 `stamina_hud.js`）。

## 图片缩放过滤（AUI 1.3.1）

`<img>` 和 `background-image` 默认 `image-rendering: auto`，放大时一律线性过滤，低分辨率像素图会变糊。像素图元素要加 `image-rendering: pixelated`：放大用最近邻、缩小仍用线性。`crisp-edges` 为始终最近邻。该属性会继承父元素。mod 无全局开关，本项目每个页面的 `html, body` 规则都已加 `image-rendering: pixelated`，新建页面也要加上。WorldWindow 例外：mod 按 CSS 尺寸而非屏幕像素判断缩放，世界 UI 在 CSS 里略缩小、屏幕上却被大幅放大，`pixelated` 仍会走线性变糊，所以 `footui.html`、`footsoak.html` 根规则用 `crisp-edges`，新增 WorldWindow 页面同理。

## 女仆饰品属性统计（TLM 女仆容器叠加层）

- 触发页签：`kubejs/startup_scripts/ui/maid_stats_ui.js` 使用 TLM 官方 `MaidContainerGuiEvent$Render` 在 `leftPos+194, topPos+5` 绘制第 5 个页签（24×26，贴图 `touhou_little_maid:textures/gui/maid_gui_side.png`，`u=207,v=21` 空白页签底 + 铁剑图标）。`MaidContainerGuiEvent$Tooltip` 在 TLM 原生控件之后调用 `GuiGraphics.renderTooltip` 绘制两行原生 tooltip，因此不会被铁剑覆盖，并自动保留黑色外框、暗紫背景和屏幕边界定位。`getGuiLeft()/getGuiTop()` 是 protected，事件提供的 `getLeftPos()/getTopPos()` 直接作为坐标来源；`Java.loadClass` 拿到的类包装没有 `isInstance`（调用会抛错），界面识别一律走「菜单有 `getMaid()`」探测，结果由 client tick 写入 `global.pfMaidGuiOpen` 供渲染阶段复用。
- 数据：点击页签发 `pf_maid_stats_request`（`entityId`），`kubejs/server_scripts/backpack/maid_stats.js` 尝试校验当前打开的是同一女仆的容器（取不到菜单时退回距离校验）且距离 ≤144 后才统计，然后 `pf_maid_stats_sync` 回推 `json`。
- 统计方式：启动期把 `kubejs:serve.*` 属性同时挂到玩家和 `touhou_little_maid:maid`，女仆生成、遗物换装和统计请求都会调用 `global.updateMaidBackpack(maid)` 重算真实 modifier。服务端给 `relic.onLoad` 传代理对象捕获每件遗物的属性来源，并在执行期间把位置辅助函数临时换成 6×6 语义（`finally` 还原）；面板的“属性合计”只返回 15 项搓脚属性，读取女仆实体的最终 `getValue()`，同时附带基础值和每件遗物的来源 modifier。
- 展示：`kubejs/client_scripts/ui/maid_stats_ui.js` 把 `apricity/kubejs/maid_stats.html` 作为 `reloadPersistent=true` 的 Overlay 叠在 TLM 容器界面上，关闭后 TLM 界面保留（Overlay 不是 Screen）。HTML 页面将合计属性、饰品和每条 modifier 渲染为可悬浮行，详情框显示基础值、当前值、来源和运算方式。ESC 由 `ScreenEvent$KeyPressed$Pre` 拦截为「只关统计页」，点击前四个 TLM 原生页签会先释放统计页状态再放行原生切换，TLM 界面关闭时 Overlay 自动回收。

## 调试建议

- 查 UI 脚本错误：`rg -n "FOOT-UI|STAMINA-HUD|PHONE|createWorldWindow|ambiguous|Error in 'ClientEvents.tick'" logs/latest.log logs/debug.log logs/aui.log`
- 查 AUI 文档加载：`rg -n "footsoak|phone.html|stamina_hud|AUI Document" logs/aui.log`
- 若日志出现 `createWorldWindow ... ambiguous`，说明 Rhino 重载选择失败，优先检查是否用了 5 参数 number 调用。
- 若改了 `client_scripts` 后游戏内无变化，先确认日志里出现了当前脚本版本标识，再判断 UI 行为。
