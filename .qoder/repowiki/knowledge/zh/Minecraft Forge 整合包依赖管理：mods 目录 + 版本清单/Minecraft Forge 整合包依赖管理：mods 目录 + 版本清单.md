---
kind: dependency_management
name: Minecraft Forge 整合包依赖管理：mods 目录 + 版本清单
category: dependency_management
scope:
    - '**'
source_files:
    - 洗手.json
    - mods/
    - mods/kubejs.plugins.txt
    - mods/pack.mcmeta
    - CustomSkinLoader/CustomSkinLoader.json
    - PCL/Setup.ini
    - PCL/config.json
    - local/CustomPackLoader.java
---

## 1. 使用的系统/方法

本仓库是一个 **Minecraft 1.20.1 Forge 整合包**，不是传统编程语言项目，因此不存在 `go.mod`、`package.json`、`pom.xml` 等语言级依赖声明文件。依赖管理的核心由两部分组成：

- **Minecraft Launcher 版本清单** `洗手.json`：声明 Minecraft 客户端/服务端 JAR、Forge（`47.4.10`）、Java Runtime（`java-runtime-gamma majorVersion: 17`）以及所有底层 Java 库（`libraries` 数组），每个条目包含 Maven 坐标（如 `com.google.guava:guava:31.1-jre`）、SHA1、大小与从 `https://libraries.minecraft.net/...` 的下载 URL。
- **`mods/` 目录**：存放所有第三方模组 `.jar` 文件（Forge mod、Fabric mod、OptiFine/Iris 等）。这是整合包实际加载的依赖集合，直接以文件形式“vendored”。

没有发现任何自动化依赖解析工具（如 Modrinth App/Modpacks API、CurseForge Project File、FTB App manifest、Gradle/POM 构建脚本）。更新依赖是手工把新的 `.jar` 放入 `mods/` 并可能同步修改 `洗手.json`。

## 2. 关键文件

- `洗手.json`：Launcher 版本描述符，定义 Minecraft/Forge/Java 版本及运行时依赖库。
- `mods/`：模组 jar 目录，按文件名命名（如 `[JEI]jei-1.20.1-forge-15.20.0.106.jar`、`[Iris非官方移植]oculus-mc1.20.1-1.8.0.jar`、`[IPN前置]libIPN-forge-1.20-4.0.2.jar`）。
- `mods/pack.mcmeta`：资源包元数据（与依赖无关但属于 mods 目录的一部分）。
- `mods/kubejs.plugins.txt`：KubeJS 插件注册表，声明 KubeJS 扩展依赖。
- `CustomSkinLoader/CustomSkinLoader.json`：自定义皮肤加载器的本地配置，含其自身依赖项。
- `PCL/Setup.ini`、`PCL/config.json`：Prism Launcher 实例配置，指定该实例使用哪个版本（即 `洗手.json`）。

## 3. 架构与约定

- **分层依赖模型**：
  - 第一层：Minecraft 本体 + Forge loader（由 `洗手.json` 中的 `downloads.client/server`、`arguments.game` 中 `--fml.forgeVersion`/`--fml.mcVersion` 控制）。
  - 第二层：Forge 运行时依赖（`洗手.json` 的 `libraries` 数组，约 1800+ 行，涵盖 Guava、Netty、LWJGL、Log4j、ASM、JNA 等）。
  - 第三层：玩家模组（`mods/*.jar`），由 Forge 在启动时扫描加载。
- **版本锁定通过 SHA1 实现**：每个 library 都有固定 `sha1`，确保可重现下载；mod jar 则通过文件名中的版本号（如 `1.20.1-1.3.7`）人工追踪。
- **平台差异化**：`洗手.json` 中使用 `rules.os` 为 LWJGL natives、Netty epoll 等提供 linux/windows/macos 多架构变体。
- **私有/本地依赖**：`local/aui-jar/com/sighs/apricityui/` 下放置了自研模组 `apricityui` 的 jar 及其 class 结构，作为本地依赖参与打包（见 `local/CustomPackLoader.java`）。
- **KubeJS 脚本依赖**：`kubejs/server_scripts`、`kubejs/startup_scripts` 等目录下的 JS 脚本通过 `mods/kubejs.plugins.txt` 注册，构成逻辑层面的“脚本依赖”。

## 4. 约定与约束

- **观察到的约定**（非强制规则）：
  - 模组 jar 文件名采用 `<标签>名称-MC版本-模组版本.jar` 格式，前缀用方括号标注来源（如 `[JEI]`、`[IPN前置]`、`[Iris非官方移植]`），便于识别模组类型和作者。
  - 配置文件集中在 `config/<modid>/` 或根 `config/*.toml`，遵循各模组的默认配置结构。
  - 自研内容放在 `local/` 与 `tlm_custom_pack/`，不混入公共 `mods/`。
- **无显式约束**：仓库中没有 `.gitignore` 排除 `mods/` 外的依赖锁定文件（因为不存在）；也没有 CI 脚本校验依赖一致性。依赖更新完全依赖人工维护。
- **唯一可验证的强制点**：`洗手.json` 中 `libraries[].downloads.artifact.sha1` 必须与实际下载的 jar 匹配，否则 Minecraft Launcher 会拒绝运行——这是 Mojang 版本清单格式的硬性要求。