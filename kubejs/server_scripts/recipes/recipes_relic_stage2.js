// priority: 10
// ============================================================
// 第二阶段芯片遗物合成配方（每个配方粉末组合唯一）
// ------------------------------------------------------------
// 镜像第一章骨架，核心材料替换：精密构件→高级电子元件、黄铜板→钢板
//
// 普通 ×5（2 高级电子元件）3×3 shaped：
//   R S R
//   E X E      R=红石, S=钢板, E=高级电子元件
//   R Y R      X=主效果粉, Y=副效果粉（两者不同，组合唯一）
//
// 高级 ×3（4 高级电子元件）3×3 shaped：
//   E S E
//   X Y Z      4 高级电子元件 + 2 钢板 + 中间行 3 种粉末
//   E S E
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
    let STEEL = '#forge:plates/steel'                          // 钢板
    let ELEC  = 'immersiveengineering:component_electronic_adv' // 高级电子元件

    // -------- ① 普通 ×5（2 高级电子元件，主粉X + 副粉Y 组合唯一） --------
    // 每个配方 (X, Y) 按效果映射：主效果粉 + 副效果粉
    let commonChips = [
        { id: 'marguerite:squeeze_chip_toe',    X: C, Y: G, theme: '压榨 金钱+2/满意-2 → 铜+金' },
        { id: 'marguerite:rush_chip_sole',      X: C, Y: I, theme: '赶工 金钱+2/体力+15 → 铜+铁' },
        { id: 'marguerite:slack_chip_center',   X: I, Y: G, theme: '偷懒 体力-15/满意-2 → 铁+金' },
        { id: 'marguerite:idle_chip_heel',      X: I, Y: C, theme: '清闲 体力-15/金钱-2 → 铁+铜' },
        { id: 'marguerite:craft_chip_all',      X: G, Y: I, theme: '匠心 满意+2/体力+15 → 金+铁' }
    ]
    for (let i = 0; i < commonChips.length; i++) {
        let c = commonChips[i]
        try {
            event.shaped(c.id, [
                'RSR',
                'EXE',
                'RYR'
            ], {
                R: RED,
                S: STEEL,
                E: ELEC,
                X: c.X,
                Y: c.Y
            }).id('kubejs:relic_recipe_' + c.id.split(':')[1])
            console.log('[RELIC-RECIPE] 普通: ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    // -------- ② 高级 ×3（4 高级电子元件，中间行三粉组合唯一） --------
    // 中间行 X Y Z 三粉位置，每配方组合唯一
    let uncommonChips = [
        { id: 'marguerite:monopoly_chip_toe',   X: C, Y: C, Z: G, theme: '垄断 金钱+3/满意-3 → 铜/铜/金' },
        { id: 'marguerite:shutdown_chip_sole',  X: I, Y: G, Z: C, theme: '停摆 体力-25/满意-2/金钱-2 → 铁/金/铜' },
        { id: 'marguerite:ardor_chip_center',   X: G, Y: G, Z: I, theme: '热忱 满意+3/体力+24 → 金/金/铁' }
    ]
    for (let i = 0; i < uncommonChips.length; i++) {
        let c = uncommonChips[i]
        try {
            event.shaped(c.id, [
                'ESE',
                'XYZ',
                'ESE'
            ], {
                S: STEEL,
                E: ELEC,
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
    // 聚能 / 忘我 / 摸鱼 / 游刃 —— 不提供合成配方

    console.log('[RELIC-RECIPE] 第二阶段 8 个可合成芯片配方注册完成（稀有 4 个不可合成）')
})
