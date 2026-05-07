// priority: 5
// ============================================================
// Boss：博丽神社巫女 · 博丽灵梦
// ------------------------------------------------------------
// 触发物：紫水晶碎片（阴阳玉/神道法器意象）
// 需求倍率 x4：最强巫女的全方位调养
// 满意度倍率 x0.25：常人的服务很难让她满意
// ============================================================

global.bossRegister.register(boss => {
    boss
        .setId("boss_reimu")
        .setName("§c博丽神社巫女 · 博丽灵梦")
        .setModel("touhou_little_maid:hakurei_reimu")
        .setAutoCreateItem(true)
        .setItemTexture("minecraft:item/paper")
        .setItemRarity("epic")
        .setDemandMultiplier(4)
        .setSatisfactionMultiplier(0.25)
        .setHint("§7「赛钱拿来了吗？...哼，那就凑合给你一个机会吧。」")
})
