// priority: 10
// ============================================================
// "草灰" 熔炉熔炼配方
// ------------------------------------------------------------
// 配方：草 / 高草 / 蕨 / 高蕨  →  marguerite:grass_ash
// 烧制时间：200 ticks（与原版熔炼一致）；XP：0.1
// ============================================================

ServerEvents.recipes(event => {
    let inputs = [
        { id: 'minecraft:grass', tag: 'grass_to_ash' },
        { id: 'minecraft:tall_grass', tag: 'tall_grass_to_ash' },
        { id: 'minecraft:fern', tag: 'fern_to_ash' },
        { id: 'minecraft:large_fern', tag: 'large_fern_to_ash' }
    ]
    for (let i = 0; i < inputs.length; i++) {
        let it = inputs[i]
        try {
            event.smelting('marguerite:grass_ash', it.id)
                .id('marguerite:' + it.tag)
                .xp(0.1)
                .cookingTime(200)
            console.log('[GRASS-ASH] 熔炼配方: ' + it.id + ' -> marguerite:grass_ash')
        } catch (e) {
            console.log('[GRASS-ASH] 熔炼配方注册失败 ' + it.id + ': ' + e)
        }
    }
})
