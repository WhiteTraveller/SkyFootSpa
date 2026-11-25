// priority: 5
// ============================================================
// Boss：守矢推销 · 东风谷早苗
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_sanae）
// 需求范围 6-12：跑遍幻想乡传教，脚板磨得比谁都狠
// 满意度倍率 x0.6：见过外界顶尖足浴店，眼光自然高
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_sanae")
        .setName("东风谷早苗")
        .setModel("touhou_little_maid:kochiya_sanae")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_sanae")
        .setItemName("东风谷早苗邀请函")
        .setItemRarity("rare")
        .setSatisfactionMultiplier(0.6)
        .setSatisfactionTarget(70)
        .setTime(60)
        .setHint("§7她举着御币跨进店里，笑容灿烂：「在幻想乡可不能被常识束缚！」")
})
