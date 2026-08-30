# ChatBox 字段级参考（基于官方文档 1.1.4）

文档源：https://doc.mafuyu.moe/wiki/ChatBox （原始 Markdown：`https://doc.mafuyu.moe/md/chatbox/zh-CN/<页面>.md`）。
字段要求分三级：**必填**（不填可能崩溃）、**建议填**、**可选**（有默认值）。

## 1. 组件通用基础参数（所有组件通用）

| 字段 | 含义 / 默认值 |
|---|---|
| `x` / `y` | 坐标，相对窗口宽/高百分比，0=左/上，100=右/下，可为负 |
| `width` / `height` | 宽/高，单位由 `widthReference`/`heightReference` 决定 |
| `widthReference` / `heightReference` | 默认 `screen_width`/`screen_height`；可选 `pixel`（绝对像素，不建议） |
| `scale` | 缩放，默认 1，以组件中心为基准 |
| `alignX` | 默认 `left`；可选 `left`/`center`/`right` |
| `alignY` | 默认 `top`；可选 `top`/`center`/`bottom` |
| `renderOrder` | 图层，值越大越上层；各组件默认值不同 |
| `brightness` / `opacity` | 亮度/不透明度，默认 100（0-100） |
| `angle` | 旋转，默认 0，中心为基准顺时针 |
| `hidden` | 默认 false，配合渲染事件使用 |
| `renderEvents` | 组件渲染事件数组 |

若组件附带渲染文本，`scale/brightness/opacity/angle` 也影响文本渲染。枚举字符串参数无视大小写。

## 2. 主题立绘 `portrait` 字段

| 字段 | 要求 | 说明 |
|---|---|---|
| `type` | 可选，默认 `texture` | `texture` 资源包图片 / `player_head` 玩家头像 / `item` 物品纹理 / `entity` 生物实体渲染 |
| `texture` | **必填** | texture=图片路径；player_head=玩家名/UUID 或 `@s`；item=物品 id；entity=生物（`@s`、`target1`…） |
| `hoverTexture` | 可选 | 鼠标悬停材质 |
| `isLock` / `lockTexture` | 可选 | 锁定状态与锁定材质，建议搭配 `renderEvents` 解锁 |
| `attachment` | 可选 | 渲染附件数组（见 §6） |
| `itemCount` | 可选，默认 1 | 仅 `item` 类型有效 |
| `customItemData` | 可选 | 物品 CustomModelData，仅 `item`，1.21.2+ 弃用 |
| `renderOrder` | 可选 | 立绘默认 20 |
| `animation` | 可选 | 预设动画名。内置：`FADE_IN`/`SLIDE_IN_FROM_BOTTOM`/`BOUNCE`；也可填主题 `customAnimation` 名称 |
| `customAnimation` | 可选 | 关键帧数组（见 §7），与 `animation` 同填时仅它生效 |
| `loop` | 可选，默认 false | 动画循环播放 |

- 玩家头像边长 = width×屏幕宽 + height×屏幕高（宽高默认 10）。
- 物品纹理宽高参数无效，实际渲染 16×16 像素，用 `scale` 调整。

**`entity` 类型专属字段**（其他参数无效）：

| 字段 | 说明 |
|---|---|
| `texture` | **必填**，必须是生物；`@s`=玩家，`target1`/`target2`…=目标实体（需 `/chatbox skip` 传入足够目标） |
| `width` / `height` | 建议填，单位像素，限制渲染区域 |
| `yOffset` | 垂直偏移（只渲染上半身可设正值下移） |
| `stareAt` | `mouse`（仅屏幕模式）/`point`/不填（看正前方） |
| `stareAtX` / `stareAtY` | `stareAt: "point"` 时的注视点（百分比） |

## 3. 主题其他组件字段

### `option`（选项按钮）

