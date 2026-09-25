// priority: 5
// ============================================================
// Boss：地狱跑腿 · 火焰猫燐
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_rin）
// 需求倍率 x1.5：搬尸体力活，脚上需求不少
// 满意度倍率 x0.75：猫科的挑剔程度中等偏上
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_rin")
        .setName("§c地狱跑腿 · 火焰猫燐")
        .setModel("touhou_little_maid:kaenbyou_rin")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/bone")
        .setItemRarity("rare")
        .setDemandMultiplier(1.5)
        .setSatisfactionMultiplier(0.75)
        .setHint("§7她推着手推车在店门口停下，尾巴不安地甩动：「我可不是来当顾客的喵。」")
})
