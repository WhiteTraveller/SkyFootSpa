// ============================================================
// 电解质水瓶 · 右键饮用逻辑
// ------------------------------------------------------------
// 依赖：global.pfRestoreStamina (server_scripts/stamina.js)
// 依赖：global.ELECTROLYTE_BOTTLE (startup_scripts/item/electrolyte_bottle.js)
// 效果：恢复 500 体力（无副作用，无使用冷却）
// ============================================================

ItemEvents.rightClicked(event => {
    let player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    let item = event.getItem()
    if (!item) return
    let itemId = "" + item.getId()
    if (itemId !== "marguerite:electrolyte_bottle") return

    let cfg = global.ELECTROLYTE_BOTTLE
    if (!cfg) return

    // 消耗物品
    if (!player.isCreative()) {
        item.shrink(1)
    }

    // 恢复体力
    if (typeof global.pfRestoreStamina === 'function') {
        global.pfRestoreStamina(player, cfg.stamina)
    }

    player.tell(Text.aqua("§b💧 饮用电解质水 §7- 恢复 §a" + cfg.stamina + " §7体力"))
    // 无使用 CD，不调用 player.addItemCooldown
})
