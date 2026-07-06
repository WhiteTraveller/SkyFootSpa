# 辅助 API

## 标签

来源：`kubejs/startup_scripts/relic/relicTags.js`

`global.margueriteTags` 包含以下标签对象：

| 键 | ID | 中文名 | 颜色 |
| --- | --- | --- | --- |
| `doll` | `marguerite:tag_doll` | 人偶 | `yellow` |
| `fabric` | `marguerite:tag_fabric` | 布制品 | `gray` |
| `metal` | `marguerite:tag_metal` | 金属制品 | `white` |
| `knife` | `marguerite:tag_knife` | 小刀 | `blue` |
| `perform` | `marguerite:tag_perform` | 演奏 | `yellow` |
| `mushroom` | `marguerite:tag_mushroom` | 蘑菇 | `blue` |
| `wooden` | `marguerite:tag_wooden` | 木制 | `gold` |
| `step` | `marguerite:tag_step` | 步 | `green` |
| `magic` | `marguerite:tag_magic` | 魔法 | `light_purple` |
| `artifact` | `marguerite:tag_artifact` | 人工制品 | `aqua` |
| `book` | `marguerite:tag_book` | 书 | `dark_aqua` |
| `conductive` | `marguerite:tag_conductive` | 导电 | `red` |

在 `relic.setTags([...])` 中使用这些标签对象；`relic.js` 会用每个对象的 `id` 添加真实物品标签。

## 属性辅助函数

来源：`kubejs/startup_scripts/relic/relicHelpers.js`

这些辅助函数会对四个有效足部部位添加 addition modifier：

- `global.modifyAllMoney(player, modName, value)`
- `global.modifyAllSat(player, modName, value)`
- `global.modifyAllStaminaCost(player, modName, value)`

它们作用于 `jiaozhi`、`jiaozhang`、`jiaoxin`、`jiaogen`，不包含 `jiaobei`。

## 槽位几何

辅助层假设 `ROWS = 6`、`COLS = 9`、`TOTAL_SLOTS = 54`。

空间辅助函数：

- `getSameRowSlots(i, curiosAll)`：同一行，排除 `i`；传入 `curiosAll` 时跳过空间镶板。
- `getSameColSlots(i, curiosAll)`：同一列，排除 `i`；传入 `curiosAll` 时跳过空间镶板。
- `getNineGrid(center, rows, cols)`：周围 3 x 3 格，排除中心。
- `getTenGrid(center, rows, cols)`：只返回上下左右正交相邻格。
- `getDiagonalSlots(i)`：四个对角方向上的全部格，排除中心。
- `isFirstRow(i, curiosAll)`：物理第一行，或上方所有行都是空间镶板。
- `isBottomRow(i, curiosAll)`：下方所有行都是空间镶板。
- `isBottomTwoRows(i, curiosAll)`：位于当前存在区域的底部两行。
- `getBottomTwoRowSlots(curiosAll)`：当前存在区域底部两行的所有槽，排除空间镶板。
- `isInCenter2x3(i)`：是否在固定中心 2 x 3 区域。
- `getCenter2x3Slots()`：返回固定中心 2 x 3 区域。

计数辅助函数：

- `isSpacePanelId(id)`：判断是否为 `backpack_space_mk1..mk5`。
- `getSpacePanelIdByLevel(level)`：返回 `marguerite:backpack_space_mkN`。
- `getSlotExpanderIdByLevel(level)`：返回 `marguerite:slot_expander_mkN`。
- `isValidRelic(stack)`：非空且不是空间镶板。
- `countRelicsInSlots(slots, curiosAll)`：统计有效遗物栈数量。
- `countEmptyInSlots(slots, curiosAll)`：统计可用空槽，跳过空间镶板。
- `itemHasRelicTag(stack, tagId)`：使用已注册遗物的 `tags` 元数据，不是 Minecraft 原生标签查询。
- `countTagInSlots(slots, tagId, curiosAll)`。
- `hasTagInSlots(slots, tagId, curiosAll)`。
- `countUniqueTagsInBackpack(curiosAll)`。
- `countUniqueTagsInSlots(slots, curiosAll)`。
- `getCuriosAll(player)`：返回 Curios 已装备物品容器。

`global.relicTagMap` 会从 `global.relicRegister.relics` 懒加载构建。如果首次使用后又修改了遗物定义，下一次使用标签辅助函数前应先设置 `global.relicTagMap = null`。
