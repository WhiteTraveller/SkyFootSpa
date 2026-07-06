# 遗物注册

## 核心注册表

来源：`kubejs/startup_scripts/relic/relicRegister.js`

`global.relicRegister` 由 `RelicRegister` 创建。主要公开状态：

- `relics`：所有已注册遗物对象，包括背包镶板。
- `commonRelics`、`specialRelics`、`curseRelics`、`shopRelics`：由 `register()` 按池分类填充。
- `spaceRelics`：已声明，但当前 `register()` 不会填充它。
- `currentStage`：阶段文件注册遗物前会设置这个值。

`register(fn)` 会创建一个新的 `Relic`，传给 `fn` 填充数据；如果该遗物没有主动设置 `stage`，就从 `currentStage` 自动继承阶段，最后追加到 `relics`。

## 遗物字段

`Relic` 实例支持这些数据字段：

- `name`：内部物品后缀。最终物品 ID 是 `marguerite:${name}`。
- `nameZH`：显示名。
- `description`：普通 tooltip 描述，通常是 `Text` 对象。
- `specialDescription`：可选的额外 tooltip 描述。
- `story`：故事文本。
- `tags`：来自 `global.margueriteTags` 的标签对象数组。
- `guideTexture`：旧 tooltip 路径使用的 `Text` 行数组，用来显示布局提示。
- `texture`：可选贴图文件名或路径提示。
- `rarity`：`global.raritys.common`、`uncommon`、`rare`、`epic` 之一。
- `pool`：`global.relicPool.common`、`shop`、`curse`、`special`、`space` 之一。
- `stage`：数字阶段，通常从阶段文件继承。

回调字段：

- `canEquip(slotContext, stack)`
- `canUnEquip(slotContext, stack)`
- `onLoad(player, slotIndex)`
- `onDoDamage(event, player, slotIndex)`
- `onEquip(slotContext, oldStack, newStack)`
- `onUnEquip(slotContext, oldStack, newStack)`
- `onKill(player, slotIndex)`

每个字段都有链式 setter，例如 `setName`、`setTags`、`setOnLoad`、`setPool`。

## 物品注册

来源：`kubejs/startup_scripts/relic/relic.js`

物品注册阶段，脚本遍历 `global.relicRegister.relics`，为每个遗物创建一个 KubeJS 物品：

- ID：`global.getRelicId(relic.name)`，返回 `marguerite:${name}`。
- 显示名：优先使用 `nameZH`，否则使用 `name`。
- 最大堆叠数：`1`。
- Curios 能力：装备、卸下、可装备、可卸下回调。
- 标签：一定有 `curios:package`，并附加 `relic.tags` 中每个标签对象的 `id`。

装备和卸下回调会先尝试调用 `global.updatePlayerBackpack(entity)`，再调用该遗物自己的 `onEquip` 或 `onUnEquip`。异常会被捕获并记录，避免单个遗物回调破坏 Curios 事件总线。

## 贴图规则

`relic.js` 按以下顺序选择物品贴图：

1. 如果设置了 `relic.texture`：
   - `chip_lv*.png` 映射到 `kubejs:item/chip_lv*`。
   - 其他文件名映射到 `marguerite:item/<fileName>`。
2. 如果没有设置贴图，且 `stage` 在 `1..5`，则根据名称后缀映射芯片部位贴图：
   - `_toe` -> `pt1`
   - `_sole` -> `pt2`
   - `_center` -> `pt3`
   - `_heel` -> `pt4`
   - `_all` -> `pt5`
3. 其他情况回退到 `marguerite:item/${relic.name}`。

现有芯片贴图位于 `kubejs/assets/kubejs/textures/item/chip_lv*_pt*.png`。独特遗物贴图位于 `kubejs/assets/marguerite/textures/item/`。Apricity UI tooltip 图片位于 `apricity/kubejs/`，如果修改自定义视觉 tooltip，可能也要补同名图片。

## 阶段文件

来源：`kubejs/startup_scripts/relic/relicItem/stage1..stage5/stage*.js`

每个阶段文件都会先设置 `global.relicRegister.currentStage = N`，然后多次调用 `global.relicRegister.register(...)`。除非遗物主动调用 `setStage`，否则阶段会自动继承。

当前数量：

- 阶段 1：12 个遗物。
- 阶段 2：26 个遗物。
- 阶段 3：14 个遗物。
- 阶段 4：11 个遗物。
- 阶段 5：10 个遗物。
- 背包镶板：`relicBackpackSpace.js` 注册 5 个镶板遗物。
