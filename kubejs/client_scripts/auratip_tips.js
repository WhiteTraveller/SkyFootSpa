// AuraTip: teaching tips for the pathfinder service flow.
global.aTip = global.aTip || {}

const ATIP_DELETE_HINT = "\ndelete 关闭"

function atipCodepointUnits(codePoint) {
    if (codePoint === 10 || codePoint === 13) {
        return 0
    }
    if (codePoint <= 0x7f) {
        return 1
    }
    if (codePoint >= 0x2e80) {
        return 2
    }
    return 1
}

function atipIterateChars(text) {
    let chars = []
    let raw = "" + (text == null ? "" : text)
    for (let i = 0; i < raw.length; i++) {
        let codePoint = raw.codePointAt(i)
        chars.push(String.fromCodePoint(codePoint))
        if (codePoint > 0xffff) {
            i++
        }
    }
    return chars
}

global.aTip.measureUnits = function(text) {
    let total = 0
    let chars = atipIterateChars(text)
    for (let i = 0; i < chars.length; i++) {
        let codePoint = chars[i].codePointAt(0)
        total += atipCodepointUnits(codePoint)
    }
    return total
}

global.aTip.stripDeleteHint = function(content) {
    let raw = "" + (content == null ? "" : content)
    if (raw.endsWith(ATIP_DELETE_HINT)) {
        return raw.substring(0, raw.length - ATIP_DELETE_HINT.length)
    }
    return raw
}

