// priority: 5
// ============================================================
// Boss：守矢推销 · 东风谷早苗
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_sanae）
// 需求倍率 x1.75：跑遍幻想乡传教，脚板磨得比谁都狠
// 满意度倍率 x0.6：见过外界顶尖足浴店，眼光自然高
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_sanae")
        .setName("§a守矢推销 · 东风谷早苗")
        .setModel("touhou_little_maid:kochiya_sanae")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/emerald")
        .setItemRarity("rare")
        .setDemandMultiplier(1.75)
        .setSatisfactionMultiplier(0.6)
        .setHint("§7她举着御币跨进店里，笑容灿烂：「在幻想乡可不能被常识束缚！」")
})
