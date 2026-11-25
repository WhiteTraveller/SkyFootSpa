---
kind: dependency_management
name: Minecraft 整合包依赖管理（PCL + mods 目录 + 版本清单）
category: dependency_management
scope:
    - '**'
source_files:
    - 洗手.json
    - mods/pack.mcmeta
    - mods/kubejs.plugins.txt
    - apricity.zip
    - local/CustomPackLoader.java
    - local/aui-jar/com/sighs/apricityui/
    - config/
    - defaultconfigs/
---

## 概述

本仓库是一个基于 PCL2（Plain Craft Launcher 2）的 Minecraft 1.20.1 Forge 整合包「洗手」，其依赖管理并非通过传统的代码级包管理器（如 Maven/Gradle/npm），而是采用 **Minecraft 整合包** 的典型模式：

- 核心运行时由 `洗手.json`（Mojang 版本清单格式）声明 Java、Forge、Minecraft 客户端/服务端 JAR 及其依赖库。
- Mod 以预编译 `.jar` 形式直接放入 `mods/` 目录，作为“已解析的二进制依赖”。
- KubeJS 脚本与 JS 工具位于 `kubejs/`、`local/`，使用 Node.js 生态（`.cjs` / `.js` 脚本），但未见 `package.json`，说明 Node 依赖是本地安装而非仓库内声明。
- 自定义模组 `apricityui` 以源码形式放在 `local/aui-jar/com/sighs/apricityui/`，打包为 `apricity.zip` 后由 `CustomPackLoader.java` 动态加载。

## 关键文件

- `洗手.json` — Mojang 版本清单，声明 `id: "东方足道屿"`、`javaVersion.majorVersion: 17`、`--fml.forgeVersion: 47.4.10`、`--fml.mcVersion: 1.20.1`，以及 `libraries[]` 中所有第三方库（gson、guava、netty、lwjgl、jna、log4j 等）的 Maven coordinates、sha1、size、url。
- `mods/pack.mcmeta` — 整合包元数据。
- `mods/kubejs.plugins.txt` — KubeJS 插件注册。
- `apricity.zip` / `local/aui-jar/...` / `local/CustomPackLoader.java` — 自研模组 `apricityui` 的源码与打包产物。
- `config/*.toml` / `defaultconfigs/*.snbt` — 各 mod 的配置快照，随整合包分发。
- `docs/` — 项目文档（非依赖声明）。

## 架构与约定

1. **Minecraft 运行时依赖**：全部集中在 `洗手.json` 的 `libraries[]` 数组中，每个条目包含 `name`（maven 坐标）、`downloads.artifact.url/sha1/size`。例如 `com.google.code.gson:gson:2.10`、`io.netty:netty-common:4.1.82.Final`、`org.lwjgl:lwjgl-glfw:3.3.1` 等。这些库由 launcher 从 `https://libraries.minecraft.net/...` 下载并缓存。
2. **Mod 依赖**：以 `.jar` 文件平铺在 `mods/` 目录下，launcher 启动时自动扫描加载。未发现统一的 mod 列表或版本锁定文件；mod 版本即文件名中的版本号。
3. **平台相关依赖**：通过 `rules[].os` 条件选择 native 变体，如 lwjgl 的 `natives-linux` / `natives-macos` / `natives-windows(-arm64,-x86)`、netty 的 `linux-aarch_64` / `linux-x86_64`。
4. **JVM 参数**：`arguments.jvm` 中固定了 `-Djava.library.path=${natives_directory}`、`--add-modules ALL-MODULE-PATH`、`--add-opens` 等 Forge 1.20.1 所需参数。
5. **自定义模组构建**：`apricityui` 未走标准 Forge 构建流程，而是将源码置于 `local/aui-jar/`，手动打包成 `apricity.zip`，并通过 `CustomPackLoader.java` 在运行时动态加载。该模组同时被 KubeJS 的 `client_scripts` / `server_scripts` 引用。
6. **KubeJS 脚本依赖**：`local/` 下存在大量 `.cjs` / `.js` 工具脚本（如 `bake-portrait-fade.cjs`、`check-rare-ids.cjs`、`gallery_validation.cjs`），但未发现 `package.json` 或 `node_modules`，表明 Node.js 依赖由用户本地环境提供。
7. **配置即依赖**：`config/` 和 `defaultconfigs/` 中按 mod 名分目录存放 `.toml` / `.json` / `.snbt` 配置文件，作为可复现运行环境的组成部分。

## 约定与约束

- **描述性约定**：第三方库以 Maven coordinate 形式在 `洗手.json` 中声明，并由 Mojang 官方库镜像 `https://libraries.minecraft.net/` 提供；sha1 用于完整性校验。
- **描述性约定**：Mod 以预编译 `.jar` 形式直接放入 `mods/` 目录，无统一清单或锁文件。
- **描述性约定**：平台特定 native 库通过 `rules[].os` 在 `洗手.json` 中条件化引入。
- **描述性约定**：自研模组 `apricityui` 通过 `CustomPackLoader.java` 动态加载，不走标准 Forge 依赖解析。
- **约束来源**：`洗手.json` 中 `javaVersion.majorVersion: 17` 强制要求 Java 17；`--fml.forgeVersion: 47.4.10` 与 `--fml.mcVersion: 1.20.1` 固定了 Forge/MC 版本。
- **约束来源**：`libraries[]` 中每个 artifact 的 `sha1` 字段由 launcher 校验，确保下载的库未被篡改。

## 不适用项

仓库中未发现 `go.mod`、`package.json`、`pom.xml`、`build.gradle`、`settings.gradle`、`vendor/`、`GOPRIVATE`、私有 Maven/NPM 仓库配置等典型代码级依赖管理设施。Node.js 脚本的依赖由用户本地环境提供，不在仓库内声明。