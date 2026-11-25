---
kind: configuration_system
name: Minecraft Forge 整合包配置体系（config/ + defaultconfigs/ + KubeJS + PCL）
category: configuration_system
scope:
    - '**'
---

## 概述

本仓库是一个 Minecraft 1.20.1 Forge 整合包，没有自研的配置框架。运行时配置由 Forge、各模组自身以及 KubeJS 共同承担，采用「按模组分目录的扁平文件」+「defaultconfigs 默认值分发」+「KubeJS properties」三层结构。

## 核心位置与分层

- **`config/`**：Forge 启动时扫描的根级配置目录，每个子目录对应一个模组或客户端工具，文件名即该模组的配置文件名。常见格式包括 `.toml`（如 `create-common.toml`、`jei/jei-client.toml`）、`.json5`（如 `cobblegen.json5`、`skyguis.json5`）、`.properties`（如 `embeddium-mixins.properties`、`oculus.properties`）、`.snbt`（如 `ftbxmodcompat.snbt`、`ftbbackups2.json`）、`.cfg`（如 `attributeslib.cfg`、`MouseTweaks.cfg`）、`.txt`（如 `xaerominimap.txt`）等。这是整包最庞大的配置层，涵盖 create、immersiveengineering、jei、patchouli、sodium/embeddium、fancymenu、ftbquests、toughasnails 等数十个模组。
- **`defaultconfigs/`**：Forge 服务器端默认配置模板目录，由 `config/fml.toml` 中 `defaultConfigPath = "defaultconfigs"` 指定。服务器首次生成世界时会把这里的文件复制到 `serverconfig/` 下供玩家覆盖。当前包含 `ftblibrary`、`ftbquests`、`ftbxmodcompat`、`sdmshop` 等 FTB 生态模组的空模板（例如 `ftbessentials-server.snbt` 仅含 `{ }`），以及 `dimdungeons-server.toml`。
- **`kubejs/config/`**：KubeJS 脚本运行时的配置，使用 Java `.properties` 格式，分为 `common.properties`（服务端/通用）和 `client.properties`（客户端）。其中启用了 `matchJsonRecipes=true`、`allowAsyncStreams=true`、`announceReload=true`、`startupErrorGUI=true`，并自定义了 Creative Tab 图标为 `minecraft:purple_dye`。
- **`PCL/Setup.ini`**：Plain Craft Launcher 2 实例配置，声明 Forge 版本 `47.4.10`、Java 内存 `VersionRamCustom:17`、认证服务 `https://littleskin.cn/api/yggdrasil`（LittleSkin）。
- **`fancymenu_data/last_world.fmdata`**：FancyMenu 记录的上次游玩世界路径。

## 架构约定

1. **按模组隔离**：`config/` 下每个模组拥有独立子目录或独立文件，不存在跨模组的共享配置中心；新增模组只需在 `config/<modid>/` 下放置其生成的配置文件。
2. **默认值通过 `defaultconfigs/` 分发**：FTB 系列模组遵循此约定，管理员修改 `defaultconfigs/` 中的模板即可让新玩家获得一致的初始配置。
3. **KubeJS 作为脚本层配置入口**：所有 KubeJS 脚本读取 `kubejs/config/common.properties` / `client.properties`，不直接硬编码行为开关。
4. **多格式并存但按模组选择**：Forge/Toml 类模组用 `.toml`，数据驱动型模组用 `.json5`，旧式模组用 `.cfg`/`.properties`，无统一 schema 校验。
5. **客户端与服务端分离**：大量模组提供 `-client.toml` 与 `-common.toml` 双文件（如 `create-client.toml` vs `create-common.toml`、`immersiveengineering-client.toml` vs `immersiveengineering-common.toml`），客户端专属选项放 `-client` 后缀文件。
6. **无环境变量/密钥管理**：未发现 `.env`、`application.properties`、Secrets Manager 等机制；敏感信息（如 LittleSkin 登录地址）以明文写在 `PCL/Setup.ini` 中。

## 约束与规则

- Forge 的默认配置目录由 `config/fml.toml` 中的 `defaultConfigPath = "defaultconfigs"` 强制决定，修改该值会改变服务器默认配置的加载位置。
- KubeJS 的 `packmode=` 字段为空，表示未启用 pack mode 限制。
- `ftbxmodcompat.snbt` 显式声明权限实现选择器 `permission_selector: "default"` 与阶段实现选择器 `stage_selector: "default"`，表明本整合包依赖 FTB Ranks → LuckPerms 的优先级链以及 KubeJS → Game Stages → Vanilla 的阶段解析链。
- Embeddium/Sodium 的 mixin 配置文件 `embeddium-mixins.properties` 目前仅保留注释头，未启用任何自定义 mixin 覆盖。
- 未发现统一的配置验证、schema 校验或 CI 检查流程；配置变更主要依赖模组自身的运行时校验。