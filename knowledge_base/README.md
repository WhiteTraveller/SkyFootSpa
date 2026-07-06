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

## 当前范围

第一批知识节点覆盖 `kubejs/startup_scripts/relic` 系统，以及负责执行遗物效果的服务端背包脚本。这里也记录了直接相关的 Curios 槽位数据和服务玩法属性，因为理解背包行为必须依赖这些信息。
