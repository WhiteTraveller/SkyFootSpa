// priority: 10
// ============================================================
// 筋膜枪合成配方 (工作台) - 保留NBT电力
// ------------------------------------------------------------
// 无头筋膜枪 + 头 → 有头筋膜枪 (通过 modifyResult 转移 pfFE)
// ============================================================

ServerEvents.recipes(function(event) {
    var parts = ['jiaozhi', 'jiaozhang', 'jiaoxin', 'jiaogen']

    for (var i = 0; i < parts.length; i++) {
        (function(part) {
            try {
                event.recipes.kubejs.shapeless(
                    Item.of('marguerite:fascia_gun_' + part),
                    [
                        'marguerite:fascia_gun',
                        'marguerite:fascia_gun_head_' + part
                    ]
                )
                .modifyResult(function(grid, result) {
                    var gun = grid.find(Ingredient.of('marguerite:fascia_gun'))
                    if (gun && gun.nbt) {
                        var fe = gun.nbt.getInt('pfFE')
                        if (fe > 0) {
                            result = result.withNBT({pfFE: fe})
                        }
                    }
                    return result
                })
                .id('kubejs:fascia_gun_' + part)
                console.log('[FASCIA-GUN] 配方已注册(保留NBT): 无头筋膜枪 + 头(' + part + ') → 筋膜枪(' + part + ')')
            } catch (e) {
                console.log('[FASCIA-GUN] 配方注册失败(' + part + '): ' + e)
            }
        })(parts[i])
    }
})