# 项目知识库

这个目录是本项目的本地树状知识库，用于后续代码生成和修改。使用时从根节点逐层读到具体专题，不要一开始就把整个项目平铺加载。

## 阅读顺序

1. 先从这里选择专题节点。
2. 阅读该专题的 `README.md`。
3. 只继续阅读本次改动需要的叶子文档。
4. 修改代码前，打开叶子文档引用到的源码文件核对细节。

## 目录树

- `relic/README.md`：遗物注册与背包行为入口。
- `relic/registration.md`：遗物定义如何变成实际注册物品。
- `relic/backpack.md`：Curios `package` 槽、背包镶板、属性重算。
- `relic/runtime-events.md`：装备、卸下、加载、伤害、击杀、tooltip 事件流。
- `relic/helper-api.md`：共享辅助函数与标签约定。
- `relic/authoring-checklist.md`：新增或修改遗物前的检查清单。
- `relic/catalog.md`：当前遗物按阶段和源码位置建立的索引。
- `relic/source-map.md`：文件职责地图。
- `item/README.md`：物品注册入口。
- `item/registration.md`：通用注册模式、命名空间、Builder 链式调用和错误处理。
- `item/simple-items.md`：普通一次性物品（皴、草灰、魔力粉等）。
- `item/tiers.md`：分 tier 批量注册物品（能量饮料、体力药剂）。
- `item/capability-items.md`：带 Forge Capability 的物品（筋膜枪 FE 能量）。
- `item/tool-mapping.md`：物品 ID 与玩法系统的映射关系。
- `item/textures.md`：贴图路径约定与默认材质复用。

## 当前范围

第一批知识节点覆盖 `kubejs/startup_scripts/relic` 系统，以及负责执行遗物效果的服务端背包脚本；第二批知识节点覆盖 `kubejs/startup_scripts/item` 下的物品注册。这里也记录了直接相关的 Curios 槽位数据、服务玩法属性以及物品命名/贴图约定，因为理解背包行为和新增物品都必须依赖这些信息。
