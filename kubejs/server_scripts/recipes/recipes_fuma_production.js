// priority: 5
// ============================================================
// 第二章：富魔洗脚水处理产线配方
// ------------------------------------------------------------
// 产线流程（参考流程图）：
//   ① 富魔洗脚水(1000mb) + 植物油(1000mb)
//      → [动力搅拌] → 洗脚水(1000mb) + 富魔植物油(1000mb)
//
//   ② 富魔植物油(1000mb) + 盐(1个)
//      → [IE 工业搅拌机] → 植物油-魔力悬浊液(1000mb)
//
//   ③ 植物油-魔力悬浊液(1000mb)
//      → [动力搅拌] → 魔力粉(1个) + 含盐植物油(1000mb)
//
// 已有物品/流体：
//   - 富魔洗脚水: kubejs:fuma_foot_water
//   - 植物油:     immersiveengineering:plantoil
//   - 洗脚水:     kubejs:foot_water
//   - 盐:         mekanism:salt
// ============================================================

ServerEvents.recipes(event => {
    // ========== 动力搅拌：富魔洗脚水 + 植物油 → 洗脚水 + 富魔植物油 ==========
    event.recipes.create.mixing(
        // 输出：两种流体各 1000mb
        [
            Fluid.of('kubejs:foot_water', 1000),
            Fluid.of('kubejs:fuma_plantoil', 1000)
        ],
        // 输入：两种流体各 1000mb
        [
            Fluid.of('kubejs:fuma_foot_water', 1000),
            Fluid.of('immersiveengineering:plantoil', 1000)
        ]
    ).id('kubejs:fuma_mixing_step1')


    // ========== IE 工业搅拌机：富魔植物油 + 盐 → 植物油-魔力悬浊液 ==========
    event.custom({
        type: 'immersiveengineering:mixer',
        inputs: [
            { item: 'mekanism:salt' }
        ],
        fluid: { tag: 'forge:fuma_plantoil', amount: 1000 },
        result: { fluid: 'kubejs:plantoil_magic_suspension', amount: 1000 },
        energy: 3200
    }).id('kubejs:fuma_ie_mixer_step2')

    // ========== 动力搅拌：植物油-魔力悬浊液 → 魔力粉 + 含盐植物油 ==========
    event.recipes.create.mixing(
        // 输出：魔力粉(物品) + 含盐植物油(流体)
        [
            Item.of('marguerite:magic_dust'),
            Fluid.of('kubejs:salted_plantoil', 1000)
        ],
        // 输入：植物油-魔力悬浊液 1000mb
        [
            Fluid.of('kubejs:plantoil_magic_suspension', 1000)
        ]
    ).id('kubejs:fuma_mixing_step3')

    //============ 高效配方：富魔洗脚水 + 灰水 → 加碱带魔力的洗脚水 =========
    event.custom({
        type: "immersiveindustry:chemical",
        input_fluids: [
            { tag: 'forge:grass_ash_water', amount: 1000 },
            { tag: 'forge:fuma_foot_water', amount: 1000 }
        ],
        result_fluids: [
            { fluid: 'kubejs:fuma_low_PH_foot_water', amount: 1000 }
        ],
        time: 100
    }).id('effective_fuma_production_recipe_step1')

    //============ 高效配方：加碱带魔力的洗脚水 + 植物油 → 富魔植物油 =========
    event.custom({
        type: "immersiveindustry:chemical",
        input_fluids: [
            { tag: 'forge:fuma_low_ph_foot_water', amount: 1000 },
            { tag: 'forge:plantoil', amount: 1000 }
        ],
        result_fluids: [
            { fluid: 'kubejs:fuma_plantoil', amount: 2000 }
        ],
        time: 100
    }).id('effective_fuma_production_recipe_step2')

    //============ 回收配方：含盐植物油 → 植物油 + 盐 =========
    event.custom({
        type: "immersiveindustry:chemical",
        input_fluids: [
            { tag: 'forge:salted_plantoil', amount: 1000 },
        ],
        result_fluids: [
            { fluid: 'immersiveengineering:plantoil', amount: 1000 }
        ],
        outputs: [
            { item: 'mekanism:salt', count: 1 }
        ],
        time: 100
    }).id('salted_plantoil_recycle')


})
