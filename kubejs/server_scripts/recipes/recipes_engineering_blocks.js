// priority: 5
// ============================================================
// 第二章：工程块与高级电子元件配方升级
// ------------------------------------------------------------
// 轻型工程块(crafting/light_engineering)与
// 红石工程块(crafting/rs_engineering)原配方板金属用
// forge:sheetmetals/iron，改为 forge:sheetmetals/steel。
// 重型工程块(crafting/heavy_engineering)中心由琥珀金锭
// 改为高级电子元件(component_electronic_adv)。
// 高级电子元件(blueprint/component_electronic_adv)：
// 铝线(forge:wires/aluminum)→琥珀金线(forge:wires/electrum)，
// 真空管(electron_tube)×2→精密构件(create:precision_mechanism)×2。
// 红石工程块是 IE 自定义类型 turn_and_copy，高级电子元件是
// blueprint 类型，均直接删原配方按原 JSON 重建，确保换料生效。
// ============================================================

ServerEvents.recipes(event => {
    // 轻型工程块：minecraft:crafting_shaped
    event.remove({ id: 'immersiveengineering:crafting/light_engineering' })
    event.custom({
        type: 'minecraft:crafting_shaped',
        category: 'misc',
        key: {
            c: { tag: 'forge:ingots/copper' },
            g: { item: 'immersiveengineering:component_iron' },
            i: { tag: 'forge:sheetmetals/steel' }
        },
        pattern: ['igi', 'gcg', 'igi'],
        result: { count: 4, item: 'immersiveengineering:light_engineering' },
        show_notification: true
    })

    // 红石工程块：immersiveengineering:turn_and_copy
    event.remove({ id: 'immersiveengineering:crafting/rs_engineering' })
    event.custom({
        type: 'immersiveengineering:turn_and_copy',
        category: 'misc',
        key: {
            c: { tag: 'forge:ingots/copper' },
            i: { tag: 'forge:sheetmetals/steel' },
            r: { tag: 'forge:dusts/redstone' }
        },
        pattern: ['iri', 'rcr', 'iri'],
        quarter_turn: true,
        result: { count: 4, item: 'immersiveengineering:rs_engineering' }
    })

    // 重型工程块：中心琥珀金锭→高级电子元件，钢零件/钢板金属不变
    event.remove({ id: 'immersiveengineering:crafting/heavy_engineering' })
    event.custom({
        type: 'minecraft:crafting_shaped',
        category: 'misc',
        key: {
            e: { item: 'immersiveengineering:component_electronic_adv' },
            g: { item: 'immersiveengineering:component_steel' },
            i: { tag: 'forge:sheetmetals/steel' }
        },
        pattern: ['igi', 'geg', 'igi'],
        result: { count: 4, item: 'immersiveengineering:heavy_engineering' },
        show_notification: true
    })

    // 高级电子元件（工程师装配台 components 蓝图）：
    // 塑料板不变，真空管×2→精密构件×2，铝线→琥珀金线
    event.remove({ id: 'immersiveengineering:blueprint/component_electronic_adv' })
    event.custom({
        type: 'immersiveengineering:blueprint',
        category: 'components',
        inputs: [
            { tag: 'forge:plates/plastic' },
            { base_ingredient: { item: 'create:precision_mechanism' }, count: 2 },
            { tag: 'forge:wires/electrum' }
        ],
        result: { item: 'immersiveengineering:component_electronic_adv' }
    })

    console.log('[ENG-BLOCK] 轻型/红石工程块板金属改钢；重型中心改高级电子元件；高级电子元件改精密构件+琥珀金线')
})
