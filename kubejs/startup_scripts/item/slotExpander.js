// priority: 5
// ============================================================
// 栏位扩大器 mk1~mk5 物品注册
// ------------------------------------------------------------
// 用途：作为"卸下背包镶板"的凭证消耗品。
//   mk1 扩大器 → 卸下 mk1 镶板（marguerite:backpack_space_mk1）
//   mk2 扩大器 → 卸下 mk2 镶板，依此类推。
// 实际卸下消耗逻辑在 relicBackpackSpace.js 的 onUnEquip 中。
// ============================================================

let EXPANDER_TEXTURES = {
    1: "mekanism:item/basic_control_circuit",
    2: "mekanism:item/advanced_control_circuit",
    3: "mekanism:item/elite_control_circuit",
    4: "mekanism:item/ultimate_control_circuit",
    5: "mekanism:item/ultimate_control_circuit"
}

StartupEvents.registry("item", event => {
    for (let lv = 1; lv <= 5; lv++) {
        try {
            let id = "marguerite:slot_expander_mk" + lv
            let builder = event.create(id)
                .displayName("§f栏位扩大器 MK" + lv)
                .maxStackSize(64)
                .tooltip("§7用于卸下对应等级的背包镶板")
                .tooltip("§8放入背包后即可卸下 MK" + lv + " 镶板，每次消耗 1 个")
                .texture(EXPANDER_TEXTURES[lv])
            try { builder.rarity("common") } catch (e) {}
            console.log("[SLOT-EXPANDER] 已注册物品: " + id)
        } catch (e) {
            console.log("[SLOT-EXPANDER] mk" + lv + " 注册失败: " + e)
        }
    }
})
