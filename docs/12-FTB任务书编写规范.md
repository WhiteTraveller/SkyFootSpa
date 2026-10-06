# FTB 任务书编写规范（主线章节）

> 本规范约束 **FTB Quests 主线章节** 的编写：布局、节点分级、人物/剧情驱动、命名、描述、魔改来源核对、奖励与 SNBT 格式。
> 对照基准 = `config/ftbquests/quests/chapters/` 下现有 snbt。**第二章（`3982F16B48EBC9C6`）为最新布局标准**；**第一章（`1.snbt`）为命名/文案基准，形状/size/点阵间距均已对齐本规范（2026-09，见 §11）**。

## 1. 适用范围

- 只覆盖 **主线章节**：chapter group「主线」= `703E058CBE887155`（序章 → 第一章 → 第二章 → …）。
- **不含支线/画廊章节**：如「回顾对话」（`11558B81E9EA1D16`，`group` 为空）。支线章节规范见 [13-FTB任务书编写规范-支线章节](13-FTB任务书编写规范-支线章节.md)（框架草案）。
- 主线现有章节：

  | 章节 | 文件 | id | order_index | icon |
  | --- | --- | --- | --- | --- |
  | 序章 | `29426113FA929704.snbt` | 29426113FA929704 | 0 | `minecraft:nether_star` |
  | 第一章 | `1.snbt` | 358D848C495AD6C3 | 1 | `marguerite:basic_chip_heel` |
  | 第二章 | `3982F16B48EBC9C6.snbt` | 3982F16B48EBC9C6 | 2 | `marguerite:magic_dust` |

## 2. 文件与章节结构

- 章节文件：`config/ftbquests/quests/chapters/<filename>.snbt`；章节组：`chapter_groups.snbt`；全局默认：`data.snbt`。
- `data.snbt` 关键项：`grid_scale: 0.5d`、`default_quest_shape: "circle"`、`progression_mode: "linear"`。
- 章节头字段（新章节照抄结构）：

```snbt
{
	default_hide_dependency_lines: false
	default_quest_shape: ""
	filename: "<文件名>"
	group: "703E058CBE887155"        // 主线组
	icon: "<章节图标物品>"
	id: "<16位大写HEX>"
	order_index: <主线顺序号>
	quest_links: [ ]
	quests: [ /* 任务节点 */ ]
	title: "<第N章>"
}
```

## 3. 布局规范（点阵）

- **点阵间距 = 2.0**：相邻任务点的 `x`、`y` 均以 **2.0** 递增。
  - 对照第二章：`x = 1 / 5 / 7 / 9 / 11 …`，`y = -6 / -4 / -2 / 0 / 2 / 4`。
  - ⚠️ 第一章历史用 **1.5** 间距，属旧标准；**新章节一律 2.0**（差异见 §11）。
- **坐标格式**：`x: N.Nd` / `y: N.Nd`（双精度，必须带 `d`）。
- **两轴语义**：
  - **竖向（y，自上而下增大）= 任务/剧情走向**。同一 `x` 列、`y` 递增排列主线里程碑（人物节点）。
  - **横向（x，自左而右增大）= 关键物品制作链**。从人物/起点列向右展开合成 DAG。
- **依赖连接**：`dependencies: [ "<questId>", ... ]` 表达前置；连线默认显示（`default_hide_dependency_lines: false`）。
  - 多前置默认「全部完成」；需「任一」时加 `dependency_requirement: "one_started"`。
  - 单节点隐藏连线：`hide_dependency_lines: true`。
  - 依赖按 questId 全局解析，**可跨章节**（例：第一章「爱丽丝的回访」前置是序章「第一桶金」`7B3A5D9E2F1C8300`）。
- 人物里程碑之间可拉开距离（占据不同 y 带），带内物品节点按 2.0 点阵排布，避免重叠。

## 4. 节点分级：大小 / 形状

