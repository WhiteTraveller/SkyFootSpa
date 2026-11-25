---
kind: configuration_system
name: Minecraft 整合包配置体系（Forge/FML + KubeJS + 多格式配置文件）
category: configuration_system
scope:
    - '**'
source_files:
    - config/fml.toml
    - kubejs/config/common.properties
    - kubejs/config/client.properties
    - config/cobblegen.json5
    - config/ftbxmodcompat.snbt
    - defaultconfigs/ftbessentials-server.snbt
---

## 1. 使用的系统与框架

本仓库是一个基于 **Minecraft 1.20.1 Forge** 的整合包，其「配置系统」并非自研代码，而是由 Forge/FML、KubeJS 以及大量第三方模组各自提供的配置文件机制共同构成。核心组件包括：

- **FML/Forge**：通过 `config/fml.toml` 管理 Forge 自身行为（窗口、线程、默认配置路径等），并通过 `defaultConfigPath = "defaultconfigs"` 将服务器端默认配置指向 `defaultconfigs/` 目录。
- **KubeJS**：提供 `kubejs/config/common.properties` 与 `kubejs/config/client.properties` 两个 Java Properties 文件，分别控制服务端/客户端脚本行为（如 `matchJsonRecipes`、`allowAsyncStreams`、`startupErrorGUI`、UI 颜色等）。
- **各模组自带配置加载器**：绝大多数 mod 使用自己的配置格式（`.toml`、`.json5`、`.snbt`、`.properties`、`.yaml`、`.cfg` 等），由各自 mod 在启动时读取。

## 2. 关键目录与文件

- `config/`：所有模组的运行时配置根目录，按模组名分目录或平铺 `.toml`/`.json5`/`.snbt`/`.properties` 文件。
- `defaultconfigs/`：服务器端默认配置模板，由 FML 在首次生成 world/serverconfig 时复制过去（见 `fml.toml` 中 `defaultConfigPath = "defaultconfigs"`）。
- `kubejs/config/`：KubeJS 自身的 common/client 配置。
- `fancymenu_data/`：FancyMenu 自定义菜单的运行时数据与缓存。
- `PCL/`：Prism Launcher 的启动器配置（`Setup.ini`、`config.json`），不属于游戏内配置但影响运行环境。

## 3. 架构与约定

### 3.1 配置分层

| 层级 | 位置 | 说明 |
|---|---|---|
| Forge 全局 | `config/fml.toml` | 窗口、版本检查、默认配置路径等 |
| KubeJS Common | `kubejs/config/common.properties` | 跨客户端/服务端脚本行为 |
| KubeJS Client | `kubejs/config/client.properties` | 仅客户端 UI 样式与行为 |
| 模组通用配置 | `config/<mod>.toml` / `config/<mod>-common.toml` | 大多数 Forge 模组的通用设置 |
| 模组客户端配置 | `config/<mod>-client.toml` | 仅客户端渲染/UI 设置 |
| 模组专用目录 | `config/<mod>/` | 复杂模组的多文件配置（如 Mekanism、jei、ftbquests、skyblockbuilder 等） |
| 服务器默认模板 | `defaultconfigs/<mod>.snbt` | 供 FTB Essentials 等工具复制为服务器世界级配置 |
| FancyMenu 数据 | `fancymenu_data/` | 自定义菜单布局、主题、幻灯片等 |

### 3.2 文件格式选择

- **TOML (`.toml`)**：最常用，被 ModernUI、Create、ImmersiveEngineering、FTB Quests、ModernFix 等广泛采用。
- **JSON5 (`.json5`)**：用于需要注释和尾随逗号的复杂结构，如 `cobblegen.json5`、`skyguis.json5`、`ftbquests` 相关配置。
- **SNBT (`.snbt`)**：FTB 生态（FTB Essentials、FTB Ranks/Lib）使用，如 `ftbxmodcompat.snbt`、`defaultconfigs/ftbessentials-server.snbt`。
- **Properties (`.properties`)**：KubeJS 及少数简单模组使用。
- **YAML (`.yaml`)**：如 `immersiveui.yaml`。
- **CFG/INI**：遗留或特定模组使用，如 `MouseTweaks.cfg`、`PCL/Setup.ini`。

### 3.3 命名约定

- 同一模组同时存在服务端与客户端配置时，遵循 `<mod>-common.toml` / `<mod>-client.toml` 后缀区分（例如 `create-common.toml` / `create-client.toml`、`immersiveengineering-common.toml` / `immersiveengineering-client.toml`、`youkaishomecoming-common.toml` / `youkaishomecoming-client.toml`）。
- 复杂模组将子配置放入 `config/<mod>/` 子目录（如 `config/Mekanism/`、`config/jei/`、`config/ftbquests/`、`config/skyblockbuilder/`、`config/touhou_little_maid/`）。

## 4. 约定与约束

- **服务器默认配置来源**：FML 通过 `config/fml.toml` 中的 `defaultConfigPath = "defaultconfigs"` 指定，`defaultconfigs/` 下的文件（如 `ftbessentials-server.snbt`、`dimdungeons-server.toml`）作为首次生成服务器世界时的模板。该行为由 FML 强制实现。
- **权限与阶段后端选择**：`config/ftbxmodcompat.snbt` 显式声明 `permission_selector` 与 `stage_selector`，当前值为 `"default"`，表示优先使用 FTB Ranks + LuckPerms 与 KubeJS + Game Stages + Vanilla 的组合，具体优先级由 FTB 库在运行时根据已安装模组决定。
- **KubeJS 脚本行为开关**：`kubejs/config/common.properties` 中的 `matchJsonRecipes=true`、`allowAsyncStreams=true`、`startupErrorGUI=true` 等属性直接控制 KubeJS 引擎行为，修改后需重载脚本生效。
- **无统一配置入口**：仓库中没有自写的配置加载类或集中式配置 API；每个模组独立解析自己的配置文件，整合包作者仅负责维护这些文件的值。
- **无环境变量/Feature Flag 机制**：未发现 `.env*` 文件或应用内 feature flag 系统；功能开关由各模组配置项（如 `enabled: true/false`）表达。
- **无密钥管理**：未发现 secrets 管理逻辑；若模组支持外部密钥（如 API key），应放在对应模组的配置文件中，仓库未提供统一的加密或注入机制。