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

- 对话：主线按“一个角色段一个文件”拆为六个文件（同属 `skyfootspa` 命名空间、统一 `story_` 前缀）：`story_alice.json`（主题 `alice_margatroid1`：`ch0_prologue` 序章、`ch1_alice`、`ch3_alice`、`ch3_alice_boss`）、`story_nitori.json`（`kawashiro_nitori1`：`ch1_nitori`、`ch1_nitori_boss`）、`story_reimu.json`（`hakurei_reimu1`：`ch1_reimu`、`ch1_reimu_boss`）、`story_rin.json`（`kaenbyou_rin1`：`ch2_rin`、`ch2_rin_boss`、`ch3_rin`）、`story_sanae.json`（`kochiya_sanae1`：`ch3_sanae`、`ch3_sanae_boss`）、`story_yuugi.json`（`hoshiguma_yuugi1`：`ch2_yuugi`、`ch2_yuugi_boss`）。段落命名规范 `ch<章节>_<角色>[_boss]` 按剧情时间序。**ChatBox 1.1.4 每翻一行都会把主题重置回文件级 theme（源码 ChatBoxUtil.skipDialogues），首行 `/chatbox theme` 只活一行且 toggleTheme 会清空当前行 name/text，故禁止在 story_* 文件内用行级切主题；专属对话框/立绘注册表必须由文件级主题承载**（曾合并单文件 story.json 导致对话框不随角色变化，已拆回）。`intro.json`/`intro_gal.json` 是模组自带 `test:` 命名空间示例，不要照抄其 theme。旧文件与旧 ID（start/hchq/hell_arc/story、chapter1..3/end_boss_seal_*/rin_visit/yuugi_visit）已废弃，FTB 任务命令已同步。
- 主题：正式用 `alice_margatroid1.json`；`kawashiro_nitori1.json` 为河取专用（对话框底图 `dialog_box_hchq.png`，其余与 alice 主题同值）；`hell_arc1.json` 为燐/永仪共用（对话框用默认 `dialog_box.png`，现无文件引用仅保留）；`hakurei_reimu1.json`（红框 `dialog_box_reimu.png`）、`kaenbyou_rin1.json`（浅黑框 `dialog_box_rin.png`）、`hoshiguma_yuugi1.json`（深黄框 `dialog_box_yuugi.png`）为角色专属色框主题（副本仅换底图），**由对应 story_* 对话文件的文件级 theme 承载**（不要用行级 command 切）；`alice_margatroid.json` 为旧版；`default.json`/`gal.json` 为字段参考示例。
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
- 演出约定（story_* 文件现行做法）：玩家说话时**当前在场角色**显示 `[{ "id": 上一表情, "animation": "NOT_TALK", "brightness": 70 }]` 压暗待机（爱丽丝/河取段落历史上用 `local/transform_player_lines.js`、`local/transform_nitori_lines.js` 套用）；灵梦段已手工套用 NOT_TALK，ch1_reimu_boss 无玩家行。角色说话 `TALK` 只播一次——进入说话状态的首句写 `TALK`，后续连续同角色行省略；`BOUNCE` 强调动画不受此限。
- `clearOldPortrait`（默认 true）：是否清除上一句立绘；设 `false` 保留，可用 `removePortrait: ["立绘ID"]` 手动移除指定立绘。
- `options`: 玩家选项数组：

