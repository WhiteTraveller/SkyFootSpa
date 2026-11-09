// priority: 10
// ============================================================
// 洗脚水元数据 + 流体/桶注册
// ------------------------------------------------------------
// 5 种洗脚水配方（来源：中医常用保健泡脚方）：
//   1. 生姜水   (ginger_water)     - 水桶 + 生姜           - 基础需求特化
//   2. 草灰水   (grass_ash_water)  - 水桶 + 草灰           - 搓脚掉皴 +1/次
//   3. 花椒水   (pepper_water)     - 水桶 + 下界疣        - 财运特化（掉钱）
//   4. 食盐水   (salt_water)       - 水桶 + 骨粉          - 皴加成特化
//   5. 牛奶水   (milk_water)       - 水 + 牛奶流体      - 泡脚完成立即掉 5 钱
// —— 第二章特色泡脚水（材料门槛天然限定第二章产线，配方自定义）——
//   6. 豪华牛奶水 (deluxe_milk_water) - 牛奶水+金粉(IE搅拌机)    - 泡脚完成掉 35 钱
//   7. 强力去灰水 (strong_ash_water)  - 草灰水+石英粉(Create搅拌) - 搓脚掉皴 +3/次
//   8. 皴水       (cun_water)         - 已有产线(皴块水洗)       - 满意度-25 + 各部位需求0~2
// —— 商店限定泡脚水（无合成配方，仅通过商店购买）——
//   9. 鱼疗水     (fish_spa_water)    - 仅商店购买               - 满意度+20 + 产出热带鱼3~5
// ------------------------------------------------------------
// 效果方向：不改体力；第6/7专精单一效果；第8皴水为廉价水，负满意度+加需求双效果；
//           第9鱼疗水为商店限定水，满意度+产出物品双效果
// ============================================================

// ---------------- 1) 元数据注册 ----------------
global.soakWaterRegister.register(function (w) {
    w.setName("ginger_water")
        .setNameZH("§6生姜水")
        .setColor(0xC97F3C)
        .setDescription("§7温通经脉 §8|§7 专精：各手法需求")
        .setIngredients(['ubesdelight:ginger'])
        .setDemandBonus(3)          // 每部位随机 0~3
})

global.soakWaterRegister.register(function (w) {
    w.setName("grass_ash_water")
        .setNameZH("§8草灰水")
        .setColor(0x4A4A4A)
        .setDescription("§7草灰去角质 §8|§7 专精：搓脚掉皴")
        .setIngredients(['marguerite:grass_ash'])
        .setCunBonusPerClick(1)     // 每次搓脚掉皴 +1
})

global.soakWaterRegister.register(function (w) {
    w.setName("pepper_water")
        .setNameZH("§c花椒水")
        .setColor(0x8B2E1F)
        .setDescription("§7驱散寒气 §8|§7 专精：掉钱")
        .setIngredients(['minecraft:nether_wart'])
        .setMoneyDrop(20)
})

global.soakWaterRegister.register(function (w) {
    w.setName("salt_water")
        .setNameZH("§f食盐水")
        .setColor(0xC8E0F0)
        .setDescription("§7清洁杀菌 §8|§7 专精：搓脚掉皴")
        .setIngredients(['minecraft:bone_meal'])
        .setCunBonusPerClick(2)
})

global.soakWaterRegister.register(function (w) {
    w.setName("milk_water")
        .setNameZH("§f牛奶水")
        .setColor(0xF5F0E8)
        .setDescription("§7满床乳香 §8|§7 专精：立即掉钱")
        .setIngredients([])
        .setExtraFluids([{ id: 'minecraft:milk', amount: 1000 }])  // 与水并列的额外流体输入
        .setMoneyDrop(5)            // 泡脚完成立即掉 5 铜币
})

// ============ 第二章特色泡脚水 ============
// 材料均来自第二章产线；配方自定义（customRecipe），见 recipes_chapter2_soak_water.js。

