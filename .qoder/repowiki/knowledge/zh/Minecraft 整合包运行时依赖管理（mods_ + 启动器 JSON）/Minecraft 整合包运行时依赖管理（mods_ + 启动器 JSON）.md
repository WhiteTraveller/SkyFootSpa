---
kind: dependency_management
name: Minecraft 整合包运行时依赖管理（mods/ + 启动器 JSON）
category: dependency_management
scope:
    - '**'
source_files:
    - 洗手.json
    - mods/
    - .gitignore
    - mods/kubejs.plugins.txt
    - mods/chatbox-refmap.json
    - mods/chatbox.mixins.json
---

## 概述

本仓库是 Apricity 整合包的**运行时数据目录**，并非源码工程。依赖管理围绕 Minecraft Forge 1.20.1 整合包展开，核心机制由两部分组成：

1. `mods/` 目录——以预编译 `.jar` 文件形式直接存放第三方模组与 KubeJS 插件。
2. `洗手.json`——PCL（Plain Craft Launcher）生成的 Minecraft 启动器版本描述文件，声明 Java、Forge、Mojang 库及 assets。

仓库中不存在 `go.mod`、`package.json`、`pom.xml`、`build.gradle`、`Cargo.toml`、`deps.ts` 等任何语言级依赖清单；也没有 `vendor/`、`node_modules/`、`.m2/repository` 等 vendoring 目录。所有第三方二进制依赖均以“已下载好的 jar 包”形态随仓库分发。

## 关键文件

- `洗手.json`：Forge 1.20.1 启动器 manifest，包含 `javaVersion.majorVersion: 17`、`launchTarget: forgeclient`、`fml.forgeVersion: 47.4.10`、`fml.mcVersion: 1.20.1`，以及大量 Mojang 官方库（gson、guava、netty、lwjgl、log4j、authlib 等）的精确 sha1 与下载地址。
- `mods/`：约 128 个 `.jar` 文件，即整合包实际加载的模组集合（如 `ApothicAttributes-1.20.1-1.3.7.jar` 等），以及 KubeJS 插件清单 `kubejs.plugins.txt`、Mixin 映射 `chatbox-refmap.json`、`chatbox.mixins.json`。
- `.gitignore`：忽略 `logs/`、`saves/`、`crash-reports/`、`shaderpacks/`、`resourcepacks/`、`local/`、`config/*`（仅保留 `config/fancymenu/`）、`mods/*.zip` 等运行时产物，但 **未忽略 `mods/*.jar`**，说明 jar 依赖是受版本控制的。

## 架构与约定

- **无构建系统**：没有 Gradle/Maven/Cargo/npm 等依赖解析流程；依赖版本由人工维护在 `mods/` 与 `洗手.json` 中。
- **双轨依赖来源**：
  - Forge / Mojang 基础库通过 `洗手.json` 的 `libraries[]` 数组声明，由启动器从 `https://libraries.minecraft.net/...` 拉取并缓存到 `library_directory`。
  - 整合包自定义模组全部以 jar 形式提交到 `mods/`，启动时由 Forge 自动扫描加载。
- **KubeJS 脚本**：业务逻辑位于 `kubejs/server_scripts/`、`kubejs/startup_scripts/`、`kubejs/client_scripts/` 下的 JavaScript 文件，通过 `mods/kubejs*.jar` 加载运行。
- **资源与配置**：资源包放在 `resourcepacks/`（被 .gitignore 忽略，不在版本控制内），服务器默认配置放在 `defaultconfigs/`，运行时配置在 `config/`（也被 .gitignore 排除，仅 `fancymenu` 例外）。

## 约定与约束

- 观察到的约定：第三方模组以“固定版本的 jar 包”形式存放在 `mods/` 根目录下，文件名采用 `<ModName>-<MCVersion>-<ModVersion>.jar` 命名风格（例如 `ApothicAttributes-1.20.1-1.3.7.jar`）。
- 约束（由 `.gitignore` 体现）：`mods/*.zip` 被忽略，而 `mods/*.jar` 未被忽略，意味着 zip 形式的模组不被纳入版本控制，只有 jar 形式才受跟踪。
- 约束（由 `洗手.json` 体现）：Java 运行时要求 `majorVersion: 17`，Forge 版本锁定为 `47.4.10`，Minecraft 版本锁定为 `1.20.1`。
- 未发现私有仓库、代理或镜像配置；所有 Mojang 库均直接访问 `piston-data.mojang.com` 与 `libraries.minecraft.net`。
- 未发现自动化更新依赖的脚本或 CI 任务；依赖升级需人工替换 `mods/` 中的 jar 并同步更新 `洗手.json`。

## 结论

该仓库作为 Minecraft 整合包的运行时快照，依赖管理方式是**手工维护的 jar 清单 + 启动器 manifest**，没有使用通用的包管理器或 vendoring 策略。若需要引入新的第三方依赖，应将其 jar 放入 `mods/` 并确保其版本与 Forge 1.20.1 兼容。