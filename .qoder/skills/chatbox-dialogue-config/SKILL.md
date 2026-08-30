---
name: chatbox-dialogue-config
description: 本项目 ChatBox 模组剧情对话配置方法：对话文件、主题文件、立绘贴图、命令触发、占位符、动画、渲染事件与 MVEL 条件。当用户要求新增/修改剧情对话、调整立绘主题、配置 chatbox 或提到 skyfootspa 对话时使用。字段级完整参考见 reference.md。
---

# ChatBox 对话配置

本项目用 ChatBox 模组（文档：https://doc.mafuyu.moe/wiki/ChatBox）实现剧情对话。数据放 `kubejs/data`，贴图放 `kubejs/assets`，命名空间统一为 `skyfootspa`。字段级完整参考见 [reference.md](reference.md)。

## 文件位置

| 内容 | 路径 |
|---|---|
| 对话文件 | `kubejs/data/skyfootspa/chatbox/dialogues/*.json` |
| 主题文件 | `kubejs/data/skyfootspa/chatbox/theme/*.json` |
| 贴图资源 | `kubejs/assets/skyfootspa/textures/`（portrait/names/options/button/chatbox） |
| 全局配置 | `config/chatbox_config.toml` |

现有文件：

- 对话：`start.json`（正式剧情，段落：`start`、`chapter1`、`chapter2`、`end_boss_seal_hchq`、`chapter3`、`end_boss_seal_reimu`）；`intro.json`/`intro_gal.json` 是模组自带 `test:` 命名空间示例，不要照抄其 theme。
- 主题：正式用 `alice_margatroid1.json`；`alice_margatroid.json` 为旧版；`default.json`/`gal.json` 为字段参考示例。
- 均支持 `/reload` 热重载，重载后跳转到新对话生效。

## 对话文件结构

```json
{
  "$introduce": "本文件的中文用途说明",
  "theme": "skyfootspa:alice_margatroid1",
  "isPause": false,
  "dialogues": {
    "段落ID": [ ...对话行... ]
  }
}
```

文件级字段（完整默认值见 reference.md）：

- `dialogues`（必填）：键为分组（段落）唯一标识，值为对话行数组；`/chatbox skip` 用「文件:分组+序号」定位。
- `theme`：进入对话时自动切换的主题，格式 `命名空间:主题文件名`。
- `isScreen`（默认 true）：屏幕模式（沉浸，鼠标选选项）；`false` 为渲染层模式，玩家可移动。
- `isEsc`（默认 true）/`isPause`（默认 true，单人暂停）/`isHistoricalSkip`（默认 true，允许历史回溯）。
- `maxTriggerCount`（默认 -1 无限）：可触发次数；0=禁止访问。
- `animationFPS`（默认 60）/`autoPlayTick`（默认 20 刻）：动画帧率 / 自动播放延迟。
- `criteria`：原版进度格式触发器，可自动触发对话。
- 所有文本支持翻译键，也可直写中文。

## 对话行字段

每行一个对象，常用字段：

- `dialogBox`: `{ "name": 说话人名, "text": 台词 }`。本项目惯例：说话人改用名牌立绘（见下），`name` 省略，玩家台词只写 `text`。
- `portrait`: 立绘数组。元素可以是主题注册的立绘 ID 字符串（如 `"names"`），或对象覆盖预设：

```json
{ "id": "alice_smile", "renderOrder": 10, "replace": true, "animation": "TALK" }
```

  `replace: true` 先移除所有同名立绘再添加；也可覆盖 `customAnimation`/`attachment` 等。立绘无法用渲染事件凭空新增，必须在 `portrait` 数组中提及（或从上一句保留）。
- 演出约定（start.json 现行做法，转换脚本 `local/transform_player_lines.js`）：玩家说话时爱丽丝在场则显示 `[{ "id": 上一表情, "animation": "NOT_TALK", "brightness": 70 }]` 压暗待机，爱丽丝不在场（河取/灵梦段落）用 `[]`；爱丽丝说话 `TALK` 只播一次——进入说话状态的首句写 `TALK`，后续连续爱丽丝行省略；`BOUNCE` 强调动画不受此限。
- `clearOldPortrait`（默认 true）：是否清除上一句立绘；设 `false` 保留，可用 `removePortrait: ["立绘ID"]` 手动移除指定立绘。
- `options`: 玩家选项数组：

