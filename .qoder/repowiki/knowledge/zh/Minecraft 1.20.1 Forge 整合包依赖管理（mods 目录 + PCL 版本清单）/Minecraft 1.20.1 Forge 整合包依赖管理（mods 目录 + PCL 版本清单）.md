---
kind: dependency_management
name: Minecraft 1.20.1 Forge 整合包依赖管理（mods 目录 + PCL 版本清单）
category: dependency_management
scope:
    - '**'
source_files:
    - 洗手.json
    - mods/
    - mods/pack.mcmeta
    - mods/kubejs.plugins.txt
    - kubejs/jsconfig.json
    - local/aui-jar/com/sighs/apricityui/
---

## 概述

本仓库是一个基于 **Forge 1.20.1** 的 Minecraft 整合包工程，依赖管理采用「PCL 启动器 + 本地 mods 目录」的方式：第三方模组以 `.jar` 文件直接放入 `mods/` 目录，游戏版本、Forge 版本及运行时库由 PCL 生成的 `洗手.json` 声明。KubeJS 脚本侧使用 JS 语言，通过 `kubejs/jsconfig.json` 提供 IDE 类型提示，但不存在 npm/pnpm/yarn 等前端包管理器。

## 关键文件与位置

- `洗手.json`：PCL 为该整合包实例生成的版本清单，声明了 Minecraft 客户端/服务端 jar、Forge 47.4.10、Java 17、assets index、以及完整的 `libraries` 列表（包含 netty、lwjgl、log4j、guava、oshi 等所有运行时依赖），每个条目均带 sha1 校验和与下载地址。
- `mods/`：存放所有已安装的 Forge 模组 jar 包（约 98 个文件），包括 JEI、Patchouli、Create、ImmersiveEngineering、FTB Quests、SDMEconomy/SDMShop、Oculus、Xaeros Minimap/WorldMap、LibX、Placebo、Bookshelf 等。
- `mods/pack.mcmeta`：整合包元数据（pack format 等）。
- `mods/kubejs.plugins.txt`：KubeJS 插件加载配置。
- `kubejs/jsconfig.json`：仅用于 VSCode 等 IDE 的类型提示，指定 `rootDirs` 为 `probe/generated`、`probe/user`、`server_scripts`、`startup_scripts`、`client_scripts`，目标语言 ES2015；不引入任何外部 JS 依赖。
- `local/aui-jar/com/sighs/apricityui/`：自研 ApricityUI 前端的 Java 端适配 jar 被作为本地资源随包分发。
- `apricity.zip` / `tlm_custom_pack.zip`：打包后的自定义内容压缩包。

## 架构与约定

1. **模组依赖 = 物理 jar 文件**：所有第三方模组以预编译的 `.jar` 形式提交到 `mods/`，不存在 Maven/Gradle 构建声明或远程仓库解析。版本号直接体现在文件名中（如 `JEI-1.20.1-forge-15.20.0.106.jar`、`libIPN-forge-1.20-4.0.2.jar`、`[Iris非官方移植]oculus-mc1.20.1-1.8.0.jar`）。
2. **运行时代码库由 PCL 管理**：`洗手.json` 中的 `libraries` 数组列出了 Forge/Minecraft 所需的所有底层库（netty、lwjgl、jna、gson、guava、log4j 等），并附带精确的 sha1 校验值，确保可复现下载。
3. **无锁文件、无私有仓库**：仓库内未发现 `package-lock.json`、`yarn.lock`、`go.sum`、`pom.xml`、`build.gradle`、`settings.gradle`、`gradle.properties`、`vendor/`、`GOPRIVATE` 等依赖锁定或私有源配置。
4. **KubeJS 脚本无外部 JS 依赖**：脚本通过 KubeJS API 访问 Minecraft 对象，IDE 类型来自 KubeJS probe 生成（`probe/generated`），无需 npm 安装。
5. **本地开发辅助 jar**：`local/aui-jar/` 下放置自研 ApricityUI 的 Java 适配层 jar，作为本地资源随包分发，而非从 Maven Central 拉取。

## 约定与约束

- 新增模组时，应将对应版本的 `.jar` 放入 `mods/` 目录，并确保其兼容 Forge 47.4.10 / Minecraft 1.20.1。
- 模组版本变更需手动替换 `mods/` 下的 jar 文件，不存在自动更新机制。
- `洗手.json` 由 PCL 启动器维护，不应手工编辑；它同时充当该实例的“运行时依赖清单”，其中每个 library 条目都带有 sha1 校验。
- 自研组件（ApricityUI）以源码 + 预编译 jar 双轨方式维护：Java 端适配在 `local/aui-jar/`，前端资源在 `apricity/` 与 `kubejs/assets/`。
- 无 CI 流水线对依赖进行自动化校验或升级扫描。