global.aTip.wrapLine = function(line, wrapUnits) {
    if (global.aTip.measureUnits(line) <= wrapUnits) {
        return [line]
    }

    let result = []
    let current = ""
    let currentUnits = 0
    let chars = atipIterateChars(line)
    let tokens = []
    for (let i = 0; i < chars.length; i++) {
        let char = chars[i]
        let codePoint = char.codePointAt(0)
        if (codePoint <= 0x7f && char !== " ") {
            let token = char
            while (i + 1 < chars.length) {
                let next = chars[i + 1]
                let nextCodePoint = next.codePointAt(0)
                if (nextCodePoint > 0x7f || next === " ") {
                    break
                }
                token += next
                i++
            }
            tokens.push(token)
        } else {
            tokens.push(char)
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        let units = global.aTip.measureUnits(token)
        if (current !== "" && currentUnits + units > wrapUnits) {
            if (/^[，。；：、！？,.!?;:]$/.test(token)) {
                result.push(current + token)
                current = ""
                currentUnits = 0
                continue
            }
            result.push(current)
            current = token
            currentUnits = units
        } else {
            current += token
            currentUnits += units
        }
    }

    if (current !== "") {
        result.push(current)
    }
    return result
}

global.aTip.wrapContent = function(content, wrapUnits) {
    let mainContent = global.aTip.stripDeleteHint(content)
    let limit = wrapUnits == null ? 26 : wrapUnits
    let sourceLines = mainContent.split("\n")
    let wrappedLines = []

    for (let i = 0; i < sourceLines.length; i++) {
        let line = sourceLines[i]
        if (line === "") {
            wrappedLines.push(line)
            continue
        }

        let lines = global.aTip.wrapLine(line, limit)
        for (let j = 0; j < lines.length; j++) {
            wrappedLines.push(lines[j])
        }
    }

    return wrappedLines.join("\n") + ATIP_DELETE_HINT
}

global.aTip.estimateCardSize = function(title, content, wrapUnits, minWidth, maxWidth, minHeight, maxHeight) {
    let titleLines = (title == null || title === "") ? [] : ("" + title).split("\n")
    let contentLines = (content == null || content === "") ? [] : ("" + content).split("\n")
    let widestUnits = 0

    let lines = titleLines.concat(contentLines)
    for (let i = 0; i < lines.length; i++) {
        let units = global.aTip.measureUnits(lines[i])
        if (units > widestUnits) {
            widestUnits = units
        }
    }

    let layoutUnits = wrapUnits == null ? widestUnits : Math.min(widestUnits, wrapUnits)
    let width = 34 + layoutUnits * 2.6
    if (width < minWidth) width = minWidth
    if (width > maxWidth) width = maxWidth

    let contentLineCount = contentLines.length === 0 ? 1 : contentLines.length
    let height = 43 + contentLineCount * 7
    if (height < minHeight) height = minHeight
    if (height > maxHeight) height = maxHeight

    return { width: width, height: height }
}

function atipResolveLayout(tip) {
    let title = "" + (tip.title == null ? "" : tip.title)
    let content = global.aTip.wrapContent(tip.content, tip.wrapUnits)
    let size = global.aTip.estimateCardSize(title, content, tip.wrapUnits, 104, 124, 54, 86)

    return {
        title: title,
        content: content,
        width: size.width,
        height: size.height
    }
}

// 注册tip id trigger title content
global.aTip.tips = [
    {
        id: "pathfinder_open_shop_tip",
        trigger: "kubejs:pathfinder_open_shop",
        title: "开店引导",
        content: "右键寻路方块以开店，进入下一流程。" + ATIP_DELETE_HINT,
        wrapUnits: 34
    },
    {
        id: "pathfinder_night_close_tip",
        trigger: "kubejs:pathfinder_night_close",
        title: "开店引导",
        content: "现在是夜晚，暂时无法开店；请等待白天后再右键寻路方块。" + ATIP_DELETE_HINT,
        wrapUnits: 26
    },
    {
        id: "pathfinder_voucher_click_tip",
        trigger: "kubejs:pathfinder_voucher_click",
        title: "预约凭证提示",
        content: "手持预约凭证右键寻路方块，会消耗凭证并立即召唤顾客。" + ATIP_DELETE_HINT,
        wrapUnits: 28
    },
    {
        id: "pathfinder_water_soak_click_tip",
        trigger: "kubejs:pathfinder_water_soak_click",
        title: "泡脚提示",
        content: "手持水桶右击，将泡脚 UI 上的空桶填满，等待倒计时完成。" + ATIP_DELETE_HINT,
        wrapUnits: 26
    },
    {
        id: "pathfinder_rub_foot_tip",
        trigger: "kubejs:pathfinder_rub_foot",
        title: "搓脚提示",
        content: "玩家可以选择佩戴不同的遗物，搭配会影响体力消耗、金钱和满意度。" + ATIP_DELETE_HINT,
        wrapUnits: 28
    },
    {
        id: "pathfinder_service_finish_tip",
        trigger: "kubejs:pathfinder_service_finish",
        title: "流程结束",
        content: "顾客到达路径终点后，提示会自动关闭；如需回顾教程使用/auratip openshop。" + ATIP_DELETE_HINT,
        durationTicks: 100,
        wrapUnits: 28
    }
]

// 注册tip样式（教学卡片）
global.aTip.styleTeachingCard = function(builder, layout) {
        let width = layout && layout.width ? layout.width : 116
        let height = layout && layout.height ? layout.height : 42

    return builder
        .visual(v => {
            v.animationStyle("auratip:fade_and_slide")
            v.animationSpeed(0.85)
            v.animationFrom("TOP_RIGHT")
            v.animationTo("TOP_RIGHT")
            v.size(width, height)
            v.position("TOP_RIGHT")
            v.themeColor("#DDE3C95F")
            v.background("gradient", ["#DA282F38", "#C43A4550"], 12)
            v.backgroundRounded(true)
            v.hoverAnimationStyle("auratip:none")
            v.stripeWidth(0)
            v.stripeLengthFactor(0)
        })
        .behavior(b => {
            b.duration(-1)
            b.pauseOnHover(true)
            b.closeKey("key.keyboard.delete")
            b.allowPaging(false)
            b.showCloseButton(false)
            b.showPageIndicator(false)
        })
}

global.aTip.page = function(page, title, content) {
    page.title(
        TipText.of(title)
            .colorHex("#FFF5F4EE")
            .bold()
            .build(),
        1.08,
        0
    )
    page.titleDivider(1, 4, -4, 0.78, "#A8E3C95F")
    page.content(
        TipText.of(content)
            .colorHex("#FFE8E5D8")
            .build(),
        0.70,
        0
    )
}

global.aTip.register = function(event, tip) {
    let layout = atipResolveLayout(tip)
    let builder = global.aTip.styleTeachingCard(
        event.create(tip.id)
            .trigger(tip.trigger, "repeatable", 0),
        layout
    )

    if (tip.durationTicks != null) {
        builder = builder.behavior(b => {
            b.duration(tip.durationTicks)
            b.pauseOnHover(true)
            b.closeKey("key.keyboard.delete")
            b.allowPaging(false)
            b.showCloseButton(false)
            b.showPageIndicator(false)
        })
    }

    builder.page(0, p => {
        global.aTip.page(p, layout.title, layout.content)
    })
}

global.aTip.registerAll = function(event) {
    for (let i = 0; i < global.aTip.tips.length; i++) {
        global.aTip.register(event, global.aTip.tips[i])
    }
}

if (typeof TipEvents !== "undefined") {
    TipEvents.register(event => {
        console.log("[ATIP-CLIENT] register teaching tips v8 wrap-content count=" + global.aTip.tips.length)
        global.aTip.registerAll(event)
    })
}
