---
kind: build_system
name: Minecraft Forge 整合包版本描述与本地资源管理
category: build_system
scope:
    - '**'
source_files:
    - 洗手.json
    - README.md
    - AGENTS.md
    - mods/
    - kubejs/
    - resourcepacks/
    - apricity/kubejs/
    - 洗手.jar
---

## 1. 使用的系统/方法

本项目是一个基于 **Minecraft 1.20.1 + Forge 47.4.10** 的整合包，没有传统意义上的 Makefile/Dockerfile/CI 流水线。构建与打包完全由 Minecraft 启动器生态完成：

- 版本入口是根目录的 `洗手.json`（Mojang Launcher JSON 格式），声明了游戏版本、Forge 版本、Java 版本、libraries、downloads、assetIndex 等。
- 依赖通过 `mods/` 目录下的 `.jar` 文件直接提供（约 128 个 mod jar）。
- KubeJS 脚本位于 `kubejs/`（startup_scripts / server_scripts / client_scripts / data / assets），作为运行时逻辑扩展。
- 自定义资源放在 `resourcepacks/`、`apricity/kubejs/`、`patchouli_books/`、`tlm_custom_pack/` 等目录。
- 本地预编译/原生库放在 `洗手-natives/`。
- 打包产物为根目录的 `洗手.jar` 和 `洗手.json`（经 PCL 打包后的整合包）。