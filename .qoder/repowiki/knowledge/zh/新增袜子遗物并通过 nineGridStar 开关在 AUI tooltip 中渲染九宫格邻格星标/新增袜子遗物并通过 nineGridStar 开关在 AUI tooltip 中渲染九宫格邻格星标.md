---
kind: design
name: 新增袜子遗物并通过 nineGridStar 开关在 AUI tooltip 中渲染九宫格邻格星标
source: session
category: adr
---

# 新增袜子遗物并通过 nineGridStar 开关在 AUI tooltip 中渲染九宫格邻格星标

_来源：a02a3e3 → fc5622b 提交周期内记录的编码计划——内容为规划时意图，实现可能滞后或有出入。_

**状态：** accepted

## 背景
需要一种能根据背包内相邻格子内容改变效果的遗物（袜子），并在悬停时直观展示其作用范围（中心 3×3 的 8 个邻格）。

## 决策驱动
- 复用现有 `money_gain.jiaobei` 属性避免引入新结算路径
- 通过布尔开关而非硬编码分支扩展 tooltip 行为
- 修复既有 jiaobei 清理遗漏以保证卸载正确性

## 备选方案
- **在 tooltip.js 中对 socks 做 if-else 硬编码判断** _（已否决）_ — 优点：改动最小；缺点：每新增一个带邻格提示的遗物都要改 tooltip.js，破坏可扩展性
- **在 Relic 注册器中新增 `nineGridStar` 布尔字段并让 updateGuideGrid 通用处理** — 优点：新增同类遗物只需 `setNineGridStar(true)`，tooltip 逻辑零侵入；缺点：多一个字段，但对当前需求足够简单

## 决策
在 `relicRegister.js` 的 `Relic()` 中增加 `this.nineGridStar = false` 及链式 setter；`socks.js` 调用 `setNineGridStar(true)`，`tooltip.js` 的 `updateGuideGrid` 对索引 `[6,7,8,11,13,16,17,18]` 输出金色 ★，非星标遗物则清空该格文本。同时把 `jiaobei` 加入 `backpackUpdate.js` 的 attributeList 清理列表，确保九宫格计数变化与卸下时 modifier 归零。

## 影响
袜子效果通过 `kubejs:serve.money_gain.jiaobei` 写入属性（pathfinder 尚未消费该属性，仅为未来结算预留）；AUI 星标依赖系统字体渲染 ★，若出现方框/空白需回退为星形 PNG。