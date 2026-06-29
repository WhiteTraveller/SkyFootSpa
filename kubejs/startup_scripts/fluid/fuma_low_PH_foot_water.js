StartupEvents.registry("fluid", event => {
    try {
        let builder = event.create('fuma_low_ph_foot_water')
            .displayName('§b加碱带魔力的洗脚水')
            .bucketColor(0x7FD07D)
            .thinTexture(0x7FD07D)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x7FD07D) } catch (e) { }
        console.log('[FUMA-LOW-PH-WASHING-WATER] 已注册流体 kubejs:fuma_low_ph_foot_water')
    } catch (e) {
        console.log('[FUMA-LOW-PH-WASHING-WATER] 流体注册失败: ' + e)
    }
})

// 常量导出
global.pfFumaLowPHWashingWater = {
    FLUID_ID: 'kubejs:fuma_low_ph_foot_water',
    BUCKET_ID: 'kubejs:fuma_low_ph_foot_water_bucket',
    BOTTLE_AMOUNT: 250
}