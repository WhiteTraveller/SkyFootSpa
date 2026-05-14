// AuraTip: teaching tips for the pathfinder service flow.
global.aTip = global.aTip || {}

const ATIP_DELETE_HINT = "\n按 Delete 可手动关闭当前提示。"

// 注册tip id trigger title content
global.aTip.tips = [
    {
        id: "pathfinder_open_shop_tip",
        trigger: "kubejs:pathfinder_open_shop",
        title: "开店引导",
        content: "右键寻路方块以开店，进入下一流程。\n此消息为教学流程，只展示一次。\n如需回顾请使用 /auratip_openshop 指令。" + ATIP_DELETE_HINT
    },
    {
        id: "pathfinder_night_close_tip",
        trigger: "kubejs:pathfinder_night_close",
        title: "夜晚无法开店",
        content: "现在是夜晚，暂时无法开店；请等待白天后再右键寻路方块。" + ATIP_DELETE_HINT
    },
    {
        id: "pathfinder_voucher_click_tip",
        trigger: "kubejs:pathfinder_voucher_click",
        title: "预约凭证提示",
        content: "手持预约凭证右键寻路方块，会消耗凭证并召唤顾客。\n顾客会沿红色地毯寻找空闲床位。\n在空闲床位不足时，会在蓝色地毯处排队等候。\n服务结束，顾客会走到黄色地毯处并消失。" + ATIP_DELETE_HINT
    },
    {
        id: "pathfinder_water_soak_click_tip",
        trigger: "kubejs:pathfinder_water_soak_click",
        title: "泡脚提示",
        content: "手持水桶右击，将泡脚 UI 上的空桶填满。\n不同的泡脚水会有奇妙的效果。\n等待直至泡脚倒计时完成，随后自动跳转搓脚界面。" + ATIP_DELETE_HINT
    },
    {
        id: "pathfinder_rub_foot_tip",
        trigger: "kubejs:pathfinder_rub_foot",
        title: "搓脚提示",
        content: "玩家可以选择佩戴不同的遗物，搭配会影响体力消耗、金钱和满意度。" + ATIP_DELETE_HINT
    },
    {
        id: "pathfinder_service_finish_tip",
        trigger: "kubejs:pathfinder_service_finish",
        title: "流程结束",
        content: "顾客到达路径终点并消失后，本提示会自动关闭；若未触发则 5 秒后自动消失。\n注意收集顾客留下来的奖励。" + ATIP_DELETE_HINT,
        durationTicks: 100
    }
]

// 注册tip样式
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
    let builder = global.aTip.stylePersistentRight(
        event.create(tip.id)
            .trigger(tip.trigger, "repeatable", 0)
    )

    if (tip.durationTicks != null) {
        builder = builder.behavior(b => {
            b.duration(tip.durationTicks)
            b.pauseOnHover(true)
            b.closeKey("key.keyboard.delete")
            b.allowPaging(false)
        })
    }

    builder.page(0, p => {
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
