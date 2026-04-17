// ============================================================
// Serve 系统 - 精油（抹油）扩展
//
// 规则：
// - 玩家手持精油点击任意现有按钮（部位/泡脚）时，判定为“抹油”，不消耗需求、不开始泡脚；
// - 抹油成功后，接下来若干次“有效点击”（需求>0）会获得额外奖励；
// - 奖励次数耗尽后，清除 UI 显示字段。
// ============================================================

let OIL_ITEM_ID = 'marguerite:oil'
let OIL_CHARGES = 5
let OIL_SAT_BONUS = 5
let OIL_MONEY_BONUS = 1

function serveIsHoldingOil(player) {
    let stack = player.getMainHandItem()
    return stack && stack.id === OIL_ITEM_ID
}

function serveDamageOil(player) {
    if (player.creative) return
    let stack = player.getMainHandItem()
    if (!stack || stack.id !== OIL_ITEM_ID) return
    stack.hurtAndBreak(1, player, (_player) => true)
    player.setMainHandItem(stack)
}

global.registerServeClickHook(ctx => {
    if (!ctx || !ctx.player || !ctx.targetEntity || !ctx.item || !ctx.nbt) return

    if (serveIsHoldingOil(ctx.player)) {
        serveDamageOil(ctx.player)
        ctx.nbt.merge({
            pfOilId: OIL_ITEM_ID,
            pfOilLeft: OIL_CHARGES
        })
        ctx.message = '§a已抹油：精油（' + OIL_CHARGES + '次）'
        ctx.cancel = true
        return
    }

    if (!ctx.isEffective) return

    let left = ctx.nbt.getInt('pfOilLeft') || 0
    if (left <= 0) return

    ctx.satGain = (ctx.satGain || 0) + OIL_SAT_BONUS
    ctx.moneyGain = (ctx.moneyGain || 0) + OIL_MONEY_BONUS

    left--
    ctx.nbt.pfOilLeft = left
    if (left <= 0) {
        ctx.nbt.merge({ pfOilId: '' })
    }
})