| 字段 | 要求 | 说明 |
|---|---|---|
| `texture` / `hoverTexture` / `lockTexture` | 建议填 | 默认/悬停/上锁贴图（本项目也支持 `selectTexture` 写法） |
| `optionChatX` / `optionChatY` | 可选，默认 0 | 选项文本水平/垂直偏移 |
| `textAlign` | 可选，默认左 | `LEFT/CENTER/RIGHT` |
| `renderOrder` | 可选 | 默认 10 |

### `dialogBox`（对话框）

| 字段 | 要求 | 说明 |
|---|---|---|
| `texture` | 建议填 | 对话框贴图 |
| `lineWidth` | **必填** | 一行文本宽度，窗口宽度百分比 |
| `nameX` / `nameY` | 可选，默认 0 | 名称距左边框/贴图上边框位置 |
| `textX` / `textY` | 可选，默认 0 | 文本距左边框/贴图上边框位置 |
| `textAlign` | 可选，默认左 | 同时影响名称和文本 |
| `renderOrder` | 可选 | 默认 0 |

### `functionalButton`（数组）

| 字段 | 要求 | 说明 |
|---|---|---|
| `type` | **必填** | `LOG` 历史记录 / `FASTFORWARD` 快进 / `AUTOPLAY` 自动播放 |
| `texture` / `hoverTexture` | 建议填 | 贴图 / 悬浮或激活时贴图 |
| `renderOrder` | 可选 | 默认 30 |

自动播放：有 `sound`（语音）时语音播完 1 秒后下一句；否则文本显示完 `autoPlayTick`（默认 20 刻）后下一句。

### `keyPrompt`（仅 `isScreen: false` 渲染层模式有用）

`visible`（默认 true，隐藏后玩家无法直接跳转下一句）、`mouseTextureWidth/Height`（默认 16 像素）、`rightClickTexture`、`scrollTexture`、`renderOrder`（默认 40）。

### 模组自带贴图清单

- 对话框：`chatbox:textures/chatbox/default_dialog_box.png`、`gal_dialog_box.png`
- 选项：`chatbox:textures/options/default_checked_option.png`、`default_lock_checked_option.png`、`default_no_checked_option.png`、`gal_checked_option.png`、`gal_no_checked_option.png`
- 按钮：`chatbox:textures/button/default_log.png`、`default_hover_log.png`、`default_fastforward.png`、`default_hover_fastforward.png`、`default_autoplay.png`、`default_hover_autoplay.png`

## 4. 对话文件级字段

| 字段 | 要求 | 说明 |
|---|---|---|
| `$introduce` | 可选 | 纯装饰注释 |
| `dialogues` | **必填** | 键=分组唯一标识，值=对话数组 |
| `animationFPS` | 可选，默认 60 | 立绘动画帧率，设备低于 60 时按实际帧率 |
| `autoPlayTick` | 可选，默认 20 | 自动播放下一句延迟（游戏刻） |
| `isEsc` | 可选，默认 true | Esc 可否关闭对话框 |
| `isPause` | 可选，默认 true | 单人打开对话框是否暂停 |
| `isHistoricalSkip` | 可选，默认 true | 历史记录可否回溯 |
| `maxTriggerCount` | 可选，默认 -1 | 可触发次数，0=无法访问 |
| `isScreen` | 可选，默认 true | 屏幕模式 / 渲染层模式 |
| `theme` | 可选 | 进入对话自动切换的主题 |
| `criteria` | 可选 | 原版进度格式触发器 |

## 5. 单句对话字段