```json
{ "text": "选项文本", "next": "段落ID或this",
  "click": {"type": "command", "value": "give @s marguerite:boss_seal_hchq"},
  "isLock": true, "unlockCommand": "execute if entity @s[nbt={...}]", "tooltip": "..." }
```

  `next` 规则：数字=跳当前分组对应序号；字符串=跳对应分组第一句；不填=下一句；`"this"`=留在当前句；负数=直接结束对话。
  `unlockCommand` 必须以 `execute` 开头（或写 mvel）：通过=可选；不通过时 `isLock: true` 显示上锁、否则直接隐藏选项。
  `click` 常用 `{"type": "command", "value": "..."}`，多段指令用 `;` 分隔，权限 2 级。
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

  其他：`player_head`（`texture: "@s"`=当前玩家）；`item`（`texture` 为物品 id，宽高无效用 `scale`，可配 `itemCount`/`hoverTexture`/`isLock`/`lockTexture`）；`entity`（生物实体渲染，`texture: "@s"` 或 `"target1"`，支持 `yOffset`/`stareAt`）。名牌立绘（`names`、`nitori_name`、`hakurei_reimu_name`、`rin_name`、`yuugi_name`）指向 `textures/names/`：0.1.4 起 name.png 与 dialog.png 同 512×256 画布（名字是盒左上吊 tab），名牌组件**与 dialogBox 组件完全同几何**（x3/y15/136×68/center/bottom/screen_height、无 scale、renderOrder 20）叠放在对话框上，全角色位置与大小完全一致；校验 `local/verify_014.py`。
- `option`: 选项按钮（`texture`/`selectTexture`/`lockTexture` 指向 `textures/options/`，另有 `optionChatX/optionChatY` 文本偏移、`textAlign`），默认 `hidden: true`，由 dialogBox 的 renderEvents 在台词结束时 `show @Options`。
- `dialogBox`: 对话框底图、`lineWidth`（**必填**，一行文本宽度=窗口宽度百分比）、`nameX/nameY/textX/textY`、`textAlign`。底图是**主题级（文件级）**：行级 `dialogBox` 仅覆盖 `name`/`text`；因每翻一行主题重置回文件级，换对话框的唯一稳妥做法是**拆独立对话文件+文件级主题**（现例：`story_nitori.json` + `kawashiro_nitori1`）；不要在行级 `command` 里 `/chatbox theme`（只活一行且清空当行文本）。
- `functionalButton`（数组）: `LOG`/`FASTFORWARD`/`AUTOPLAY` 按钮；**不配置则界面不显示按钮且对应功能不可用**；贴图指向 `textures/button/`。本项目几何：x25/28/31、y-1.5、center/bottom、**width=height=16/3≈5.3333**（0.1.4 换 16×16 新图后按用户要求缩小三分之一，旧值 8）、texture=默认图/hoverTexture=悬停图。
- `keyPrompt`: 按键提示，仅渲染层模式（`isScreen: false`）有用；`visible: false` 可阻止玩家自由跳转下一句。
- `customAnimation`: 自定义预设动画。本项目已定义 `FADE_IN`、`SLIDE_IN_FROM_BOTTOM`、`BOUNCE`、`TALK`（说话抖动）、`NOT_TALK`、`PAN_DOWN`，以及序章演出用 `HOP`（立绘跳动，快速小幅起落两次）、`SQUAT`（立绘蹲起，较缓下蹲一次）、`LOOK_AROUND`（立绘左顾右盼，绕中心左右探头）、`LOOK_AROUND_HOP`（左顾右盼接跳动）、`LINES_SHAKE`（白色放射线晃动，配 `loop: true`）。预设动画加载后**全局通用、名称区分大小写**，同名后加载覆盖先加载，建议用 `命名空间:名称` 防重名。

默认渲染顺序：对话框 0、选项 10、立绘 20、功能按钮 30、按键提示 40。右键隐藏对话框时只隐藏 `renderOrder` 大于对话框的立绘（据此区分背景立绘/前景立绘，本项目背景立绘用负值如 -10）。

## 贴图资源规则

- `texture` 值 `skyfootspa:textures/xxx.png` 对应文件 `kubejs/assets/skyfootspa/textures/xxx.png`；`chatbox:textures/...` 为模组自带（对话框底图、默认选项/按钮等），无需放置。
- 子目录：`portrait/`（立绘）、`names/`（名牌）、`options/`（选项）、`button/`（功能按钮）、`chatbox/`（对话框背景）。
- 新增立绘三步：PNG 放入 `textures/portrait/` → 主题 `portrait` 注册 ID → 对话行按情绪引用该 ID。
- 注意：主题中引用但文件缺失的立绘不会渲染；改文件名需同步主题 `texture` 字段，Windows/Git 大小写改名用中间名两步法。

## 组件化立绘（表情差分，attachment 叠放）

