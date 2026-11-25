// priority: 5
// ============================================================
// 机械动力（Create）动力搅拌配方：洗脚水(液体) -> 盐 + 水
// ------------------------------------------------------------
// 参考：https://kubejs.com/wiki/addons/create
//   event.recipes.create.mixing(outputs[], inputs[])
// 输入：洗脚水液体 1000mb（普通 kubejs:foot_water 与富魔 kubejs:fuma_foot_water 各一条配方，
//       覆盖范围与原先的桶 tag #forge:foot_water_bucket 一致）
// 产出：mekanism:salt × 3 + minecraft:water × 1000mb
// 无需加热；搅拌后盐留在 Basin，水可用空桶接出。
// ============================================================

ServerEvents.recipes(event => {
    if (!event.recipes || !event.recipes.create || typeof event.recipes.create.mixing !== 'function') {
        console.log('[SOAK-CREATE-SALT] 未检测到 Create mixing API，跳过制盐配方注册')
        return
    }

    let salt = 'mekanism:salt'
    // 普通洗脚水与富魔洗脚水均可制盐（直接用液体，不再用桶）
    let sourceFluids = [
        { fluid: 'kubejs:foot_water',      id: 'kubejs:create_mixing_salt_from_foot_water' },
        { fluid: 'kubejs:fuma_foot_water', id: 'kubejs:create_mixing_salt_from_fuma_foot_water' }
    ]

    for (let i = 0; i < sourceFluids.length; i++) {
        let src = sourceFluids[i]
        try {
            event.recipes.create.mixing(
                // 输出：盐 ×3 + 水 1000mb
                [
                    Item.of(salt, 3),
                    Fluid.of('minecraft:water', 1000)
                ],
                // 输入：洗脚水液体 1000mb
                [
                    Fluid.of(src.fluid, 1000)
                ]
            ).id(src.id)
            console.log('[SOAK-CREATE-SALT] 动力搅拌制盐配方已注册: ' + src.fluid + '(1000mb) -> ' + salt + ' x3 + water(1000mb)')
        } catch (e) {
            console.log('[SOAK-CREATE-SALT] 动力搅拌制盐配方注册失败 ' + src.fluid + ': ' + e)
        }
    }
})