| 字段 | 要求 | 说明 |
|---|---|---|
| `renderEvents` | 可选 | 仅进入该句时触发（仅 `on_start` 时机有效） |
| `dialogBox.name` / `dialogBox.text` | 可选 | 说话者 / 台词（支持翻译键、§ 格式码、占位符、`<<MVEL>>`） |
| `portrait` | 可选 | 字符串=主题预设 ID；对象=覆盖预设（`id`=基础立绘，`replace: true`=先移除所有同名立绘） |
| `clearOldPortrait` | 可选，默认 true | 是否清除上一句立绘 |
| `removePortrait` | 可选 | 不清除时手动指定要移除的立绘标识符数组 |
| `options` | 可选 | 选项数组 |
| `sound` | 可选 | 音效路径 |
| `bgm` | 可选 | BGM：有值则循环播放；连续相同值不重播；`""`=停止；不写不操作 |
| `stayTick` | 默认 0 | 强制停留刻数；负数=永远无法手动跳转（不影响选项） |
| `command` | 可选 | 到达该句执行指令，`;` 分隔，权限 2 级 |
| `backgroundImage` | 可选 | 背景图片路径（无额外参数；动画背景需做成立绘） |
| `video` | 可选 | 需 WATERMeDIA 2.x（**勿用 3.x**）：`path`（相对游戏根目录，安装目录不能含中文）、`canControl`（默认 true）、`canSkip`（默认 true）、`loop`（默认 false）、`x/y/width/height/alignX/alignY` |

### 选项字段

| 字段 | 要求 | 说明 |
|---|---|---|
| `text` | **必填** | 选项文本 |
| `isLock` | 可选，默认 false | 上锁显示 `lockTexture` |
| `unlockCommand` | 可选 | 指令须 `execute` 开头（或 mvel）；通过=可选；不通过时 `isLock: true` 上锁、否则**隐藏** |
| `next` | 可选 | 数字=当前分组序号；字符串=分组第一句；不填=下一句；`this`=留在当前；负数=结束对话 |
| `click` | 可选 | `{"type": "command", "value": "指令;指令"}`（权限 2 级）；更多 type 见渲染事件；另有 `TERRA_ENTITY_SHOP` |
| `tooltip` | 可选 | 悬浮提示 |

隐藏机制区别：`hidden: true` 是客户端渲染层隐藏（渲染事件可恢复）；`unlockCommand` 不通过是服务端隐藏，仅 `set_normal` 可恢复。

## 6. 渲染附件 `attachment`

立绘配置项，附件与立绘形成整体、动画时一起动。

| 字段 | 说明 |
|---|---|
| `type` | `texture`（图片）/ `text`（文本），与立绘自身 `type` 无关 |
| `x` / `y` | 相对立绘的偏移（窗口百分比），默认 0 |
| `value` | texture=图片路径；text=文本内容 |
| `width` | text 的行宽，影响换行与对齐 |
| `textAlign` | text 专属，默认 `left`，需 `width>0` |
| `lineBreak` | text 专属，默认 false，需 `width>0` |
| `textColor` | text 专属，默认 -1（白色），ARGB |

## 7. 动画关键帧

关键帧数组，逐帧参数：

| 字段 | 说明 |
|---|---|
| `time` | 默认 1，该关键帧总帧数（60FPS 时 time=60 约 1 秒） |
| `easing` | 缓动函数（30 种，见下） |
| `x`/`y`/`scale`/`brightness`/`opacity`/`angle` | 目标值，期间按缓动渐变 |
| `xOffset`/`yOffset` | 相对原坐标偏移（`yOffset: -5` 上移 5 单位） |
| `texture` / `attachment` | 在关键帧**结束时**才改变 |

未写的字段值保持不变。三种配置方法：① 主题 `customAnimation` 命名预设 + 立绘 `animation` 引用；② 立绘直接写 `customAnimation` 关键帧数组；③ 对话行覆盖立绘时换动画（本质同②）。

预设动画不与主题绑定、加载后全局通用、名称区分大小写、同名后加载覆盖先加载（建议 `命名空间:名称`）。

30 种缓动函数：`EASE_IN_SINE, EASE_OUT_SINE, EASE_IN_OUT_SINE, EASE_IN_QUAD, EASE_OUT_QUAD, EASE_IN_OUT_QUAD, EASE_IN_CUBIC, EASE_OUT_CUBIC, EASE_IN_OUT_CUBIC, EASE_IN_QUART, EASE_OUT_QUART, EASE_IN_OUT_QUART, EASE_IN_QUINT, EASE_OUT_QUINT, EASE_IN_OUT_QUINT, EASE_IN_EXPO, EASE_OUT_EXPO, EASE_IN_OUT_EXPO, EASE_IN_CIRC, EASE_OUT_CIRC, EASE_IN_OUT_CIRC, EASE_IN_BACK, EASE_OUT_BACK, EASE_IN_OUT_BACK, EASE_IN_ELASTIC, EASE_OUT_ELASTIC, EASE_IN_OUT_ELASTIC, EASE_IN_BOUNCE, EASE_OUT_BOUNCE, EASE_IN_OUT_BOUNCE`。

