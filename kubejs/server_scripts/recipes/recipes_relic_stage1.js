// priority: 10
// ============================================================
// 第一阶段芯片遗物合成配方（每个配方粉末组合唯一）
// ------------------------------------------------------------
// 全部 6 个芯片均为 3×3 shaped，模板 RBR / PXP / RYR（2 精密构件）：
//   R B R
//   P X P      R=红石, B=黄铜板, P=精密构件
//   R Y R      X=主效果粉, Y=副效果粉（(X,Y) 组合全表唯一）
//
// 粉末主题映射：满意度→金粉(G)、金钱→铜粉(C)、体力→铁粉(I)
// 基础 ×4：双效果，X≠Y（主效果粉 + 副效果粉）
// 位置 ×2：单效果（留白=满意+1、余地=金钱+1），X=Y=主题粉；
//          生效仍需上方/下方相邻槽位为空（效果条件不变，仅新增合成途径）
// ============================================================

ServerEvents.recipes(event => {
    let G = '#forge:dusts/gold'      // 满意度主题
    let C = '#forge:dusts/copper'    // 金钱主题
    let I = '#forge:dusts/iron'      // 体力主题
    let RED   = 'minecraft:redstone'
    let BRASS = 'create:brass_sheet'
    let PM    = 'create:precision_mechanism'

    // 基础 ×4（双效果，主粉X + 副粉Y）+ 位置 ×2（单效果，X=Y=主题粉）
    let chips = [
        { id: 'marguerite:basic_chip_sole',   X: C, Y: I, theme: '勤劳 金钱+1/体力+10 → 铜+铁' },
        { id: 'marguerite:basic_chip_toe',    X: C, Y: G, theme: '敛财 金钱+1/满意-1 → 铜+金' },
        { id: 'marguerite:basic_chip_center', X: I, Y: G, theme: '懈怠 体力-20/满意-2 → 铁+金' },
        { id: 'marguerite:basic_chip_heel',   X: G, Y: I, theme: '热情 满意+1/体力+20 → 金+铁' },
        { id: 'marguerite:void_chip_all',     X: G, Y: G, theme: '留白 满意+1（上方需空）→ 金+金' },
        { id: 'marguerite:margin_chip_all',   X: C, Y: C, theme: '余地 金钱+1（下方需空）→ 铜+铜' }
    ]
    for (let i = 0; i < chips.length; i++) {
        let c = chips[i]
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
            console.log('[RELIC-RECIPE] ' + c.id + '  (' + c.theme + ')')
        } catch (e) {
            console.log('[RELIC-RECIPE] 失败 ' + c.id + ': ' + e)
        }
    }

    console.log('[RELIC-RECIPE] 第一阶段 6 个芯片配方注册完成（基础 4 + 位置 2）')
})