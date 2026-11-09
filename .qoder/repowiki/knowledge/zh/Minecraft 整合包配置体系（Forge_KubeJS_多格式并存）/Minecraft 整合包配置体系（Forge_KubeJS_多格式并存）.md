---
kind: configuration_system
name: Minecraft 整合包配置体系（Forge/KubeJS/多格式并存）
category: configuration_system
scope:
    - '**'
source_files:
    - config/fml.toml
    - kubejs/config/common.properties
    - kubejs/config/client.properties
    - kubejs/config/probejs.json
    - defaultconfigs/dimdungeons-server.toml
    - defaultconfigs/ftbessentials-server.snbt
    - config/ftbxmodcompat.snbt
    - config/skyguis.json5
    - mods/kubejs.plugins.txt
---

## 1. 使用的系统与框架

本仓库是一个基于 **Forge 1.20.1** 的 Minecraft 整合包，配置系统由三层组成：

- **Forge/FML 层**：`config/fml.toml` 控制 Forge 自身行为（窗口、线程、GL 等），并通过 `defaultConfigPath = "defaultconfigs"` 指定默认配置模板目录。
- **KubeJS 层**：`kubejs/config/common.properties` 与 `kubejs/config/client.properties` 分别承载 KubeJS 通用与客户端属性（如 `matchJsonRecipes`、`allowAsyncStreams`、`announceReload`、`startupErrorGUI`、颜色主题等）；`kubejs/config/probejs.json` 用于 ProbeJS 调试。
- **模组原生配置层**：每个第三方模组按自身约定在 `config/<modid>/` 或根 `config/*.toml|*.json|*.properties` 下提供配置，涵盖 TOML（`create-common.toml`、`jei/*`、`fancymenu/*`）、JSON/JSON5（`skyguis.json5`、`cobblegen.json5`、`ftbxmodcompat.snbt`）、SNBT（`ftbessentials-server.snbt`）、Properties（`file_copier.properties`、`embeddium-mixins.properties`）等多种格式。

## 2. 关键文件与目录

- `config/`：运行时主配置目录，包含所有已加载模组的最终生效配置。
- `defaultconfigs/`：默认配置模板目录，供 Forge 首次启动时复制到 `config/`（见 `fml.toml` 中 `defaultConfigPath`）。
- `kubejs/config/`：KubeJS 专属配置（common/client/probejs）。
- `mods/kubejs.plugins.txt`：KubeJS 插件清单（声明启用的 KubeJS 扩展）。
- `mods/pack.mcmeta`：资源包元数据（定义资源包版本与依赖）。

## 3. 架构与约定

### 3.1 默认配置模板 → 运行时配置的复制机制

Forge 通过 `fml.toml` 中的 `defaultConfigPath = "defaultconfigs"` 将 `defaultconfigs/` 下的模板文件复制到 `config/`。仓库中 `defaultconfigs/` 仅包含少量模组模板（`dimdungeons-server.toml`、`ftbessentials-server.snbt`、`ftblibrary/`、`ftbquests/`、`ftbxmodcompat/`、`sdmshop/`），其余模组的初始配置直接以“空壳”形式放在 `config/` 下，由各自模组生成器在首次运行后填充完整结构。

### 3.2 按模组域分目录

`config/` 下绝大多数模组使用子目录组织：`ae2/`、`enderio/`、`fancymenu/`、`jei/`、`registerhelper/`、`skyblockbuilder/`、`touhou_little_maid/`、`yes_steve_model/`、`konkrete/locals/`、`SDMEconomy/currencies/`、`SDMShop/` 等。未找到子目录的模组则把配置文件平铺在 `config/` 根（如 `create-common.toml`、`jei/*`、`modernfix-common.toml`、`sodium-extra-options.json`）。

### 3.3 KubeJS 脚本与配置分离

KubeJS 逻辑代码位于 `kubejs/server_scripts/`、`kubejs/startup_scripts/`、`kubejs/client_scripts/`、`kubejs/data/`，而运行时可编辑的配置集中在 `kubejs/config/`。脚本本身不内嵌配置值，而是通过 KubeJS 的 Properties API 读取 `common.properties` / `client.properties`，实现“逻辑与配置解耦”。

### 3.4 多格式并存

仓库没有统一配置格式，而是尊重各模组的原生格式：
- TOML：Create、ImmersiveEngineering、FTB Essentials、ModernFix、Sodium 系列等主流模组。
- JSON/JSON5：SkyGUIs、CobbleGen、FTB XMod Compat、CustomSkinLoader 等。
- SNBT：FTB Essentials server 配置（`.snbt`）。
- Properties：KubeJS、File Copier、Embeddium mixins、Oculus 等。
- INI/自定义：PCL 启动器的 `PCL/Setup.ini`、`PCL/config.json`。

### 3.5 客户端/服务端配置分离

部分模组同时提供 `-client.toml` 与 `-common.toml`（如 `create-client.toml`/`create-common.toml`、`immersiveengineering-client.toml`/`immersiveengineering-common.toml`、`curios-client.toml`/`curios-common.toml`、`staaaaaaaaaaaack-client.toml`/`staaaaaaaaaaaack-common.toml`、`naturescompass-client.toml`/`naturescompass-common.toml`），遵循 Forge 的 client/common 配置分层约定。

## 4. 约定与约束

- **默认配置模板存放于 `defaultconfigs/`**：这是 Forge FML 通过 `fml.toml` 的 `defaultConfigPath` 强制约定的路径，首次启动时会被复制到 `config/`。
- **KubeJS 配置必须放在 `kubejs/config/`**：KubeJS 引擎只扫描该目录下的 `common.properties` 与 `client.properties`，其他位置不会被加载。
- **模组配置按 modid 子目录组织**：对于拥有大量配置项的模组（FancyMenu、JEI、AE2、EnderIO、FTB Quests 等），约定是创建 `config/<modid>/` 子目录，而非把所有文件平铺在 `config/`。
- **客户端与服务端配置通过文件名后缀区分**：命名约定为 `<mod>-client.toml` 与 `<mod>-common.toml`，由 Forge 根据运行环境自动选择加载。
- **FTB 系列使用 SNBT 格式**：`ftbessentials-server.snbt` 及 `ftbxmodcompat.snbt` 采用 SNBT（Simple Not Quite Binary Text）格式，注释以 `#` 开头，键值对用 `{}` 包裹。
- **KubeJS 插件清单集中管理**：`mods/kubejs.plugins.txt` 是启用 KubeJS 扩展的唯一入口，新增 KubeJS 相关 JAR 需在此注册。
- **无环境变量/密钥管理系统**：仓库未发现 `.env`、`application.properties` 形式的集中式应用配置，也未发现任何 secrets 管理方案；敏感信息（如皮肤加载器 token）若存在，应直接写入对应模组的配置文件（如 `CustomSkinLoader/CustomSkinLoader.json`），但仓库中未见此类敏感字段。
- **无统一的 schema/validation**：各模组配置由其自身解析器校验，仓库未引入外部 schema 工具（如 ajv、jsonschema）进行预检。

## 5. 总结

该整合包的配置体系是典型的「Forge + 多模组原生配置」组合：Forge 负责 `defaultconfigs` 模板分发与基础生命周期，KubeJS 提供独立的 `kubejs/config` 属性空间，各第三方模组保留各自的配置格式与目录约定。仓库层面没有引入跨模组的统一配置抽象层，维护者主要通过目录组织和命名约定来维持一致性。