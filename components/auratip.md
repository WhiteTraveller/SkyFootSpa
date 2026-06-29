# AuraTip 教学提示模块

AuraTip 是 Pathfinder 服务流程的教学提示系统。客户端负责注册提示卡片和样式，服务端负责按玩家教学阶段触发、关闭和推进提示。

本模块只管理提示展示、提示关闭、阶段状态和延迟触发队列；不负责开店、寻路、顾客生成、泡脚结算、搓脚收益或物品 tooltip。

## 代码入口

- 客户端提示定义：`kubejs/client_scripts/auratip/auratip_tips.js`
- 服务端触发器：`kubejs/server_scripts/auratip_triggers.js`
- Pathfinder 接入点：
  - `kubejs/server_scripts/pathfinder/pfBlockHandler.js`
  - `kubejs/server_scripts/pathfinder/pfNetworkHandler.js`
  - `kubejs/server_scripts/pathfinder/pfMovement.js`
  - `kubejs/server_scripts/sleep.js`

## 运行结构

客户端脚本在 `global.aTip.tips` 中维护教学卡片定义。每个 tip 至少包含：

- `id`：AuraTip 内部使用的提示 id，例如 `pathfinder_open_shop_tip`
- `trigger`：TipTriggers 使用的触发字符串，例如 `kubejs:pathfinder_open_shop`
- `title`：卡片标题
- `content`：卡片正文
- `wrapUnits`：中文/英文混排时的自动换行宽度
- `durationTicks`：可选；不填时默认常驻，直到关闭或被下一张提示替换

客户端通过 `TipEvents.register(event => global.aTip.registerAll(event))` 注册卡片。卡片统一使用 `global.aTip.styleTeachingCard(...)` 设置样式，位置固定在右上角，关闭键是 `key.keyboard.delete`，卡片内 badge 文案为 `delete 关闭`。

服务端脚本在 `global.aTip.triggers` 中维护 `tip id -> trigger` 映射。服务端调用 `TipTriggers.trigger(trigger, player)` 展示提示，调用 `TipTriggers.close(player)` 关闭当前提示。

为避免同 tick 关闭后立即显示导致状态不稳定，服务端提供 `global.aTip.queueShow(player, tipId, delayTicks)` 和 `global.aTip.closeThenShow(player, tipId, delayTicks)`。待显示项存入 `global.aTip.pendingShows`，由 `ServerEvents.tick` 每 tick 检查并触发。

玩家教学阶段保存在：

```js
player.persistentData["aTipTeaching.stage"]
```

服务端 API 使用 `global.aTip.getStage(player)`、`setStage(player, stage)`、`clearStage(player)`、`isStage(player, stage)` 读写该阶段。历史阶段 `night_blocked` 会被兼容映射回 `wait_pathfinder_click`。

## 当前教学流程

当前流程从命令或代码调用开始：

```text
openshop
  -> wait_pathfinder_click
  -> wait_voucher_click
  -> wait_soak_click
  -> wait_rub_foot
  -> done
```

阶段推进点：

- `/auratip openshop` 或 `global.aTip.startOpenShop(player)`：设置 `wait_pathfinder_click`，显示开店引导。
- 右键寻路方块成功开店：从 `wait_pathfinder_click` 推进到 `wait_voucher_click`，显示预约凭证提示。
- 夜晚右键寻路方块：不推进阶段，只显示夜晚无法开店提示；等待白天后继续右键。
- 手持预约凭证右键寻路方块：从 `wait_voucher_click` 推进到 `wait_soak_click`，显示泡脚提示。
- 客户端点击泡脚按钮且服务端成功开始泡脚：从 `wait_soak_click` 推进到 `wait_rub_foot`，显示搓脚提示。
- 顾客服务结束时：从 `wait_rub_foot` 推进到 `done`，显示流程结束提示。
- 顾客到达路径终点或流程结束后，Pathfinder 会尝试关闭玩家当前提示。

当前已注册 tip：

