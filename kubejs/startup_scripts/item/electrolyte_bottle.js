// priority: 5
// ============================================================
// 电解质水瓶物品注册（marguerite:electrolyte_bottle）
// ------------------------------------------------------------
// 效果：恢复 500 体力，无使用冷却
// 获取：Create 注液器 250mb 电解质水 + 玻璃瓶（配方在 server_scripts/recipes/recipes_electrolyte.js）
// 右键饮用逻辑：server_scripts/electrolyte_bottle.js
// ============================================================

global.ELECTROLYTE_BOTTLE = {
    id: "marguerite:electrolyte_bottle",
    stamina: 500
}

StartupEvents.registry("item", event => {
    try {
        let builder = event.create("marguerite:electrolyte_bottle")
            .displayName("§b电解质水瓶")
            .maxStackSize(16)
            .tooltip("§7饮用恢复 §a500 §7体力值")
            .tooltip("§7无使用冷却")
            .texture("minecraft:item/potion")
        try { builder.rarity("uncommon") } catch (e) { }
        console.log("[ELECTROLYTE] 已注册物品: marguerite:electrolyte_bottle (+500 体力, 无CD)")
    } catch (e) {
        console.log("[ELECTROLYTE] 物品注册失败: " + e)
    }
})
