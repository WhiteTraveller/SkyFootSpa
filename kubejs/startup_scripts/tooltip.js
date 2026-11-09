// ============================================================
// 遗物自定义 HTML tooltip（ApricityUI）
// ForgeEvents 只在 startup_scripts 提供；客户端渲染监听器必须按物理端隔离。
// ============================================================

if (Platform.isClientEnvironment()) {
    (function() {
        let DOC_PATH = "kubejs/tooltip.html"
        let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")
        let AuiPosition = Java.loadClass("com.sighs.apricityui.layout.Position")
        let Minecraft = Java.loadClass("net.minecraft.client.Minecraft")
        let RenderSystem = Java.loadClass("com.mojang.blaze3d.systems.RenderSystem")
        let GameRenderer = Java.loadClass("net.minecraft.client.renderer.GameRenderer")
        let ResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation")
        let tooltipDocument = null
        let tooltipRoot = null
        let tooltipReady = false
        let lastItemId = ""
        let lastSeenAt = 0
        let isShowingCustom = false
        let lastPosX = -1
        let lastPosY = -1

        // 九宫格星标（原版渲染叠在真实槽位上）：星形贴图 256×256、星占左上 18×18
        let NS_STAR_COUNT = 8
        let NS_SLOT = 18
        let nsLastDebugAt = 0
        let STAR_RL = new ResourceLocation("kubejs", "textures/gui/nine_star.png")
        // 与 tooltip_desc_mid.png 高度一致
        let DESC_MID_HEIGHT = 108

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

                // 标题文字色：浅纸底上需用深色系
                let color = "rgb(140, 100, 20)"
                let rarity = relic.rarity
                if (rarity && rarity.name === "少见") color = "rgb(50, 115, 50)"
                else if (rarity && rarity.name === "稀有") color = "rgb(130, 45, 105)"
                else if (rarity && rarity.name === "史诗") color = "rgb(150, 35, 25)"
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

        // ---------- 九宫格星标：叠在真实容器槽位上 ----------
        function nsDbg(msg) {
            let now = Date.now()
            if (now - nsLastDebugAt < 2000) return
            nsLastDebugAt = now
            console.log("[NINE-STAR] " + msg)
        }

        // 原版渲染：在 8 个真实邻槽坐标上 blit 星形贴图（必然可见，不依赖 AUI 绘制）
        function drawNineStars(pose, screen, mx, my) {
            let menu = screen.getMenu()
            let guiLeft = screen.getGuiLeft()
            let guiTop = screen.getGuiTop()
            let slots = menu.slots
            let hovered = findHoveredSlot(slots, guiLeft, guiTop, mx, my)
            if (hovered == null) return false
            let hStack = hovered.getItem()
            let rd = (hStack && !hStack.isEmpty()) ? getRelicData("" + hStack.getId()) : null
            if (!rd || rd.nineGridStar !== true) return false
            let neighbors = findNeighborSlots(slots, hovered)
            if (neighbors.length === 0) return false
            RenderSystem.enableBlend()
            RenderSystem.defaultBlendFunc()
            RenderSystem.setShader(GameRenderer.getPositionTexShader())
            RenderSystem.setShaderTexture(0, STAR_RL)
            RenderSystem.setShaderColor(1.0, 1.0, 1.0, 1.0)
            for (let k = 0; k < neighbors.length; k++) {
                let n = neighbors.get(k)
                // screen 本身是 GuiComponent 子类，直接调实例 blit，避免启动期加载 GuiComponent 类失败
                screen.blit(pose, guiLeft + n.x, guiTop + n.y, 0, 0, NS_SLOT, NS_SLOT)
            }
            return true
        }

        function findHoveredSlot(slots, guiLeft, guiTop, mx, my) {
            for (let i = 0; i < slots.size(); i++) {
                let s = slots.get(i)
                let sx = guiLeft + s.x
                let sy = guiTop + s.y
                if (mx >= sx && mx < sx + NS_SLOT && my >= sy && my < sy + NS_SLOT) {
                    return s
                }
            }
            return null
        }

        function findNeighborSlots(slots, hovered) {
            let result = []
            for (let i = 0; i < slots.size() && result.length < NS_STAR_COUNT; i++) {
                let s = slots.get(i)
                let dx = s.x - hovered.x
                let dy = s.y - hovered.y
                if (dx === 0 && dy === 0) continue
                if ((dx === -NS_SLOT || dx === 0 || dx === NS_SLOT) &&
                    (dy === -NS_SLOT || dy === 0 || dy === NS_SLOT)) {
                    result.push(s)
                }
            }
            return result
        }

        // 该 Forge 版本的 ScreenEvent$Render$Post 在 Rhino 下无 getPoseStack()；
        // 沿类链反射读私有字段 poseStack（Forge 自有字段名，运行时不被混淆）
        function getPoseStackOf(event) {
            let cls = event.getClass()
            while (cls != null) {
                try {
                    let f = cls.getDeclaredField("poseStack")
                    f.setAccessible(true)
                    return f.get(event)
                } catch (e) {
                    cls = cls.getSuperclass()
                }
            }
            return null
        }

        // 容器界面渲染后叠加九宫格星标（原版 PoseStack 绘制，位于界面之上）
        ForgeEvents.onEvent("net.minecraftforge.client.event.ScreenEvent$Render$Post", function(event) {
            try {
                let screen = event.getScreen()
                if (screen == null) return
                let pose = getPoseStackOf(event)
                if (pose == null) { nsDbg("poseStack=null"); return }
                if (drawNineStars(pose, screen, event.getMouseX(), event.getMouseY())) {
                    nsDbg("drawn")
                }
            } catch (e) {
                nsDbg("ERR " + e)
            }
        })

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
            // 进游戏时搜索索引会为所有物品生成 tooltip 文本，不能在这里创建文档，只在真实渲染（RenderTooltipEvent）时创建
            if (!tooltipReady) return

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
            if (titleEl) {
                titleEl.innerText = relicData.nameZH || relicData.name || ""
                titleEl.setAttribute("style", "color: " + (relicColorCache[itemId] || "rgb(140, 100, 20)") + ";")
            }

            let descMid = tooltipDocument.getElementById("desc-mid")
            if (descMid) {
                descMid.setAttribute("style", "height: " + (relicData.tooltipHeight * DESC_MID_HEIGHT) + "px;")
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

                    cell.setAttribute("style", style)
                }
            }

            let icon = tooltipDocument.getElementById("guide-icon")
            if (icon) {
                let texturePath = getRelicTexturePath(relicData)
                icon.setAttribute("style", texturePath ? "background-image: url(" + texturePath + ");" : "")
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
