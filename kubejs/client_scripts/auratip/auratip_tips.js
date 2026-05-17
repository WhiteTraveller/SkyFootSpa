// AuraTip: teaching tips for the pathfinder service flow.
global.aTip = global.aTip || {}

global.aTip.tips = [
    {
        id: "pathfinder_open_shop_tip",
        trigger: "kubejs:pathfinder_open_shop",
        title: "开店提示",
        content: "右键寻路方块，开始店铺流程。\n系统会引导你进入下一步。"
    },
    {
        id: "pathfinder_voucher_click_tip",
        trigger: "kubejs:pathfinder_voucher_click",
        title: "预约凭证提示",
        content: "手持预约凭证右键寻路方块，消耗凭证并召唤顾客。"
    },
    {
        id: "pathfinder_water_soak_click_tip",
        trigger: "kubejs:pathfinder_water_soak_click",
        title: "泡脚提示",
        content: "手持水桶点击泡脚 UI，成功后会进入搓脚阶段。"
    },
    {
        id: "pathfinder_rub_foot_tip",
        trigger: "kubejs:pathfinder_rub_foot",
        title: "搓脚提示",
        content: "顾客开始泡脚后，继续完成搓脚相关操作。"
    },
    {
        id: "pathfinder_service_finish_tip",
        trigger: "kubejs:pathfinder_service_finish",
        title: "流程结束",
        content: "顾客服务完成并下床，当前教学流程结束。"
    }
]

global.aTip.stylePersistentRight = function(builder) {
    return builder
        .visual(v => {
            v.animationStyle("auratip:fade_and_slide")
            v.animationSpeed(0.85)
            v.animationFrom("RIGHT_CENTER")
            v.animationTo("RIGHT_CENTER")
            v.size(240, 96)
            v.position("RIGHT_CENTER")
            v.themeColor("#FFE6C15A")
            v.background("gradient", ["#EE161816", "#DD252015"], 6)
            v.backgroundRounded(true)
            v.hoverAnimationStyle("auratip:none")
        })
        .behavior(b => {
            b.duration(-1)
            b.pauseOnHover(true)
            b.closeKey("key.keyboard.delete")
            b.allowPaging(false)
        })
}

global.aTip.page = function(page, title, content) {
    page.title(
        TipText.of(title)
            .colorHex("#FFE6C15A")
            .bold()
            .build(),
        0.9,
        0
    )
    page.titleDivider(1, 3, 4, 1.0, "#FFE6C15A")
    page.content(
        TipText.of(content)
            .colorHex("#FFF4E8C8")
            .build(),
        0.72,
        2
    )
}

global.aTip.register = function(event, tip) {
    global.aTip.stylePersistentRight(
        event.create(tip.id)
            .trigger(tip.trigger, "repeatable", 0)
    ).page(0, p => {
        global.aTip.page(p, tip.title, tip.content)
    })
}

global.aTip.registerAll = function(event) {
    for (let i = 0; i < global.aTip.tips.length; i++) {
        global.aTip.register(event, global.aTip.tips[i])
    }
}

if (typeof TipEvents !== "undefined") {
    TipEvents.register(event => {
        console.log("[ATIP-CLIENT] register teaching tips v2 count=" + global.aTip.tips.length)
        global.aTip.registerAll(event)
    })
}
