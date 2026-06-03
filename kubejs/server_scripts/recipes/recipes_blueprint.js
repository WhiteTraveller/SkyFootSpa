// ============================================================
// 工程师蓝图配方修改
// ------------------------------------------------------------
// 将 IE 工程师蓝图配方中的铝锭替换为金锭
// 原因：本整合包不走铝产线，用金锭替代
// ============================================================

ServerEvents.recipes(event => {
    // 将所有蓝图配方中的铝锭替换为金锭
    try {
        event.replaceInput(
            { output: 'immersiveengineering:blueprint' },
            'immersiveengineering:ingot_aluminum',
            'minecraft:gold_ingot'
        )
        console.log('[BLUEPRINT] 已将蓝图配方中的铝锭替换为金锭')
    } catch (e) {
        console.log('[BLUEPRINT] 蓝图配方铝→金替换失败: ' + e)
    }
})
