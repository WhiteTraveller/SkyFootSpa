// priority: 5
// ============================================================
// 第三章：魔力金属产线（承接石油分馏之后的重工业升级）
// ------------------------------------------------------------
// 主链：
//   魔力粉(marguerite:magic_dust)
//     →[沉浸工业·回转窑]→ 魔力锭(magic_ingot)
//     →[电气时代·激发器充能]→ 充能魔力锭(energized_magic_ingot)
//     →[IE·金属冲压机(板材模具)]→ 充能魔力锭板(energized_magic_plate)
//     →[工作台合成]→ 重型机械方块(heavy_machinery_block)
//     →[沉浸工业·车窑]→ 充能魔力块(energized_magic_block)
//
// 门槛改造（沿用「高级电子元件解锁难机器」的分级思路，见 docs/08）：
//   · 回转窑滚筒(rotary_kiln_cylinder) 复合窑壁掺入 高级电子元件
//   · 激发器(basic_energiser) 合成掺入 高级电子元件
//   · 车窑砖(car_kiln_brick) 核心改用 重型机械方块（重型机械方块门槛车窑）
//   · 斗轮挖掘机沿用 IE 重型工程块（已由高级电子元件门槛），仅在任务链上串接
//
// 终产物「充能魔力块」= 最强磁铁 + IE 高炉超高热值燃料（第三章燃料目标）。
// 挖掘机产出锇(mekanism)，为第四章做提前准备。
//
// 配方类型来源（实测自模组 jar）：
//   immersiveindustry:rotary_kiln  —— input(物品) → result(物品) + 可选 result_fluid/byproduct（无流体输入）
//   immersiveindustry:car_kiln     —— inputs[](base_ingredient+count) + 可选 input_fluid → results[]
//   create_new_age:energising      —— energy_needed + ingredients[] → results[]
//   immersiveengineering:metal_press —— energy + input + mold + result
//   immersiveengineering:blast_furnace_fuel —— input + time
//   immersiveengineering:mineral_mix —— dimensions[] + ores[] + spoils[] + weight + fail_chance
// ============================================================