爱丽丝与河城荷取立绘套均用组件化套件 `c:/Users/ZhaoM/Pictures/pix_illust_0_1_2/`（`alice/`、`kawashiro/`、`reimu/`、`kaenbyou_rin/`），assets 按角色子目录存于 `textures/portrait/<char>/`：无脸底图 `illust.png` + 同尺寸同对齐组件（0.1.2 将所有图片从 200×400 统一至 **512×512**；角色保持原生像素尺寸，画布改方形并重新居中）。**统一用 attachment 运行时叠放**：立绘 texture=底图，每个表情=底图+`attachment` 组件数组（附件写与立绘同盒的 width/height 即精确对齐）；不做离线烘焙合图。512 方形画布后立绘盒由 1:2 改**方形**：统一 `width=height=75.52、scale=2`。ChatBox 1.1.4 先对齐未缩放画布，再绕中心缩放；`bottom` 的正 y 仍向下。旧三角色内容仅平移 (+156,+56)，因此保持画布的屏幕中心和每个源像素的渲染尺寸即可保持本体站位，不能按透明画布左缘或缩放后的底边直接补偿。

- 原 16:9 布局下统一 `x=-7.943125`；y：alice `33.26`、kawashiro `28.26`、reimu `29.76`、kaenbyou_rin `35.365`。猫燐本体按同一中心列摆放、脚底对齐灵梦，不按两侧骷髅怨灵的左缘对齐。
- 对旧三角色，`x_new = x_old - (75.52-29.5)/2 × 屏高/屏宽`，`y_new = y_old + (75.52-59)/2`。x 是屏宽百分比而 width 是屏高百分比，当前固定数值只对应原 16:9 布局；更换宽高比须重算 x，不能宣称任意窗口比例均无偏移。校验脚本 `local/measure_012.py` 使用迁移前实测 bbox 快照，不能将已覆盖的 assets 当旧素材。
- 主主题及对白 `command` 实际切换的专属主题必须同步：`alice_margatroid1`/`hakurei_reimu1`，`hell_arc1`/`kaenbyou_rin1`/`hoshiguma_yuugi1`。当前 53 个组件立绘及附件、三个正式对话文件引用均通过静态校验；尚未完成此次修改的游戏实测。

- 爱丽丝表情组合（attachment 顺序 brow→eye→mouth→special）：`alice` 平静=def/def/def；`alice_grin` 坏笑元气=mouth/smile；`alice_sullen` 沮丧=eye/lost_highlight；`alice_close_eyes` 闭眼微笑=eye/smile；`alice_raise_eyebrow` 挑眉=eyebow/up；`alice_grin_eyebrow` 坏笑+挑眉=eyebow/up+mouth/smile；`alice_confuse` 困惑=eyebow/default+mouth/default+special/confuse（**confuse 组件自带担忧眼+问号，不要另叠 eye/default**；flower 则只是花，需完整默认脸）；`alice_flowers` 花饰=def/def/def+special/flower（special/black_face 备用未用）。
- 映射定法：`local/preview_alice_new.py` 出全组合预览；新旧脸对比基准存 `local/alice_face_compare2.png`（旧套 grin=睁眼开口笑、close_eyes=闭眼+小嘴，新套按此对齐语义）。
- 改表情或新增组合：直接改主题 attachment 数组；新 ID 需在主题注册并在对话引用。历史烘焙脚本（`local/compose_alice_portraits_v2.py`/`compose_nitori_portraits.py`）已废弃，其单张烘焙产物（alice_*.png/hchq_*.png）保留但不再被引用。
- 旧整图立绘 ID（alice_hammer/alice_sad/alice_smile 等）已废弃，对话一律引用上述 ID。

## 河城荷取立绘（attachment 叠放）

河取立绘套源素材 `c:/Users/ZhaoM/Pictures/pix_illust_0_1_2/kawashiro/`（assets 同存 `textures/portrait/kawashiro/`）：无脸底图 `illust.png`（512×512）+ 组件 `eye/`（default 睁眼 / slit 闭眼弯眉 / lost_highlight 无高光冷峻）、`mouth/`（default 中性 / happy 开口笑）、`special/black_face`（阴沉，本段未用）。与爱丽丝同方案：立绘 texture=底图，表情用 attachment 数组叠放。

