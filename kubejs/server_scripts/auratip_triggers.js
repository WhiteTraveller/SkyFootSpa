// priority: -100
// AuraTip: staged teaching flow helpers.
global.aTip = global.aTip || {}

global.aTip.stageKey = "aTipTeaching.stage"
global.aTip.serverTick = 0
global.aTip.pendingShows = global.aTip.pendingShows || []

global.aTip.triggers = {
    pathfinder_open_shop_tip: "kubejs:pathfinder_open_shop",
    pathfinder_voucher_click_tip: "kubejs:pathfinder_voucher_click",
    pathfinder_water_soak_click_tip: "kubejs:pathfinder_water_soak_click",
    pathfinder_rub_foot_tip: "kubejs:pathfinder_rub_foot",
    pathfinder_service_finish_tip: "kubejs:pathfinder_service_finish"
}

global.aTip.getStage = function(player) {
    if (!player || !player.persistentData) return ""
    return "" + player.persistentData.getString(global.aTip.stageKey)
}

global.aTip.setStage = function(player, stage) {
    if (!player || !player.persistentData) return
    player.persistentData.putString(global.aTip.stageKey, stage || "")
}

global.aTip.clearStage = function(player) {
    global.aTip.setStage(player, "")
}

global.aTip.canClose = function() {
    return typeof TipTriggers !== "undefined" && typeof TipTriggers.close === "function"
}

global.aTip.closePlayerTip = function(player) {
    if (!player || !global.aTip.canClose()) return false
    TipTriggers.close(player)
    return true
}

global.aTip.show = function(id, player) {
    if (typeof TipTriggers === "undefined") {
        console.log("[ATIP] TipTriggers is undefined for " + id)
        return false
    }
    if (!player) return false

    let trigger = global.aTip.triggers[id]
    if (!trigger) {
        console.log("[ATIP] trigger missing for " + id)
        return false
    }

    console.log("[ATIP] trigger " + id + " -> " + trigger)
    TipTriggers.trigger(trigger, player)
    return true
}

global.aTip.queueShow = function(player, tipId, delayTicks) {
    if (!player || !tipId) return false

    let dueTick = global.aTip.serverTick + Math.max(1, delayTicks || 1)
    global.aTip.pendingShows.push({
        player: player,
        tipId: tipId,
        dueTick: dueTick
    })
    console.log("[ATIP] queued " + tipId + " for " + player.getUuid() + " at tick " + dueTick)
    return true
}

global.aTip.closeThenShow = function(player, tipId, delayTicks) {
    if (!player || !tipId) return false

    global.aTip.closePlayerTip(player)
    return global.aTip.queueShow(player, tipId, delayTicks || 1)
}

global.aTip.startOpenShop = function(player) {
    if (!player) return 0

    global.aTip.setStage(player, "wait_pathfinder_click")
    global.aTip.closeThenShow(player, "pathfinder_open_shop_tip", 1)
    return 1
}

global.aTip.advance = function(player, expectedStage, nextStage, nextTipId) {
    if (!player) return false

    let currentStage = global.aTip.getStage(player)
    if (currentStage !== expectedStage) {
        console.log("[ATIP] advance blocked: expected=" + expectedStage + ", current=" + currentStage + ", nextTip=" + nextTipId)
        return false
    }

    global.aTip.setStage(player, nextStage)
    global.aTip.closeThenShow(player, nextTipId, 1)
    console.log("[ATIP] advance " + expectedStage + " -> " + nextStage + ", nextTip=" + nextTipId)
    return true
}

global.aTip.resetCommand = function(context) {
    let player = context.source.player
    if (!player) return 0

    global.aTip.closePlayerTip(player)
    global.aTip.clearStage(player)

    player.tell("[AuraTip] Reset teaching stage.")
    return 1
}

global.aTip.debugShowCommand = function(context, id) {
    let player = context.source.player
    if (!player) return 0

    let shown = global.aTip.show(id, player)
    if (shown) {
        player.tell("[AuraTip] Debug show: " + id)
        return 1
    }

    player.tell("[AuraTip] Debug show failed: " + id)
    return 0
}

global.aTip.findPlayerByUuid = function(level, uuid) {
    if (!level || !uuid || uuid.length === 0) return null

    let players = level.getPlayers()
    for (let i = 0; i < players.size(); i++) {
        let player = players.get(i)
        if (("" + player.getUuid()) === uuid) return player
    }

    return null
}

global.aTip.findActionPlayer = function(entity, level) {
    if (entity) {
        let item = entity.getMainHandItem()
        if (item && item.nbt) {
            let uuid = "" + item.nbt.getString("pfActionPlayerUuid")
            let player = global.aTip.findPlayerByUuid(level, uuid)
            if (player) return player
        }
        // 退化：通过实体上持久化的 pfSpawnerPlayerUuid 反查开店玩家
        try {
            let spawnerUuid = "" + entity.persistentData.getString("pfSpawnerPlayerUuid")
            if (spawnerUuid && spawnerUuid.length > 0) {
                let p = global.aTip.findPlayerByUuid(level, spawnerUuid)
                if (p) return p
            }
        } catch (e) {}
    }

    return null
}

ServerEvents.commandRegistry(event => {
    let Commands = event.commands

    event.register(
        Commands.literal("auratip_openshop")
            .executes(context => global.aTip.startOpenShop(context.source.player))
    )

    event.register(
        Commands.literal("auratip_reset")
            .executes(context => global.aTip.resetCommand(context))
    )

    event.register(
        Commands.literal("auratip_debug_show")
            .then(Commands.literal("pathfinder_open_shop_tip")
                .executes(context => global.aTip.debugShowCommand(context, "pathfinder_open_shop_tip")))
            .then(Commands.literal("pathfinder_voucher_click_tip")
                .executes(context => global.aTip.debugShowCommand(context, "pathfinder_voucher_click_tip")))
            .then(Commands.literal("pathfinder_water_soak_click_tip")
                .executes(context => global.aTip.debugShowCommand(context, "pathfinder_water_soak_click_tip")))
            .then(Commands.literal("pathfinder_rub_foot_tip")
                .executes(context => global.aTip.debugShowCommand(context, "pathfinder_rub_foot_tip")))
            .then(Commands.literal("pathfinder_service_finish_tip")
                .executes(context => global.aTip.debugShowCommand(context, "pathfinder_service_finish_tip")))
    )
})

ServerEvents.tick(() => {
    global.aTip.serverTick++

    if (!global.aTip.pendingShows || global.aTip.pendingShows.length === 0) {
        return
    }

    let remaining = []
    for (let i = 0; i < global.aTip.pendingShows.length; i++) {
        let entry = global.aTip.pendingShows[i]
        if (!entry || !entry.player || !entry.tipId) {
            continue
        }

        if (entry.dueTick > global.aTip.serverTick) {
            remaining.push(entry)
            continue
        }

        global.aTip.show(entry.tipId, entry.player)
    }

    global.aTip.pendingShows = remaining
})
