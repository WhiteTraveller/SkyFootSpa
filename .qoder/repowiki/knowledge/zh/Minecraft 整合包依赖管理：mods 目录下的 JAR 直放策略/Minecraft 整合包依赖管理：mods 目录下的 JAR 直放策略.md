---
kind: dependency_management
name: Minecraft 整合包依赖管理：mods 目录下的 JAR 直放策略
category: dependency_management
scope:
    - '**'
source_files:
    - mods/
    - mods/pack.mcmeta
    - mods/kubejs.plugins.txt
---

## 1. 使用的系统/方法

本仓库是一个 Forge 1.20.1 Minecraft 整合包（KubeJS 脚本为核心），**没有使用任何传统软件工程的依赖管理系统**（无 `package.json`、`go.mod`、`pom.xml`、`build.gradle`、`requirements.txt` 等清单文件，也无 lockfile、vendor 目录或私有仓库配置）。

依赖管理的唯一机制是：**将第三方模组以预编译的 `.jar` 文件直接放入根级 `mods/` 目录**。Forge 启动器在加载整合包时会自动扫描该目录并加载所有 JAR。这是 Minecraft 整合包社区的标准做法，而非通过 Gradle/Maven 等工具解析声明式依赖。

## 2. 关键文件与位置

- `mods/` 目录：存放全部第三方模组 JAR，约 80+ 个文件，按功能分类命名（带 `[前置]`、`[JEI拼音搜索]`、`[机械动力]` 等中文前缀便于识别）。
- `mods/pack.mcmeta`：资源包元数据，声明 `pack_format: 15`（对应 1.20.1），描述为 `ChatBox`。
- `mods/kubejs.plugins.txt`：KubeJS 插件注册入口，仅一行 `com.zhenshiz.chatbox.ChatBoxJSPlugin`。
- `config/` 与 `defaultconfigs/`：各模组的配置文件模板，首次运行由游戏复制到玩家目录。
- `kubejs/server_scripts/`、`kubejs/startup_scripts/`、`kubejs/client_scripts/`：KubeJS JS 脚本，通过 KubeJS API 调用已加载模组的对象（如 `Item.of('create:*')`、`blockEntity.getCapability(...)`），但脚本本身不声明对模组的版本依赖。

## 3. 架构与约定

- **JAR 直放（Vendored-by-copy）**：每个依赖都是完整的、已编译好的 JAR，版本号硬编码在文件名中（例如 `ImmersiveEngineering-1.20.1-10.2.0-183.jar`、`create-1.20.1-6.0.8.jar`、`kubejs-forge-2001.6.5-build.26.jar`）。更新依赖即替换对应 JAR 文件。
- **中文注释化命名**：大量 JAR 以 `[中文说明]` 前缀命名，用于区分同名或来源不明的模组（如 `[JEI]jei-1.20.1-forge-15.20.0.106.jar`、`[Xaero的小地图]Xaeros_Minimap_25.2.0_Forge_1.20.jar`、`[铷]embeddium-0.3.31+mc1.20.1.jar`）。
- **前置模组分离**：部分前置库单独列出并加 `[前置]` 标记（如 `[前置]architectury-9.2.14-forge.jar`、`[前置]cloth-config-11.1.136-forge.jar`、`[前置]Bookshelf-Forge-1.20.1-20.2.13.jar`），与使用该前置的主模组并列放置。
- **KubeJS 生态**：KubeJS 及其扩展（`kubejs-forge`、`kubejs-create-forge`、`kubejs-immersive-engineering`、`kubejs_curios_forge`、`rhino-forge`、`probejs`、`powerfuljs`、`eventjs`、`entityjs`）作为一组依赖共同出现，脚本通过 KubeJS 运行时访问这些模组暴露的对象。
- **资源包清单**：`mods/pack.mcmeta` 定义了一个独立的资源包（pack_format 15），用于 ChatBox 的资源；主整合包的 pack.mcmeta 位于根目录（未在此仓库树中显示，但在 `apricity.zip` / `tlm_custom_pack.zip` 中打包）。

## 4. 约定与约束

- **观察到的约定（非强制）**：
  - 模组 JAR 文件名包含完整版本信息，便于人工追踪版本。
  - 中文前缀用于标注模组用途或所属系列（机械动力、通用机械、FTB 系列、渲染优化类如 embeddium/ferritecore/modernfix）。
  - 前置库与被其依赖的模组分别放置，不加特殊目录隔离。
  - KubeJS 脚本通过字符串字面量引用模组 ID（如 `'create:'`、`'immersiveengineering:'`），而非类型安全的依赖声明。
- **无自动化约束**：仓库中没有 CI 任务、脚本或文档声明“必须使用某版本”“禁止升级至 X”之类的规则。依赖一致性完全依赖人工维护 `mods/` 目录。
- **无私有仓库/代理配置**：未发现任何 `~/.gradle/gradle.properties`、`gradle.properties`、`settings.gradle`、`.npmrc`、`.pypirc` 等配置文件，也未见 GOPRIVATE、Nexus/OSSRH 等私有源设置。
- **无 lockfile**：不存在 `package-lock.json`、`yarn.lock`、`poetry.lock`、`Cargo.lock`、`go.sum` 等同步文件。

总结：该仓库的依赖管理就是「把需要的 JAR 丢进 `mods/`」，版本锁定靠文件名中的硬编码版本号，更新靠人工替换文件。这是一种简单但缺乏可重复构建能力的策略，符合 Minecraft 整合包社区的常见实践。