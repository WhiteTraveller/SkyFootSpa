// priority: 5
// ============================================================
// 搓脚手物品注册
// ------------------------------------------------------------
// 4 种"手"物品，玩家手持不同的手右键脚图片 = 搓不同部位
//   - marguerite:hand_jiaozhang  搓脚掌的手
//   - marguerite:hand_jiaoxin    搓脚心的手
//   - marguerite:hand_jiaogen    搓脚跟的手
//   - marguerite:hand_jiaozhi    搓脚趾的手
// ============================================================

StartupEvents.registry("item", event => {
    let hands = [
        { id: "marguerite:hand_jiaozhang", name: "§e搓脚掌的手", tip: "§7右键脚 → 搓脚掌", tex: "kubejs:item/hand_jiaozhang" },
        { id: "marguerite:hand_jiaoxin",   name: "§d搓脚心的手", tip: "§7右键脚 → 搓脚心", tex: "kubejs:item/hand_jiaoxin" },
        { id: "marguerite:hand_jiaogen",   name: "§a搓脚跟的手", tip: "§7右键脚 → 搓脚跟", tex: "kubejs:item/hand_jiaogen" },
        { id: "marguerite:hand_jiaozhi",   name: "§b搓脚趾的手", tip: "§7右键脚 → 搓脚趾", tex: "kubejs:item/hand_jiaozhi" }
    ]

    for (let i = 0; i < hands.length; i++) {
        let h = hands[i]
        try {
            event.create(h.id)
                .displayName(h.name)
                .maxStackSize(1)
                .tooltip(h.tip)
                .texture(h.tex)
            console.log("[HAND] 注册物品: " + h.id)
        } catch (e) {
            console.log("[HAND] 注册失败: " + h.id + " -> " + e)
        }
    }
})
