// priority: 5
// ============================================================
// Boss：博丽神社巫女 · 博丽灵梦
// ------------------------------------------------------------
// 触发物：紫水晶碎片（阴阳玉/神道法器意象）
// 需求范围 脚掌/脚后跟 5-10、脚趾/脚心 2-6：最强巫女的全方位调养
// 满意度倍率 x0.3：常人的服务很难让她满意
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_reimu")
        .setName("博丽灵梦")
        .setModel("touhou_little_maid:hakurei_reimu")
        .setAutoCreateItem(true)
        .setItemTexture("marguerite:item/boss_seal_reimu")
        .setItemName("博丽灵梦邀请函")
        .setItemRarity("epic")
        .setDemandRange(5, 10)
        .setDemandRangePart('脚趾', 2, 6)
        .setDemandRangePart('脚心', 2, 6)
        .setSatisfactionMultiplier(0.3)
        .setSatisfactionTarget(50)
        .setTime(120)
        .setHint("§7「赛钱拿来了吗？...哼，那就凑合给你一个机会吧。」")
})
