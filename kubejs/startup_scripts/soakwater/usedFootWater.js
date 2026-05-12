// priority: 8
// ============================================================
// "洗脚水"流体注册（已被使用过的泡脚水）
// ------------------------------------------------------------
// 当床旁 Create 工作盆中的任意已注册泡脚水完成倒计时，
// 将 1000mb 的泡脚水转换为 1000mb 的本流体。
// 此流体仅作为"已使用"的产物标记，不挂任何泡脚效果。
// ============================================================

StartupEvents.registry("fluid", event => {
    try {
        let builder = event.create('foot_water')
            .displayName('§8洗脚水')
            .bucketColor(0x6B4A2E)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x6B4A2E) } catch (e) { }
        console.log('[USED-FOOT-WATER] 已注册流体 kubejs:foot_water')
    } catch (e) {
        console.log('[USED-FOOT-WATER] 注册失败: ' + e)
    }
})

// 常量导出，供服务端脚本引用
global.pfUsedFootWater = {
    FLUID_ID: 'kubejs:foot_water',
    BUCKET_ID: 'kubejs:foot_water_bucket',
    REQUIRED_AMOUNT: 1000
}
