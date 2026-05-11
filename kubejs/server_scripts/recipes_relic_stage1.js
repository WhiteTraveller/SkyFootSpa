// priority: 10
// ============================================================
// 第一阶段芯片遗物合成配方（前 6 个）
// ------------------------------------------------------------
// 单一效果（1-3 号）：3×3 shaped
//   布局：  R . R      红石 × 2（上排两角）
//           B P B      黄铜板 | 精密构件 | 黄铜板（中行）
//           X . X      其他矿物粉 × 2（下排两角，按特性选 1 种）
//
// 组合效果（4-6 号）：3×3 shaped
//   布局：  R B X      红石 | 黄铜 | 其他粉（对角分布）
//           P B P      精密 | 黄铜 | 精密
//           X B R      其他粉 | 黄铜 | 红石
//
// 符号:
//   R = minecraft:redstone         (红石粉)
//   B = create:brass_sheet         (黄铜板)
//   P = create:precision_mechanism (精密构件)
//   X = 其他矿物粉（铁/金/铜 中选 1 种，按遗物主题匹配）
// ============================================================

ServerEvents.recipes(event => {
    // 主题 → 粉末 tag 映射
    //   满意度/美观 → 金粉
    //   金钱/交易   → 铜粉
    //   体力/坚韧   → 铁粉
    let POW_GOLD   = '#forge:dusts/gold'
    let POW_COPPER = '#forge:dusts/copper'
    let POW_IRON   = '#forge:dusts/iron'
    let RED = 'minecraft:redstone'
    let BRASS = 'create:brass_sheet'
    let PM = 'create:precision_mechanism'

    // -------- ① 单一效果芯片（3 个） --------
    let singleChips = [
        { id: 'marguerite:basic_chip_toe',    powder: POW_GOLD,   theme: '悦心 / 满意度 → 金粉' },
        { id: 'marguerite:basic_chip_sole',   powder: POW_COPPER, theme: '敛财 / 金钱   → 铜粉' },
        { id: 'marguerite:basic_chip_center', powder: POW_IRON,   theme: '省力 / 体力   → 铁粉' }
    ]

    for (let i = 0; i < singleChips.length; i++) {
        let c = singleChips[i]
        try {
            event.shaped(c.id, [
                'R R',
                'BPB',
                'X X'
            ], {
                R: RED,
                B: BRASS,
                P: PM,
                X: c.powder
            }).id('kubejs:relic_recipe_' + c.id.split(':')[1])
            console.log('[RELIC-RECIPE] 单一效果: ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    // -------- ② 组合效果芯片（3 个） --------
    let comboChips = [
        { id: 'marguerite:basic_chip_heel',  powder: POW_GOLD,   theme: '逐利 / 金钱+满意 → 金粉' },
        { id: 'marguerite:general_chip_all', powder: POW_COPPER, theme: '温柔 / 满意+金钱 → 铜粉' },
        { id: 'marguerite:synergy_chip_toe', powder: POW_IRON,   theme: '全能 / 满意+金钱+体力 → 铁粉' }
    ]

    for (let i = 0; i < comboChips.length; i++) {
        let c = comboChips[i]
        try {
            event.shaped(c.id, [
                'RBX',
                'PBP',
                'XBR'
            ], {
                R: RED,
                B: BRASS,
                P: PM,
                X: c.powder
            }).id('kubejs:relic_recipe_' + c.id.split(':')[1])
            console.log('[RELIC-RECIPE] 组合效果: ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    console.log('[RELIC-RECIPE] 第一阶段 6 个芯片合成配方注册完成')
})