- 映射：`hchq_1` 平常=eye/default+mouth/default；`hchq_2` 元气=eye/default+mouth/happy；`hchq_think_1` 沉吟=eye/slit+mouth/default；`hchq_think_2` 严肃=eye/lost_highlight+mouth/default。
- 名牌 `names/name_kawashiro_nitori.png`（主题 ID `nitori_name`）已存在。
- 改表情或新增组合：直接改主题 attachment 数组；新 ID 需在主题注册并在对话引用。
- 四个 hchq 立绘同为方形盒 75.52×75.52/scale:2、x-7.943125/y28.26、renderOrder:10（原 16:9 布局）。中心补偿后，旧三角色在 scale 1/2/2.5/3 及 TALK/PAN_DOWN 偏移下的坐标数学校验一致，`PAN_DOWN` 原关键帧无需因居中扩画布而额外修改，实际演出仍需游戏确认；chapter2 在玩家问“你是？”后插了一条空白 PAN_DOWN 检视行（portrait `hchq_1` + replace:true，无 stayTick 手动推进），与爱丽丝序章运镜同款。
- 河取段落用独立文件 `story_nitori.json` + 独立主题 `kawashiro_nitori1`（对话框底图 `chatbox/dialog_box_hchq.png`，蓝边+向日葵角标）；历史拆分/合并/再拆分脚本 `local/split_hchq_dialogues.js`、`local/merge_story.py`、`local/split_story.py`。两主题 `customAnimation` 为同值副本（预设动画全局通用、同名后加载覆盖先加载），调 TALK/NOT_TALK/PAN_DOWN 时所有主题需同步改。

## 博丽灵梦立绘（attachment 叠放）

灵梦立绘套源素材 `c:/Users/ZhaoM/Pictures/pix_illust_0_1_2/reimu/`（assets 同存 `textures/portrait/reimu/`）：无脸底图 `illust.png`（512×512）+ 组件 `eye/`（default 睁眼 / half_closed 半闭 / half_closed_lost_highlight 半闭无高光 / lost_highlight 睁眼无高光）、`mouth/`（default 中性 / m_shape 撇嘴 / open 开口），无 eyebow/special。与爱丽丝同方案：立绘 texture=底图，表情用 attachment 数组叠放（附件同盒 75.52×75.52）。

- 映射：`reimu` 平静自信=eye/default+mouth/default；`reimu_open` 开口郑重=eye/default+mouth/open；`reimu_serious` 严肃=eye/lost_highlight+mouth/default；`reimu_think` 思索=eye/half_closed+mouth/default；`reimu_sigh` 无奈叹息=eye/half_closed_lost_highlight+mouth/default；`reimu_pout` 无语撇嘴=eye/half_closed+mouth/m_shape。
- 几何为方形盒 75.52×75.52/scale:2、x-7.943125/y29.76（原 16:9 布局，512 迁移后补偿中心）；renderOrder:10（前景，与 chapter3 现风格一致）。
- 名牌 `names/name_hakurei_reimu.png`（主题 ID `hakurei_reimu_name`）已存在，chapter3 自报家门句起挂载。
- 旧整图 `hakurei_reimu_potrait1/3` 已全段弃用（chapter3 与 end_boss_seal_reimu 均改引用组件 ID），主题注册保留不删。end_boss_seal_reimu 映射：你过关了=`reimu`(BOUNCE)/运营符合规范=`reimu_think`(TALK)/背书认证=`reimu_open`/警告与巡视=`reimu_serious`/省略号停顿=`reimu_sigh`/给钱傲娇=`reimu_pout`。chapter3 与 end_boss 台词以《第1章文案 第3稿》为准。
- 映射定法预览脚本：`local/preview_reimu.py`（全组合+三角色脚位对比）、`local/preview_reimu_face.py`（脸部放大）。

## 火焰猫燐立绘（attachment 叠放）

