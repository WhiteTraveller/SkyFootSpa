// ============================================================
// 自定义遗物提示框 (ApricityUI Tooltip)
// 仅对已注册遗物物品生效，模仿雨中冒险2设计风格
// ============================================================

let DOC_PATH = "kubejs/tooltip.html"
let document
let tooltipRoot
let guideArea
let tooltipReady = false
let lastItemId = ""
let lastSeenAt = 0
let isShowingCustom = false
let lastPosX = -1
let lastPosY = -1

// 构建遗物ID集合 (延迟初始化，确保 relicRegister 已加载)
let relicIdSet = null
// 遗物稀有度颜色缓存 (避免每次遍历)
let relicColorCache = null

function getRelicIdSet() {
    if (relicIdSet != null) return relicIdSet
    relicIdSet = {}
    relicColorCache = {}
    if (global.relicRegister && global.relicRegister.relics) {
        let relics = global.relicRegister.relics
        for (let i = 0; i < relics.length; i++) {
            let id = "marguerite:" + relics[i].name
            relicIdSet[id] = true
            // 预缓存稀有度颜色（使用实际RGB值，避免CSS变量在内联样式中不生效）
            let color = "rgb(189, 180, 61)"  // gold (默认)
            let rarity = relics[i].rarity
            if (rarity && rarity.name) {
                if (rarity.name === "少见") color = "rgb(88, 149, 88)"      // green
                else if (rarity.name === "稀有") color = "rgb(163, 77, 132)" // purple
                else if (rarity.name === "史诗") color = "rgb(142, 50, 50)"  // red
            }
            relicColorCache[id] = color
        }
        console.log('[TOOLTIP] 已加载 ' + relics.length + ' 个遗物ID到tooltip过滤集')
    }
    return relicIdSet
}

function isRelicItem(stack) {
    if (!stack || stack.isEmpty()) return false
    let id = "" + stack.getId()
    return getRelicIdSet()[id] === true
}

function ensureTooltipOnce() {
    if (tooltipReady) return
    if (ApricityUI.getDocument(DOC_PATH).isEmpty()) ApricityUI.createDocument(DOC_PATH)
    if (!ApricityUI.getDocument(DOC_PATH).isEmpty()) {
        document = ApricityUI.getDocument(DOC_PATH).get(0)
        tooltipRoot = document.querySelector("#tooltip")
        guideArea = document.querySelector("#guide-area")
        tooltipReady = true
    }
}

ForgeEvents.onEvent("net.minecraftforge.event.entity.player.ItemTooltipEvent", function(event) {
    let stack = event.getItemStack()
    if (!isRelicItem(stack)) {
        // 非遗物：标记状态
        if (lastSeenAt !== 0) {
            lastSeenAt = 0
            lastItemId = ""
        }
        return
    }
    // 遗物：仅在物品变化时重建DOM
    let currentId = "" + stack.getId()
    if (currentId !== lastItemId) {
        ensureTooltipOnce()
        if (tooltipRoot == null) return
        rebuildTooltip(stack, event, currentId)
        lastItemId = currentId
    }
    lastSeenAt = Date.now()
})

ForgeEvents.onEvent("net.minecraftforge.client.event.RenderTooltipEvent$Pre", function(event) {
    let rtIsRelic = isRelicItem(event.getItemStack())
    if (!rtIsRelic) {
        // 非遗物：确保自定义tooltip不遮挡，让原版正常渲染
        // 用位置判断代替isShowingCustom，避免ClientTickEvent后状态不一致
        if (tooltipReady && tooltipRoot != null && lastPosX !== -9999) {
            tooltipRoot.setAttribute("style", "position: fixed; left: -9999px; top: -9999px;")
            document.body.setAttribute("class", "")
            isShowingCustom = false
            lastPosX = -9999
            lastPosY = -9999
        }
        return
    }
    // 遗物：取消原版渲染，定位自定义tooltip
    if (!tooltipReady) ensureTooltipOnce()
    if (tooltipRoot == null) return
    lastSeenAt = Date.now()
    event.setCanceled(true)
    // 每帧更新位置（不缓存，确保跟随鼠标）
    let px = event.getX()
    let py = event.getY()
    tooltipRoot.setAttribute("style", "position: fixed; left: " + px + "px; top: " + (py - 30) + "px;")
    lastPosX = px
    lastPosY = py
    if (!isShowingCustom) {
        document.body.setAttribute("class", "shown")
        isShowingCustom = true
    }
})