## 8. 组件渲染事件 `renderEvents`

每项 4 字段：`trigger`、`condition`、`type`、`value`。

### trigger

| 时机 | 说明 |
|---|---|
| `on_start`（`start`） | 组件渲染开始 / 跳转对话时 |
| `on_end`（`end`） | dialogBox=文本显示完；portrait=动画结束（不循环）；video=播完（不循环）；其他组件无 |
| `tick` | 对话框打开期间每 tick；客户端 mvel 可用 `chatboxTick` |
| `check` | 进入对话必触发一次（不论锁定/隐藏），常配 `set_normal` |
| `on_click`（`click`） | 仅立绘：被点击（重叠时最上层） |
| `on_mouse_over` / `on_mouse_out` | 仅立绘：鼠标移入/移出 |

### condition

留空=无条件；默认客户端执行 mvel；`execute` 开头=服务端命令；`server:` 开头=服务端 mvel。

### type

| type | value |
|---|---|
| `command` | 服务端指令（无需 `/`） |
| `mvel` | mvel 代码，`server:` 开头则服务端执行 |
| `jump` | 强制跳转：不填=下一句；数字=索引；组名=该组第一句；`this`=留在当前；负数=结束 |
| `goto_next` | 下一句（有选项时无效），无参数 |
| `play_sound` / `play_voice` / `stop_sound` | 音效 id；语音进入下一句停止 |
| `hide` / `show` / `replace` / `lock` / `unlock` / `set_normal` | 组件目标，`;` 分隔；`@` 前缀=全体：`@s`、`@portraits`、`@options`/`@Options`、`@buttons`、`@dialog`、`@video` |
| `set_autoplay` | `true`/`false` |
| `scale` | 缩放比例（float） |
| `play_animation` | 只能填主题预设动画名 |
| `restart_animation` | 重播立绘动画（循环动画无效），无参数 |

要点：

- 被 `hide` 或 `hidden: true` 隐藏的组件不渲染、不可交互，无法触发除 `tick`/`check` 外的事件。
- 立绘必须在当前对话 `portrait` 数组提及（或从之前对话保留），事件无法新增立绘。
- 选项本质=自带便捷参数的立绘；选项点击=触发时机 `click` 的渲染事件；选项跳转=`jump`；`unlockCommand` 等价于 `trigger: check` + 条件 + `set_normal @s`。
- KubeJS 可注册自定义 type（见 SKILL.md「KubeJS 联动」）。

## 9. 占位符

| 占位符 | 说明 |
|---|---|
| `@s` | 当前玩家 id；`@@s` 输出字面 `@s` |
| `<targetN.name>` / `<targetN.uuid>` / `<targetN.tags>` / `<targetN.health>` | 第 N 个目标实体属性（N 从 1 起）；只写 `<targetN>`=名称；无目标时保持原样 |
| `<ruby (字符数) (注音)>` | 注音，如 `茕茕孑<ruby 1 lì>立` |
| `<<MVEL代码>>` | 台词内嵌 mvel 表达式，需有返回值 |

KubeJS 自定义占位符解析器：

```javascript
// server_script
let LivingEntity = Java.loadClass("net.minecraft.world.entity.LivingEntity")
ChatBoxUtil.addPlaceholderResolver("effects", (entity) => {
    if (entity instanceof LivingEntity) return entity.getActiveEffects().toString()
    return "[]"
})
```

## 10. MVEL 完整参考

变量操作：`hasVar('名')`、`setVar('名', 值)`、`setVarIfNoDef('名', 值)`、`removeVar('名')`。自定义变量客户端/服务端全局持久，不主动删除不消失。

### 预定义变量