```json
{ "text": "选项文本", "next": "段落ID或this",
  "click": {"type": "command", "value": "give @s marguerite:boss_seal_hchq"},
  "isLock": true, "unlockCommand": "execute if entity @s[nbt={...}]", "tooltip": "..." }
```

  `next` 规则：数字=跳当前分组对应序号；字符串=跳对应分组第一句；不填=下一句；`"this"`=留在当前句；负数=直接结束对话。
  `unlockCommand` 必须以 `execute` 开头（或写 mvel）：通过=可选；不通过时 `isLock: true` 显示上锁、否则直接隐藏选项。
  `click` 常用 `{"type": "command", "value": "..."}`，多段指令用 `;` 分隔，权限 2 级；本项目也接自定义命令如 `auratip_openshop`。
- `sound`: 音效（如 `"minecraft:ambient.cave"`）；`bgm`: 背景音乐（值不变不重播，空字符串 `""` 表示停止，不写不操作）。
- `command`: 到达该句时执行的指令，`;` 分隔，权限 2 级。
- `stayTick`（默认 0）：强制停留刻数；负数=永远无法手动跳转（不影响选项）。
- `backgroundImage`: 背景图片路径（无额外参数）。
- `renderEvents`: 进入该句时触发的渲染事件（仅 `start` 时机有效）。

## 主题文件结构

顶层字段：`portrait`、`option`、`dialogBox`、`functionalButton`、`keyPrompt`、`customAnimation`。

组件通用基础参数：`x`/`y`（屏幕百分比，可为负）、`width`/`height`（单位随 `widthReference`/`heightReference`，默认 `screen_width`/`screen_height`，可选 `pixel`）、`scale`、`alignX`（left/center/right）、`alignY`（top/center/bottom）、`renderOrder`（越大越上层）、`brightness`/`opacity`（0-100）、`angle`、`hidden`、`renderEvents`。枚举字符串无视大小写。

- `portrait`: 立绘注册表，key 即对话中引用的唯一标识。`type` 可选 `texture`（默认）/`player_head`/`item`/`entity`。纹理立绘模板：

```json
{ "type": "texture", "texture": "skyfootspa:textures/portrait/xxx.png",
  "x": 5, "y": -2, "width": 36, "height": 59, "scale": 1.1,
  "alignX": "left", "alignY": "bottom",
  "widthReference": "screen_height", "heightReference": "screen_height",
  "renderOrder": -10, "animation": "TALK", "loop": false }
```

  其他：`player_head`（`texture: "@s"`=当前玩家）；`item`（`texture` 为物品 id，宽高无效用 `scale`，可配 `itemCount`/`hoverTexture`/`isLock`/`lockTexture`）；`entity`（生物实体渲染，`texture: "@s"` 或 `"target1"`，支持 `yOffset`/`stareAt`）。名牌立绘（`names`、`nitori_name`、`hakurei_reimu_name`）指向 `textures/names/`，renderOrder 较高。
- `option`: 选项按钮（`texture`/`selectTexture`/`lockTexture` 指向 `textures/options/`，另有 `optionChatX/optionChatY` 文本偏移、`textAlign`），默认 `hidden: true`，由 dialogBox 的 renderEvents 在台词结束时 `show @Options`。
- `dialogBox`: 对话框底图、`lineWidth`（**必填**，一行文本宽度=窗口宽度百分比）、`nameX/nameY/textX/textY`、`textAlign`。
- `functionalButton`（数组）: `LOG`/`FASTFORWARD`/`AUTOPLAY` 按钮；**不配置则界面不显示按钮且对应功能不可用**；贴图指向 `textures/button/`。
- `keyPrompt`: 按键提示，仅渲染层模式（`isScreen: false`）有用；`visible: false` 可阻止玩家自由跳转下一句。
- `customAnimation`: 自定义预设动画。本项目已定义 `FADE_IN`、`SLIDE_IN_FROM_BOTTOM`、`BOUNCE`、`TALK`（说话抖动）。预设动画加载后**全局通用、名称区分大小写**，同名后加载覆盖先加载，建议用 `命名空间:名称` 防重名。

默认渲染顺序：对话框 0、选项 10、立绘 20、功能按钮 30、按键提示 40。右键隐藏对话框时只隐藏 `renderOrder` 大于对话框的立绘（据此区分背景立绘/前景立绘，本项目背景立绘用负值如 -10）。

## 贴图资源规则

