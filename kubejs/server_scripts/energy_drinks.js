// ============================================================
// 能量饮料使用
// ------------------------------------------------------------
// 依赖：global.pfRestoreStamina (server_scripts/stamina.js)
// 依赖：global.ENERGY_DRINK_TIERS (startup_scripts/energy_drinks.js)
// 效果：恢复体力 + 扣生命 + 20s 饥饿
// ============================================================

ItemEvents.rightClicked(event => {
    let player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    let item = event.getItem()
    if (!item) return
    let itemId = "" + item.getId()
    if (itemId.indexOf("marguerite:energy_drink_") !== 0) return

    let tierStr = itemId.replace("marguerite:energy_drink_", "")
    let tier = parseInt(tierStr)
    if (isNaN(tier) || tier < 1 || tier > 3) return

    // 读配置
    let cfg = null
    let tiers = global.ENERGY_DRINK_TIERS || []
    for (let i = 0; i < tiers.length; i++) {
        if (tiers[i].tier === tier) { cfg = tiers[i]; break }
    }
    if (!cfg) return

    // 消耗物品
    if (!player.isCreative()) {
        item.shrink(1)
    }

    // 1) 恢复体力
    if (typeof global.pfRestoreStamina === 'function') {
        global.pfRestoreStamina(player, cfg.stamina)
    }

    // 2) 扣生命（优先用 /damage 指令触发受伤动画，失败则回退 setHealth）
    try {
        let server = player.getLevel().getServer()
        let name = player.getUsername()
        server.runCommandSilent('damage ' + name + ' ' + cfg.damage + ' minecraft:magic')
    } catch (e) {
        try {
            let hp = player.getHealth()
            let newHp = Math.max(0.5, hp - cfg.damage)
            player.setHealth(newHp)
        } catch (ee) { console.log('[ENERGY_DRINK] 扣血失败: ' + ee) }
    }

    // 3) 饥饿效果 20s
    try {
        let server = player.getLevel().getServer()
        let name = player.getUsername()
        server.runCommandSilent('effect give ' + name + ' minecraft:hunger ' + cfg.hungerSec + ' 0')
    } catch (e) { console.log('[ENERGY_DRINK] 饥饿效果失败: ' + e) }

    player.tell(Text.red("§c⚡ 猛灌能量饮料 §7- 恢复 §a" + cfg.stamina + " §7体力 §8| §c-" + cfg.damage + " §7生命 §8| §6饥饿 " + cfg.hungerSec + "s"))
    try { player.addItemCooldown(item.getItem(), 10) } catch (e) { }
})
