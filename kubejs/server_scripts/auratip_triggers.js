// AuraTip: trigger persistent tips from server-side right-click interactions.
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

        TipTriggers.trigger("kubejs:sign_right_click", player)
    })

    BlockEvents.rightClicked("#minecraft:beds", event => {
        let player = event.player
        if (!player) return

        let level = event.level
        if (level && level.isClientSide()) return

        TipTriggers.trigger("kubejs:bed_right_click", player)
    })
}
