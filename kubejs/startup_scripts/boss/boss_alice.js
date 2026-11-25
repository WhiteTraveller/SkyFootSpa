// priority: 5
// ============================================================
// Boss：中期考核 · 爱丽丝·玛格特罗伊德
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_alice）
// 需求范围 6-12：人偶使的双脚由她本人亲自验收
// 满意度倍率 x0.4：事先声明，她可没有其它顾客那么好对付
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_alice")
        .setName("爱丽丝·玛格特罗伊德")
        .setModel("touhou_little_maid:alice_margatroid")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_alice")
        .setItemName("爱丽丝邀请函")
        .setItemRarity("rare")
        .setSatisfactionMultiplier(0.4)
        .setSatisfactionTarget(60)
        .setTime(60)
        .setHint("§7她抱着手臂倚在门口，挑眉打量：「我可没有其它顾客那么好对付。」")
})
