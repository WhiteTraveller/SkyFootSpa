// AuraTip: trigger persistent tips from server-side right-click interactions.
global.aTip = global.aTip || {}

global.aTip.triggers = global.aTip.triggers || {
    sign_right_click_tip: "kubejs:sign_right_click",
    bed_right_click_tip: "kubejs:bed_right_click"
}

global.aTip.show = function(id, player) {
    if (typeof TipTriggers === "undefined") return
    if (!player) return

    let trigger = global.aTip.triggers[id]
    if (!trigger) return

    TipTriggers.trigger(trigger, player)
}

if (typeof TipTriggers !== "undefined") {
    ItemEvents.rightClicked(event => {
        let player = event.getPlayer()
        if (!player) return

        let level = player.getLevel()
        if (level && level.isClientSide()) return

        let item = event.getItem()
        if (!item || item.isEmpty()) return

        let isSign = false

        try {
            isSign = Ingredient.of("#minecraft:signs").test(item)
        } catch (ignored) {
        }

        if (!isSign) {
            try {
                isSign = item.hasTag && item.hasTag("minecraft:signs")
            } catch (ignored) {
            }
        }

        if (!isSign) {
            let itemId = "" + item.getId()
            isSign = itemId.indexOf("minecraft:") === 0 && itemId.endsWith("_sign")
        }

        if (!isSign) return

        global.aTip.show("sign_right_click_tip", player)
    })

    BlockEvents.rightClicked("#minecraft:beds", event => {
        let player = event.player
        if (!player) return

        let level = event.level
        if (level && level.isClientSide()) return

        global.aTip.show("bed_right_click_tip", player)
    })
}
