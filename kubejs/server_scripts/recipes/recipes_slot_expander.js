// priority: 10
// ============================================================
// 栏位扩大器（slot_expander）合成配方
// ------------------------------------------------------------
// MK1：3×3 shaped
//   I C I        I = create:iron_sheet   铁板
//   C P C        C = create:copper_sheet 铜板
//   I C I        P = create:precision_mechanism 精密构件
//   产出：1 个 marguerite:slot_expander_mk1
// 后续 MK2~MK5 配方暂未提供，需要时按相同范式扩展。
// ============================================================

ServerEvents.recipes(event => {
    try {
        event.shaped('marguerite:slot_expander_mk1', [
            'ICI',
            'CPC',
            'ICI'
        ], {
            I: 'create:iron_sheet',
            C: 'create:copper_sheet',
            P: 'create:precision_mechanism'
        }).id('kubejs:slot_expander_mk1')
        console.log('[SLOT-EXPANDER] 配方已注册: 4铁板+4铜板+精密构件 -> slot_expander_mk1')
    } catch (e) {
        console.log('[SLOT-EXPANDER] 配方注册失败 mk1: ' + e)
    }
})
