// priority: 5
// ============================================================
// 第二章：皴块进阶处理线配方
// ------------------------------------------------------------
// 产线流程：
//   ① 皴块 + 水(1000mb) → [动力搅拌(不加热)] → 皴水(1000mb) + 洗净的皴块
//   ② 洗净的皴块 → [黄铜/进阶黄铜筛网] → 矿粒 + 煤炭(30%/45%)
//   ③ 皴水(8000mb) → [动力搅拌(加热)] → 赛特斯石英
// ============================================================

ServerEvents.recipes(event => {
    // ========== ① 动力搅拌：皴块 + 水 → 皴水 + 洗净皴块 ==========
    if (event.recipes && event.recipes.create && typeof event.recipes.create.mixing === 'function') {
        try {
            event.recipes.create.mixing(
                // 输出：皴水(1000mb) + 洗净的皴块(1个)
                [
                    Fluid.of('kubejs:cun_water', 1000),
                    Item.of('marguerite:cleaned_cun_block')
                ],
                // 输入：皴块(1个) + 水(1000mb)
                [
                    Item.of('marguerite:cun_block'),
                    Fluid.of('minecraft:water', 1000)
                ]
            ).id('kubejs:cun_water_wash')
            console.log('[CUN-PROC] ① 水洗搅拌配方已注册: 皴块+水 → 皴水+洗净皴块')
        } catch (e) {
            console.log('[CUN-PROC] ① 水洗搅拌配方注册失败: ' + e)
        }
    } else {
        console.log('[CUN-PROC] ① Create mixing API 不可用，跳过')
    }

    // ========== ② 洗净皴块筛网配方 ==========
    // 只有黄铜筛网和进阶黄铜筛网（线筛网不能筛洗净皴块）
    // 基础矿粒产出同皴块，额外产出煤炭
    let cleanedCunBaseChances = {
        iron: 0.40, copper: 0.40, zinc: 0.40, gold: 0.20, quartz: 0.20
    }
    let cleanedCunMeshes = [
        { mesh: 'createsifter:brass_mesh',          mult: 1.50, idTag: 'brass',          coalChance: 0.30 },
        { mesh: 'createsifter:advanced_brass_mesh', mult: 2.25, idTag: 'advanced_brass', coalChance: 0.45 }
    ]
    for (let i = 0; i < cleanedCunMeshes.length; i++) {
        let m = cleanedCunMeshes[i]
        try {
            event.custom({
                type: 'createsifter:sifting',
                ingredients: [
                    { item: 'marguerite:cleaned_cun_block' },
                    { item: m.mesh }
                ],
                processingTime: 500,
                results: [
                    { chance: +(cleanedCunBaseChances.iron   * m.mult).toFixed(4), item: 'minecraft:iron_nugget',   count: 3 },
                    { chance: +(cleanedCunBaseChances.copper * m.mult).toFixed(4), item: 'create:copper_nugget',     count: 3 },
                    { chance: +(cleanedCunBaseChances.zinc   * m.mult).toFixed(4), item: 'create:zinc_nugget',       count: 3 },
                    { chance: +(cleanedCunBaseChances.gold   * m.mult).toFixed(4), item: 'minecraft:gold_nugget',   count: 3 },
                    { chance: +(cleanedCunBaseChances.quartz * m.mult).toFixed(4), item: 'minecraft:quartz',         count: 3 },
                    { chance: m.coalChance,                                         item: 'minecraft:coal',           count: 1 }
                ]
            }).id('kubejs:sift_cleaned_cun_block_' + m.idTag)
            console.log('[CUN-PROC] ② 洗净皴块筛网配方已注册: ' + m.mesh + ' (煤炭 ' + (m.coalChance * 100) + '%)')
        } catch (e) {
            console.log('[CUN-PROC] ② 洗净皴块筛网配方注册失败 (' + m.mesh + '): ' + e)
        }
    }

    // ========== ③ 动力搅拌(加热)：皴水 → 赛特斯石英 ==========
    if (event.recipes && event.recipes.create && typeof event.recipes.create.mixing === 'function') {
        try {
            event.recipes.create.mixing(
                // 输出：赛特斯石英 ×1
                [
                    Item.of('ae2:certus_quartz_crystal')
                ],
                // 输入：皴水 8000mb
                [
                    Fluid.of('kubejs:cun_water', 8000)
                ]
            ).heated().id('kubejs:cun_water_to_certus_quartz')
            console.log('[CUN-PROC] ③ 加热搅拌配方已注册: 皴水(8000mb)加热 → 赛特斯石英')
        } catch (e) {
            console.log('[CUN-PROC] ③ 加热搅拌配方注册失败: ' + e)
        }
    } else {
        console.log('[CUN-PROC] ③ Create mixing API 不可用，跳过')
    }

    console.log('[CUN-PROC] 第二章皴处理线配方注册完成（共3步）')
})
