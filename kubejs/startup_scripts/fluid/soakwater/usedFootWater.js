// priority: 8
// ============================================================
// "洗脚水"流体注册（已被使用过的泡脚水）
// ------------------------------------------------------------
// 当床旁 Create 工作盆中的任意已注册泡脚水完成倒计时，
// 将 1000mb 的泡脚水转换为 1000mb 的本流体。
// 此流体仅作为"已使用"的产物标记，不挂任何泡脚效果。
//
// 富魔洗脚水：妖怪/妖精顾客泡脚产生的废水变体，
// 与普通洗脚水共享同一 tag 和配方。
// ============================================================

StartupEvents.registry("fluid", event => {
    // --- 普通洗脚水（人类/神明顾客产出） ---
    try {
        let builder = event.create('foot_water')
            .displayName('§8洗脚水')
            .bucketColor(0x6B4A2E)
            .thinTexture(0x6B4A2E)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x6B4A2E) } catch (e) { }
        console.log('[USED-FOOT-WATER] 已注册流体 kubejs:foot_water')
    } catch (e) {
        console.log('[USED-FOOT-WATER] 注册失败: ' + e)
    }

    // --- 富魔洗脚水（妖怪/妖精顾客产出） ---
    try {
        let builder = event.create('fuma_foot_water')
            .displayName('§5富魔洗脚水')
            .bucketColor(0x7B2D8B)
            .thinTexture(0x7B2D8B)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x7B2D8B) } catch (e) { }
        console.log('[USED-FOOT-WATER] 已注册流体 kubejs:fuma_foot_water')
    } catch (e) {
        console.log('[USED-FOOT-WATER] 富魔洗脚水注册失败: ' + e)
    }
})

// 常量导出，供服务端脚本引用
global.pfUsedFootWater = {
    FLUID_ID: 'kubejs:foot_water',
    BUCKET_ID: 'kubejs:foot_water_bucket',
    FUMA_FLUID_ID: 'kubejs:fuma_foot_water',
    FUMA_BUCKET_ID: 'kubejs:fuma_foot_water_bucket',
    REQUIRED_AMOUNT: 1000
}
