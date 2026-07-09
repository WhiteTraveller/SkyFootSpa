# 分 tier 批量注册

项目中有两组物品采用数组驱动批量注册：能量饮料、体力药剂。

## 能量饮料

源码：`kubejs/startup_scripts/item/energy_drinks.js`

```js
global.ENERGY_DRINK_TIERS = [
    { tier: 1, stamina: 1000, damage: 3, hungerSec: 20, ... },
    { tier: 2, stamina: 2000, damage: 4, hungerSec: 20, ... },
    { tier: 3, stamina: 3000, damage: 5, hungerSec: 20, ... }
]
```

- 注册出的物品 ID 为 `marguerite:energy_drink_1` 等。
- `global.ENERGY_DRINK_TIERS` 被服务端脚本读取，用于处理右键饮用效果。

## 体力药剂

源码：`kubejs/startup_scripts/item/stamina_potions.js`

```js
global.STAMINA_POTION_TIERS = [
    { tier: 1, amount: 1000, ... },
    { tier: 2, amount: 2000, ... },
    ...
]
```

- 注册出的物品 ID 为 `marguerite:stamina_potion_1` 等。
- `global.STAMINA_POTION_TIERS` 被服务端脚本读取。

## 扩展方法

新增 tier 时，只需在数组中追加配置：物品注册和服务端效果会自动同步。
