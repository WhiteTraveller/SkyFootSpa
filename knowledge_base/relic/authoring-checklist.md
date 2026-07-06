# 遗物编写检查清单

新增或修改遗物前先读这里。

## 选择源码位置

- 阶段遗物放在 `kubejs/startup_scripts/relic/relicItem/stageN/stageN.js`。
- 空间/锁定行为放在 `kubejs/startup_scripts/relic/relicItem/relicBackpackSpace.js`。
- 共享布局或计数逻辑放在 `relicHelpers.js` 或 `relicTags.js`。
- 运行时事件分发放在 `kubejs/server_scripts/backpack/relic/`。
- 不要把玩法逻辑放进 tooltip 文件。

## 定义遗物

最小结构：

```js
global.relicRegister.register(function(relic) {
    relic.setName("example_relic")
        .setNameZH("示例遗物")
        .setDescription(Text.gray("说明"))
        .setSpecialDescription(Text.gray("特殊说明"))
        .setStory("故事文本")
        .setTags([global.margueriteTags.magic])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 1.0, 'addition')
        })
        .setPool(global.relicPool.common)
})
```

检查项：

- `setName` 必须在所有遗物和镶板中唯一。
- `setNameZH` 应保持稳定，因为很多 modifier 名会使用它。
- 独特遗物使用 `setTexture`。如果遗物名以 `_toe`、`_sole`、`_center`、`_heel` 或 `_all` 结尾，芯片类遗物可以依赖阶段/后缀自动贴图映射。
- `setTags` 使用 `global.margueriteTags.*` 对象。
- 只有旧 tooltip 路径需要显示布局提示时才使用 `setGuideTexture`。
- 设置 `setRarity` 和 `setPool`。
- 可重算属性效果优先放在 `onLoad`。
- 攻击事件行为使用 `onDoDamage`，地牢击杀行为使用 `onKill`。

## 属性效果

- 四个有效部位全部生效时，优先使用 `global.modifyAllMoney`、`global.modifyAllSat` 或 `global.modifyAllStaminaCost`。
- 单个部位生效时，调用 `player.modifyAttribute('kubejs:serve.<kind>.<part>', modifierName, value, 'addition')`。
- 每个遗物实例使用唯一 modifier 名。常见模式是 `relic.nameZH + i`；同一遗物有多个 modifier 时加后缀。
- `stamina_cost` 为正表示更差，为负表示更好。
- 除非先更新 `backpackUpdate.js` 去清理 `jiaobei` modifier，否则避免新增 `jiaobei` 效果。

## 布局效果

当效果依赖附近槽位时：

1. 用 `global.getCuriosAll(player)` 获取 `curiosAll`。
2. 使用 `helper-api.md` 中的辅助函数；如果辅助函数能跳过空间镶板，就传入 `curiosAll`。
3. 从返回的槽位列表统计遗物、空槽、标签或不同标签数。
4. 应用 modifier。

## 完成前检查

- 阅读目标阶段文件附近的遗物，匹配本地风格和平衡模式。
- 检查贴图是否存在于 `kubejs/assets/kubejs/textures/item` 或 `kubejs/assets/marguerite/textures/item`。
- 如果需要 Apricity UI tooltip 图片，检查 `apricity/kubejs/`。
- 如果新增标签颜色，且旧 tooltip 路径仍重要，需要同步更新 tooltip 处理。
- 如果修改槽位几何，更新 `backpack.md` 和辅助函数文档。
