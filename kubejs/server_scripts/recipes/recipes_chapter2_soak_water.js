// priority: 5
// ============================================================
// 第二章特色泡脚水 · 自定义配方
// ------------------------------------------------------------
// 这三种泡脚水不走 recipes_soak_water_create.js 的自动 Create 搅拌
// （已在 soakWaters.js 标记 customRecipe=true），配方在此手动定义：
//
//   豪华牛奶水：牛奶水(1000mb) + 金粉 → IE 工业搅拌机 → 豪华牛奶水(1000mb)
//   强力去灰水：草灰水(1000mb) + 赛特斯石英粉 → Create 动力搅拌机 → 强力去灰水(1000mb)
//   皴水：沿用已有产线（皴块+水→皴水+洗净皴块，见 recipes_cun_processing.js），此处不定义
//
// IE 配方约定（与 recipes_fuma_production.js 一致）：输入流体用 tag，输出流体用 fluid id。
// ============================================================

ServerEvents.recipes(event => {
    // ========== 豪华牛奶水 · IE 工业搅拌机（immersiveengineering:mixer）==========
    // 流体输入：牛奶水(tag forge:milk_water)；物品输入：金粉(tag forge:dusts/gold)
    try {
        event.custom({
            type: 'immersiveengineering:mixer',
            inputs: [
                { tag: 'forge:dusts/gold' }
            ],
            fluid: { tag: 'forge:milk_water', amount: 1000 },
            result: { fluid: 'kubejs:deluxe_milk_water', amount: 1000 },
            energy: 3200
        }).id('kubejs:deluxe_milk_water_mixing')
        console.log('[CH2-SOAK] IE工业搅拌机配方已注册: 牛奶水(1000mb)+金粉 → 豪华牛奶水(1000mb)')
    } catch (e) {
        console.log('[CH2-SOAK] 豪华牛奶水 IE mixer 配方注册失败: ' + e)
    }

    // ========== 强力去灰水 · Create 动力搅拌机（mixing）==========
    // 草灰水(1000mb) + 赛特斯石英粉 → 强力去灰水(1000mb)，不加热
    if (event.recipes && event.recipes.create && typeof event.recipes.create.mixing === 'function') {
        try {
            event.recipes.create.mixing(
                Fluid.of('kubejs:strong_ash_water', 1000),
                [
                    Fluid.of('kubejs:grass_ash_water', 1000),
                    Item.of('ae2:certus_quartz_dust')
                ]
            ).id('kubejs:strong_ash_water_mixing')
            console.log('[CH2-SOAK] Create搅拌配方已注册: 草灰水(1000mb)+赛特斯石英粉 → 强力去灰水(1000mb)')
        } catch (e) {
            console.log('[CH2-SOAK] 强力去灰水 Create mixing 配方注册失败: ' + e)
        }
    } else {
        console.log('[CH2-SOAK] Create mixing API 不可用，跳过强力去灰水配方')
    }
})
