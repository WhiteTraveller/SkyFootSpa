// ============================================================
// "皴" 相关合成配方
// ------------------------------------------------------------
// 1) 9 个皴 无序合成 1 个皴块（marguerite:cun_block）
// 2) Create: Sifter 筛网配方（皴块 → 铁粒/铜粒/锌粒/金粒）
//    参考：https://wiki.mechanicalmods.net/mods/create-sifter/recipes/
//    概率按常识（丰度倒序）：
//      铁粒 40%  铜粒 30%  锌粒 20%  金粒 10%
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
    try {
        event.custom({
            type: 'createsifter:sifting',
            ingredients: [
                { item: 'marguerite:cun_block' },
                { item: 'createsifter:string_mesh' }
            ],
            processingTime: 500,
            results: [
                { chance: 0.20, item: 'minecraft:iron_nugget' },
                { chance: 0.20, item: 'create:copper_nugget' },
                { chance: 0.20, item: 'create:zinc_nugget' },
                { chance: 0.10, item: 'minecraft:gold_nugget' },
                { chance: 0.10, item: 'minecraft:quartz' }
            ]
        }).id('kubejs:sift_cun_block')
        console.log('[CUN] 筛网配方已注册: 皴块 -> 铁/铜/锌/金粒')
    } catch (e) {
        console.log('[CUN] 筛网配方注册失败: ' + e)
    }
})
