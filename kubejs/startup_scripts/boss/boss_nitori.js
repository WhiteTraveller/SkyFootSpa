// priority: 5
// ============================================================
// Boss：水都技师 · 河城荷取
// ------------------------------------------------------------
// 触发物：红石块（河童的工程/红石意象）
// 需求倍率 x2：技师的工作量比较琐碎
// 满意度倍率 x0.5：她对细节极度挑剔
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_nitori")
        .setName("§b水都技师 · 河城荷取")
        .setModel("touhou_little_maid:kawasiro_nitori")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/prismarine_crystals")
        .setItemRarity("rare")
        .setDemandMultiplier(2)
        .setSatisfactionMultiplier(0.5)
        .setHint("§7她抱着一箱工具走来，眼睛里闪着光：「让我检查一下你的手艺」")
})
