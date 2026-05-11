// priority: 10
// ============================================================
// 洗脚水 Create 搅拌机（Mixer）配方
// ------------------------------------------------------------
// 模式：水(1000mb) + 原料  →  对应洗脚水流体(1000mb)，无需加热
// 玩家用 Basin 接液：水桶注水 → 投入原料 → 机械搅拌
// 搅拌完成后用空桶在 Basin 右键取出 → 获得洗脚水桶
// 唯一获取途径：必须使用 Create 搅拌机，无工作台桶合成
// ------------------------------------------------------------
// 参考：https://wiki.latvian.dev/books/kubejs-legacy/page/kubejs-create
//      https://kubejs.com/wiki/addons/create
// ============================================================

ServerEvents.recipes(event => {
    // 确认 Create 模组与 mixing API 可用
    if (!event.recipes || !event.recipes.create || typeof event.recipes.create.mixing !== 'function') {
        console.log("[SOAK-WATER-CREATE] 未检测到 Create mixing API，跳过搅拌机配方注册")
        return
    }

    let waters = global.soakWaterRegister ? global.soakWaterRegister.waters : []
    for (let i = 0; i < waters.length; i++) {
        let w = waters[i]
        try {
            // 输入：水 1000mb + 原料列表
            let inputs = [Fluid.of('minecraft:water', 1000)]
            for (let j = 0; j < w.ingredients.length; j++) {
                inputs.push(w.ingredients[j])
            }
            // 输出：对应洗脚水流体 1000mb（= 1 桶）
            let output = Fluid.of(w.getFluidId(), 1000)

            event.recipes.create.mixing(output, inputs)
                .id('kubejs:soak_water_mixing_' + w.name)

            console.log("[SOAK-WATER-CREATE] 注册搅拌配方: " + w.getFluidId() + "(1000mb) <- water(1000mb) + [" + w.ingredients.join(', ') + "]")
        } catch (e) {
            console.log("[SOAK-WATER-CREATE] 搅拌配方注册失败: " + w.name + " -> " + e)
        }
    }
})
