// priority: 5
// ============================================================
// Boss：水都技师 · 河城荷取
// ------------------------------------------------------------
// 触发物：红石块（河童的工程/红石意象）
// 需求范围 3-6：技师的工作量比较琐碎
// 满意度倍率 x0.5：她对细节极度挑剔
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_nitori")
        .setName("河城荷取")
        .setModel("touhou_little_maid:kawasiro_nitori")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_nitori")
        .setItemName("河城荷取邀请函")
        .setItemRarity("rare")
        .setDemandRange(3, 6)
        .setSatisfactionMultiplier(0.5)
        .setSatisfactionTarget(60)
        .setTime(60)
        .setHint("§7她抱着一箱工具走来，眼睛里闪着光：「让我检查一下你的手艺」")
})
