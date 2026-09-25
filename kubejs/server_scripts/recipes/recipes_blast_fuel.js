// priority: 5
// ============================================================
// 第二章：高炉燃料限制
// ------------------------------------------------------------
// IE 默认高炉燃料四种：焦煤、焦煤块、木炭、木炭块
// （data/immersiveengineering/recipes/blastfurnace/fuel_*.json）。
// 本包只保留焦煤/焦煤块：煤炭必须先过焦炭炉烧成焦煤才能进高炉炼钢。
// ============================================================

ServerEvents.recipes(event => {
    let removed = [
        'immersiveengineering:blastfurnace/fuel_charcoal',
        'immersiveengineering:blastfurnace/fuel_charcoal_block'
    ]
    for (let i = 0; i < removed.length; i++) {
        try {
            event.remove({ id: removed[i] })
            console.log('[BLAST-FUEL] 已移除木炭高炉燃料: ' + removed[i])
        } catch (e) {
            console.log('[BLAST-FUEL] 移除失败 (' + removed[i] + '): ' + e)
        }
    }
})