| 变量 | 类型 | 环境 |
|---|---|---|
| `random` | Random | 始终 |
| `player` | Player | 提供玩家时 |
| `gameTime` | long | 提供玩家时 |
| `chatbox` | ChatBoxUtil 类 | 客户端 |
| `chatboxScreen` | ChatBoxScreen | 客户端 |
| `chatboxTick` | int | 客户端 |
| `targets` | List\<Entity\> | 双端 |
| `_this` | Object（组件事件时=组件本身） | 提供时 |

### 动态属性（可用 `ChatBoxUtil.addMvelProperty` 在启动脚本扩展）

`name`（实体/物品）、`id`（注册 ID）、`count`（物品堆）、`uuid`、`tags`、`health`、`experienceLevel`、`foodLevel`、`x/y/z`、`mainHandItem`、`offHandItem`。

### 动态方法

| 方法 | 说明 |
|---|---|
| `hasItem(player, 'id')` | 是否拥有至少一个 |
| `getItemCount(player, 'id')` | 总数（含背包/盔甲/副手） |
| `getItemBySlot(实体, 'chest'/'head'/'legs'/'feet' 或 0~40 索引)` | 取槽位物品（0~35 主背包，36~39 盔甲，40 副手） |
| `getScore(player, 'objective')` | 计分板分数（客户端只能取展示的） |
| `hasTag(实体, 'tag')` | 实体标签（客户端一般取不到，加入对话目标列表后可） |
| `hasAdvancement(player, '进度名')` | 是否达成进度（客户端只能查本人） |
| `tell(player, '消息', true?)` | 发消息，第二参数 true=动作栏 |
| `getEnchantLevel(物品, 'id')` / `enchant(物品, 'id', 等级)` | 附魔等级 / 加附魔（需服务端） |

两种写法均可：`hasItem(player, 'diamond')` 或 `player.hasItem('diamond')`。

表达式示例：

```
player.mainHandItem.id == 'minecraft:diamond_sword' && player.experienceLevel >= 10
player.hasTag('vip') || player.getItemCount('golden_apple') >= 5
for (t : targets) { t.tell('Hello ' + t.name, true) }
```

调试命令：`/chatbox mvelTest <表达式> <是否服务端>`，结果发给玩家（其他 mvel 场景出错不输出，看日志）。

## 11. KubeJS 联动 API（1.20.1 Forge / 1.21.1 NeoForge）

```javascript
// client_script：渲染前（可取消）/渲染后
ChatBoxEvents.renderPre(event => { let g = event.getGuiGraphics(); event.cancel() })
ChatBoxEvents.renderPost(event => {})

// 双端：跳转对话或关闭对话（关闭时 index === -1）
ChatBoxEvents.skipChat(event => {
    let { player, resourceLocation, group, index, targets } = event
})

// server_script：注册自定义渲染事件 type
ServerEvents.loaded(event => {
    ChatBoxUtil.registerComponentEvent('类型名',
        (component, value) => {},   // 客户端动作（component 可能为空）
        true,                        // 是否需服务端执行
        (player, value) => {         // 服务端动作
            let targets = ChatBoxUtil.serverGetChatTargets(player) // 当前对话目标实体列表
        })
})

// server_script：直接打开对话
ChatBoxUtil.serverSkipDialogues(player, 'skyfootspa:start', 'start', [])
```

## 12. 隐藏按键与调试（屏幕模式）

| 界面 | 按键 | 功能 |
|---|---|---|
| 对话框 | Ctrl（mac=Cmd） | 快进（若可快进） |
| 对话框 | 滚轮向下 | 同左键点击 |
| 对话框 | 滚轮向上 | 打开历史记录 |
| 对话框 | 右键 | 隐藏/展示对话框（含选项、对话框之上的立绘、功能按钮） |
| 历史记录 | 右键 | 关闭历史记录返回对话 |
| 对话框 | F3 | 调试模式 |

对话框、选项、功能按钮本质都是立绘（可配动画和附件）；选项和对话框文本渲染借用附件实现。
