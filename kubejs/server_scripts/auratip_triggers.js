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

    })

    BlockEvents.rightClicked("#minecraft:beds", event => {

    })
}
