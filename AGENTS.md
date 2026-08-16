# AGENTS.md

本仓库是 Minecraft/KubeJS 整合包工程。核心逻辑在 `kubejs`，模块文档放在 `components`。后续 AI 或人类开发者修改代码前，必须先读相关模块入口和调用点，再做最小范围修改。

## 强制安全规则

禁止批量删除文件或目录。

不要使用：

- `del /s`
- `rd /s`
- `rmdir /s`
- `Remove-Item -Recurse`
- `rm -rf`

需要删除文件时，只能一次删除一个明确路径的文件。

正确示例：

```powershell
Remove-Item "C:\path\to\file.txt"
```

如果需要批量删除文件，应停止操作，并让用户手动删除。

## 项目总览

- `kubejs/startup_scripts`：注册物品、方块、流体、属性、遗物、油、Boss、泡脚水等启动期内容。
- `kubejs/server_scripts`：服务端玩法逻辑、网络事件、配方、Pathfinder 主流程、体力、手机、抽卡、音效等。
- `kubejs/client_scripts`：客户端 UI、tooltip、AuraTip 卡片注册、HUD 和网络同步显示。
- `kubejs/assets`、`kubejs/data`：资源、语言、模型、贴图、结构、tag、数据包内容。
- `components`：模块级说明文档。AuraTip 详见 `components/auratip.md`，ApricityUI/KubeJS UI 适配详见 `components/apricityui-ui.md`。

## 模块划分

### Pathfinder 服务流程

功能：开店、扫描地毯路径、生成顾客、排队移动、蓝色地毯等待、躺床、泡脚、搓脚、结算、Boss 和预约凭证。

主要入口：

- `kubejs/startup_scripts/block/pathfinder.js`
- `kubejs/server_scripts/pathfinder.js`
- `kubejs/server_scripts/pathfinder/pfMain.js`
- `kubejs/server_scripts/pathfinder/pfBlockHandler.js`
- `kubejs/server_scripts/pathfinder/pfNetworkHandler.js`

能力边界：Pathfinder 负责业务流程和实体状态，不负责 AuraTip 卡片样式，不负责普通物品 tooltip 展示。

简单调用：方块实体 tick 入口是 `global.pathfinderTick(entity)`；开店由右键 `kubejs:pathfinder_block` 触发；客户端 UI 通过 `NetworkEvents.dataReceived` 对应的服务端处理器提交泡脚、搓脚、送客请求。

### AuraTip

功能：Pathfinder 教学提示状态机和右上角教学卡片展示。

主要入口：

- `kubejs/client_scripts/auratip/auratip_tips.js`
- `kubejs/server_scripts/auratip_triggers.js`
- `components/auratip.md`

能力边界：只负责提示注册、展示、关闭和阶段推进，不负责 Pathfinder 成功条件和结算。

简单调用：游戏内使用 `/auratip openshop`、`/auratip reset`、`/auratip debug show <tip_id>`；代码侧使用 `global.aTip.startOpenShop(player)`、`global.aTip.advance(...)`、`global.aTip.closeThenShow(...)`。

### ApricityUI / KubeJS UI

功能：WorldWindow、Screen、HUD、手机、泡脚/搓脚 HTML UI 的客户端展示和交互适配。

主要入口：

- `kubejs/client_scripts/ui/foot_ui.js`
- `kubejs/client_scripts/ui/phone_ui.js`
- `kubejs/client_scripts/ui/stamina_hud.js`
- `apricity/kubejs/footui.html`
- `apricity/kubejs/footsoak.html`
- `apricity/kubejs/footsoak_button.html`
- `apricity/kubejs/phone.html`
- `apricity/kubejs/stamina_hud.html`
- `components/apricityui-ui.md`

能力边界：UI 模块负责展示、点击/鼠标事件和客户端同步，不直接决定 Pathfinder 业务流程、顾客状态、奖励结算或物品消耗。

