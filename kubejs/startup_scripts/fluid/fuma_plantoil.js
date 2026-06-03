// priority: 8
// ============================================================
// 富魔产线流体注册
// ------------------------------------------------------------
// 第二章洗脚水处理线的中间产物流体：
//   1. 富魔植物油 (fuma_plantoil)       - 富魔洗脚水+植物油 动力搅拌产物
//   2. 植物油-魔力悬浊液 (plantoil_magic_suspension) - 富魔植物油+盐 IE搅拌产物
//   3. 含盐植物油 (salted_plantoil)     - 悬浊液动力搅拌的副产物
// ============================================================

StartupEvents.registry("fluid", event => {
    // --- 1. 富魔植物油 ---
    try {
        let builder = event.create('fuma_plantoil')
            .displayName('§5富魔植物油')
            .bucketColor(0x6A3D8F)
            .thinTexture(0x6A3D8F)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x6A3D8F) } catch (e) { }
        console.log('[FUMA-PROD] 已注册流体 kubejs:fuma_plantoil')
    } catch (e) {
        console.log('[FUMA-PROD] fuma_plantoil 注册失败: ' + e)
    }

    // --- 2. 植物油-魔力悬浊液 ---
    try {
        let builder = event.create('plantoil_magic_suspension')
            .displayName('§d植物油-魔力悬浊液')
            .bucketColor(0x9B59B6)
            .thinTexture(0x9B59B6)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0x9B59B6) } catch (e) { }
        console.log('[FUMA-PROD] 已注册流体 kubejs:plantoil_magic_suspension')
    } catch (e) {
        console.log('[FUMA-PROD] plantoil_magic_suspension 注册失败: ' + e)
    }

    // --- 3. 含盐植物油 ---
    try {
        let builder = event.create('salted_plantoil')
            .displayName('§e含盐植物油')
            .bucketColor(0xC8B560)
            .thinTexture(0xC8B560)
            .stillTexture('minecraft:block/water_still')
            .flowingTexture('minecraft:block/water_flow')
        try { builder.textColor(0xC8B560) } catch (e) { }
        console.log('[FUMA-PROD] 已注册流体 kubejs:salted_plantoil')
    } catch (e) {
        console.log('[FUMA-PROD] salted_plantoil 注册失败: ' + e)
    }
})

// 常量导出
global.pfFumaProduction = {
    FUMA_PLANTOIL_FLUID: 'kubejs:fuma_plantoil',
    FUMA_PLANTOIL_BUCKET: 'kubejs:fuma_plantoil_bucket',
    SUSPENSION_FLUID: 'kubejs:plantoil_magic_suspension',
    SUSPENSION_BUCKET: 'kubejs:plantoil_magic_suspension_bucket',
    SALTED_PLANTOIL_FLUID: 'kubejs:salted_plantoil',
    SALTED_PLANTOIL_BUCKET: 'kubejs:salted_plantoil_bucket'
}
