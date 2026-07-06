# 背包行为

## Curios 槽位

来源：

- `kubejs/data/curios/curios/slots/package.json`
- `kubejs/assets/curios/lang/zh_cn.json`
- `kubejs/server_scripts/backpack/backpackInit.js`
- `kubejs/server_scripts/backpack/backpackUpdate.js`
- `kubejs/startup_scripts/relic/relicItem/relicBackpackSpace.js`

背包被建模为 Curios 标识符 `package`，显示名是 `背包`。遗物物品创建时会被打上 `curios:package` 标签。

当前槽位 JSON 声明：

```json
{
  "size": 9,
  "add_cosmetic": true,
  "icon": "curios:slot/package_icon"
}
```

背包代码按 6 x 9 逻辑网格编写。修改槽位数量前，应先在运行中的整合包里确认实际 `curiosAll.getSlots()` 值。

## 初始镶板矩阵

玩家首次登录时，`backpackInit.js` 会按下面矩阵向 6 x 9 逻辑网格填入 `backpack_space_mkN` 镶板。`0` 表示该槽留空。

```text
5 4 3 3 3 3 3 4 5
5 4 2 1 1 1 2 4 5
5 4 2 0 0 0 2 4 5
5 4 2 0 0 0 2 4 5
5 4 2 1 1 1 2 4 5
5 4 3 3 3 3 3 4 5
```

初始化由玩家持久数据键 `pfBackpackInited` 保护。`global.pfResetBackpackInit(player)` 可以重置并重新应用镶板矩阵。

## 背包镶板

`relicBackpackSpace.js` 会把 `backpack_space_mk1` 到 `backpack_space_mk5` 注册为遗物对象，并放入 `global.relicPool.space` 池。

镶板行为：

- 名称：`背包镶板 MKN`。
- 贴图：`marguerite:item/backpack_space`。
- `canUnEquip`：要求玩家背包里有一个对应的 `marguerite:slot_expander_mkN`。
- 缺少扩大器时显示 actionbar 提示，40 tick 节流。
- `onUnEquip`：消耗一个对应栏位扩大器，并调用 `global.updatePlayerBackpack`。

应把镶板视为锁定空间。辅助函数通过 `global.SPACE_PANEL_IDS` 识别它们，并在大多数空间计数中排除这些槽。

## 属性重算

`backpackUpdate.js` 中的 `global.updatePlayerBackpack(player)` 是运行时应用遗物效果的主路径。

它做两件事：

1. 从固定属性列表中移除所有现有 modifier。
2. 遍历每个 Curios 已装备槽位，对匹配已注册遗物 ID 的物品调用 `relic.onLoad(player, slotIndex)`。

会清理的原版/模组属性包括生命、移动、攻击、护甲、幸运和 `l2damagetracker:crit_rate`。

当前会清理的服务玩法属性只包含以下四个部位：

- `kubejs:serve.sat_gain.jiaozhi`
- `kubejs:serve.money_gain.jiaozhi`
- `kubejs:serve.stamina_cost.jiaozhi`
- `kubejs:serve.sat_gain.jiaozhang`
- `kubejs:serve.money_gain.jiaozhang`
- `kubejs:serve.stamina_cost.jiaozhang`
- `kubejs:serve.sat_gain.jiaoxin`
- `kubejs:serve.money_gain.jiaoxin`
- `kubejs:serve.stamina_cost.jiaoxin`
- `kubejs:serve.sat_gain.jiaogen`
- `kubejs:serve.money_gain.jiaogen`
- `kubejs:serve.stamina_cost.jiaogen`

`serveAttributes.js` 也注册了 `jiaobei`，但背包重算不会清理它。新增持久性的 `jiaobei` 遗物效果前，必须先决定是否要让 `backpackUpdate.js` 清理 `jiaobei`。

## 服务玩法属性

来源：`kubejs/startup_scripts/attributes/serveAttributes.js`

基础值：

| Part | sat | money | stamina |
| --- | ---: | ---: | ---: |
| `jiaozhi` | 5 | 5 | 150 |
| `jiaozhang` | 10 | 2 | 120 |
| `jiaoxin` | 5 | 2 | 70 |
| `jiaogen` | 7 | 3 | 100 |
| `jiaobei` | 0 | 0 | 100 |

源码注释里写明 `jiaobei` 仅作兼容用途，已从 pathfinder 玩法中移除。当前 pathfinder 代码只把实际操作映射到 `jiaozhi`、`jiaozhang`、`jiaoxin` 和 `jiaogen`。
