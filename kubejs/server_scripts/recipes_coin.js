// ============================================================
// 硬币升级配方（coinsje）
// ------------------------------------------------------------
// 规则：9 个下级硬币 无序合成 1 个上级硬币
//   copper  -> iron
//   iron    -> gold
//   gold    -> diamond
//   diamond -> netherite
// 面额体系参考 sleep.js 结算分支（1:9 递进）
// ------------------------------------------------------------
// 额外：移除 coinsje 原版"9 硬币 → 1 coin_pile"的所有合成配方，
//       避免与本插件的升阶链条冲突/抢夺玩家的硬币素材。
// ============================================================

ServerEvents.recipes(event => {
    // ---------------- A) 移除所有 xxx_coin_pile 合成 ----------------
    let pileIds = [
        'coinsje:copper_coin_pile',
        'coinsje:iron_coin_pile',
        'coinsje:gold_coin_pile',
        'coinsje:diamond_coin_pile',
        'coinsje:netherite_coin_pile'
    ]
    for (let i = 0; i < pileIds.length; i++) {
        let pid = pileIds[i]
        try {
            // 按"输出"移除（覆盖 shapeless/shaped 等所有合成类型）
            event.remove({ output: pid })
            console.log('[COIN] 已移除合成配方 (output=' + pid + ')')
        } catch (e) {
            console.log('[COIN] 移除合成配方失败 ' + pid + ': ' + e)
        }
    }

    // ---------------- B) 注册硬币升阶链 ----------------
    let upgrades = [
        { from: 'coinsje:copper_coin',   to: 'coinsje:iron_coin',      id: 'kubejs:coin_copper_to_iron' },
        { from: 'coinsje:iron_coin',     to: 'coinsje:gold_coin',      id: 'kubejs:coin_iron_to_gold' },
        { from: 'coinsje:gold_coin',     to: 'coinsje:diamond_coin',   id: 'kubejs:coin_gold_to_diamond' },
        { from: 'coinsje:diamond_coin',  to: 'coinsje:netherite_coin', id: 'kubejs:coin_diamond_to_netherite' }
    ]

    for (let i = 0; i < upgrades.length; i++) {
        let u = upgrades[i]
        try {
            event.shapeless(u.to, [
                u.from, u.from, u.from,
                u.from, u.from, u.from,
                u.from, u.from, u.from
            ]).id(u.id)
            console.log('[COIN] 合成配方已注册: 9 ' + u.from + ' -> 1 ' + u.to)
        } catch (e) {
            console.log('[COIN] 合成配方注册失败 ' + u.id + ': ' + e)
        }
    }
})
