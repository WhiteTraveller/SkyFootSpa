---
kind: configuration_system
name: Minecraft Forge 整合包配置体系（config/defaultconfigs/KubeJS）
category: configuration_system
scope:
    - '**'
source_files:
    - config/fml.toml
    - config/forge-client.toml
    - config/create-common.toml
    - defaultconfigs/dimdungeons-server.toml
    - defaultconfigs/ftbessentials-server.snbt
    - defaultconfigs/sdmshop/sdmshop-common.snbt
    - kubejs/jsconfig.json
    - kubejs/powerfuljs_fe_guide.md
    - PCL/Setup.ini
    - PCL/config.json
    - CustomSkinLoader/CustomSkinLoader.json
---

## 1. 使用的系统与框架

本仓库是一个基于 **Forge / NeoForge** 的 Minecraft 整合包，配置系统由以下组件共同构成：
- **Forge/FML 核心配置**：`config/fml.toml`、`config/forge-client.toml` 等。
- **各模组自管配置**：每个模组在启动时按约定写入 `config/<modid>.toml`（TOML）、`.json`、`.cfg`、`.properties`、`.yaml`、`.snbt` 等格式文件。
- **默认配置分发**：`defaultconfigs/` 目录存放服务端模组的默认配置，由 Forge 在服务端首次生成后同步到客户端。
- **KubeJS 脚本化配置**：`kubejs/config/`、`kubejs/server_scripts/`、`kubejs/startup_scripts/` 通过 JavaScript 动态加载数据与行为。
- **Launcher 与第三方工具配置**：PCL (`PCL/Setup.ini`, `PCL/config.json`)、CustomSkinLoader (`CustomSkinLoader/CustomSkinLoader.json`)、FancyMenu (`fancymenu_data/`) 等。

## 2. 关键文件与目录

- `config/fml.toml` — FML 引导窗口、线程数、`defaultConfigPath = "defaultconfigs"` 等核心开关。
- `config/forge-client.toml` — Forge 客户端渲染相关选项。
- `config/create-common.toml` 及同目录下大量 `<mod>-common.toml` / `<mod>-client.toml` — 各模组的双端/客户端配置。
- `defaultconfigs/` — FTB Essentials、FTB Quests、SDMShop、DimDungeons 等服务端模组的默认 `.snbt` / `.toml`。
- `kubejs/config/`、`kubejs/server_scripts/`、`kubejs/startup_scripts/` — KubeJS 运行时逻辑与数据。
- `PCL/Setup.ini`、`PCL/config.json` — Prism Launcher (PCL) 启动器配置。
- `CustomSkinLoader/CustomSkinLoader.json` — 皮肤加载器配置。
- `fancymenu_data/` — FancyMenu 菜单布局与缓存。

## 3. 架构与约定

### 3.1 分层加载顺序
1. **Forge/FML 初始化**：读取 `config/fml.toml`，确定 `defaultConfigPath`（本仓库为 `defaultconfigs`）。
2. **模组配置生成**：各模组根据自身的 ConfigSpec 生成 `config/<mod>.toml`；若不存在则从 `defaultconfigs/<mod>.toml` 复制（由 Forge 的 `defaultConfigPath` 机制驱动）。
3. **KubeJS 启动阶段**：`kubejs/startup_scripts/` 最先执行，随后是 `server_scripts/` / `client_scripts/`，可覆盖或扩展模组配置。
4. **运行时数据**：`apricity/kubejs/` 下的大量 PNG/HTML 资源由 KubeJS 在运行时作为 UI 资产加载。

### 3.2 配置文件命名约定
- 双端通用配置：`<mod>-common.toml`（如 `create-common.toml`、`immersiveengineering-common.toml`、`youkaishomecoming-common.toml`）。
- 仅客户端配置：`<mod>-client.toml`（如 `jei-config.toml`、`xaerominimap.txt`）。
- 仅服务端配置：`<mod>-server.toml`（如 `dimdungeons-server.toml`、`backpacked.server.toml`）。
- 其他格式：JEI (`jei/` 目录)、FTB 系列 (`.snbt`)、Sodium/Embeddium (`*.properties` / `*.json`)、FancyMenu (`fancymenu/`)。

### 3.3 默认配置分发
`config/fml.toml` 中显式设置 `defaultConfigPath = "defaultconfigs"`，因此 Forge 会在服务端首次运行时将 `defaultconfigs/` 下的文件复制到 `config/`。该目录目前包含：
- `ftblibrary/ftblibrary-client.snbt`
- `ftbquests/client-config.snbt`
- `ftbxmodcompat/ftbxmodcompat.snbt`
- `sdmshop/sdmshop-common.snbt`
- `dimdungeons-server.toml`
- `ftbessentials-server.snbt`

## 4. 约定与约束

- **观察到的约定**：所有 Forge 模组的配置统一放在根级 `config/` 目录下，按模组 ID 分文件或分子目录组织；KubeJS 脚本与数据集中在 `kubejs/` 及其子目录 `server_scripts/`、`startup_scripts/`、`data/`、`assets/`。
- **由实现强制的规则**：`config/fml.toml` 将 `defaultConfigPath` 固定为 `defaultconfigs`，这意味着服务端默认配置必须位于该目录才能被 Forge 自动分发；修改此值会破坏默认配置同步流程。
- **由 Forge 类型系统保证的规则**：每个 `<mod>-common.toml` / `<mod>-client.toml` 的结构受对应模组的 ConfigSpec 约束，字段名、类型、取值范围由模组定义，玩家编辑错误会导致启动时报错。
- **KubeJS 约定**：`kubejs/server_scripts/` 与 `kubejs/startup_scripts/` 使用 JavaScript 模块（配合 `jsconfig.json`），并通过 `powerfuljs_fe_guide.md` 提供编写指南；`apricity/kubejs/` 下的静态资源（PNG、HTML）由 KubeJS 在运行时以 asset 形式暴露给前端 UI。
- **无集中式环境变量/密钥管理**：仓库未发现 `.env`、`application.properties` 或统一的 secrets 加载器；敏感信息（如 API Key）未出现在版本控制中（见 `.gitignore`），应通过外部注入或运行时替换。
- **多启动器共存**：同时存在 PCL (`PCL/`)、CustomSkinLoader (`CustomSkinLoader/`)、FancyMenu (`fancymenu_data/`) 各自的配置目录，互不干扰，由各自进程独立加载。