- `texture` 值 `skyfootspa:textures/xxx.png` 对应文件 `kubejs/assets/skyfootspa/textures/xxx.png`；`chatbox:textures/...` 为模组自带（对话框底图、默认选项/按钮等），无需放置。
- 子目录：`portrait/`（立绘）、`names/`（名牌）、`options/`（选项）、`button/`（功能按钮）、`chatbox/`（对话框背景）。
- 新增立绘三步：PNG 放入 `textures/portrait/` → 主题 `portrait` 注册 ID → 对话行按情绪引用该 ID。
- 注意：主题中引用但文件缺失的立绘不会渲染；改文件名需同步主题 `texture` 字段，Windows/Git 大小写改名用中间名两步法。

## 组件化立绘（表情差分）

爱丽丝立绘套源素材为同尺寸 200×400 画布：底图 `alice_illust.png` + 表情组件 `alice_component_*.png` / 组合表情 `alice_compose_*.png`，源目录 `c:/Users/ZhaoM/Pictures/pixel/`（assets 存一份副本）。当前主题用 **attachment 运行时叠放**：每个表情立绘 = 底图 texture + `attachment` 组件，组件与底图同画布、`width/height` 与基础立绘一致保证对齐（个别组件需 `x: -6` 之类微调，以游戏内实测为准）。

- ID 与情绪：`alice` 平静 / `alice_grin` 坏笑元气 / `alice_sullen` 沮丧 / `alice_close_eyes` 闭眼微笑 / `alice_raise_eyebrow` 挑眉 / `alice_flowers` 花饰 / `alice_confuse` 问号困惑 / `alice_grin_eyebrow` 坏笑+挑眉（双 attachment）。
- 备选离线烘焙方案（attachment 渲染有问题时切换）：`local/compose_alice_portraits.py`（PIL `alpha_composite`）把组件叠到底图生成单张贴图；该方案完整产物存 `local/portrait_bake_backup/`（7 张烘焙贴图 + 新底图 `alice_illust_v2.png` + 主题 `alice_margatroid1.baked.json`）。切换步骤：重烘焙贴图到 `textures/portrait/` → 用 baked 版主题覆盖。
- 换底图或新增组合：更新源素材 → attachment 方案换底图即生效；烘焙方案跑脚本重烘焙；新 ID 需在主题注册并在对话引用。
- 旧整图立绘 ID（alice_hammer/alice_sad/alice_smile 等）已废弃，对话一律引用上述 ID。

## 命令与触发

| 命令 | 用途 |
|---|---|
| `/chatbox skip <命名空间:文件> <分组> [序号] [目标实体...]` | 跳转到对话。序号默认 0；目标实体供占位符 `<target1.name>` 等引用 |
| `/chatbox theme <命名空间:主题>` | 切换主题 |
| `/chatbox open` | 打开最近一次对话 |
| `/chatbox maxTriggerCount <路径> <次数>` | 限制访问次数（-1 无限，0 禁止）；`reset` 重置 |
| `/chatbox command nextDialogue` / `autoPlay <bool>` / `isScreen <bool>` | 跳下一句 / 自动播放开关 / 屏幕模式开关 |
| `/chatbox mvelTest <表达式> <是否服务端>` | 调试 mvel，结果发给玩家 |

- 剧情入口挂在 FTB Quests 任务命令里（`config/ftbquests/quests/chapters/*.snbt` 中 `command: "/chatbox skip skyfootspa:start ..."`），Boss 结算段通过选项 `click` 命令衔接（如 `auratip_openshop`）。
- KubeJS 服务端也可直接调用 `ChatBoxUtil.serverSkipDialogues(player, 'skyfootspa:start', 'start', [])`。

## 占位符与文本格式

- `§`+格式码：`§1`~`§f` 颜色、`§l` 粗体、`§o` 斜体（可用在说话者、台词、选项）。
- `@s`：当前玩家名；`@@s` 输出字面文本。
- `<target1.name>`、`<target1.uuid>`、`<target1.health>`：目标实体属性（需 `/chatbox skip` 传了目标）；只写 `<target1>` 表示名称。
- `<ruby 1 lì>`：注音，如 `茕茕孑<ruby 1 lì>立`。
- `<<MVEL代码>>`：台词内嵌 MVEL 表达式（需有返回值）。

## MVEL 条件判断（常用）

条件用于渲染事件 `condition`、`unlockCommand` 等。内置属性/方法：`player.name/health/experienceLevel/foodLevel/mainHandItem.id`、`player.hasItem('diamond')`、`player.getItemCount('id')`、`player.getItemBySlot('chest')`、`player.hasAdvancement('...')`、`player.hasTag('vip')`、`getScore(player, '目标')`、`random.nextInt(10)`、`targets` 列表。变量：`setVar/hasVar/removeVar` 全局持久（详见 reference.md）。