猫燐（猫车）立绘套源素材 `c:/Users/ZhaoM/Pictures/pix_illust_0_1_2/kaenbyou_rin/`（assets 同存 `textures/portrait/kaenbyou_rin/`）：无脸底图 `illust.png`（512×512，燐+骷髅怨灵）+ `eyebow/`（default/high 扬/low 垂）、`eye/`（default/jido_eyes 半睨/small_pupil 缩瞳）、`mouth/`（default/m_shaped 猫式坏笑/open 开朗/open_wide 大叫/embarrassed 窘笑）。

- 映射（attachment 顺序 brow→eye→mouth）：`rin` 平静=def/def/def；`rin_cheer` 开朗说话=def/def/open；`rin_smug` 猫式坏笑=def/def/m_shaped；`rin_panic` 惊慌大叫=high/small_pupil/open_wide；`rin_fluster` 慌乱窘迫=high/small_pupil/embarrassed；`rin_tired` 疲惫半睨=def/jido_eyes/def；`rin_shy` 困扰窘笑=low/def/embarrassed。
- 几何 x-7.943125/y35.365/75.52×75.52/scale:2/renderOrder:10（原 16:9 布局，画布中心列及脚位对齐 reimu；不以骷髅怨灵的左缘作为角色锚点）。
- story_rin.json ch2_rin 映射：招呼/传话=`rin_cheer`、喵语气 playful=`rin_smug`、自报家门被闻=`rin_fluster`、喵喵？！=`rin_panic`(BOUNCE)；ch2_rin_boss 惘然=`rin_tired`、职业窘=`rin_shy`、道歉=`rin_fluster`、赔礼=`rin_cheer`；ch2_yuugi_boss 尾声猫燐=`rin_smug`/`rin_cheer`。旧整图 `rin_1..4.png` 弃用但注册保留；星熊永仪组件见「星熊永仪立绘」节。
- 0.1.3 底图减少两侧骷髅怨灵（本体与脚底 bbox 不变，几何沿用）；部署与校验脚本 `local/update_chatbox_013.py`（audit/deploy/verify）。
- 0.1.4（assets_0_1_0.7z）新增每角色 `dialog.png`（对话框底图）与 `name.png`（对话框名称），均 512×256；已部署覆盖 `textures/chatbox/dialog_box_*.png` 与 `textures/names/*.png`（路径不变）。同包 `button_0_1_0`（16×16：log/skip/auto 各 default/hover/pressed）与 `option_0_1_0`（256×64：default/hover/lock）也已部署：按钮引用改为 `button/log.png|skip.png|auto.png` + `_hover`（顺带修正旧配置 default/hover 反接），fastForward 类型用 skip 图；选项 `texture=option_default`、`hoverTexture=selectTexture=option_hover`、`lockTexture=option_lock`。1.1.4 的 Portrait 仅支持 texture/hoverTexture/lockTexture/selectTexture，**pressed 图已部署但无字段引用**。审计脚本 `local/audit_014.py`。
- 预览脚本：`local/preview_rin.py`（脸部放大）。

## 星熊永仪立绘（attachment 叠放）

永仪立绘套源素材 0.1.3 新增（解压存 `local/assets_013/pix_illust_0_1_3/hoshiguma_yuugi/`，assets 同存 `textures/portrait/hoshiguma_yuugi/`）：无脸底图 `illust.png`（512×512）+ `eyebow/`（default/low 垂/v_shape 怒眉）、`eye/`（default/smile 闭眼笑/close 闭眼）、`mouth/`（default/open）。与爱丽丝同方案：立绘 texture=底图，表情用 attachment 数组叠放（附件同盒 75.52×75.52）。

