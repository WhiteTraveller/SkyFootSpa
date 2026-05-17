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
// ------------------------------------------------------------
// 效果方向：不改体力；每种水专精一种效果（无药水附加）
// ============================================================

// ---------------- 1) 元数据注册 ----------------
global.soakWaterRegister.register(function (w) {
    w.setName("ginger_water")
        .setNameZH("§6生姜水")
        .setColor(0xC97F3C)
        .setDescription("§7温通经脉 §8|§7 专精：各部位需求")
        .setIngredients(['ubesdeight:ginger'])
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
        .setExtraFluids([{ id: 'create:milk', amount: 1000 }])  // 与水并列的额外流体输入
        .setMoneyDrop(5)            // 泡脚完成立即掉 5 铜币
})

// ---------------- 2) 流体注册 ----------------
// KubeJS 会自动为每个流体生成对应的 bucket 物品（id: <ns>:<name>_bucket）
StartupEvents.registry("fluid", event => {
    let list = global.soakWaterRegister.waters
    for (let i = 0; i < list.length; i++) {
        let w = list[i]
        try {
            let builder = event.create(w.name)
                .displayName(w.nameZH)
                .bucketColor(w.color)
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

