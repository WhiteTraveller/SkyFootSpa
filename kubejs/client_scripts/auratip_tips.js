// AuraTip: persistent informational tips for right-click interactions.
if (typeof TipEvents !== "undefined") {
    TipEvents.register(event => {
        event.create("sign_right_click_tip")
            .trigger("kubejs:sign_right_click", "repeatable", 0)
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
            .page(0, p => {
                p.title(
                    TipText.of("\u544a\u793a\u724c\u63d0\u793a")
                        .colorHex("#FFE6C15A")
                        .bold()
                        .build(),
                    0.9,
                    0
                )
                p.titleDivider(1, 3, 4, 1.0, "#FFE6C15A")
                p.content(
                    TipText.of("\u4f60\u6b63\u5728\u4f7f\u7528\u544a\u793a\u724c\u3002\n\u8fd9\u91cc\u53ef\u4ee5\u653e\u7f6e\u8bf4\u660e\u3001\u89c4\u5219\u6216\u6559\u7a0b\u4fe1\u606f\u3002\n\u6309 Delete \u5173\u95ed\uff1bESC \u4e5f\u80fd\u5173\u95ed\uff0c\u4f46\u4f1a\u6253\u5f00\u6682\u505c\u83dc\u5355\u3002")
                        .colorHex("#FFF4E8C8")
                        .build(),
                    0.72,
                    2
                )
            })
    })
}

// AuraTip: show the same style of persistent tip when a bed block is used.
if (typeof TipEvents !== "undefined") {
    TipEvents.register(event => {
        event.create("bed_right_click_tip")
            .trigger("kubejs:bed_right_click", "repeatable", 0)
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
            .page(0, p => {
                p.title(
                    TipText.of("\u5e8a\u94fa\u63d0\u793a")
                        .colorHex("#FFE6C15A")
                        .bold()
                        .build(),
                    0.9,
                    0
                )
                p.titleDivider(1, 3, 4, 1.0, "#FFE6C15A")
                p.content(
                    TipText.of("\u662f\u9009\u62e9\u7761\u89c9\u8fd8\u662f\u7ed9\u5ba2\u6237\u6ce1\u811a\uff1f\n\u6309 Delete \u5173\u95ed\uff1bESC \u4e5f\u80fd\u5173\u95ed\uff0c\u4f46\u4f1a\u6253\u5f00\u6682\u505c\u83dc\u5355\u3002")
                        .colorHex("#FFF4E8C8")
                        .build(),
                    0.72,
                    2
                )
            })
    })
}