- 映射（attachment 顺序 brow→eye→mouth）：`yuugi` 平静自信=def/def/def；`yuugi_open` 开口宣告=def/def/open；`yuugi_challenge` 怒眉挑衅=v_shape/def/open；`yuugi_laugh` 眯眼大笑=def/smile/open；`yuugi_impressed` 战后赞叹=low/def/open；`yuugi_satisfied` 满意闭眼=def/close/def。
- 几何 x-7.943125/y23.27/75.52×75.52/scale:2/renderOrder:10（与其他角色同画布中心列，原 16:9 布局）；脚底(px459)对齐灵梦脚底线。她 bbox 左缘是手持酒盏尖端，不能用于 x 补偿（曾按 bbox 中心右补偿 31 源像素导致游戏内偏右，已废弃）；本体锚点用眼组件中心(px242.5)，须落在其他角色脸部列区间内（`local/measure_columns.py` 可复测）。hell_arc1/kaenbyou_rin1/hoshiguma_yuugi1 三主题同步注册。
- story_yuugi.json ch2_yuugi 映射：开场/自报家门=`yuugi`、宣战与小的们上=`yuugi_challenge`、泡汤后大笑=`yuugi_laugh`、比拼宣告=`yuugi_open`；ch2_yuugi_boss 赞叹=`yuugi_impressed`、平局认可=`yuugi_satisfied`。旧整图 `yuugi_1..3.png` 弃用但注册保留。
- 表情预览：`local/assets_013/yuugi_expressions.png`（audit 子命令合成）。

## 东风谷早苗立绘（attachment 叠放，400 画布特例）

早苗立绘套源素材 `c:/Users/ZhaoM/Desktop/pix_illust_0_1_4/sanae/`（assets 同存 `textures/portrait/kochiya_sanae/`）：无脸底图 `illust.png` 与 `face/`（default 睁眼中性嘴 / smile 笑嘴 / sad 垂眼沮丧）均为 **400×400 同画布**（美工修正版）+ `dialog.png`/`name.png`（512×256，已部署 `dialog_box_sanae.png`/`name_kochiya_sanae.png`，主题 `kochiya_sanae1` 已指向）。

- 同画布叠放：父盒与附件盒同 59×59（400 画布保持与其他角色同源的 0.295%sh/px 像素比例）、scale:2、x/y=0 原本位置直接覆盖，不做任何平移（早期 512 画布 face 需 75.52 附件盒与平移的结论均已废弃）；部署脚本 `local/deploy_sanae.py`，预览 `local/assets_010/sanae_deploy_preview.png`。
- 几何 x-7.943125/y26.515/59×59/scale:2/renderOrder:10（脚底 px364 对齐灵梦脚底线）。
- 映射：`sanae`=face/default；`sanae_smile`=face/smile；`sanae_sad`=face/sad。??? 阶段（未自报家门）只挂立绘不挂名牌，自报家门句起挂 `sanae_name`。
- story_sanae.json 映射：ch3_sanae 惊叹/童工调侃/Plan B=`sanae_smile`、probing/STOP=`sanae`、被常识束缚沮丧=`sanae_sad`；ch3_sanae_boss 赞叹/释然=`sanae_smile`、内心独白=`sanae`。旧整图 `sanae_1`（400×400 AI 图）弃用但注册保留（sanae_sample.json 仍引用）。
- Boss：`boss_sanae.js`（召唤符 boss_seal_sanae，模型 kochiya_sanae）、`boss_alice.js`（boss_seal_alice，模型 alice_margatroid，第三章中期考核）。

## 第二章名牌与历史整图（AI 像素画管线）

永仪 0.1.3 前的 AI 整图已被组件套件替换；名牌 `names/name_kaenbyou_rin.png`、`name_hoshiguma_yuugi.png` 沿用，主题为第二章三主题。

