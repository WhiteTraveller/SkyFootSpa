// priority: 8
// ============================================================
// 皴水流体注册
// ------------------------------------------------------------
// 第二章固体处理线中间产物：
//   皴块 + 水 → 动力搅拌（不加热） → 皴水 + 洗净的皴块
//   皴水 + 加热搅拌 → 赛特斯石英
// ============================================================

StartupEvents.registry("fluid", event => {
    try {
        let builder = event.create('cun_water')
            .displayName('§7皴水')
            .bucketColor(0x8B7355)
            .thinTexture(0x8B7355)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x8B7355) } catch (e) { }
        console.log('[CUN-WATER] 已注册流体 kubejs:cun_water')
    } catch (e) {
        console.log('[CUN-WATER] cun_water 注册失败: ' + e)
    }
})

// 常量导出
global.pfCunWater = {
    FLUID_ID: 'kubejs:cun_water',
    BUCKET_ID: 'kubejs:cun_water_bucket'
}
