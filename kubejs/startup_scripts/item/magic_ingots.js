// priority: 5
// ============================================================
// 第三章：魔力金属物品注册
// ------------------------------------------------------------
// 承接第二章产物「魔力粉」(marguerite:magic_dust)，构建第三章
// 「魔力金属」产线的三级中间品：
//
//   魔力粉 →(回转窑)→ 魔力锭 →(激发器充能)→ 充能魔力锭
//          →(金属冲压机)→ 充能魔力锭板
//
// 充能魔力锭板用于合成「重型机械方块」，进而解锁车窑 / 斗轮挖掘机。
// 配方见 server_scripts/recipes/recipes_chapter3_magic_line.js。
// 贴图：builder.texture() 复用原版/IE 贴图占位，后续可替换为专属贴图。
// ============================================================

StartupEvents.registry("item", event => {
    // ---------- 魔力锭 ----------
    try {
        let builder = event.create("marguerite:magic_ingot")
            .displayName("§d魔力锭")
            .maxStackSize(64)
            .texture("minecraft:item/iron_ingot")
            .tooltip("§7魔力粉在回转窑中烧结成的金属锭")
            .tooltip("§8第三章魔力金属产线的基础材料")
        try { builder.rarity("uncommon") } catch (e) { }
        console.log("[MAGIC-INGOT] 已注册物品: marguerite:magic_ingot")
    } catch (e) {
        console.log("[MAGIC-INGOT] 物品注册失败: " + e)
    }

    // ---------- 充能魔力锭 ----------
    try {
        let builder = event.create("marguerite:energized_magic_ingot")
            .displayName("§d充能魔力锭")
            .maxStackSize(64)
            .texture("minecraft:item/gold_ingot")
            .tooltip("§7经激发器充能后的魔力锭，蕴含电流")
            .tooltip("§8可冲压成充能魔力锭板")
        try { builder.rarity("rare") } catch (e) { }
        console.log("[MAGIC-INGOT] 已注册物品: marguerite:energized_magic_ingot")
    } catch (e) {
        console.log("[MAGIC-INGOT] 物品注册失败: " + e)
    }

    // ---------- 充能魔力锭板 ----------
    try {
        let builder = event.create("marguerite:energized_magic_plate")
            .displayName("§d充能魔力锭板")
            .maxStackSize(64)
            .texture("immersiveengineering:item/plate_iron")
            .tooltip("§7充能魔力锭冲压成的板材")
            .tooltip("§8制作重型机械方块的关键材料")
        try { builder.rarity("rare") } catch (e) { }
        console.log("[MAGIC-INGOT] 已注册物品: marguerite:energized_magic_plate")
    } catch (e) {
        console.log("[MAGIC-INGOT] 物品注册失败: " + e)
    }
})
