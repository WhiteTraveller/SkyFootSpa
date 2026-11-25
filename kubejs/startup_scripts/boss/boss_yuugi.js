// priority: 5
// ============================================================
// Boss：旧地狱温泉街主管 · 星熊永仪
// ------------------------------------------------------------
// 触发物：召唤符（autoCreateItem → marguerite:boss_seal_yuugi）
// 需求范围 6-12：鬼的脚力与酒量一样深不见底
// 满意度倍率 x0.5：拿温泉标准来衡量洗脚，极难伺候
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_yuugi")
        .setName("星熊永仪")
        .setModel("touhou_little_maid:hoshiguma_yugi")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_yuugi")
        .setItemName("星熊永仪邀请函")
        .setItemRarity("rare")
        .setSatisfactionMultiplier(0.5)
        .setSatisfactionTarget(60)
        .setTime(60)
        .setHint("§7她举着酒盏灌了一口，放声大笑：「既然开到我们边上，就得比划比划。」")
})
