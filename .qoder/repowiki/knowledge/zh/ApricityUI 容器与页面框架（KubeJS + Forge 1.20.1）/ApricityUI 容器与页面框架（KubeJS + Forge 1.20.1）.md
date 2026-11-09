---
kind: external_dependency
name: ApricityUI 容器与页面框架（KubeJS + Forge 1.20.1）
slug: apricityui
category: external_dependency
category_hints:
    - framework_behavior
    - sdk_real_api
    - client_constraint
scope:
    - '**'
source_files:
    - kubejs/pathfinder_config.html
    - kubejs/server_scripts/pathfinder/pfBlockHandler.js
    - kubejs/client_scripts/ui/pathfinder_config_ui.js
    - components/apricityui-ui.md
---


- **Overlay**：通过 `createDocument` 创建的普通页面（如 phone.html），用 `mode=browser`、`aui-mouse-events=intercept` 处理 DOM 点击。

关键约束（来自对话实锤）：
- 容器 Screen **不能加** `aui-mouse-events=intercept`——它会吞掉 MC 菜单的 slot 点击/拖拽/shift-click，导致物品点不动；容器应完全不加该 meta。
- 容器 CSS 基础样式须对齐文档最小示例：`container { display: grid; gap: 2px; width: max-content; }`，不要给 container 加 padding/border/background，否则会干扰 `preset:player` 自动排列和命中框。
- 官方文档地址：`https://doc.sighs.cc/ApricityUI/guide/container`。

verify exact API/params against official docs.