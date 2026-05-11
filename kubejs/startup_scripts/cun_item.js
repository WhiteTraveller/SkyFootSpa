// priority: 5
// ============================================================
// "皴" 物品注册
// ------------------------------------------------------------
// 用途：搓脚副产物。每次搓脚（有效点击）会掉落若干个。
// 合成：9 个皴 → 1 个泥土（见 server_scripts/recipes_cun.js）。
// 掉落数量：由 global.pfCunDrop.getDropCount 动态控制（见
//           server_scripts/pathfinder/pfCunDrop.js），后期可接入
//           玩家属性 / Boss / 遗物等条件提高产出。
// ============================================================

StartupEvents.registry("item", event => {
    try {
        let builder = event.create("marguerite:cun")
            .displayName("§f皴")
            .maxStackSize(64)
            .tooltip("§7搓脚产物")
            .tooltip("§8九个皴可合成一个泥土")
        try { builder.rarity("common") } catch (e) {}
        try { builder.texture("minecraft:item/dried_kelp") } catch (e) {}
        console.log("[CUN] 已注册物品: marguerite:cun")
    } catch (e) {
        console.log("[CUN] 物品注册失败: " + e)
    }
})
