---
kind: build_system
name: Minecraft Forge 整合包构建与分发体系（无自动化 CI）
category: build_system
scope:
    - '**'
source_files:
    - 洗手.json
    - mods/pack.mcmeta
    - mods/kubejs.plugins.txt
    - mods/LICENSE
    - kubejs/jsconfig.json
    - kubejs/powerfuljs_fe_guide.md
    - .gitignore
---

## 1. 使用的系统/方法

本仓库是一个 **Forge 1.20.1 Minecraft 整合包**，没有传统意义上的编译型 build_system（无 Makefile、Dockerfile、CI pipeline、Gradle/Maven 工程）。其「构建」本质是：

- 通过 PCL（Plain Craft Launcher）或官方 launcher 加载 `洗手.json` 版本描述文件；
- 由 launcher 从 Mojang 的 piston 服务下载固定版本的 client/server jar、mappings、libraries 和 assets；
- 将预编译好的第三方模组 JAR 直接放入 `mods/` 目录作为依赖；
- 使用 KubeJS + Rhino 在运行时解释执行 JavaScript 脚本，实现数据/逻辑扩展。

因此，这个项目的「build & artifact management」实际上是 **静态资源打包 + 版本清单管理**，而非代码编译流水线。

## 2. 关键文件

- `洗手.json` — Minecraft launcher version manifest。声明了 `id: "东方足道屿"`、`javaVersion.majorVersion: 17`、`launchTarget: forgeclient`、`fml.forgeVersion: 47.4.10`、`fml.mcVersion: 1.20.1`、`fml.mcpVersion: 20230612.114412`，以及所有 Mojang 官方库的 sha1/url/size 元数据。
- `mods/pack.mcmeta` — 整合包资源包清单，`pack_format: 15`，`description: "ChatBox"`。
- `mods/kubejs.plugins.txt` — KubeJS 插件注册表（KubeJS 启动时读取）。
- `mods/` — 存放所有预编译模组 JAR（含 KubeJS、Rhino、Create、ImmersiveEngineering、FTB 系列等），是整合包的「依赖库」。`LICENSE` 在此目录下。
- `kubejs/` — KubeJS 脚本根目录，包含 `startup_scripts/`、`server_scripts/`、`client_scripts/`、`data/`、`assets/`、`config/`、`probe/`，以及 `jsconfig.json`（IDE 提示）和 `powerfuljs_fe_guide.md`。
- `local/*.py` / `local/*.ps1` — 本地开发辅助脚本（头像合成、对话拆分、贴图像素化、配置审计等），属于开发者工具，不参与正式打包。
- `apricity.zip`、`tlm_custom_pack.zip` — 额外打包的资源包产物，被整合包引用。
- `config/`、`defaultconfigs/` — 模组默认配置模板，首次运行由 Forge 复制到玩家目录。
- `.gitignore`、`.idea/`、`.vscode/`、`.qoder/` — IDE 与 Git 忽略规则。

## 3. 架构与约定

### 3.1 版本与依赖锁定
- 所有 Mojang 库通过 `洗手.json` 中的 `downloads.*.sha1` 精确锁定，确保可复现的客户端/服务端环境。
- Forge 版本硬编码为 `47.4.10`，MC 版本 `1.20.1`，Java 要求 `majorVersion: 17`。
- 第三方模组以「预编译 JAR + 中文注释文件名」形式存放在 `mods/`，例如 `[机械动力] create-1.20.1-6.0.8.jar`、`[沉浸工程] ImmersiveEngineering-1.20.1-10.2.0-183.jar`、`ftb-quests-forge-2001.4.12.jar` 等，命名中同时保留模组名、MC 版本、Forge 后缀和版本号。

### 3.2 资源包结构
- 顶层 `resourcepacks/` 为空目录，实际资源主要放在 `mods/` 下的各模组自带资源包，以及 `apricity.zip`、`tlm_custom_pack.zip` 两个 zip 形式的附加资源包。
- `kubejs/assets/` 提供 KubeJS 自定义资源（如 ApricityUI 的 HTML/CSS/图片）。

### 3.3 KubeJS 脚本生命周期
- `startup_scripts/` — 游戏启动阶段执行的 JS（如注册事件、初始化数据）。
- `server_scripts/` — 服务器端逻辑（物品合成、任务书、经济系统等）。
- `client_scripts/` — 客户端 UI 与渲染相关逻辑。
- `data/` — KubeJS 生成的 data pack（tag、recipe、loot table 等）。
- `probe/` — ProbeJS 探测生成的文档。

### 3.4 本地开发工具链
- `local/` 下大量 Python/PowerShell 脚本用于美术资源处理（头像合成、对话拆分、贴图像素化、配置比对等），这些脚本由开发者手动运行，不是自动化构建的一部分。
- `crash-reports/`、`logs/`、`saves/`、`screenshots/` 是运行时产物，不应视为构建输出。

## 4. 约定与约束

- **无自动化构建/CI**：仓库中没有 `.github/`、`Makefile`、`Dockerfile`、`gradlew`、`pom.xml`、`package.json`（除 kubejs/jsconfig.json 外）等任何持续集成或编译配置文件。发布流程是手动的：整理 `mods/`、`config/`、`kubejs/` 后打包成整合包供 PCL 加载。
- **依赖不可变**：`mods/` 中的 JAR 文件名包含完整版本信息，更新模组需替换对应 JAR 并可能同步修改 `config/` 下的默认配置。
- **launcher 驱动**：`洗手.json` 是唯一的入口点，定义了 JVM 参数（如 `-Xss1M`、`--add-modules ALL-MODULE-PATH`、`--add-opens`）、native 路径、classpath 拼接等，任何运行时参数变更必须修改此文件。
- **KubeJS 脚本即业务逻辑**：由于整合包的核心玩法通过 KubeJS JavaScript 实现，脚本的语法检查依赖 `kubejs/jsconfig.json`，IDE 补全依赖 `probe/` 生成的类型定义。
- **资源包格式**：`mods/pack.mcmeta` 中 `pack_format: 15` 对应 MC 1.20.x 资源包格式，新增资源包需遵循该格式。
- **日志与崩溃报告**：`logs/` 下按日期归档 `.log.gz`，`crash-reports/` 保存 FML/客户端崩溃堆栈，是调试依据但不参与构建。

## 5. 结论

该项目不存在传统意义上的 build_system；其「构建」等同于 **静态整合包组装**，核心工件是 `洗手.json` + `mods/` + `kubejs/` + `config/`。所有版本、依赖、JVM 参数均通过 Minecraft launcher 的 JSON manifest 和预置 JAR 文件管理，没有跨平台编译、容器化或 CI 流水线。