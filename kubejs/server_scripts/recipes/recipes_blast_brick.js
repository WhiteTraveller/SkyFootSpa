// ============================================================
// 高炉砖配方修改
// ------------------------------------------------------------
// 修改 IE 原版高炉砖配方：岩浆块(中心) → 烈焰粉
// 新配方：4下界砖(四角) + 4砖块(十字) + 1烈焰粉(中心) → 4高炉砖
// 下界砖来源：地狱岩(netherrack) → 熔炉烧炼 → 下界砖(nether_brick)
// ============================================================

ServerEvents.recipes(event => {
    // 移除 IE 原版高炉砖配方
    try {
        event.remove({ output: 'immersiveengineering:blastbrick' })
        console.log('[BLAST] 已移除 IE 原版高炉砖配方')
    } catch (e) {
        console.log('[BLAST] 移除 IE 原版高炉砖配方失败: ' + e)
    }

    // 注册新的高炉砖配方：4下界砖(四角) + 4砖块(十字) + 1烈焰粉(中心) → 4高炉砖
    try {
        event.shaped(
            Item.of('immersiveengineering:blastbrick', 4),
            [
                'NBN',
                'BAB',
                'NBN'
            ],
            {
                N: 'minecraft:nether_brick',
                B: 'minecraft:brick',
                A: 'minecraft:blaze_powder'
            }
        ).id('kubejs:blast_brick_from_nether_brick')
        console.log('[BLAST] 高炉砖配方已注册: 4下界砖+4砖块+1烈焰粉 → 4高炉砖')
    } catch (e) {
        console.log('[BLAST] 高炉砖配方注册失败: ' + e)
    }
})
