// ============================================================
// 遗物自定义 HTML tooltip（ApricityUI）
// ForgeEvents 只在 startup_scripts 提供；客户端渲染监听器必须按物理端隔离。
// ============================================================

if (Platform.isClientEnvironment()) {
    (function() {
        let DOC_PATH = "kubejs/tooltip.html"
        let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")
        let AuiPosition = Java.loadClass("com.sighs.apricityui.layout.Position")
        let tooltipDocument = null
        let tooltipRoot = null
        let tooltipReady = false
        let lastItemId = ""
        let lastSeenAt = 0
        let isShowingCustom = false
        let lastPosX = -1
        let lastPosY = -1

        let relicIdSet = null
        let relicColorCache = null
        let relicDataCache = null

        function getRelicIdSet() {
            if (relicIdSet != null) return relicIdSet

            relicIdSet = {}
            relicColorCache = {}
            let relics = global.relicRegister && global.relicRegister.relics
            if (!relics) return relicIdSet

            for (let i = 0; i < relics.length; i++) {
                let relic = relics[i]
                let id = "marguerite:" + relic.name
                relicIdSet[id] = true

                let color = "rgb(189, 180, 61)" // gold（默认）
                let rarity = relic.rarity
                if (rarity && rarity.name === "少见") color = "rgb(88, 149, 88)"
                else if (rarity && rarity.name === "稀有") color = "rgb(163, 77, 132)"
                else if (rarity && rarity.name === "史诗") color = "rgb(142, 50, 50)"
                relicColorCache[id] = color
            }

            console.log("[TOOLTIP] 已加载 " + relics.length + " 个遗物ID到HTML tooltip过滤集")
            return relicIdSet
        }

        function isRelicItem(stack) {
            if (!stack || stack.isEmpty()) return false
            return getRelicIdSet()["" + stack.getId()] === true
        }

        function ensureTooltipOnce() {
            if (tooltipReady && tooltipDocument != null && tooltipRoot != null) return true

            // ApricityUI 1.2.5.3 的 getDocument 返回文档列表；优先复用已有页面。
            let documents = ApricityUI.getDocument(DOC_PATH)
            if (documents != null && !documents.isEmpty()) {
                tooltipDocument = documents.get(0)
            } else {
                // createDocument 在资源不存在时返回 null。
                tooltipDocument = ApricityUI.createDocument(DOC_PATH)
            }

            if (tooltipDocument == null) {
                console.error("[TOOLTIP] 无法创建 ApricityUI 文档: " + DOC_PATH)
                return false
            }

            // 遗物 tooltip 会在背包/JEI Screen 上显示；普通 Overlay 在 Screen 打开时会隐藏。
            tooltipDocument.setReloadPersistent(true)

            tooltipRoot = tooltipDocument.getElementById("tooltip")
            if (tooltipRoot == null) {
                console.error("[TOOLTIP] HTML 中找不到 #tooltip: " + DOC_PATH)
                tooltipDocument = null
                return false
            }

            tooltipReady = true
            return true
        }

        function hideCustomTooltip(animate) {
            if (tooltipDocument != null) {
                tooltipDocument.body.setAttribute("class", animate ? "hiding" : "")
            }
            if (tooltipRoot != null) {
                tooltipRoot.setAttribute("style", "position: fixed; left: -9999px; top: -9999px;")
            }

            isShowingCustom = false
            lastSeenAt = 0
            lastPosX = -9999
            lastPosY = -9999
        }

        ForgeEvents.onEvent("net.minecraftforge.event.entity.player.ItemTooltipEvent", function(event) {
            let stack = event.getItemStack()
            if (!isRelicItem(stack)) {
                if (lastSeenAt !== 0) {
                    lastSeenAt = 0
                    lastItemId = ""
                }
                return
            }

            let currentId = "" + stack.getId()
            if (!ensureTooltipOnce()) return

            if (currentId !== lastItemId) {
                if (!rebuildTooltip(currentId)) return
                lastItemId = currentId
            }
            lastSeenAt = Date.now()
        })

        ForgeEvents.onEvent("net.minecraftforge.client.event.RenderTooltipEvent$Pre", function(event) {
            let stack = event.getItemStack()
            if (!isRelicItem(stack)) {
                if (tooltipRoot != null && lastPosX !== -9999) hideCustomTooltip(false)
                return
            }

            let currentId = "" + stack.getId()
            if (!ensureTooltipOnce()) return

            // 渲染事件前重新核对当前物品，确保卡片内容对应本帧物品。
            if (currentId !== lastItemId) {
                if (!rebuildTooltip(currentId)) return
                lastItemId = currentId
            }

            lastSeenAt = Date.now()
            event.setCanceled(true)

            // browser viewport 与 Minecraft GUI 坐标可能不同，使用 AUI 坐标换算。
            let docPos = tooltipDocument.screenToDocumentPosition(new AuiPosition(event.getX(), event.getY()))
            let px = docPos.x
            let py = docPos.y
            tooltipRoot.setAttribute("style", "position: fixed; left: " + px + "px; top: " + (py - 30) + "px;")
            lastPosX = px
            lastPosY = py

            if (!isShowingCustom) {
                tooltipDocument.body.setAttribute("class", "shown")
                isShowingCustom = true
            }
        })

        ForgeEvents.onEvent("net.minecraftforge.event.TickEvent$ClientTickEvent", function(event) {
            if (lastSeenAt === 0 || Date.now() - lastSeenAt <= 50) return
            hideCustomTooltip(true)
        })

        function rebuildTooltip(itemId) {
            let relicData = getRelicData(itemId)
            if (!relicData) {
                console.warn("[TOOLTIP] 未找到遗物数据: " + itemId)
                return false
            }

            let titleEl = tooltipDocument.getElementById("title")
            if (titleEl) titleEl.innerText = relicData.nameZH || relicData.name || ""

            let header = tooltipDocument.getElementById("header")
            if (header) {
                let color = relicColorCache[itemId] || "rgb(189, 180, 61)"
                header.setAttribute("style", "background-color: " + color + ";")
            }

            let mainDescText = tooltipDocument.getElementById("main-desc-text")
            if (mainDescText) {
                let description = relicData.description
                mainDescText.innerText = description ? description.getString() : ""
            }

            let subDescText = tooltipDocument.getElementById("sub-desc-text")
            if (subDescText) {
                let specialDescription = relicData.specialDescription
                subDescText.innerText = specialDescription ? specialDescription.getString() : ""
            }

            updateGuideGrid(relicData)

            let storyText = tooltipDocument.getElementById("story-text")
            if (storyText) storyText.innerText = relicData.story || ""
            return true
        }

        function updateGuideGrid(relicData) {
            let guideRows = relicData.guideTexture || []
            for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
                let row = rowIndex < guideRows.length ? guideRows[rowIndex] : null
                let siblings = row != null ? row.getSiblings() : null

                for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
                    let cell = tooltipDocument.getElementById("guide-cell-" + (rowIndex * 5 + columnIndex))
                    if (!cell) continue

                    let segment = null
                    if (columnIndex === 0) {
                        segment = row
                    } else if (siblings != null && siblings.size() >= columnIndex) {
                        segment = siblings.get(columnIndex - 1)
                    }

                    let textColor = segment != null ? segment.getStyle().getColor() : null
                    let style = ""
                    if (textColor == null) {
                        style = ""
                    } else {
                        let rgb = Number(textColor.getValue())
                        let red = (rgb >> 16) & 255
                        let green = (rgb >> 8) & 255
                        let blue = rgb & 255
                        style = "background-color: rgb(" + red + ", " + green + ", " + blue + ");"
                    }

                    if (rowIndex === 2 && columnIndex === 2) {
                        let texturePath = getRelicTexturePath(relicData)
                        if (texturePath) style += "background-image: url(" + texturePath + ");"
                    }
                    cell.setAttribute("style", style)
                }
            }
        }

        function getRelicData(itemId) {
            if (relicDataCache == null) {
                relicDataCache = {}
                let relics = global.relicRegister && global.relicRegister.relics
                if (relics) {
                    for (let i = 0; i < relics.length; i++) {
                        relicDataCache["marguerite:" + relics[i].name] = relics[i]
                    }
                }
            }
            return relicDataCache[itemId] || null
        }

        function getRelicTexturePath(relicData) {
            if (relicData.texture) return relicData.texture

            let partMap = { "_toe": 1, "_sole": 2, "_center": 3, "_heel": 4, "_all": 5 }
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
            return relicData.name + ".png"
        }

        console.log("[TOOLTIP] 遗物 ApricityUI HTML tooltip 客户端事件已注册")
    })()
}
