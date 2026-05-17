// priority: 9
// 背包镶板 mk1~mk5：占据 curios:package 槽位形成"虚拟空白"
// 卸下条件：玩家背包中存在对应等级的"栏位扩大器 mkN"，卸下时消耗 1 个

let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

// mk 等级 → 镶板贴图（统一沿用原 backpack_space 材质）
let SPACE_TEXTURE = "marguerite:item/backpack_space"

function registerSpacePanel(level) {
    let expanderId = "marguerite:slot_expander_mk" + level
    global.relicRegister.register(relic => {
        relic.setName("backpack_space_mk" + level)
            .setNameZH("背包镶板 MK" + level)
            .setDescription(Text.gray("无效果"))
            .setSpecialDescription(Text.gray("使用 MK" + level + " 栏位扩大器取下"))
            .setStory("占据背包空间的 MK" + level + " 镶板，可用对应等级的栏位扩大器取下。")
            .setTexture(SPACE_TEXTURE)
            .setOnUnEquip((slotContext, oldStack, newStack) => {
                global.updatePlayerBackpack(slotContext.entity())
                let player1 = slotContext.entity()
                if (player1.isPlayer()) {
                    let items = player1.getInventory().getAllItems()
                    for (let item of items) {
                        if (item.id !== null && item.id == expanderId) {
                            item.setCount(item.getCount() - 1)
                            break
                        }
                    }
                }
            })
            .setCanUnEquip((slotContext, stack) => {
                let player1 = slotContext.entity()
                if (player1.isPlayer()) {
                    let items = player1.getInventory().getAllItems()
                    for (let item of items) {
                        if (item.id !== null && item.id == expanderId) {
                            return true
                        }
                    }
                    // 缺少对应扩大器，actionbar 提示（节流：每 40 tick 一次，避免刷屏）
                    try {
                        let now = player1.getLevel().getGameTime()
                        let lastKey = "pfSpaceTipLast_mk" + level
                        let last = player1.persistentData.getLong(lastKey)
                        if (now - last >= 40) {
                            player1.persistentData.putLong(lastKey, now)
                            player1.displayClientMessage(
                                Text.red("需要 MK" + level + " 栏位扩大器才能取下此镶板"),
                                true
                            )
                        }
                    } catch (e) {}
                }
                return false
            })
            .setPool(global.relicPool.space)
    })
}

for (let lv = 1; lv <= 5; lv++) {
    registerSpacePanel(lv)
}