ServerEvents.recipes(event => {
    // ========== ① 回转窑：魔力粉 → 魔力锭 ==========
    try {
        event.custom({
            type: 'immersiveindustry:rotary_kiln',
            input: { item: 'marguerite:magic_dust' },
            result: { item: 'marguerite:magic_ingot' },
            time: 400
        }).id('kubejs:ch3_rotary_kiln_magic_ingot')
        console.log('[CH3-MAGIC] ① 回转窑: 魔力粉 → 魔力锭')
    } catch (e) {
        console.log('[CH3-MAGIC] ① 回转窑配方注册失败: ' + e)
    }

    // ========== ② 激发器充能：魔力锭 → 充能魔力锭 ==========
    try {
        event.custom({
            type: 'create_new_age:energising',
            energy_needed: 20000,
            ingredients: [
                { item: 'marguerite:magic_ingot' }
            ],
            results: [
                { item: 'marguerite:energized_magic_ingot' }
            ]
        }).id('kubejs:ch3_energising_magic_ingot')
        console.log('[CH3-MAGIC] ② 激发器充能: 魔力锭 → 充能魔力锭 (20000 FE)')
    } catch (e) {
        console.log('[CH3-MAGIC] ② 充能配方注册失败: ' + e)
    }

    // ========== ③ 金属冲压机（板材模具）：充能魔力锭 → 充能魔力锭板 ==========
    try {
        event.custom({
            type: 'immersiveengineering:metal_press',
            energy: 2400,
            input: { item: 'marguerite:energized_magic_ingot' },
            mold: 'immersiveengineering:mold_plate',
            result: { item: 'marguerite:energized_magic_plate' }
        }).id('kubejs:ch3_metal_press_magic_plate')
        console.log('[CH3-MAGIC] ③ 金属冲压机: 充能魔力锭 → 充能魔力锭板')
    } catch (e) {
        console.log('[CH3-MAGIC] ③ 冲压配方注册失败: ' + e)
    }

    // ========== ④ 工作台合成：8 充能魔力锭板 + 重型工程块 → 重型机械方块 ==========
    try {
        event.shaped('marguerite:heavy_machinery_block', [
            'ppp',
            'php',
            'ppp'
        ], {
            p: 'marguerite:energized_magic_plate',
            h: 'immersiveengineering:heavy_engineering'
        }).id('kubejs:ch3_heavy_machinery_block')
        console.log('[CH3-MAGIC] ④ 合成: 8充能魔力锭板 + 重型工程块 → 重型机械方块')
    } catch (e) {
        console.log('[CH3-MAGIC] ④ 重型机械方块合成失败: ' + e)
    }

    // ========== ⑤ 车窑：9 充能魔力锭板 → 充能魔力块 ==========
    try {
        event.custom({
            type: 'immersiveindustry:car_kiln',
            inputs: [
                { base_ingredient: { item: 'marguerite:energized_magic_plate' }, count: 9 }
            ],
            results: [
                { item: 'marguerite:energized_magic_block' }
            ],
            time: 800,
            tickEnergy: 64
        }).id('kubejs:ch3_car_kiln_magic_block')
        console.log('[CH3-MAGIC] ⑤ 车窑: 9充能魔力锭板 → 充能魔力块')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑤ 车窑配方注册失败: ' + e)
    }

    // ========== ⑥ 终产物：充能魔力块 = IE 高炉超高热值燃料（焦煤的 20 倍）==========
    try {
        event.custom({
            type: 'immersiveengineering:blast_furnace_fuel',
            input: { item: 'marguerite:energized_magic_block' },
            time: 24000
        }).id('kubejs:ch3_energized_magic_block_blast_fuel')
        console.log('[CH3-MAGIC] ⑥ 高炉燃料: 充能魔力块 time=24000（焦煤 1200 的 20 倍）')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑥ 高炉燃料配方注册失败: ' + e)
    }

    // ========== ⑦ 旧地狱锇矿脉：斗轮挖掘机产出锇（第四章提前准备）==========
    // 注意：旧地狱(marguerite:old_hell)为 flat 生成器且 features=false，
    // IE 矿物脉世界特征默认不会自然生成，需另配生成或用 /ie mineral 命令放置（见 docs/04）。
    try {
        event.custom({
            type: 'immersiveengineering:mineral_mix',
            dimensions: ['marguerite:old_hell'],
            weight: 30,
            fail_chance: 0.1,
            ores: [
                { chance: 0.55, output: { item: 'mekanism:raw_osmium' } },
                { chance: 0.25, output: { item: 'mekanism:osmium_ore' } },
                { chance: 0.20, output: { tag: 'forge:dusts/sulfur' } }
            ],
            spoils: [
                { chance: 0.5, output: { item: 'minecraft:netherrack' } },
                { chance: 0.3, output: { item: 'minecraft:cobblestone' } },
                { chance: 0.2, output: { item: 'minecraft:gravel' } }
            ],
            sample_background: 'minecraft:netherrack'
        }).id('kubejs:ch3_old_hell_osmium_vein')
        console.log('[CH3-MAGIC] ⑦ 旧地狱锇矿脉已注册（斗轮挖掘机产出锇）')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑦ 矿物脉配方注册失败: ' + e)
    }

    // ============================================================
    // 门槛改造（删原配方按新料重建，确保换料生效）
    // ============================================================

    // ========== ⑧ 回转窑滚筒：复合窑壁掺入高级电子元件 ==========
    // 原配方：耐火窑砖×3 / 红砖×3 / 钢板×3。改后中间行中心红砖→高级电子元件。
    try {
        event.remove({ output: 'immersiveindustry:rotary_kiln_cylinder' })
        event.custom({
            type: 'minecraft:crafting_shaped',
            category: 'misc',
            key: {
                a: { item: 'immersiveindustry:refractory_kiln_brick' },
                c: { item: 'minecraft:brick' },
                e: { item: 'immersiveengineering:component_electronic_adv' },
                b: { tag: 'forge:plates/steel' }
            },
            pattern: ['aaa', 'cec', 'bbb'],
            result: { item: 'immersiveindustry:rotary_kiln_cylinder', count: 2 },
            show_notification: true
        }).id('kubejs:ch3_rotary_kiln_cylinder_gated')
        console.log('[CH3-MAGIC] ⑧ 回转窑滚筒复合窑壁已掺入高级电子元件')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑧ 回转窑滚筒改造失败: ' + e)
    }

    // ========== ⑨ 激发器：合成掺入高级电子元件 ==========
    // 原配方（无序）：安山机壳 + 避雷针。改后追加 高级电子元件。
    try {
        event.remove({ output: 'create_new_age:basic_energiser' })
        event.custom({
            type: 'minecraft:crafting_shapeless',
            category: 'misc',
            ingredients: [
                { item: 'create:andesite_casing' },
                { item: 'minecraft:lightning_rod' },
                { item: 'immersiveengineering:component_electronic_adv' }
            ],
            result: { item: 'create_new_age:basic_energiser' }
        }).id('kubejs:ch3_basic_energiser_gated')
        console.log('[CH3-MAGIC] ⑨ 激发器合成已掺入高级电子元件')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑨ 激发器改造失败: ' + e)
    }

    // ========== ⑩ 车窑砖：核心改用重型机械方块（门槛车窑）==========
    // 原配方：耐火窑砖×3 / 铜线圈(中心) / 钢板×3。改后中心铜线圈→重型机械方块。
    try {
        event.remove({ output: 'immersiveindustry:car_kiln_brick' })
        event.custom({
            type: 'minecraft:crafting_shaped',
            category: 'misc',
            key: {
                a: { item: 'immersiveindustry:refractory_kiln_brick' },
                m: { item: 'marguerite:heavy_machinery_block' },
                b: { tag: 'forge:plates/steel' }
            },
            pattern: ['aaa', 'ama', 'bbb'],
            result: { item: 'immersiveindustry:car_kiln_brick', count: 2 },
            show_notification: true
        }).id('kubejs:ch3_car_kiln_brick_gated')
        console.log('[CH3-MAGIC] ⑩ 车窑砖核心已改用重型机械方块')
    } catch (e) {
        console.log('[CH3-MAGIC] ⑩ 车窑砖改造失败: ' + e)
    }
})
