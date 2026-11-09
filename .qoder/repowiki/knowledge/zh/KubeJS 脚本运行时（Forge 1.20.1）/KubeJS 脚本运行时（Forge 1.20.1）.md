---
kind: external_dependency
name: KubeJS 脚本运行时（Forge 1.20.1）
slug: kubejs
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - kubejs/startup_scripts/item/air_structure.js
    - kubejs/server_scripts/item/air_structure.js
    - kubejs/server_scripts/old_hell_tp.js
---

- server 端用 `ServerEvents.commandRegistry` + Brigadier 注册命令，用 `ItemEvents.rightClicked` 处理右键，用 `server.runCommandSilent` 执行原生命令（跨维度需 `execute in <dim> run`）。
- datapack 资源位于 `kubejs/data/<namespace>/...`，但经日志验证 `kubejs/data/structures/` 不会被 Minecraft 结构系统加载（ResourceManager 只有 `[assets]` pack），因此 `.nbt` 结构文件若要通过 `/place` 使用，需绕过 StructureTemplateManager，改用 Java API 直接读取 NBT 并 `placeInWorld`。
- 维度定义放在 `kubejs/data/marguerite/dimension_type/`、`worldgen/biome/`、`dimension/`，配合 flat 生成器实现自定义维度。
- 页面热重载通过 `autoReload` + `aiAutoScreenshot`，但 `client_scripts` 改动 HTML 不会热重载覆盖，需要重启客户端或完整重载客户端脚本。