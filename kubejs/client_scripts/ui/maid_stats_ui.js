// ============================================================
// 女仆 Curios 饰品属性统计 - 客户端文档管理
// ------------------------------------------------------------
// 服务端在 pf_maid_stats_sync 里回推 JSON，这里负责把
// apricity/kubejs/maid_stats.html 作为可交互 Overlay 叠在 TLM 女仆
// 界面上。Overlay 不是 Screen，关闭统计页后 TLM 容器界面仍然保留。
//
// 开关状态放在 global.pfMaidStatsOpen：
// - startup_scripts/ui/maid_stats_ui.js 的页签点击 / ESC 会改它
// - 本文件 HTML 的关闭按钮也会改它
//
// pfMaidGuiOpen 约定：
// - Overlay 打开期间"冻结"为 true（因为 ApricityUI Document 不是 MC Screen）
// - Overlay 关闭时实时跟踪 MaidScreen 状态
// ============================================================

let ApricityUI = Java.loadClass('com.sighs.apricityui.ApricityUI')
let Minecraft = Java.loadClass('net.minecraft.client.Minecraft')

const PF_MAID_STATS_DOC = 'kubejs/maid_stats.html'

let pfMaidStatsDoc = null
let pfMaidStatsRendered = ''

if (global.pfMaidStatsOpen === undefined) global.pfMaidStatsOpen = false
if (global.pfMaidStatsJson === undefined) global.pfMaidStatsJson = ''
if (global.pfMaidGuiOpen === undefined) global.pfMaidGuiOpen = false

// 用"菜单有 getMaid()"判断是不是女仆容器界面
function pfMaidStatsIsMaidScreen(screen) {
    if (screen == null) return false
    try {
        let menu = screen.getMenu()
        if (menu == null) return false
        return menu.getMaid() != null
    } catch (e) {
        return false
    }
}

function pfMaidStatsFmt(value, signed) {
    let v = Math.round(Number(value) * 100) / 100
    return signed && v > 0 ? '+' + v : '' + v
}

function pfMaidStatsPadEnd(value, length) {
    let text = '' + value
    while (text.length < length) text += ' '
    return text
}

function pfMaidStatsSetText(doc, id, text) {
    let el = doc.getElementById(id)
    if (el == null) return false
    el.setTextContent(text)
    return true
}

function pfMaidStatsBuildContent(payload) {
    let out = []
    let totals = payload.totals || []
    let curios = payload.curios || []

    if (curios.length === 0 && totals.length === 0) {
        return '（未装备饰品）'
    }

    if (totals.length > 0) {
        out.push('—— 属性合计 ——')
        for (let i = 0; i < totals.length; i++) {
            let name = totals[i].label
            let val = pfMaidStatsFmt(totals[i].amount, false)
            out.push(pfMaidStatsPadEnd(name, 14) + val)
        }
    }

    if (out.length > 0) out.push('')

    if (curios.length > 0) {
        out.push('—— 饰品明细 ——')
        for (let i = 0; i < curios.length; i++) {
            let c = curios[i]
            let title = (i + 1) + '. ' + c.name
            if (c.rarity) title += ' [' + c.rarity + ']'
            out.push(title)
            let mods = c.mods || []
            if (mods.length === 0) {
                out.push('  （无属性）')
            } else {
                for (let m = 0; m < mods.length; m++) {
                    out.push('  ' + pfMaidStatsFmt(mods[m].amount, true) + '  ' + mods[m].label)
                }
            }
        }
    }

    return out.join('\n')
}

function pfMaidStatsRender(json) {
    if (pfMaidStatsDoc == null) return false
    let payload
    try {
        payload = JSON.parse(json)
    } catch (e) {
        console.warn('[MAID-STATS] JSON 解析失败: ' + e)
        return false
    }
    pfMaidStatsSetText(pfMaidStatsDoc, 'title', payload.maidName + ' · ' + payload.relicCount + ' 件饰品')
    // 内容区由 maid_stats.html 页面脚本渲染为可悬浮的属性行；
    // 这里不要再把结构化 DOM 覆盖成纯文本。
    return true
}

function pfMaidStatsRemoveDoc() {
    try { ApricityUI.removeDocument(PF_MAID_STATS_DOC) } catch (e) {}
    pfMaidStatsDoc = null
    pfMaidStatsRendered = ''
}

// ===== 服务端回推 =====

NetworkEvents.dataReceived('pf_maid_stats_sync', event => {
    if (!global.pfMaidStatsOpen) return
    global.pfMaidStatsJson = '' + event.data.getString('json')
})

// ===== 客户端 Tick：管理文档生命周期 =====

ClientEvents.tick(event => {
    let player = event.player
    if (player == null) {
        global.pfMaidGuiOpen = false
        return
    }

    // Overlay 打开期间"冻结" pfMaidGuiOpen=true
    // （ApricityUI Document 不是 MC Screen，Minecraft.screen 可能是 null）
    // Overlay 关闭时才实时跟踪 MaidScreen 状态
    if (global.pfMaidStatsOpen) {
        global.pfMaidGuiOpen = true
    } else {
        global.pfMaidGuiOpen = pfMaidStatsIsMaidScreen(Minecraft.getInstance().screen)
    }

    if (global.pfMaidStatsOpen) {
        // 页面内关闭按钮会直接 removeDocument；同步把开关状态收回来
        let documents = ApricityUI.getDocument(PF_MAID_STATS_DOC)
        if (pfMaidStatsDoc != null && (documents == null || documents.isEmpty())) {
            pfMaidStatsDoc = null
            pfMaidStatsRendered = ''
            global.pfMaidStatsOpen = false
            return
        }

        // TLM 容器被关掉（ESC、距离过远等）时，统计页也跟着关
        // 必须用 Minecraft.screen 真实状态，不能用冻结过的 pfMaidGuiOpen
        if (!pfMaidStatsIsMaidScreen(Minecraft.getInstance().screen)) {
            global.pfMaidStatsOpen = false
            pfMaidStatsRemoveDoc()
            return
        }

        if (pfMaidStatsDoc == null) {
            try { ApricityUI.removeDocument(PF_MAID_STATS_DOC) } catch (e) {}
            pfMaidStatsDoc = ApricityUI.createDocument(PF_MAID_STATS_DOC)
            if (pfMaidStatsDoc == null) {
                console.error('[MAID-STATS] 无法创建文档: ' + PF_MAID_STATS_DOC)
                global.pfMaidStatsOpen = false
                return
            }
            pfMaidStatsDoc.setReloadPersistent(true)
            pfMaidStatsRendered = ''
            console.info('[MAID-STATS] Overlay 文档已创建')
        }

        let json = '' + global.pfMaidStatsJson
        if (json.length > 0 && json !== pfMaidStatsRendered) {
            if (pfMaidStatsRender(json)) pfMaidStatsRendered = json
        }
    } else if (pfMaidStatsDoc != null) {
        pfMaidStatsRemoveDoc()
    }
})

// ===== 会话清理 =====

ClientEvents.loggedIn(event => {
    pfMaidStatsRemoveDoc()
    global.pfMaidStatsOpen = false
    global.pfMaidStatsJson = ''
})

ClientEvents.loggedOut(event => {
    pfMaidStatsRemoveDoc()
    global.pfMaidStatsOpen = false
    global.pfMaidStatsJson = ''
})