## KubeJS 联动（1.20.1 Forge 可用）

```javascript
// server_script 注册自定义渲染事件 type（本项目选项 click 可引用）
ServerEvents.loaded(event => {
  ChatBoxUtil.registerComponentEvent('类型名', (component, value) => {}, true, (player, value) => { })
})
// 对话跳转/关闭监听（关闭时 index === -1）
ChatBoxEvents.skipChat(event => { let { player, resourceLocation, group, index, targets } = event })
// 渲染前后：ChatBoxEvents.renderPre / renderPost（client_script）
// 自定义占位符：ChatBoxUtil.addPlaceholderResolver("名称", entity => "...")
```

## 渲染事件速查

写在组件 `renderEvents` 或对话行上，每项 `{ "trigger", "condition", "type", "value" }`：

- trigger：`start`/`end`（台词显示完）/`tick`/`check`（进入对话必触发一次）/`click`、`mouse_over`、`mouse_out`（仅立绘）。
- condition：留空=无条件；默认客户端 mvel；`execute` 开头=服务端命令；`server:` 开头=服务端 mvel。
- 常用 type：`command`、`jump`（value 同选项 `next` 规则）、`goto_next`、`play_sound`、`hide`/`show`/`replace`/`lock`/`unlock`/`set_normal`（value 支持 `@s`/`@portraits`/`@options`/`@buttons`/`@dialog`/`@Options` 等，多个 `;` 分隔）、`play_animation`（只能填预设动画名）、`restart_animation`、`scale`、`set_autoplay`。
- 被隐藏/锁定的组件不渲染、不可交互，但 `tick`/`check` 仍触发。

完整 type 表、30 种缓动函数、关键帧参数、渲染附件、entity 立绘字段、视频字段、MVEL 完整属性/方法表见 [reference.md](reference.md)。

## 全局配置（config/chatbox_config.toml）

| 配置项 | 当前值 | 含义 |
|---|---|---|
| `charPerSecond` | 20 | 每秒显示字符数（打字速度） |
| `historicalScrollSpeed` | 10 | 历史记录滚轮速度 |
| `soundInterruptionEnabled` | true | 新句无音效时中断旧音效 |
| `portraitWidthPercent` | 100 | 图片立绘宽度缩放比例 |
| `isStopTerraDialog` | false | 是否阻拦泰拉生物 NPC 对话 |

## 新增对话流程

1. 确定挂到现有段落还是新段落；新段落在 `dialogues` 中新增 key。
2. 台词按说话人配立绘：按剧本情绪严格映射已注册立绘（爱丽丝组件化 ID：`alice`/`alice_grin`/`alice_sullen`/`alice_close_eyes`/`alice_raise_eyebrow`/`alice_flowers`/`alice_confuse`/`alice_grin_eyebrow`；荷城河取 `hchq_1` 平常/`hchq_2` 元气/`hchq_think_1` 沉吟/`hchq_think_2` 严肃）；玩家台词按演出约定用 NOT_TALK 待机（爱丽丝不在场时 `[]`）。
3. 需要新立绘/新名牌时先在主题注册并放贴图。
4. 需要玩家交互时在段尾加 `options`，`click` 写发放物品或衔接命令；需要条件选项用 `isLock`+`unlockCommand`。
5. 需要游戏内入口时在 FTB Quests 任务命令中加 `/chatbox skip`，或 KubeJS 调 `ChatBoxUtil.serverSkipDialogues`。
6. 剧情保持线性结构，分支尽量压缩为单条确认/困惑选项。

## 验证清单

- [ ] JSON 合法（无尾逗号、引号闭合）：`Get-Content -Raw <文件> | ConvertFrom-Json`
- [ ] 对话 `theme` 与主题文件名对应（`skyfootspa:<文件名>`）
- [ ] 所有 `portrait` 引用的 ID 均已在主题 `portrait` 中注册
- [ ] 所有 `skyfootspa:` 贴图文件存在于 `kubejs/assets/skyfootspa/textures/`
- [ ] 选项 `next` 指向的段落存在；`click`/`command` 中 `@s` 指向玩家；多段指令用 `;` 分隔
- [ ] `unlockCommand` 以 `execute` 开头；`stayTick`/`maxTriggerCount` 语义正确
- [ ] 游戏内执行 `/chatbox skip skyfootspa:<文件> <段落>` 实测立绘、选项与命令（对话框按 F3 可开调试模式）