// 6) 豪华牛奶水 —— 牛奶水（掉钱）的第二章升级版
//    工序：牛奶水 + 金粉 → IE 工业搅拌机 → 豪华牛奶水
global.soakWaterRegister.register(function (w) {
    w.setName("deluxe_milk_water")
        .setNameZH("§6豪华牛奶水")
        .setColor(0xF0D890)
        .setDescription("§7金粉乳香 §8|§7 专精：立即掉钱")
        .setCustomRecipe(true)      // 配方为 IE 搅拌机，见 recipes_chapter2_soak_water.js
        .setMoneyDrop(35)           // 泡脚完成立即掉 35 铜币（强于第一章花椒水 20）
})

// 7) 强力去灰水 —— 草灰水（皴）的第二章升级版
//    工序：草灰水 + 赛特斯石英粉 → Create 动力搅拌机 → 强力去灰水
global.soakWaterRegister.register(function (w) {
    w.setName("strong_ash_water")
        .setNameZH("§8强力去灰水")
        .setColor(0x3A3A3A)
        .setDescription("§7石英研磨去死皮 §8|§7 专精：搓脚掉皴")
        .setCustomRecipe(true)      // 配方为 Create 搅拌（草灰水+石英粉），见 recipes_chapter2_soak_water.js
        .setCunBonusPerClick(3)     // 每次搓脚掉皴 +3（强于第一章食盐水 +2）
})

// 8) 皴水 —— 第二章固体线副产（皴块水洗），廉价但有代价
//    流体已在 cun_water.js 注册，配方沿用皴块水洗，故 externalFluid + customRecipe
global.soakWaterRegister.register(function (w) {
    w.setName("cun_water")
        .setNameZH("§7皴水")
        .setColor(0x8B7355)
        .setDescription("§7浑浊皴水 §8|§7 满意度-25 §8|§7 各手法需求+0~2")
        .setExternalFluid(true)     // 流体已在 cun_water.js 注册，跳过自动注册
        .setCustomRecipe(true)      // 配方沿用皴块水洗，跳过自动 mixing
        .setSatisfactionBonus(-25)  // 初始满意度 -25（廉价水的代价）
        .setDemandBonus(2)          // 每部位随机 +0~2 需求
})

// ============ 商店限定泡脚水 ============
// 无合成配方（customRecipe=true 跳过自动 Create mixing），只能通过商店购买获得桶。

// 9) 鱼疗水 —— 水里养着啃食死皮的小鱼（热带鱼）
//    泡脚完成：顾客满意度 +20，并在顾客脚下掉落 3~5 条热带鱼
global.soakWaterRegister.register(function (w) {
    w.setName("fish_spa_water")
        .setNameZH("§b鱼疗水")
        .setColor(0x4FC3E8)
        .setDescription("§7小鱼啃食死皮 §8|§7 专精：满意度")
        .setCustomRecipe(true)      // 仅商店购买，无合成配方
        .setSatisfactionBonus(20)   // 顾客满意度 +20
        .setItemDrops([{ item: 'minecraft:tropical_fish', min: 3, max: 5, labelZH: '热带鱼' }])
})

// ---------------- 2) 流体注册 ----------------
// KubeJS 会自动为每个流体生成对应的 bucket 物品（id: <ns>:<name>_bucket）
StartupEvents.registry("fluid", event => {
    let list = global.soakWaterRegister.waters
    for (let i = 0; i < list.length; i++) {
        let w = list[i]
        if (w.externalFluid) continue   // 流体已在别处注册（如皴水），跳过
        try {
            let builder = event.create(w.name)
                .displayName(w.nameZH)
                .bucketColor(w.color)
                .thinTexture(w.color)
                .stillTexture("minecraft:block/water_still")
                .flowingTexture("minecraft:block/water_flow")
            // 某些 KubeJS 版本支持 textColor
            try { builder.textColor(w.color) } catch (e) { }
            console.log("[SOAK-WATER] 注册流体: kubejs:" + w.name)
        } catch (e) {
            console.log("[SOAK-WATER] 流体注册失败: " + w.name + " -> " + e)
        }
    }
})

// ---------------- 3) 桶物品 tooltip 增强 ----------------
// tooltip 必须在 CLIENT 脚本类型注册，详见：
//   kubejs/client_scripts/soakWaterTooltip.js