| 节点类型 | size | shape | 说明 |
| --- | --- | --- | --- |
| 普通任务 | 不写（默认 1.0） | 不写（默认 circle） | 材料收集 / 中转节点 |
| **关键节点** | **`1.5d`** | `square` | 关键物品、阶段里程碑 |
| 人物 / 剧情 / boss 节点 | `2.0d` | `square` | 角色来访、对话触发、boss |

- **硬规则（用户约定）：关键节点 `size = 1.5d`；人物/剧情/boss 节点 `size = 2.0d`。**
- **形状一律 `square`**（人物节点也固定 `square`，不用 `gear`/`hexagon`/`diamond`）；次级节点可 `square` 1.0d。
- 第一章原用 `gear`/`hexagon`/`diamond` @2.0d 的里程碑（精密构件、爱丽丝、灵梦、扩充器）已于 2026-09 全部对齐为 `square`（人物 2.0d、关键物品 1.5d）；改前备份见 `config/ftbquests/backup/1.snbt.bak-20260927-prealign`。

## 5. 人物节点 · 剧情与 boss 驱动

主线每章由 **人物节点** 串起竖向走向。人物节点特征：

- `icon` = `touhou_little_maid:garage_kit` + `tag.EntityInfo.ModelId`（角色模型），如 `alice_margatroid` / `kawasiro_nitori` / `hakurei_reimu` / `kaenbyou_rin` / `hoshiguma_yugi`。
- `shape: "square"`、`size: 2.0d`。
- `tasks` 多为 `checkmark` 或「持有某关键物 / 币」。
- `rewards` = command `/chatbox skip skyfootspa:story <对话id>`（`title: "与XX对话"`、`icon: minecraft:nether_star`）；boss 角色再附 `marguerite:boss_seal_<name>`（召唤符）。

**驱动链**：制作关键物品（横向）→ 满足人物节点前置 → 完成人物任务 → 发放 `/chatbox` 命令奖励 → 触发对话 →（boss 角色）用召唤符挑战对应对话 boss。

第一章三人物（对照 `1.snbt`，均 `x = 2.0`，y 递增 = 走向）：

| 角色 | questId | y | 对话命令 | 附加奖励 |
| --- | --- | --- | --- | --- |
| 爱丽丝的回访 | `2C92FF8892F38FDC` | -9.0 | `chapter1` | 芯片 ×4、随机券 |
| 河城荷取的来访 | `494196DBF4AA9FCE` | -3.0 | `chapter2` | `boss_seal_nitori` |
| 博丽灵梦的来访 | `0FD9B77E961BFF01` | 4.0 | `chapter3` | — |

- 人物依赖链：爱丽丝 → 荷取 → 灵梦（灵梦另需「精密构件」`7B3A5D9E2F1C8220`）。
- 对话命令的 `<对话id>` 与 ChatBox 配置对应，编写时配合 **chatbox-dialogue-config** skill。

## 6. 任务命名

- **以关键物品为主**：标题即该节点核心产出物 / 关键物品。
- 风格：简短有韵（2~6 字中文），诗意 / 隐喻 / 口语化，避免干巴技术名。
  - 好例（现状）：「意外的副产物」(皴)、「聚砂成塔」(皴块)、「筛矿工具」、「首次筛矿」、「魔力的残余」、「萃取魔力」、「盐析悬浊」。
  - 差例：「获取铁粉」「合成动力搅拌器」。
- 购买类可用前缀「以币易物：购买 X」。
- 纯中转物品节点可省略 `title`（默认取物品名）。

## 7. 任务描述

- 核心：**该物品的制作方式 + 来源**，简短易懂，不堆废话。
- 结构（重要节点）：
  1. 一句世界观 / 用途引入；
  2. `§e获取方式§r：` / `§a配方§r：` / `§a功能§r：`（列表条目用「·」开头）；
  3. 可选一句鼓励 / 提示。
