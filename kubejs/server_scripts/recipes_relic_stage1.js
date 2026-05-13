// priority: 10
// ============================================================
// 第一阶段芯片遗物合成配方（每个配方粉末组合唯一）
// ------------------------------------------------------------
// 普通 ×5（2 精密构件）3×3 shaped：
//   R B R
//   P X P      R=红石, B=黄铜板, P=精密构件
//   R Y R      X=主效果粉, Y=副效果粉（两者不同，组合唯一）
//
// 高级 ×3（4 精密构件）3×3 shaped：
//   P B P
//   X Y Z      4 精密构件 + 2 黄铜板 + 中间行 3 种粉末
//   P B P
//
// 稀有 ×4（无法合成，仅通过特殊渠道获得）
//
// 粉末主题映射：满意度→金粉(G)、金钱→铜粉(C)、体力→铁粉(I)
// ============================================================

ServerEvents.recipes(event => {
    let G = '#forge:dusts/gold'      // 满意度主题
    let C = '#forge:dusts/copper'    // 金钱主题
    let I = '#forge:dusts/iron'      // 体力主题
    let RED   = 'minecraft:redstone'
    let BRASS = 'create:brass_sheet'
    let PM    = 'create:precision_mechanism'

    // -------- ① 普通 ×5（2 精密构件，主粉X + 副粉Y 组合唯一） --------
    // 每个配方 (X, Y) 按效果映射：主效果粉 + 副效果粉
    let commonChips = [
        { id: 'marguerite:basic_chip_toe',    X: C, Y: G, theme: '悦心 金钱+1/满意-1 → 铜+金' },
        { id: 'marguerite:basic_chip_sole',   X: C, Y: I, theme: '敛财 金钱+1/体力+10 → 铜+铁' },
        { id: 'marguerite:basic_chip_center', X: I, Y: G, theme: '省力 体力-10/满意-1 → 铁+金' },
        { id: 'marguerite:basic_chip_heel',   X: I, Y: C, theme: '逐利 体力-10/金钱-1 → 铁+铜' },
        { id: 'marguerite:general_chip_all',  X: G, Y: I, theme: '温柔 满意+1/体力+10 → 金+铁' }
    ]
    for (let i = 0; i < commonChips.length; i++) {
        let c = commonChips[i]
        try {
            event.shaped(c.id, [
                'RBR',
                'PXP',
                'RYR'
            ], {
                R: RED,
                B: BRASS,
                P: PM,
                X: c.X,
                Y: c.Y
            }).id('kubejs:relic_recipe_' + c.id.split(':')[1])
            console.log('[RELIC-RECIPE] 普通: ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    // -------- ② 高级 ×3（4 精密构件，中间行三粉组合唯一） --------
    // 中间行 X Y Z 三粉位置，每配方组合唯一
    let uncommonChips = [
        { id: 'marguerite:synergy_chip_toe', X: C, Y: C, Z: G, theme: '全能 金钱+2/满意-2 → 铜/铜/金' },
        { id: 'marguerite:focus_chip_sole',  X: I, Y: G, Z: C, theme: '沉淀 体力-20/满意-1/金钱-1 → 铁/金/铜' },
        { id: 'marguerite:eco_chip_center',  X: G, Y: G, Z: I, theme: '节能 满意+2/体力+20 → 金/金/铁' }
    ]
    for (let i = 0; i < uncommonChips.length; i++) {
        let c = uncommonChips[i]
        try {
            event.shaped(c.id, [
                'PBP',
                'XYZ',
                'PBP'
            ], {
                B: BRASS,
                P: PM,
                X: c.X,
                Y: c.Y,
                Z: c.Z
            }).id('kubejs:relic_recipe_' + c.id.split(':')[1])
            console.log('[RELIC-RECIPE] 高级: ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    // -------- ③ 稀有 ×4（不注册合成，仅通过特殊渠道获得） --------
    // 爆发 / 连携 / 精修 / 舒缓 —— 不提供合成配方

    console.log('[RELIC-RECIPE] 第一阶段 8 个可合成芯片配方注册完成（稀有 4 个不可合成）')
})
