# 物品注册知识树

这个目录记录 `kubejs/startup_scripts/item` 下所有物品的注册方式、命名约定和扩展方法。阅读本目录前，建议先了解 [knowledge_base/README.md](../README.md) 的阅读顺序。

## 阅读顺序

1. 从本 README 了解整体结构和约定。
2. 根据本次改动需要，阅读对应叶子文档。
3. 修改代码前，打开叶子文档引用到的源码文件核对细节。

## 目录树

- `registration.md`：通用注册模式、命名空间、字段说明和错误处理。
- `simple-items.md`：普通一次性物品（皴、草灰、魔力粉等）。
- `tiers.md`：分 tier 批量注册物品（能量饮料、体力药剂）。
- `capability-items.md`：带 Forge Capability 的物品（筋膜枪 FE 能量）。
- `tool-mapping.md`：物品 ID 与玩法系统的映射关系（搓脚手、筋膜枪头、栏位扩大器等）。
- `textures.md`：贴图路径约定与默认材质复用。

## 当前范围

当前节点覆盖 `kubejs/startup_scripts/item` 下的全部物品注册脚本，包括普通物品、分 tier 物品、带 FE 能力的电动工具、搓脚手工具、栏位扩大器等。
