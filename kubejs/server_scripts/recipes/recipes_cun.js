// ============================================================
// "皴" 相关合成配方
// ------------------------------------------------------------
// 1) 9 个皴 无序合成 1 个皴块（marguerite:cun_block）
// 2) Create: Sifter 筛网配方（皴块 → 铁粒/铜粒/锌粒/金粒/下界石英）
//    参考：https://wiki.mechanicalmods.net/mods/create-sifter/recipes/
//    概率（原 0.20/0.20/0.20/0.10/0.10 × 2）：
//      铁粒 40%  铜粒 40%  锌粒 40%  金粒 20%  下界石英 20%
// ============================================================

ServerEvents.recipes(event => {
    // 0) 移除 Create-Sifter 自带的沙砾筛选配方（避免走捷径白嫖矿物）
    try {
        event.remove({ type: 'createsifter:sifting', input: 'minecraft:gravel' })
        console.log('[CUN] 已移除 createsifter 的沙砾筛选配方')
    } catch (e) {
        console.log('[CUN] 移除沙砾筛选配方失败: ' + e)
    }

    // 1) 9 皴 -> 1 皴块
    try {
        let cun = 'marguerite:cun'
        event.shapeless('marguerite:cun_block', [
            cun, cun, cun,
            cun, cun, cun,
            cun, cun, cun
        ]).id('kubejs:cun_to_cun_block')
        console.log('[CUN] 合成配方已注册: 9 皴 -> 1 皴块')
    } catch (e) {
        console.log('[CUN] 合成配方(皴块)注册失败: ' + e)
    }

    // 2) 皴块 -> 筛网产出
    // schema（本地 createsifter 版本）: ingredients:input_item[], results:output_item[], processingTime?, waterlogged?, minimumSpeed?
    // 三个筛网等级 × 不同产量倍率：
    //   - string_mesh           1.00×  基础概率
    //   - brass_mesh            1.50×  高级黄铜筛
    //   - advanced_brass_mesh   2.25×  进阶黄铜筛
    let cunSiftBaseChances = {
        iron: 0.40, copper: 0.40, zinc: 0.40, gold: 0.20, quartz: 0.20
    }
    let cunSiftMeshes = [
        { mesh: 'createsifter:string_mesh',         mult: 1.00, idTag: 'string' },
        { mesh: 'createsifter:brass_mesh',          mult: 1.50, idTag: 'brass' },
        { mesh: 'createsifter:advanced_brass_mesh', mult: 2.25, idTag: 'advanced_brass' }
    ]
    for (let i = 0; i < cunSiftMeshes.length; i++) {
        let m = cunSiftMeshes[i]
        try {
            event.custom({
                type: 'createsifter:sifting',
                ingredients: [
                    { item: 'marguerite:cun_block' },
                    { item: m.mesh }
                ],
                processingTime: 500,
                results: [
                    { chance: +(cunSiftBaseChances.iron   * m.mult).toFixed(4), item: 'minecraft:iron_nugget' },
                    { chance: +(cunSiftBaseChances.copper * m.mult).toFixed(4), item: 'create:copper_nugget' },
                    { chance: +(cunSiftBaseChances.zinc   * m.mult).toFixed(4), item: 'create:zinc_nugget' },
                    { chance: +(cunSiftBaseChances.gold   * m.mult).toFixed(4), item: 'minecraft:gold_nugget' },
                    { chance: +(cunSiftBaseChances.quartz * m.mult).toFixed(4), item: 'minecraft:quartz' }
                ]
            }).id('kubejs:sift_cun_block_' + m.idTag)
            console.log('[CUN] 筛网配方已注册: 皴块 + ' + m.mesh + ' ×' + m.mult)
        } catch (e) {
            console.log('[CUN] 筛网配方注册失败 (' + m.mesh + '): ' + e)
        }
    }
})
