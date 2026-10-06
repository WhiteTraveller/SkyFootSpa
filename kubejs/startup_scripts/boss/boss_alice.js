// priority: 5
// ============================================================
// Boss：中期考核 · 爱丽丝·玛格特罗伊德
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_alice）
// 需求倍率 x2：人偶使的双脚由她本人亲自验收
// 满意度倍率 x0.4：事先声明，她可没有其它顾客那么好对付
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_alice")
        .setName("§d中期考核 · 爱丽丝·玛格特罗伊德")
        .setModel("touhou_little_maid:alice_margatroid")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/string")
        .setItemRarity("rare")
        .setDemandMultiplier(2)
        .setSatisfactionMultiplier(0.4)
        .setHint("§7她抱着手臂倚在门口，挑眉打量：「我可没有其它顾客那么好对付。」")
})