简单调用：WorldWindow 使用 `ApricityUI.createWorldWindow(...)`，Screen 使用 `ApricityUI.openScreen(...)`。AUI 1.2.2-hotfix1 的类路径、鼠标拦截、重载歧义和热加载限制必须先看 `components/apricityui-ui.md`。

### Tooltip

功能：为物品追加说明，或为遗物替换成 ApricityUI 自定义 HTML tooltip。

主要入口：

- `kubejs/client_scripts/tooltip/fasciaGunTooltip.js`
- `kubejs/client_scripts/tooltip/soakWaterTooltip.js`
- `kubejs/client_scripts/tooltip/relicTooltip.js`
- `kubejs/client_scripts/tooltip/oilTooltip.js`
- `kubejs/startup_scripts/tooltip.js`

能力边界：tooltip 只负责展示物品说明，不负责修改物品属性、消耗物品或推进服务流程。

简单调用：普通 tooltip 使用 `ItemEvents.tooltip(event => event.addAdvanced(itemId, (stack, advanced, text) => { ... }))`，必须放在 `client_scripts`。遗物 HTML tooltip 使用 Forge tooltip 事件和 ApricityUI，当前只对 `global.relicRegister.relics` 中的遗物生效。

### Relic / Backpack

功能：遗物注册、稀有度、标签、阶段池、Curios 背包格、遗物装备/卸下/击杀/攻击钩子。

主要入口：

- `kubejs/startup_scripts/relic/relicRegister.js`
- `kubejs/startup_scripts/relic/relicItem/stage*/stage*.js`
- `kubejs/startup_scripts/relic/relicHelpers.js`
- `kubejs/server_scripts/backpack`

能力边界：遗物模块提供定义和效果钩子，不应直接承担 Pathfinder 路径、泡脚倒计时或手机 UI 逻辑。

简单调用：新增遗物通过 `global.relicRegister.register(relic => { ... })`，阶段文件顶部设置 `global.relicRegister.currentStage`。

### Oil / Serve Hooks

功能：油物品注册、油标签、服务点击钩子。

主要入口：

- `kubejs/startup_scripts/oil/oilRegister.js`
- `kubejs/startup_scripts/oil/oilItem`
- `kubejs/startup_scripts/serveHooks.js`
- `kubejs/server_scripts/serve/oil.js`

能力边界：油模块可以影响服务点击效果，但不应直接改 Pathfinder 基础状态机和实体移动。

简单调用：新增油通过 `global.oilRegister.register(oil => { ... })`；服务点击扩展通过 `global.registerServeClickHook(hookFn)`。

### Soak Water / Fluids

功能：泡脚水定义、流体和桶注册、桶 tooltip、泡脚效果应用。

主要入口：

- `kubejs/startup_scripts/soakwater/soakWaterRegister.js`
- `kubejs/startup_scripts/soakwater/soakWaters.js`
- `kubejs/startup_scripts/soakwater/usedFootWater.js`
- `kubejs/client_scripts/tooltip/soakWaterTooltip.js`
- `kubejs/server_scripts/pathfinder/pfSoakManager.js`
- `kubejs/server_scripts/pathfinder/pfSoakWaterEffects.js`

能力边界：泡脚水模块负责水种类和效果，不负责 AuraTip 流程文案和 Pathfinder 路径扫描。

简单调用：新增泡脚水通过 `global.soakWaterRegister.register(w => { ... })`；泡脚按钮服务端入口是 `foot_click_soak` 网络事件。

### Stamina / Phone / Gacha

功能：体力同步和消耗、手机设置和评价同步、抽卡/盲盒奖励。

主要入口：

- `kubejs/server_scripts/stamina.js`
- `kubejs/client_scripts/ui/stamina_hud.js`
- `kubejs/server_scripts/phone.js`
- `kubejs/server_scripts/phone_settings.js`
- `kubejs/client_scripts/ui/phone_ui.js`
- `kubejs/server_scripts/gacha.js`
- `kubejs/server_scripts/blindbox.js`

