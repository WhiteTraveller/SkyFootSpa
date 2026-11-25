---
kind: configuration_system
name: Minecraft 整合包配置体系（config/ + defaultconfigs/ + kubejs/config/）
category: configuration_system
scope:
    - '**'
source_files:
    - config/fml.toml
    - config/create-common.toml
    - config/create-client.toml
    - config/jei/jei-client-config.toml
    - config/patchouli-client.toml
    - config/apricityui-client.toml
    - config/skyblockbuilder/skyblockbuilder.json5
    - kubejs/config/common.properties
    - kubejs/config/client.properties
    - kubejs/config/probejs.json
    - defaultconfigs/dimdungeons-server.toml
    - defaultconfigs/ftbessentials-server.snbt
---

## 概述

本仓库是一个基于 Forge 1.20.1 的 Minecraft 整合包工程，配置系统由三层组成：

1. **Forge/FML 层**：`config/fml.toml` 等 Forge 自身配置。
2. **模组配置层**：根目录 `config/` 下按模组名分目录存放各模组的运行时配置，格式以 `.toml`、`.json`、`.yaml`、`.snbt`、`.properties`、`.cfg`、`.properties` 为主，由 Forge Config API 在各模组内部加载。
3. **KubeJS 脚本层**：`kubejs/config/` 下的 `common.properties`、`client.properties`、`probejs.json`，由 KubeJS 在启动时读取，控制脚本行为与 IDE 辅助。
4. **默认配置模板层**：`defaultconfigs/` 提供首次启动时复制到世界目录的初始配置模板（FTB Essentials、dimdungeons、SDMShop、ftbxmodcompat 等）。

## 关键文件与位置

- `config/fml.toml` — Forge/FML 全局开关，其中 `defaultConfigPath = "defaultconfigs"` 将默认配置目录指向仓库中的 `defaultconfigs/`。
- `config/` — 所有已安装模组的运行时配置集合，包含约 60+ 个文件或子目录，例如：
  - `create-common.toml` / `create-client.toml`
  - `jei/*.toml`、`patchouli-client.toml`
  - `fancymenu/`、`inventoryprofilesnext/`、`ftbquests/` 等模组专用子目录
  - `apricityui-client.toml`、`apricityui/`（整合包自研 ApricityUI 前端配置）
  - `skyblockbuilder/`、`registerhelper/`、`oelib/`、`libipn/` 等集成库配置
- `defaultconfigs/` — 服务器端默认配置模板，首次启动由 Forge 复制至 `world/serverconfig/`：
  - `dimdungeons-server.toml`（含 `[general]`、`[blocks]` 分组，带 `configVersion` 字段）
  - `ftbessentials-server.snbt`（注释说明“Default config file that will be copied to world's serverconfig/ftbessentials.snbt location”）
  - `ftblibrary/`、`ftbquests/`、`ftbxmodcompat/`、`sdmshop/` 等 FTB/SDM 系列模板
- `kubejs/config/common.properties` — KubeJS 通用属性（`matchJsonRecipes=true`、`allowAsyncStreams=true`、`announceReload=true`、`startupErrorGUI=true`、`serverOnly=false`、`hideServerScriptErrors=false`、`saveDevPropertiesInConfig=false`、`creativeModeTabIcon=minecraft\:purple_dye`）。
- `kubejs/config/client.properties` — KubeJS 客户端 UI 主题色（`backgroundColor=2E3440`、`barBorderColor=ECEFF4`、`barColor=ECEFF4`、`fmlLogColor=ECEFF4`、`fmlMemoryColor=ECEFF4`），以及菜单背景缩放、模糊等选项。
- `kubejs/config/probejs.json` — ProbeJS 开发辅助配置，启用类解析、ID 字面量类型生成、VSCode WebSocket（端口 `7796`）。

## 架构与约定

- **按模组隔离**：每个模组的配置放在 `config/<modid>/` 或 `config/<modid>.<scope>.toml`（如 `create-common.toml`、`create-client.toml`），客户端与服务端配置通过文件名后缀区分。
- **TOML 优先**：绝大多数现代模组使用 Forge Config API v2，配置文件为 TOML 格式，支持 `[section]` 分组与类型注解；少数旧模组仍用 `.json`、`.cfg`、`.properties`、`.yaml`、`.snbt`。
- **默认配置模板分离**：`defaultconfigs/` 仅保留服务器端初始值，不随玩家本地修改污染；玩家实际运行配置位于各自存档目录的 `serverconfig/` 下。
- **KubeJS 配置独立**：脚本相关配置集中在 `kubejs/config/`，与模组配置物理隔离，便于打包分发和版本管理。
- **APRICITYUI 专属配置**：`config/apricityui-client.toml` 与 `config/apricityui/` 目录承载整合包自研 UI 的主题、布局等前端参数。

## 约定与约束

- Forge 通过 `fml.toml` 中的 `defaultConfigPath = "defaultconfigs"` 强制默认配置模板来源为仓库根下的 `defaultconfigs/` 目录（见 `config/fml.toml` 第 16 行）。
- FTB Essentials 的默认配置模板头部注释明确声明其用途：“Default config file that will be copied to world's serverconfig/ftbessentials.snbt location”，并提示“Copy values you wish to override in here”（见 `defaultconfigs/ftbessentials-server.snbt`）。
- dimdungeons 的配置模板包含显式 `configVersion = 6` 字段，表明该模组通过版本号进行配置迁移校验。
- KubeJS 的 `common.properties` 中 `matchJsonRecipes=true`、`ignoreCustomUniqueRecipeIds=false`、`creativeModeTabIcon=minecraft\:purple_dye` 是整合包对 KubeJS 行为的固定覆盖项。
- 客户端与服务器端配置通过文件名后缀严格区分（`*-client.toml` vs `*-common.toml` 或 `*-server.toml`），这是 Forge Config API 的命名约定，被仓库内所有模组配置一致遵循。