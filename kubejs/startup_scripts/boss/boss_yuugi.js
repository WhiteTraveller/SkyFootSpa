// priority: 5
// ============================================================
// Boss：旧地狱温泉街主管 · 星熊永仪
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_yuugi）
// 需求倍率 x2：鬼的脚力与酒量一样深不见底
// 满意度倍率 x0.5：拿温泉标准来衡量洗脚，极难伺候
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_yuugi")
        .setName("§6旧地狱温泉街主管 · 星熊永仪")
        .setModel("touhou_little_maid:hoshiguma_yugi")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/honey_bottle")
        .setItemRarity("rare")
        .setDemandMultiplier(2)
        .setSatisfactionMultiplier(0.5)
        .setHint("§7她举着酒盏灌了一口，放声大笑：「既然开到我们边上，就得比划比划。」")
})
