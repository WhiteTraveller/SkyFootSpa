// ============================================================
// 机械动力：金属锭 → 金属粉
// ------------------------------------------------------------
// 提供两条处理途径，方便玩家根据机械阶段选择：
//   1) 石磨(Millstone)       —— 低门槛、低速
//   2) 粉碎轮(Crushing Wheel) —— 高门槛、批量
// 产物：mekanism:dust_iron / dust_copper / dust_gold
// ============================================================

ServerEvents.recipes(event => {
    const dusts = [
        { key: 'iron',   ingot: 'minecraft:iron_ingot',   dust: 'mekanism:dust_iron'   },
        { key: 'copper', ingot: 'minecraft:copper_ingot', dust: 'mekanism:dust_copper' },
        { key: 'gold',   ingot: 'minecraft:gold_ingot',   dust: 'mekanism:dust_gold'   }
    ]

    dusts.forEach(d => {
        // 石磨 milling
        try {
            event.recipes.create.milling(d.dust, d.ingot)
                .id(`kubejs:milling_${d.key}_ingot_to_dust`)
            console.log(`[DUST] 石磨配方已注册: ${d.ingot} -> ${d.dust}`)
        } catch (e) {
            console.log(`[DUST] 石磨配方注册失败(${d.key}): ${e}`)
        }

        // 粉碎轮 crushing
        try {
            event.recipes.create.crushing(d.dust, d.ingot)
                .id(`kubejs:crushing_${d.key}_ingot_to_dust`)
            console.log(`[DUST] 粉碎轮配方已注册: ${d.ingot} -> ${d.dust}`)
        } catch (e) {
            console.log(`[DUST] 粉碎轮配方注册失败(${d.key}): ${e}`)
        }
    })
})
