// ============================================================
// 女仆 Curios 饰品属性统计 - 页签触发（客户端）
// ------------------------------------------------------------
// ForgeEvents 只在 startup_scripts 提供，所以页签绘制/点击/ESC 放在这里，
// 并用 Platform.isClientEnvironment() 隔离物理客户端。
//
// Overlay 已改成**完全透明背景**，只中间有凸起灰面板。
// 底下 MaidContainerGui 全程可见，剑 tab 绘制不被遮挡。
//
// ┌─ 三态状态机 ─────────────────────────────────────────────┐
// │                                                          │
// │  未选中（pfMaidStatsOpen=false）                         │
// │    → 跳过背景（主面板灰露出，"置灰"态）                  │
// │    → 画铁剑图标                                          │
// │    → hover 时由 TLM 官方 Tooltip 事件画 MC 原生 tooltip  │
// │                                                          │
// │  选中（pfMaidStatsOpen=true）                            │
// │    → 画完整凸起背景（maid_gui_side.png u=207,v=21 模板） │
// │      与前 4 个 MaidTabButton 未选中 tab 风格一致          │
// │    → 画铁剑图标                                          │
// │                                                          │
// │  【设计原则】默认沿用 TLM 主界面露出的置灰底，选中时画凸起 │
// │              背景；关闭统计页后恢复原生按钮状态。         │
// │                                                          │
// └──────────────────────────────────────────────────────────┘
//
// getGuiLeft()/getGuiTop() 是 protected，Rhino 取不到，
// 用 GUI scale 居中算。AbstractMaidContainerGui imageWidth=imageHeight=256。
// ============================================================

