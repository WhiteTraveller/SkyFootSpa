# 源码地图

## 核心启动脚本

| 文件 | 职责 |
| --- | --- |
| `kubejs/startup_scripts/relic/relicRegister.js` | 定义 `RelicRegister`、`Relic`、稀有度、池和 `global.relicRegister`。 |
| `kubejs/startup_scripts/relic/relicTags.js` | 定义遗物标签元数据，以及基础网格辅助函数 `getNineGrid`、`getTenGrid`、`confirmRelic`。 |
| `kubejs/startup_scripts/relic/relicHelpers.js` | 定义 6 x 9 背包常量、镶板 ID 辅助函数、空间辅助函数、标签计数和属性辅助函数。 |
| `kubejs/startup_scripts/relic/relic.js` | 把已注册 `Relic` 对象转成带 Curios 能力和贴图的实际物品注册项。 |
| `kubejs/startup_scripts/relic/relicBlindbox.js` | 注册 `chip_blindbox_1..5` 物品和按阶段选择的芯片代表贴图。 |

## 遗物定义文件

| 文件 | 职责 |
| --- | --- |
| `kubejs/startup_scripts/relic/relicItem/relicBackpackSpace.js` | 注册 `backpack_space_mk1..5` 镶板遗物和解锁规则。 |
| `kubejs/startup_scripts/relic/relicItem/stage1/stage1.js` | 阶段 1 遗物定义。 |
| `kubejs/startup_scripts/relic/relicItem/stage2/stage2.js` | 阶段 2 遗物定义。 |
| `kubejs/startup_scripts/relic/relicItem/stage3/stage3.js` | 阶段 3 遗物定义。 |
| `kubejs/startup_scripts/relic/relicItem/stage4/stage4.js` | 阶段 4 遗物定义。 |
| `kubejs/startup_scripts/relic/relicItem/stage5/stage5.js` | 阶段 5 遗物定义。 |

## 背包服务端脚本

| 文件 | 职责 |
| --- | --- |
| `kubejs/server_scripts/backpack/backpackInit.js` | 首次登录镶板矩阵初始化和重置辅助函数。 |
| `kubejs/server_scripts/backpack/backpackUpdate.js` | 清理玩家 modifier，并重新执行每个已装备遗物的 `onLoad`。 |
| `kubejs/server_scripts/backpack/relic/relicAttack.js` | 从 `EntityEvents.hurt` 分发 `onDoDamage`。 |
| `kubejs/server_scripts/backpack/relic/relicKill.js` | 从地牢维度的 `EntityEvents.death` 分发 `onKill`。 |

## 数据与资源

| 文件 | 职责 |
| --- | --- |
| `kubejs/data/curios/curios/slots/package.json` | 定义 Curios `package` 槽位元数据。 |
| `kubejs/data/curios/tags/items/package.json` | Curios package 物品标签数据。当前 `values` 为空。 |
| `kubejs/assets/curios/lang/zh_cn.json` | Curios `package` 的本地化名称和 modifier 标签。 |
| `kubejs/assets/curios/textures/slot/package_icon.png` | Curios package 槽位图标。 |
| `kubejs/assets/kubejs/textures/item/chip_lv*_pt*.png` | 芯片物品贴图。 |
| `kubejs/assets/marguerite/textures/item/*.png` | 独特遗物和玩法物品贴图。 |
| `apricity/kubejs/*.png` | Apricity/自定义 UI 路径使用的图片，包括遗物 tooltip 视觉资源。 |

## 相关玩法

| 文件 | 职责 |
| --- | --- |
| `kubejs/startup_scripts/attributes/serveAttributes.js` | 注册遗物效果和 pathfinder 玩法使用的服务属性。 |
| `kubejs/server_scripts/pathfinder/pfNetworkHandler.js` | 读取服务属性，在玩法中计算满意度、金钱和体力。 |
| `kubejs/client_scripts/tooltip/relicTooltip.js` | 遗物元数据的旧 KubeJS tooltip 渲染路径。 |
| `kubejs/startup_scripts/tooltip.js` | ApricityUI 风格的自定义遗物 tooltip 路径；修改视觉 tooltip 前先读。 |