ForgeEvents.onEvent("net.minecraftforge.event.TickEvent$ClientTickEvent", function(event) {
    if (lastSeenAt === 0) return
    if (Date.now() - lastSeenAt <= 50) return
    if (document != null) {
        document.body.setAttribute("class", "hiding")
    }
    // 同时移走tooltip元素，防止遮挡后续非遗物tooltip
    if (tooltipRoot != null) {
        tooltipRoot.setAttribute("style", "position: fixed; left: -9999px; top: -9999px;")
    }
    isShowingCustom = false
    lastSeenAt = 0
    lastPosX = -9999
    lastPosY = -9999
})

function rebuildTooltip(stack, event, itemId) {
    // 从遗物注册表获取数据
    let relicData = getRelicData(itemId)
    if (!relicData) {
        console.log('[TOOLTIP] rebuildTooltip: 未找到遗物数据 ' + itemId)
        return
    }

    console.log('[TOOLTIP] rebuildTooltip: ' + itemId + ', name=' + relicData.name + ', nameZH=' + relicData.nameZH)

    // 填充标题
    let titleEl = document.querySelector("#title")
    if (titleEl) {
        let titleText = relicData.nameZH || relicData.name || ""
        console.log('[TOOLTIP] 设置标题文本: ' + titleText)
        titleEl.innerText = titleText
    } else {
        console.log('[TOOLTIP] 警告: 未找到 #title 元素')
    }
    // 设置标题背景色
    let header = document.querySelector("#header")
    if (header) {
        let color = relicColorCache[itemId] || "rgb(189, 180, 61)"
        header.setAttribute("style", "background-color: " + color + ";")
    }

    // 填充主描述
    let mainDescText = document.querySelector("#main-desc-text")
    if (mainDescText) {
        let descText = ""
        if (relicData.description) {
            descText = relicData.description.getString()
        }
        mainDescText.innerText = descText
    }

    // 填充附描述
    let subDescText = document.querySelector("#sub-desc-text")
    if (subDescText) {
        let specText = ""
        if (relicData.specialDescription) {
            specText = relicData.specialDescription.getString()
        }
        subDescText.innerText = specText
    }

    // 遗物引导区域 - 设置中心格子背景图
    let guideCenter = document.querySelector("#guide-center")
    if (guideCenter) {
        let texturePath = getRelicTexturePath(relicData)
        console.log('[TOOLTIP] guide-center 材质路径: ' + texturePath)
        if (texturePath) {
            guideCenter.setAttribute("style", "background-image: url(" + texturePath + ");")
        } else {
            guideCenter.setAttribute("style", "")
        }
    } else {
        console.log('[TOOLTIP] 警告: 未找到 #guide-center 元素')
    }

    // 填充故事
    let storyText = document.querySelector("#story-text")
    if (storyText) {
        storyText.innerText = relicData.story || ""
    }
}

// 根据物品ID从注册表获取遗物数据（缓存）
let relicDataCache = null

function getRelicData(itemId) {
    if (relicDataCache == null) {
        relicDataCache = {}
        if (global.relicRegister && global.relicRegister.relics) {
            let relics = global.relicRegister.relics
            for (let i = 0; i < relics.length; i++) {
                let id = "marguerite:" + relics[i].name
                relicDataCache[id] = relics[i]
            }
        }
    }
    return relicDataCache[itemId] || null
}

function getRelicTexturePath(relicData) {
    // 优先使用自定义材质
    if (relicData.texture) {
        return relicData.texture
    }
    // 自动按阶段+部位分配芯片材质（ApricityUI路径：纯文件名）
    let partMap = { '_toe': 1, '_sole': 2, '_center': 3, '_heel': 4, '_all': 5 }
    let chipPart = 0
    for (let suffix in partMap) {
        if (relicData.name.endsWith(suffix)) {
            chipPart = partMap[suffix]
            break
        }
    }
    if (relicData.stage >= 1 && relicData.stage <= 5 && chipPart > 0) {
        return "chip_lv" + relicData.stage + "_pt" + chipPart + ".png"
    }
    // 默认使用遗物名称作为材质文件名
    return relicData.name + ".png"
}

console.log('[TOOLTIP] ✅ 自定义遗物提示框已加载')
