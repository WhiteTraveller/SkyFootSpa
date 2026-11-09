// priority: 5
// ============================================================
// 第三章：含油洗脚水分馏产石油
// ------------------------------------------------------------
// 鬼族(oni)顾客泡脚产出「含油洗脚水」(kubejs:oil_foot_water，
// 见 pfBasinSoakManager.js 的 OIL_CUSTOMER_CATEGORIES 分流)。
// 剧情设定：石油即旧地狱血池中「被诅咒的血液」，鬼族当年在此
// 干活被腌入味，如今从脚上重新搓下（见 chatbox story_rin.json ch3_rin）。
//
// 分馏配方（CDG 分馏塔 createdieselgenerators:distillation）：
//   含油洗脚水 1000mb →(分馏塔, heated)→ 洗脚水 1000mb + 原油(石油) 100mb
//
// 说明：
//   - 石油复用 CDG 原油 createdieselgenerators:crude_oil，可直接接 CDG 自带
//     「原油 →(分馏)→ 柴油 + 汽油」二级分馏链，无需额外注册流体。
//   - 分馏塔为多方块：需 2 层塔体（对应 2 种产物）+ 底部燃烧室供热；
//     results 数组顺序为「重馏分在前」，与 CDG 默认原油配方一致。
//   - 输入用 fluidTag 引用 forge:oil_foot_water（tag 见 data/forge/tags/fluids/oil_foot_water.json）。
// ============================================================

ServerEvents.recipes(event => {
    try {
        event.custom({
            type: 'createdieselgenerators:distillation',
            ingredients: [
                { fluidTag: 'forge:oil_foot_water', amount: 1000 }
            ],
            heatRequirement: 'heated',
            processingTime: 60,
            results: [
                { fluid: 'kubejs:foot_water', amount: 1000 },
                { fluid: 'createdieselgenerators:crude_oil', amount: 100 }
            ]
        }).id('kubejs:chapter3_oil_foot_water_distillation')
        console.log('[CH3-OIL] 已注册分馏配方: forge:oil_foot_water(1000mb) →(heated) kubejs:foot_water(1000mb) + createdieselgenerators:crude_oil(100mb)')
    } catch (e) {
        console.log('[CH3-OIL] 分馏配方注册失败: ' + e)
    }
})