- 简单中转节点：一行即可，甚至无描述。
- **全中文（用户约定）**：描述与任务标题内不得出现英文单词——机器/模组名用官方中文（`Create`→机械动力、`Basin`→工作盆）；不写「中文名(English)」括注；流体量用「桶」（1000mb=1 桶、250mb=1/4 桶）；配方查询写「游戏内配方」（不用「JEI」）；商店写「商店」（不用「SDM 商店」）。第一章已于 2026-09 全量转为全中文。
- **§ 颜色编码**（沿用第一章基准）：

  | 代码 | 颜色 | 用途 |
  | --- | --- | --- |
  | `§b` | 青 | 机器 / 模组 / 设备名 |
  | `§e` | 黄 | 关键方法标签 / 重要物品 |
  | `§6` | 金 | 特殊道具 / 突出推荐 |
  | `§a` | 绿 | 数值加成 / 正面数量 |
  | `§c` | 红 | 消耗 / 警告 / 注意 |
  | `§f` | 白 | 普通原料物品 |
  | `§d` | 紫 | 稀有 / 魔力物品 |
  | `§5` | 深紫 | 富魔 / 妖力流体 |
  | `§7` | 灰 | 风味文字 / 补充 |
  | `§8` | 深灰 | 低价值产物 |
  | `§r` | 重置 | 每段颜色结尾必须 reset |

- **魔改来源必须先查代码（见 §8）**，描述要与实际配方一致，禁止凭空写。

## 8. 魔改来源核对（写前必查）

本包大量物品经过魔改，来源非原版 / JEI 常规配方。**写描述前先读对应代码，按代码事实描述。**

代码位置速查：

| 内容 | 目录 / 文件 |
| --- | --- |
| 物品注册 | `kubejs/startup_scripts/item/*.js`（`cun_item.js` 皴、`magic_dust.js` 魔力粉、`electrolyte_bottle.js` 电解质水瓶） |
| 方块注册 | `kubejs/startup_scripts/block/*.js`（`cun_block.js` 皴块、`cleaned_cun_block.js` 洗净皴块） |
| 流体注册 | `kubejs/startup_scripts/fluid/*.js`、`fluid/soakwater/`（`electrolyte_water.js` 等） |
| 合成 / 魔改配方 | `kubejs/server_scripts/recipes/recipes_*.js` |
| 服务掉落（皴等） | `kubejs/server_scripts/pathfinder/` + serve hooks（皴来自搓脚服务） |
| 遗物 / 芯片 | `kubejs/startup_scripts/relic/`（stage1–5）、`recipes_relic_stage1.js` |
| 泡脚水 / 油 | `startup_scripts/fluid/soakwater/`、`startup_scripts/item/oil/`、`recipes_soak_water_create.js` |

常见关键物品 → 来源对照（示例，写前仍需复核代码）：

| 物品 | 来源 / 配方文件 | 要点 |
| --- | --- | --- |
| 皴 `marguerite:cun` | 搓脚服务掉落（pathfinder / serve） | 每次搓脚随机 3~5；搓泥宝副手持翻倍 |
| 皴块 `cun_block` | `recipes_cun.js` | 9 皴 无序合成 1 皴块 |
| 矿粒 / 石英 | `recipes_cun.js` | 动力筛子 + 线筛网 筛皴块 |
| 洗净皴块 `cleaned_cun_block` | `recipes_cun_processing.js` | Basin：皴块 + 水 → 洗净皴块 + 皴水 |
| 精密构件 | `recipes_create_precision_mechanism.js` | 魔改：基材黄铜板，机械手依次装 齿轮 / 大齿轮 / 铁粒 / 红石，`loops(5)` |
| 电解质水瓶 `electrolyte_bottle` | `recipes_electrolyte.js` + `fluid/electrolyte_water.js` | 注液器 250mb 电解质水 + 玻璃瓶；饮用 +750 体力 |
| 魔力粉 `magic_dust` | `recipes_fuma_production.js` | 富魔洗脚水 → 富魔植物油 → 悬浊液 → 魔力粉（多步） |
| 芯片槽扩充器 `slot_expander_mk1/2` | `recipes_slot_expander.js` | 解锁芯片饰品槽 |
| 硬币升阶 | `recipes_coin.js` | 9 铜币 → 1 铁币 → … → 钻石币 |

