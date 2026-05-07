// priority: 5
// ============================================================
// Boss 示例：猩红恶魔 · 芙兰朵露
// ------------------------------------------------------------
// 触发物：凋灵骷髅头颅。持该物右键开店方块，消耗 1 个并召唤 boss。
// 需求倍率 x3：每部位需求次数 = 普通顾客 × 3。
// 满意度倍率 x0.3：每次加/减满意度都打 0.3 折（更难达到 60% 提升评价）。
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_flandre")
        .setName("§c猩红恶魔 · 芙兰朵露")
        .setModel("touhou_little_maid:flandre_scarlet")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/fire_charge")
        .setItemRarity("epic")
        .setDemandMultiplier(3)
        .setSatisfactionMultiplier(0.3)
        .setHint("§7她似乎已经等了很久...小心别激怒她。")
})
