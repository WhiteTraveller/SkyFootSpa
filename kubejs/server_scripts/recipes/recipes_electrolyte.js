// priority: 5
// ============================================================
// 电解质水相关 Create 配方
// ------------------------------------------------------------
// 1) 搅拌机（mixing）：水(1000mb) + 柠檬 + 盐 + 糖 -> 1000mb 电解质水
// 2) 注液器（filling）：玻璃瓶 + 250mb 电解质水 -> 电解质水瓶
// ============================================================

ServerEvents.recipes(event => {
    if (!event.recipes || !event.recipes.create) {
        console.log('[ELECTROLYTE] 未检测到 Create 模组，跳过配方注册')
        return
    }

    let LEMON = 'lemoned:lemon'      // 柠檬
    let SALT  = 'mekanism:salt'
    let SUGAR = 'minecraft:sugar'
    let FLUID = 'kubejs:electrolyte_water'
    let BOTTLE_OUT = 'marguerite:electrolyte_bottle'
    let BOTTLE_IN  = 'minecraft:glass_bottle'

    // ========== 1) 搅拌机配方 ==========
    if (typeof event.recipes.create.mixing !== 'function') {
        console.log('[ELECTROLYTE] Create mixing API 不可用')
    } else {
        try {
            let inputs = [
                Fluid.of('minecraft:water', 1000),
                LEMON,
                '4x ' + SALT,
                '4x ' + SUGAR
            ]
            let output = Fluid.of(FLUID, 1000)
            event.recipes.create.mixing(output, inputs)
                .id('kubejs:electrolyte_water_mixing')
            console.log('[ELECTROLYTE] 搅拌配方已注册: water(1000mb) + ' + LEMON + ' + 4x' + SALT + ' + 4x' + SUGAR + ' -> ' + FLUID + '(1000mb)')
        } catch (e) {
            console.log('[ELECTROLYTE] 搅拌配方注册失败: ' + e)
        }
    }

    // ========== 2) 注液器（filling）配方 ==========
    if (typeof event.recipes.create.filling !== 'function') {
        console.log('[ELECTROLYTE] Create filling API 不可用')
    } else {
        try {
            event.recipes.create.filling(
                BOTTLE_OUT,
                [
                    BOTTLE_IN,
                    Fluid.of(FLUID, 250)
                ]
            ).id('kubejs:electrolyte_bottle_filling')
            console.log('[ELECTROLYTE] 注液配方已注册: ' + BOTTLE_IN + ' + ' + FLUID + '(250mb) -> ' + BOTTLE_OUT)
        } catch (e) {
            console.log('[ELECTROLYTE] 注液配方注册失败: ' + e)
        }
    }
})
