# 遗物与背包知识树

这个节点覆盖 KubeJS 遗物系统：遗物元数据注册、实际物品生成、Curios 背包槽位、效果重算和事件回调。

## 系统形态

遗物定义是数据优先的。各阶段文件把 `Relic` 对象写入 `global.relicRegister.relics`；之后 `relic.js` 再把这些对象注册成真正的 `marguerite:*` 物品，并附加 Curios 能力和物品贴图。运行时效果不是在定义遗物时永久生效，而是由 `global.updatePlayerBackpack(player)` 根据当前已装备的 Curios 物品重新计算。

主流程：

```text
relicRegister.js
  -> relicTags.js / relicHelpers.js
  -> relicItem/stage*.js 与 relicItem/relicBackpackSpace.js
  -> relic.js item registry
  -> Curios package slots
  -> backpackUpdate.js recalculation
  -> pathfinder / serve gameplay reads player attributes
```

## 核心不变量

- 遗物物品 ID 固定为 `marguerite:` + `relic.name`。
- 普通遗物物品都会由 `relic.js` 打上 `curios:package` 标签。
- 背包逻辑把 Curios 已装备物品容器当作 6 x 9 网格处理，索引是 `0..53`。
- `backpack_space_mk1..mk5` 也注册为遗物，但它们表示锁定的背包镶板，不是可玩的遗物效果。
- `onLoad(player, slotIndex)` 必须可重复执行且结果稳定；背包重算会先清 modifier，再对每个已装备遗物调用 `onLoad`。
- 空间辅助函数通常会忽略 `backpack_space` 镶板，锁定区域不算可用空格。

## 已知风险点

- `serveAttributes.js` 注册了 `jiaobei`，但 `backpackUpdate.js` 当前只清理 `jiaozhi`、`jiaozhang`、`jiaoxin`、`jiaogen`。直接加到 `kubejs:serve.*.jiaobei` 的 modifier 可能在重算后残留。
- `relicHelpers.js` 的 `modifyAll*` 辅助函数也只作用于四个部位，不包含 `jiaobei`。
- `RelicRegister` 声明了 `spaceRelics`，但 `register()` 当前没有把 `global.relicPool.space` 的遗物推入该数组。镶板仍然存在于 `relics`。
- `client_scripts/tooltip/relicTooltip.js` 在 `let tag = ...` 前调用了 `console.log(tag)`；后续 tooltip 工作不要直接假设旧路径可用，应先检查这里。
- `data/curios/curios/slots/package.json` 声明槽位数量为 `9`，但背包脚本按 54 格编写。改布局规则前，需要在游戏运行时确认实际 `curiosAll.getSlots()`。

## 叶子文档

- 增加字段、池、标签、贴图或阶段注册文件前，读 `registration.md`。
- 修改 Curios 槽、镶板解锁、格子几何或属性重算前，读 `backpack.md`。
- 添加 `setOnLoad`、`setOnDoDamage`、`setOnKill` 等回调前，读 `runtime-events.md`。
- 使用行、列、标签、计数辅助函数前，读 `helper-api.md`。
- 实现新遗物前，读 `authoring-checklist.md`。
