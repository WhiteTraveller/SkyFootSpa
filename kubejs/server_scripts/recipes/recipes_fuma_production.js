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
    // ========== ① 动力搅拌：富魔洗脚水 + 植物油 → 洗脚水 + 富魔植物油 ==========
    if (event.recipes && event.recipes.create && typeof event.recipes.create.mixing === 'function') {
        try {
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
            console.log('[FUMA-PROD] ① 动力搅拌配方已注册: 富魔洗脚水+植物油 → 洗脚水+富魔植物油')
        } catch (e) {
            console.log('[FUMA-PROD] ① 动力搅拌配方注册失败: ' + e)
        }
    } else {
        console.log('[FUMA-PROD] ① Create mixing API 不可用，跳过')
    }

    // ========== ② IE 工业搅拌机：富魔植物油 + 盐 → 植物油-魔力悬浊液 ==========
    try {
        event.custom({
            type: 'immersiveengineering:mixer',
            inputs: [
                { item: 'mekanism:salt' }
            ],
            fluid: { tag: 'kubejs:fuma_plantoil', amount: 1000 },
            result: { fluid: 'kubejs:plantoil_magic_suspension', amount: 1000 },
            energy: 3200
        }).id('kubejs:fuma_ie_mixer_step2')
        console.log('[FUMA-PROD] ② IE搅拌机配方已注册: 富魔植物油+盐 → 植物油-魔力悬浊液')
    } catch (e) {
        console.log('[FUMA-PROD] ② IE搅拌机配方注册失败: ' + e)
    }

    // ========== ③ 动力搅拌：植物油-魔力悬浊液 → 魔力粉 + 含盐植物油 ==========
    if (event.recipes && event.recipes.create && typeof event.recipes.create.mixing === 'function') {
        try {
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
            console.log('[FUMA-PROD] ③ 动力搅拌配方已注册: 植物油-魔力悬浊液 → 魔力粉+含盐植物油')
        } catch (e) {
            console.log('[FUMA-PROD] ③ 动力搅拌配方注册失败: ' + e)
        }
    } else {
        console.log('[FUMA-PROD] ③ Create mixing API 不可用，跳过')
    }

    console.log('[FUMA-PROD] 第二章产线配方注册完成（共3步）')
})
