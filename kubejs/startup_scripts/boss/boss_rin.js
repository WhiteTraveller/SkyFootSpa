// priority: 5
// ============================================================
// Boss：地狱跑腿 · 火焰猫燐
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_rin）
// 需求范围 6-12：搬尸体力活，脚上需求不少
// 满意度倍率 x0.75：猫科的挑剔程度中等偏上
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_rin")
        .setName("火焰猫燐")
        .setModel("touhou_little_maid:kaenbyou_rin")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_rin")
        .setItemName("火焰猫燐邀请函")
        .setItemRarity("rare")
        .setSatisfactionMultiplier(0.75)
        .setSatisfactionTarget(70)
        .setTime(60)
        .setHint("§7她推着手推车在店门口停下，尾巴不安地甩动：「我可不是来当顾客的喵。」")
})