能力边界：这些模块负责玩家资源、设置和奖励，不应绕过 Pathfinder 的服务结算入口。

简单调用：体力使用 `global.pfConsumeStamina(player, amount)` 和 `global.pfRestoreStamina(player, amount)`；手机设置使用 `global.pfGetSetting(player, key)` 和 `global.pfSetSetting(player, key, value)`。

### Recipes / Items / Blocks / Assets

功能：注册基础物品、方块、流体、配方、语言、贴图、模型和数据包 tag。

主要入口：

- `kubejs/startup_scripts/item`
- `kubejs/startup_scripts/block`
- `kubejs/startup_scripts/fluid`
- `kubejs/server_scripts/recipes`
- `kubejs/assets`
- `kubejs/data`

能力边界：注册和资源文件应保持命名一致。跨 Windows/Git 大小写改名时使用中间名改名，避免 `core.ignorecase=true` 导致大小写改名失效。

简单调用：新增物品/方块/流体使用 `StartupEvents.registry(...)`；新增配方使用 `ServerEvents.recipes(event => { ... })`。

### Sound

功能：封装播放、停止、事件绑定和广播音效。

主要入口：

- `kubejs/server_scripts/sound/sound_framework.js`
- `kubejs/server_scripts/sound/sound_framework_example.js`

能力边界：音效模块只负责声音行为，不应直接决定业务流程是否成功。

简单调用：使用 `global.music.playForPlayer(player, soundId, options)`、`global.music.playAt(source, soundId, posSource, options)`、`global.music.bind(eventName, soundId, options)`、`global.music.emit(eventName, source, options)`。

## 后续 AI 开发规范

- 先读代码再改。至少查相关模块入口、`global.*` 导出、事件注册和调用方。
- 变更范围最小化。不要顺手重构无关模块、改名无关文件或统一风格。
- 不乱加兜底。只有已有代码模式、明确兼容需求或可复现故障路径需要时才加 fallback；不要用宽泛兜底吞掉真实错误。
- 跨模块契约要同步更新。改 `global.*` API、网络事件名、NBT 字段、tip id、trigger 字符串、物品 id、tag 时，必须同步调用方和文档。
- 客户端 tooltip 必须放 `client_scripts`；不要把 `ItemEvents.tooltip` 放进 `startup_scripts`。
- 新增全局 API 统一挂到 `global.*`，新增前用 `rg` 查重，避免覆盖已有名字。
- Windows/Git 下只改文件名大小写时，使用中间名两步改名。
- 避免批量删除、批量迁移和无关格式化。需要大范围清理时先停下来说明原因。
- Code review 按 GitHub PR review 思路检查 diff、行为风险、跨模块影响和缺少的验证；AI 生成内容必须人工验证后再合入。
- 文档变更要基于当前代码，不要凭记忆写不存在的接口。

## 测试与验证

按改动类型选择最低验证：

- 查引用：`rg -n "关键 id|global\\.xxx|NetworkEvents|ItemEvents\\.tooltip" kubejs components AGENTS.md`
- 文档：`Get-Content -Encoding UTF8 <file>`，确认中文正常显示；再用 `rg` 查关键术语。
- Startup 注册：启动游戏或重载 KubeJS 后看启动日志，确认没有 registry 报错。
- Server 逻辑：触发对应方块、物品、命令或网络事件，观察聊天提示和 `logs` 中对应前缀。
- Client tooltip/UI：进游戏查看物品悬浮提示或 UI，确认没有遮挡、空白和脚本类型错误。
- AuraTip：测试 `/auratip openshop`、`/auratip reset`、`/auratip debug show pathfinder_open_shop_tip`，再跑一次开店到泡脚/搓脚流程。
- Pathfinder：至少验证白天开店、夜晚拦截、预约凭证、泡脚、搓脚、顾客结束或送客中的相关路径。

文档-only 变更不要求启动游戏，但必须完成只读内容检查。
