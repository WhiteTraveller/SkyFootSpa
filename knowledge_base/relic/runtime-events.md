# 运行时事件

## 装备与卸下

来源：`kubejs/startup_scripts/relic/relic.js`

每个已注册遗物物品都会获得 Curios 能力。装备和卸下时：

1. 尝试调用 `global.updatePlayerBackpack(entity)`。
2. 尝试调用该遗物自己的 `onEquip` 或 `onUnEquip`。

这些回调会被分别捕获异常。重算失败不应阻止自定义回调执行，自定义回调失败也不应破坏整个 Curios。

## onLoad

来源：`kubejs/server_scripts/backpack/backpackUpdate.js`

`onLoad(player, slotIndex)` 不是物品注册事件。它会在背包重算过程中，对每个 ID 匹配已注册遗物的 Curios 已装备物品调用。

属性 modifier 和布局依赖效果应放在 `onLoad` 中。它必须保持幂等：

- 使用唯一 modifier 名，通常是 `relic.nameZH + slotIndex`，或 `relic.nameZH + '_row_' + slotIndex` 这类带后缀形式。
- 避免在 `onLoad` 里做永久物品栏、NBT 或世界副作用。
- 假设它可能在装备、卸下、首次登录初始化、任何手动重算后执行。

## 伤害事件

来源：`kubejs/server_scripts/backpack/relic/relicAttack.js`

`EntityEvents.hurt` 会检查 `source.actual` 是否为玩家，以及受击目标是否为 living entity。之后扫描所有 Curios 已装备槽位，对匹配的遗物 ID 调用 `relic.onDoDamage(event, player, slotIndex)`。

需要原始伤害事件的效果应使用 `setOnDoDamage`。

## 击杀事件

来源：`kubejs/server_scripts/backpack/relic/relicKill.js`

`EntityEvents.death` 会检查击杀者是否为玩家，以及该玩家所在维度字符串是否包含 `dimdungeons:dungeon_dimension`。之后扫描 Curios 槽位，对匹配的遗物 ID 调用 `relic.onKill(player, slotIndex)`。

地牢击杀奖励或计数器应使用 `setOnKill`。如果效果需要在地牢外生效，必须先修改这个事件门槛。

## Tooltip

来源：`kubejs/client_scripts/tooltip/relicTooltip.js`

旧 tooltip 路径会读取 `global.relicRegister.relics`，并添加以下 tooltip 行：

- 阶段标识。
- `description`。
- `specialDescription`。
- `guideTexture`。
- 标签名称。
- `story`。

修改这个文件前要注意：标签循环内部在 `let tag = relic.tags[j]` 之前调用了 `console.log(tag)`，循环执行时可能触发暂时性死区引用错误。颜色 switch 也只处理 `gray`、`yellow`、`blue`、`green`、`white`，而当前标签还包含 `gold`、`light_purple`、`aqua`、`dark_aqua`、`red` 等颜色。

相关但不属于本初始节点的文件：`kubejs/startup_scripts/tooltip.js` 实现了 ApricityUI 风格的自定义遗物 tooltip，也读取 `global.relicRegister`。修改视觉 tooltip 行为前应先读它。
