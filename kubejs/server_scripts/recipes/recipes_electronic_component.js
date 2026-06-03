// ============================================================
// 电子元件配方（IE 工程师装配台）
// ------------------------------------------------------------
// 替代 IE 原版电子元件配方，保留工程师装配台制作方式
// 材料：2精密构件 + 4钢线(wire_steel) + 2红石 + 1铁板
// 输出: 电子元件 (immersiveengineering:component_electronic) ×1
// 需要蓝图: components
// ============================================================

ServerEvents.recipes(event => {
    // 移除 IE 原版电子元件配方
    try {
        event.remove({ output: 'immersiveengineering:component_electronic' })
        console.log('[ELEC] 已移除 IE 原版电子元件配方')
    } catch (e) {
        console.log('[ELEC] 移除 IE 原版电子元件配方失败: ' + e)
    }

    // 注册新的 IE 工程师装配台配方 (blueprint)
    try {
        event.custom({
            type: 'immersiveengineering:blueprint',
            category: 'components',
            inputs: [
                { base_ingredient: { item: 'create:precision_mechanism' }, count: 2 },
                { base_ingredient: { item: 'immersiveengineering:wire_steel' }, count: 4 },
                { base_ingredient: { item: 'minecraft:redstone' }, count: 2 },
                { base_ingredient: { item: 'immersiveengineering:plate_iron' }, count: 1 }
            ],
            result: {
                item: 'immersiveengineering:component_electronic',
                count: 1
            }
        }).id('kubejs:electronic_component_blueprint')
        console.log('[ELEC] 电子元件装配台配方已注册: 2精密构件+4钢线(wire_steel)+2红石+1铁板')
    } catch (e) {
        console.log('[ELEC] 电子元件装配台配方注册失败: ' + e)
    }
})
