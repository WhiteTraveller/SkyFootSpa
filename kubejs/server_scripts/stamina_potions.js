// ============================================================
// 体力药剂使用 + 睡觉恢复体力
// ------------------------------------------------------------
// 依赖：global.pfRestoreStamina (server_scripts/stamina.js)
// 依赖：global.STAMINA_POTION_TIERS (startup_scripts/stamina_potions.js)
// ============================================================

let STAMINA_MAX = 10000
let SLEEP_RESTORE_AMOUNT = 4000        // 睡醒恢复体力
let POTION_AMOUNTS = [0, 1000, 2000, 4000, 6000, 8000]  // index = tier

// ===== 右键饮用体力药剂 =====
ItemEvents.rightClicked(event => {
    let player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    let item = event.getItem()
    if (!item) return
    let itemId = "" + item.getId()
    if (itemId.indexOf("marguerite:stamina_potion_") !== 0) return

    let tierStr = itemId.replace("marguerite:stamina_potion_", "")
    let tier = parseInt(tierStr)
    if (isNaN(tier) || tier < 1 || tier > 5) return

    let amount = POTION_AMOUNTS[tier]
    let stamina = player.persistentData.getInt("pfStamina")
    if (stamina >= STAMINA_MAX) {
        player.tell(Text.yellow("§e体力已满，无需服用"))
        return
    }

    if (!player.isCreative()) {
        item.shrink(1)
    }
    global.pfRestoreStamina(player, amount)

    let actualGain = Math.min(amount, STAMINA_MAX - stamina)
    player.tell(Text.green("§a⚡ 服用体力药剂 §7- 恢复 §a" + actualGain + " §7体力"))
    player.addItemCooldown(item.getItem(), 10)
})

// ===== 睡觉恢复体力（边沿检测）=====
// 通过 PlayerEvents.tick 监测 isSleeping 从 true→false 的跳变，
// 若此时 level 已到白天，视为完整睡眠，恢复体力。
PlayerEvents.tick(event => {
    let player = event.player
    if (!player) return
    let level = player.getLevel()
    if (!level || level.isClientSide()) return
    if (player.tickCount % 5 !== 0) return    // 4Hz 检测

    let data = player.persistentData
    let wasSleeping = data.getBoolean("pfWasSleeping")
    let sleeping = false
    try { sleeping = player.isSleeping() } catch (e) { sleeping = false }

    if (wasSleeping && !sleeping) {
        // 睡眠状态结束：仅在已到白天时判定为完整睡眠
        let dayTime = 0
        try { dayTime = Number(level.getDayTime()) % 24000 } catch (e) { dayTime = 0 }
        if (dayTime >= 0 && dayTime < 12000) {
            let before = data.getInt("pfStamina")
            global.pfRestoreStamina(player, SLEEP_RESTORE_AMOUNT)
            let after = data.getInt("pfStamina")
            let actual = after - before
            player.tell(Text.green("§a☾ 一夜好眠，恢复了 §a" + actual + " §a体力 §7(" + after + "/" + STAMINA_MAX + ")"))
        }
    }
    data.putBoolean("pfWasSleeping", sleeping)
})
