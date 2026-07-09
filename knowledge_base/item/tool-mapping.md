# 工具类物品与玩法映射

## 搓脚手

源码：`kubejs/startup_scripts/item/hand_items.js`

4 个物品对应 4 个部位：

- `marguerite:hand_jiaozhang` 搓脚掌
- `marguerite:hand_jiaoxin`   搓脚心
- `marguerite:hand_jiaogen`   搓脚跟
- `marguerite:hand_jiaozhi`   搓脚趾

每个手物品通过 `.texture("kubejs:item/hand_xxx")` 指定独立贴图。

## 筋膜枪头与有头筋膜枪

源码：`kubejs/startup_scripts/item/fascia_gun.js`

- 无头筋膜枪：`marguerite:fascia_gun`
- 4 个头：`marguerite:fascia_gun_head_<part>`
- 4 个头安装后的有头筋膜枪：`marguerite:fascia_gun_<part>`

全局映射见 `capability-items.md`。

## 栏位扩大器

源码：`kubejs/startup_scripts/item/slotExpander.js`

- `marguerite:slot_expander_mk1` ~ `mk5`
- 用途：作为卸下对应等级背包镶板的凭证消耗品。
- 贴图按等级区分：铜 / 铁 / 金 / 钻石 / 紫水晶。
