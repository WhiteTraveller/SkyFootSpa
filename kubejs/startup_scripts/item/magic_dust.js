// priority: 5
// ============================================================
// 魔力粉物品注册
// ------------------------------------------------------------
// 用途：第二章洗脚水处理线的最终产物
// 获取：植物油-魔力悬浊液 在 Create 动力搅拌机中离心分离
// ============================================================

StartupEvents.registry("item", event => {
    try {
        let builder = event.create("marguerite:magic_dust")
            .displayName("§d魔力粉")
            .maxStackSize(64)
            .tooltip("§7从富魔洗脚水中提取的魔力结晶")
            .tooltip("§8第二章产线的最终产物")
        try { builder.rarity("uncommon") } catch (e) { }
        console.log("[MAGIC-DUST] 已注册物品: marguerite:magic_dust")
    } catch (e) {
        console.log("[MAGIC-DUST] 物品注册失败: " + e)
    }
})
