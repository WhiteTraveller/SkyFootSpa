// priority: 5
// ============================================================
// "草灰" 物品注册
// ------------------------------------------------------------
// 用途：草灰水（grass_ash_water）的搅拌机原料。
// 获取：草 / 高草 / 蕨 / 高蕨 熔炉熔炼（见 server_scripts/recipes/recipes_grass_ash.js）。
// 材质：复用原版火药贴图 minecraft:item/gunpowder。
// ============================================================

StartupEvents.registry("item", event => {
    try {
        let builder = event.create("marguerite:grass_ash")
            .displayName("§8草灰")
            .maxStackSize(64)
            .tooltip("§7烧草所得")
            .tooltip("§8用于搅拌草灰水")
            .texture("minecraft:item/gunpowder")
        try { builder.rarity("common") } catch (e) { }
        console.log("[GRASS-ASH] 已注册物品: marguerite:grass_ash")
    } catch (e) {
        console.log("[GRASS-ASH] 物品注册失败: " + e)
    }
})
