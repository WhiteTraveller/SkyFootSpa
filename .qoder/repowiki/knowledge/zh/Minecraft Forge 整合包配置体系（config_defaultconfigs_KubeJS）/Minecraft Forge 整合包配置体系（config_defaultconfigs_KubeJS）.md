---
kind: configuration_system
name: Minecraft Forge 整合包配置体系（config/defaultconfigs/KubeJS）
category: configuration_system
scope:
    - '**'
source_files:
    - config/fml.toml
    - defaultconfigs/ftbessentials-server.snbt
    - defaultconfigs/dimdungeons-server.toml
    - config/cobblegen.json5
    - config/skyguis.json5
    - kubejs/config/common.properties
    - kubejs/config/client.properties
    - kubejs/config/probejs.json
    - CustomSkinLoader/CustomSkinLoader.json
    - PCL/Setup.ini
    - PCL/config.json
---

## 1. 使用的系统与方式

本仓库是一个基于 **Forge 1.20.1 + KubeJS** 的 Minecraft 整合包，没有自研的配置框架。运行时配置由以下组件共同构成：

- **Forge/FML**：通过 `fml.toml` 控制加载行为，并声明默认配置目录。
- **各 Mod 原生配置器**：每个 Mod 按自身约定在 `config/<modid>/` 下读写 `.toml` / `.json` / `.json5` / `.yaml` / `.cfg` / `.properties` 等格式文件。
- **KubeJS**：使用 `kubejs/config/common.properties`、`kubejs/config/client.properties` 以及 `kubejs/config/probejs.json` 管理脚本侧配置。
- **SkyGUIs**：通过 `config/skyguis.json5` 与 `apricity/kubejs/` 下的 HTML/CSS/图片资源组合出游戏内 UI 配置。
- **CustomSkinLoader**：`CustomSkinLoader/CustomSkinLoader.json` 提供皮肤加载器配置。
- **PCL 启动器**：`PCL/Setup.ini`、`PCL/config.json` 为外部启动器配置。

## 2. 关键文件与目录

- `config/fml.toml` — Forge 全局配置，声明 `defaultConfigPath = "defaultconfigs"`。
- `defaultconfigs/` — 存放可被复制到世界级 `serverconfig/` 的默认配置（FTB Essentials、DimDungeons 等）。
- `config/` — 所有 Mod 的运行时配置根目录，按 `<modid>` 子目录组织（如 `Mekanism/`、`jei/`、`create-common.toml`、`cobblegen.json5`、`immersiveui.yaml` 等）。
- `kubejs/config/` — KubeJS 脚本配置（`common.properties`、`client.properties`、`probejs.json`）。
- `config/skyguis.json5` + `apricity/kubejs/` — SkyGUIs 的 UI 主题与页面配置。
- `CustomSkinLoader/CustomSkinLoader.json` — 自定义皮肤加载器配置。
- `PCL/Setup.ini`、`PCL/config.json` — PCL 启动器配置。

## 3. 架构与约定

### 3.1 Forge 默认配置分发机制

`config/fml.toml` 中显式设置：

```
defaultConfigPath = "defaultconfigs"
```

这使得 Forge 在首次生成服务器世界时，会把 `defaultconfigs/` 下的文件拷贝到对应世界的 `serverconfig/` 目录。例如 `defaultconfigs/ftbessentials-server.snbt` 顶部注释明确说明：

> Default config file that will be copied to world's serverconfig/ftbessentials.snbt location

这构成了“版本库中的默认值 → 玩家世界覆盖”的分发路径。

### 3.2 按 Mod 分目录的组织

`config/` 下绝大多数 Mod 遵循 `<modid>/` 子目录模式，例如：

- `config/Mekanism/`
- `config/jei/`
- `config/apricityui/`
- `config/registerhelper/`
- `config/skyblockbuilder/`
- `config/touhou_little_maid/`

少数 Mod 把配置文件直接放在 `config/` 根下，命名带前缀区分 client/server/common，如 `create-client.toml`、`create-common.toml`、`appleskin-client.toml`、`modernfix-common.toml`、`embeddium-mixins.properties`、`oculus.properties`。

### 3.3 多格式并存

不同 Mod 使用不同的配置格式，仓库中同时存在：

- `.toml`（最常见，如 `create-common.toml`、`dimdungeons-server.toml`、`fancymenu/*.toml`）
- `.json5`（支持注释，如 `cobblegen.json5`、`skyguis.json5`、`attributefix.json`）
- `.yaml`（如 `immersiveui.yaml`）
- `.properties`（如 `kubejs/config/common.properties`、`oculus.properties`、`modernfix-mixins.properties`）
- `.snbt`（FTB 系列，如 `ftbxmodcompat.snbt`、`defaultconfigs/ftbessentials-server.snbt`）
- `.cfg`（如 `attributeslib.cfg`、`MouseTweaks.cfg`）
- `.txt`（如 `xaerominimap-common.txt`）

### 3.4 KubeJS 配置分层

KubeJS 将配置分为客户端与服务端两份：

- `kubejs/config/common.properties` — 服务端/通用配置
- `kubejs/config/client.properties` — 客户端专用配置
- `kubejs/config/probejs.json` — ProbeJS 调试工具配置

KubeJS 脚本本身位于 `kubejs/server_scripts/`、`kubejs/startup_scripts/`、`kubejs/client_scripts/`，配合 `apricity/kubejs/` 下的 HTML/CSS/图片资源，通过 SkyGUIs 渲染游戏内 UI。

### 3.5 独立工具配置

- `CustomSkinLoader/CustomSkinLoader.json` — 皮肤加载器配置，与主 `config/` 隔离。
- `PCL/Setup.ini`、`PCL/config.json` — PCL 启动器自身的配置，不进入游戏。
- `fancymenu_data/` — FancyMenu 的菜单布局数据，与 `config/fancymenu/` 分离。

## 4. 约定与约束

- **Forge 默认配置目录**：`config/fml.toml` 中 `defaultConfigPath = "defaultconfigs"` 强制了默认配置的来源目录；新增需要随世界初始化的 Mod 配置应放入 `defaultconfigs/<modid>.toml`（或对应文件名）。
- **Mod 配置目录命名**：绝大多数 Mod 在 `config/<modid>/` 下放置其配置，这是 Forge 生态约定，由 Mod 自身读取逻辑决定。
- **Client/Common 文件命名**：对同一 Mod 的客户端/服务端差异配置，采用 `<mod>-client.toml` / `<mod>-common.toml` 的命名约定（见 `create-client.toml`、`create-common.toml`、`curios-client.toml`、`curios-common.toml` 等）。
- **KubeJS 配置位置固定**：KubeJS 只从 `kubejs/config/common.properties` 与 `kubejs/config/client.properties` 读取属性，不能随意改名或移动。
- **无统一 schema 校验**：仓库中没有统一的配置 schema 文件或校验脚本；各 Mod 自行解析自己的配置文件，因此新增配置项需参考对应 Mod 文档。
- **无环境变量注入层**：未发现 `.env` 文件或自定义的环境变量→配置映射代码；配置完全依赖文件。
- **无集中式 feature flag 系统**：功能开关由各 Mod 的 `.toml`/`.json` 配置项控制（如 `hardcoreMode`、`globalBlockProtection`），不存在跨 Mod 的统一开关表。
- **SkyGUIs 配置与资源耦合**：`config/skyguis.json5` 引用 `apricity/kubejs/` 下的 HTML/CSS/图片资源，修改 UI 时需同步维护两者引用关系。