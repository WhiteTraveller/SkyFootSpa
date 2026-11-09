// priority: 5
// ============================================================
// 第三章：重型机械方块 / 充能魔力块 注册
// ------------------------------------------------------------
// 重型机械方块 (heavy_machinery_block)：
//   由充能魔力锭板 + 重型工程块合成，是车窑砖的门槛材料，
//   也象征玩家已具备建造斗轮挖掘机 / 车窑的重工业能力。
//
// 充能魔力块 (energized_magic_block)：
//   车窑高温烧制充能魔力锭板得到的致密魔力块，第三章终产物。
//   定位「最强力的磁铁」，同时注册为 IE 高炉超高热值燃料
//   （见 recipes_chapter3_magic_line.js 的 blast_furnace_fuel）。
//
// 贴图：builder.textureAll() 复用原版方块贴图占位，后续可替换。
// ============================================================

StartupEvents.registry("block", event => {
    // ---------- 重型机械方块 ----------
    try {
        event.create("marguerite:heavy_machinery_block")
            .displayName("§e重型机械方块")
            .material("metal")
            .soundType("metal")
            .hardness(3.0)
            .resistance(6.0)
            .requiresTool(true)
            .textureAll("minecraft:block/iron_block")
            .tagBlock("minecraft:mineable/pickaxe")
            .tagBlock("minecraft:needs_iron_tool")
        console.log("[MAGIC-BLOCK] 已注册方块: marguerite:heavy_machinery_block")
    } catch (e) {
        console.log("[MAGIC-BLOCK] 方块注册失败: " + e)
    }

    // ---------- 充能魔力块 ----------
    try {
        event.create("marguerite:energized_magic_block")
            .displayName("§d充能魔力块")
            .material("metal")
            .soundType("metal")
            .hardness(4.0)
            .resistance(8.0)
            .requiresTool(true)
            .textureAll("minecraft:block/amethyst_block")
            .tagBlock("minecraft:mineable/pickaxe")
            .tagBlock("minecraft:needs_diamond_tool")
            .lightLevel(0.6)
        console.log("[MAGIC-BLOCK] 已注册方块: marguerite:energized_magic_block")
    } catch (e) {
        console.log("[MAGIC-BLOCK] 方块注册失败: " + e)
    }
})