if (Platform.isClientEnvironment()) {
    (function() {
        let Minecraft = Java.loadClass('net.minecraft.client.Minecraft')
        let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
        let DefaultTooltipPositioner = Java.loadClass('net.minecraft.client.gui.screens.inventory.tooltip.DefaultTooltipPositioner')

        const MAID_TAB_TEXTURE = new ResourceLocation('touhou_little_maid', 'textures/gui/maid_gui_side.png')
        const MAID_TAB_BG_U = 207
        const MAID_TAB_BG_V = 21
        const MAID_TAB_W = 24
        const MAID_TAB_H = 26
        const MAID_TAB_OFFSET_X = 194
        const MAID_TAB_OFFSET_Y = 5
        const MAID_TAB_ICON = new ResourceLocation('minecraft', 'textures/item/iron_sword.png')
        const MAID_GUI_SIZE = 256

        if (global.pfMaidStatsOpen === undefined) global.pfMaidStatsOpen = false
        if (global.pfMaidStatsJson === undefined) global.pfMaidStatsJson = ''
        if (global.pfMaidGuiOpen === undefined) global.pfMaidGuiOpen = false
        let pfMaidNativeTabStates = null

        // ========== 探测 ==========

        function getMaidOf(screen) {
            let menu
            try { menu = screen.getMenu() } catch (e) { return null }
            if (!menu) return null
            try { return menu.getMaid() } catch (e) { return null }
        }

        function isInsideTab(mx, my, x, y) {
            return mx >= x && mx < x + MAID_TAB_W &&
                   my >= y && my < y + MAID_TAB_H
        }

        function getTabX() {
            let w = Minecraft.getInstance().getWindow()
            return Math.floor((w.getGuiScaledWidth() - MAID_GUI_SIZE) / 2) + MAID_TAB_OFFSET_X
        }

        function getTabY() {
            let w = Minecraft.getInstance().getWindow()
            return Math.floor((w.getGuiScaledHeight() - MAID_GUI_SIZE) / 2) + MAID_TAB_OFFSET_Y
        }

        // ========== 渲染辅助 ==========

        // 交给 Minecraft 原生 tooltip 管线处理背景、描边、换行和屏幕边界。
        // 预先建立 Java List，避免 Rhino 将 JS 数组误选成其它 renderTooltip 重载。
        let TOOLTIP_LINES = null
        let TOOLTIP_POSITIONER = null
        try {
            let Component = Java.loadClass('net.minecraft.network.chat.Component')
            let ChatFormatting = Java.loadClass('net.minecraft.ChatFormatting')
            let ArrayList = Java.loadClass('java.util.ArrayList')
            TOOLTIP_LINES = new ArrayList()
            TOOLTIP_LINES.add(Component.literal('女仆搓脚属性').withStyle(ChatFormatting.WHITE))
            TOOLTIP_LINES.add(Component.literal('-查看当前女仆搓脚属性总览').withStyle(ChatFormatting.GREEN))
            TOOLTIP_POSITIONER = DefaultTooltipPositioner.INSTANCE
        } catch (e) {
            console.error('[MAID-STATS] 无法创建页签 tooltip 文本: ' + e)
        }

        // TLM 用 AbstractWidget.active=false 表示当前页签。统计页打开时，
        // 保存四个原生页签状态并全部恢复为可绘制的灰态；关闭时逐个还原。
        function syncNativeTabState(screen, selected) {
            if (!screen || !screen.children) return
            let left = Math.floor((Minecraft.getInstance().getWindow().getGuiScaledWidth() - MAID_GUI_SIZE) / 2)
            let top = Math.floor((Minecraft.getInstance().getWindow().getGuiScaledHeight() - MAID_GUI_SIZE) / 2)
            let tabXs = [left + 94, left + 119, left + 144, left + 169]

            if (selected && pfMaidNativeTabStates == null) {
                pfMaidNativeTabStates = []
                let children
                try {
                    children = typeof screen.children === 'function' ? screen.children() : screen.children
                } catch (e) {
                    return
                }
                if (!children || typeof children.size !== 'function') return
                for (let i = 0; i < children.size(); i++) {
                    let widget = children.get(i)
                    let wx = 0, wy = 0
                    try { wx = widget.getX(); wy = widget.getY() } catch (e) { continue }
                    for (let t = 0; t < tabXs.length; t++) {
                        if (wx === tabXs[t] && wy === top + MAID_TAB_OFFSET_Y) {
                            pfMaidNativeTabStates.push({ widget: widget, active: !!widget.active })
                            try { widget.active = true } catch (e) {}
                            break
                        }
                    }
                }
            } else if (!selected && pfMaidNativeTabStates != null) {
                for (let i = 0; i < pfMaidNativeTabStates.length; i++) {
                    let state = pfMaidNativeTabStates[i]
                    try { state.widget.active = state.active } catch (e) {}
                }
                pfMaidNativeTabStates = null
            }
        }

        // ========== TLM 官方渲染事件 ==========

        // TLM 的渲染顺序是 Render → 原生控件 → Tooltip。
        // 因此铁剑必须在 Render 事件中绘制，不能放到 Screen Render$Post，
        // 否则会盖住随后出现的 tooltip。
        ForgeEvents.onEvent('com.github.tartaricacid.touhoulittlemaid.api.event.client.MaidContainerGuiEvent$Render', function(event) {
            if (!global.pfMaidGuiOpen) return

            let g = event.getGraphics()
            let x = event.getLeftPos() + MAID_TAB_OFFSET_X
            let y = event.getTopPos() + MAID_TAB_OFFSET_Y
            let selected = !!global.pfMaidStatsOpen

            syncNativeTabState(event.getGui(), selected)

            if (selected) {
                // 选中时只补 TLM 的凸起页签底图；蓝条已移除。
                g.blit(MAID_TAB_TEXTURE, x, y, MAID_TAB_BG_U, MAID_TAB_BG_V, MAID_TAB_W, MAID_TAB_H)
            }

            // 两种状态都绘制图标，且位于 TLM 原生按钮之前。
            g.blit(MAID_TAB_ICON, x + 4, y + 6, 0, 0, 16, 16, 16, 16)
        })

        // TLM 在所有控件绘制完成后触发此事件，原生 renderTooltip 会自动提供
        // 暗紫背景、黑色外框、文本描边和越界反向定位。
        ForgeEvents.onEvent('com.github.tartaricacid.touhoulittlemaid.api.event.client.MaidContainerGuiEvent$Tooltip', function(event) {
            if (!global.pfMaidGuiOpen || global.pfMaidStatsOpen || TOOLTIP_LINES == null) return

            let x = event.getLeftPos() + MAID_TAB_OFFSET_X
            let y = event.getTopPos() + MAID_TAB_OFFSET_Y
            let mx = event.getMouseX()
            let my = event.getMouseY()
            if (!isInsideTab(mx, my, x, y)) return

            try {
                // 五参数重载只接受 List<Component> + positioner，避免 Rhino
                // 在 List<Component> 与 List<FormattedCharSequence> 之间歧义。
                event.getGraphics().renderTooltip(Minecraft.getInstance().font, TOOLTIP_LINES, mx, my, TOOLTIP_POSITIONER)
            } catch (e) {
                console.error('[MAID-STATS] 页签 tooltip 绘制失败: ' + e)
            }
        })

        // ========== 点击 ==========

        ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$MouseButtonPressed$Pre', function(event) {
            if (!global.pfMaidGuiOpen) return
            if (event.getButton() !== 0) return

            let x = getTabX()
            let y = getTabY()
            let mx = event.getMouseX()
            let my = event.getMouseY()

            if (global.pfMaidStatsOpen) {
                // 统计页是第五个 tab 的内容页。点击任一原生 tab 时，
                // 先释放自绘 tab 的状态，再让 TLM 原生按钮继续处理点击。
                let nativeTabHit = false
                for (let i = 0; i < 4; i++) {
                    if (isInsideTab(mx, my, x - 100 + i * 25, y)) {
                        nativeTabHit = true
                        break
                    }
                }
                if (nativeTabHit) {
                    global.pfMaidStatsOpen = false
                    syncNativeTabState(event.getScreen(), false)
                    console.info('[MAID-STATS] 点击原生页签 → 关闭统计页并放行 TLM 切换')
                }
                return
            }

            if (!isInsideTab(mx, my, x, y)) return

            let maid = getMaidOf(event.getScreen())
            let player = Minecraft.getInstance().player
            if (!maid || !player) return

            event.setCanceled(true)
            global.pfMaidStatsJson = ''
            global.pfMaidStatsOpen = true
            syncNativeTabState(event.getScreen(), true)
            console.info('[MAID-STATS] 点击页签 → selected 请求统计 entityId=' + maid.getId())
            player.sendData('pf_maid_stats_request', { entityId: maid.getId() })
        })

        // ========== ESC 关闭 ==========

        ForgeEvents.onEvent('net.minecraftforge.client.event.ScreenEvent$KeyPressed$Pre', function(event) {
            if (!global.pfMaidStatsOpen) return
            if (event.getKeyCode() !== 256) return
            global.pfMaidStatsOpen = false
            event.setCanceled(true)
        })
    })()
}