- 生成管线：ImageGen 出横排表情组（同姿势同服装仅表情变，提示词按像素风规范追加后缀）→ `local/pixelate_ch2_sheets.py`：切格→连通域去白底（不吃白衬衫）→despeckle 去切格残噪（<12 网格像素连通块）→裁切降采样到 100×200 网格→量化 24 色去抗锯齿→最近邻 ×2 → 200×400。预览 `local/ch2_portrait_preview.png`。
- 名牌管线：`local/make_ch2_nameplates.py`：宋体奇数字大(角色色)/偶数字小(白)+柔影，文字块缩放对齐参考名牌 `name_kawashiro_nitori.png` 的 bbox（1890×236 画布、文字区约 435×135 偏左上），保证游戏内观感一致。预览 `local/ch2_nameplate_preview.png`。
- 表情映射（旧整图，已弃用仅保留注册）：`rin_1` 平静/`rin_2` 戏谑笑/`rin_3` 慌乱脸红/`rin_4` 疲惫半睁；`yuugi_1` 自信坏笑/`yuugi_2` 大笑/`yuugi_3` 惊讶。??? 阶段（未自报家门）只挂立绘不挂名牌。
- Boss 与召唤符：`startup_scripts/boss/boss_rin.js`、`boss_yuugi.js`、`boss_sanae.js`、`boss_alice.js`（镜像 boss_nitori.js）；autoCreateItem 物品名 = `marguerite:boss_seal_<id去boss_前缀>`（即 boss_seal_rin / boss_seal_yuugi / boss_seal_sanae / boss_seal_alice）。**历史断链已修**：hchq.json 曾给 `boss_seal_hchq` 但 Boss id 是 boss_nitori（实际物品 boss_seal_nitori），选项 click 给物前必须核对 bossRegister 日志里的 trigger=。
- 模型 id（TLM 日志确认）：`touhou_little_maid:kaenbyou_rin`、`touhou_little_maid:hoshiguma_yugi`（注意 yugi 非 yuugi）。
- 第二章四段落暂无 FTB 入口（任务书 9 条 chatbox 命令只到第一章）；手动实测用 `/chatbox skip skyfootspa:story_rin ch2_rin` 等；后续挂任务时同步本节。

## 命令与触发

| 命令 | 用途 |
|---|---|
| `/chatbox skip <命名空间:文件> <分组> [序号] [目标实体...]` | 跳转到对话。序号默认 0；目标实体供占位符 `<target1.name>` 等引用 |
| `/chatbox theme <命名空间:主题>` | 切换主题 |
| `/chatbox open` | 打开最近一次对话 |
| `/chatbox maxTriggerCount <路径> <次数>` | 限制访问次数（-1 无限，0 禁止）；`reset` 重置 |
| `/chatbox command nextDialogue` / `autoPlay <bool>` / `isScreen <bool>` | 跳下一句 / 自动播放开关 / 屏幕模式开关 |
| `/chatbox mvelTest <表达式> <是否服务端>` | 调试 mvel，结果发给玩家 |

- 剧情入口挂在 FTB Quests 任务命令里（`config/ftbquests/quests/chapters/*.snbt` 中 `command: "/chatbox skip skyfootspa:story_<角色> <段落ID>"`），Boss 结算段通过选项 `click` 命令衔接（如发放物品）。
- KubeJS 服务端也可直接调用 `ChatBoxUtil.serverSkipDialogues(player, 'skyfootspa:story_alice', 'ch0_prologue', [])`。

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
2. 台词按说话人配立绘：按剧本情绪严格映射已注册立绘（爱丽丝组件化 ID：`alice`/`alice_grin`/`alice_sullen`/`alice_close_eyes`/`alice_raise_eyebrow`/`alice_flowers`/`alice_confuse`/`alice_grin_eyebrow`，符号组合 `alice_grin_angry`（坏笑+愤怒青筋）/`alice_close_eyes_sweat`（闭眼+汗滴）/`alice_close_eyes_angry`（闭眼+愤怒青筋），全屏背景层 `speed_lines`（白色放射线，renderOrder -100，需逐句显式挂载、`clearOldPortrait` 默认会清掉）；荷城河取 `hchq_1` 平常/`hchq_2` 元气/`hchq_think_1` 沉吟/`hchq_think_2` 严肃；灵梦 `reimu`/`reimu_open`/`reimu_serious`/`reimu_think`/`reimu_sigh`/`reimu_pout` 见「博丽灵梦立绘」节；猫燐 `rin`/`rin_cheer`/`rin_smug`/`rin_panic`/`rin_fluster`/`rin_tired`/`rin_shy`、永仪 `yuugi`/`yuugi_open`/`yuugi_challenge`/`yuugi_laugh`/`yuugi_impressed`/`yuugi_satisfied` 见下节）；玩家台词按演出约定用当前在场角色 NOT_TALK+b70 待机（未套用约定的段落用 `[]`）。
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
