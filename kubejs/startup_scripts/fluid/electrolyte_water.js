// priority: 8
// ============================================================
// 电解质水流体注册（kubejs:electrolyte_water）
// ------------------------------------------------------------
// 用途：通过 Create 搅拌机由水 + 柠檬 + 盐 + 糖 混合得到
// 用法：使用 Create 注液器（Spout/Filling）将 250mb 该流体
//       注入玻璃瓶 -> 得到电解质水瓶（marguerite:electrolyte_bottle）
// ============================================================

StartupEvents.registry("fluid", event => {
    try {
        let builder = event.create('electrolyte_water')
            .displayName('§b电解质水')
            .bucketColor(0x7FD9E0)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x7FD9E0) } catch (e) { }
        console.log('[ELECTROLYTE] 已注册流体 kubejs:electrolyte_water')
    } catch (e) {
        console.log('[ELECTROLYTE] 流体注册失败: ' + e)
    }
})

// 常量导出
global.pfElectrolyteWater = {
    FLUID_ID: 'kubejs:electrolyte_water',
    BUCKET_ID: 'kubejs:electrolyte_water_bucket',
    BOTTLE_AMOUNT: 250
}