| Tip ID | Trigger | 用途 |
| --- | --- | --- |
| `pathfinder_open_shop_tip` | `kubejs:pathfinder_open_shop` | 引导右键寻路方块开店 |
| `pathfinder_night_close_tip` | `kubejs:pathfinder_night_close` | 夜晚无法开店提示 |
| `pathfinder_voucher_click_tip` | `kubejs:pathfinder_voucher_click` | 引导使用预约凭证 |
| `pathfinder_water_soak_click_tip` | `kubejs:pathfinder_water_soak_click` | 引导手持水桶/洗脚水桶泡脚 |
| `pathfinder_rub_foot_tip` | `kubejs:pathfinder_rub_foot` | 引导搓脚与遗物搭配 |
| `pathfinder_service_finish_tip` | `kubejs:pathfinder_service_finish` | 服务流程结束提示 |

## 简单调用方法

游戏内命令：

```text
/auratip openshop
/auratip reset
/auratip debug show pathfinder_open_shop_tip
```

代码侧常用调用：

```js
global.aTip.startOpenShop(player)
global.aTip.showNightClose(player)
global.aTip.advance(player, "wait_soak_click", "wait_rub_foot", "pathfinder_rub_foot_tip")
global.aTip.closeThenShow(player, "pathfinder_open_shop_tip", 1)
global.aTip.closePlayerTip(player)
```

`advance(player, expectedStage, nextStage, nextTipId)` 会先校验当前阶段。当前阶段不等于 `expectedStage` 时不会推进，也不会显示下一张提示。

## 新增 Tip 方法

新增普通提示时同时改客户端和服务端：

1. 在 `kubejs/client_scripts/auratip/auratip_tips.js` 的 `global.aTip.tips` 中新增一项。
2. 在 `kubejs/server_scripts/auratip_triggers.js` 的 `global.aTip.triggers` 中新增同名 `id` 到 trigger 字符串的映射。
3. 若提示要参与流程推进，在 Pathfinder、网络事件或其他服务端事件中调用 `global.aTip.advance(...)`、`show(...)` 或 `closeThenShow(...)`。
4. 用 `/auratip debug show <tip_id>` 验证卡片能显示，再触发真实流程验证阶段推进。

示例：

```js
// client_scripts/auratip/auratip_tips.js
{
    id: "example_tip",
    trigger: "kubejs:example_tip",
    title: "示例提示",
    content: "这是一条教学提示。",
    wrapUnits: 28
}

// server_scripts/auratip_triggers.js
example_tip: "kubejs:example_tip"
```

## 能力边界

AuraTip 可以做：

- 注册教学卡片。
- 展示、关闭、延迟展示卡片。
- 记录和推进玩家教学阶段。
- 根据 Pathfinder 关键事件串联教程。

AuraTip 不应该做：

- 判定 Pathfinder 路径是否有效。
- 生成或删除顾客实体。
- 消耗预约凭证、水桶、体力或 FE。
- 计算满意度、金钱、皴掉落、评价。
- 追加物品 tooltip 或替换遗物 tooltip。
- 在没有真实业务事件成功时强行推进教学阶段。

## Tooltip 关联

项目里存在两类 tooltip 写法，和 AuraTip 是不同系统：

- 普通物品 tooltip：放在 `kubejs/client_scripts/tooltip/*.js`，使用 `ItemEvents.tooltip(event => event.addAdvanced(itemId, (stack, advanced, text) => { ... }))`。
- 遗物自定义 HTML tooltip：放在 `kubejs/startup_scripts/tooltip.js`，使用 Forge tooltip 事件配合 ApricityUI 文档 `kubejs/tooltip.html`，只对已注册遗物物品生效。

注意：`ItemEvents.tooltip` 必须放在 `client_scripts`，不要放进 `startup_scripts`。`startup_scripts/tooltip.js` 是 Forge 事件 + ApricityUI 的特殊实现，不是普通 KubeJS tooltip 注册方式。

## 验证清单

- `rg -n "global\\.aTip|TipEvents|TipTriggers|pathfinder_.*_tip" kubejs`
- 游戏内执行 `/auratip debug show pathfinder_open_shop_tip`，确认右上角出现卡片。
- 游戏内执行 `/auratip reset` 后再执行 `/auratip openshop`，确认阶段重置并显示开店引导。
- 白天完成一次开店、预约凭证、泡脚、搓脚到结束流程，确认提示按顺序推进。
- 夜晚右键寻路方块，确认显示夜晚提示且阶段仍可在白天继续。