## 9. 奖励规范

- 早期简单任务：`coinsje:copper_coin` × 2~5。
- 中期解锁任务：`copper_coin` × 5~10。
- 关键设备任务：`copper_coin` × 10~15，或直接奖励物品。
- 矿锭类：`coinsje:iron_coin` × 1。
- 人物 / boss 节点：`command`（对话）+ 关键道具（芯片 / 召唤符 / 扩充器）。
- `rewards` 里 `count` 不加 L 后缀；`tasks` 里 `count > 1` 用 `count: NL`（如 `count: 3L`）。

## 10. SNBT 格式要点

- `id`：16 位大写 HEX，全局唯一；每个 task / reward 各自独立 id。
- 数组内对象 **换行分隔，不加逗号**。
- 坐标 `x: N.Nd` / `y: N.Nd`。
- 纯物品：`item: "modid:item"`；带 NBT：`item: { Count: 1, id: "modid:item", tag: { … } }`。
- 任务类型 `type: "item"` / `"checkmark"`；`consume_items` 控制是否消耗提交物。

## 11. 对照现状（差异与处理建议）

| 项 | 第一章 | 第二章 | 标准 | 状态 / 建议 |
| --- | --- | --- | --- | --- |
| 形状 | 全 `square`（已改） | `square` | `square` | ✅ 第一章 gear/hexagon/diamond 已对齐（2026-09） |
| 节点 size | 关键物品 1.5、人物 2.0（已改） | 同 | 同 | ✅ 精密构件 / 扩充器 2.0→1.5 |
| 人物节点 | `square` 2.0 + `/chatbox`（已改） | `square` 2.0 + `/chatbox` | 一致 | ✅ 爱丽丝 / 灵梦 gear→square |
| 点阵间距 | **2.0（已重排+压实）** | **2.0** | 2.0 | ✅ 75 节点排到 20 列×11 行的 2.0 网格，竖向行合并压实（2026-09） |

## 12. 新章节编写流程（checklist）

1. 读对应章节产线设计（如第二章 `docs/第二章-沉浸工程/06–11`）确定关键物品与里程碑。
2. 对每个关键物品，按 §8 查代码确认真实来源 / 配方。
3. 规划点阵：竖向排人物里程碑、横向排物品链，间距 2.0。
4. 写节点：命名（§6）+ 描述（§7）+ size/shape（§4）+ 依赖（§3）+ 奖励（§9）。
5. 人物节点挂 `/chatbox` 对话命令（配合 chatbox-dialogue-config skill）与 boss 召唤符。
6. 自查 SNBT 格式（§10），进游戏 `/reload` 或重启检查排版、连线与文案。

## 决策记录（2026-09-27）

- ✅ **第一章对齐**：形状 / size 已回改（人物 `square` 2.0、关键物品 `square` 1.5）；改前备份 `config/ftbquests/backup/1.snbt.bak-20260927-prealign`。
- ✅ **人物节点固定 `square`**（不再用 `gear` / `hexagon` / `diamond`）。
- ✅ **支线章节规范另开文档**：已建框架草案 [13-FTB任务书编写规范-支线章节](13-FTB任务书编写规范-支线章节.md)，本文只覆盖主线。
- ✅ **第一章点阵间距重排为 2.0（紧凑版）**：x 保序压缩到 2.0 网格（20 列）；y 用「行合并压实」——贪心最长路把 21 个原始 y 层级合并到 **11 行**（全局单调、同列严格递增、无碰撞），高度由错误的 40 收到 **20 单位**，风格对齐第二章。快照：`1.snbt.bak-20260927-prealign`（原始）、`-shape`（形状对齐后/重排前）。

## 开放问题

- 第一章重排+压实后需进游戏 `/reload` 核对：节点无重叠、依赖连线走向正常、竖向顺序与紧凑度是否符合预期（如需微调可在 FTB 编辑器内拖拽吸附）。
