// ============================================================
// 体力HUD - 客户端Overlay
// 使用 ApricityUI Overlay 在屏幕上显示体力条
// 通过 sendData/NetworkEvents 与服务端通信获取体力值
// ============================================================

let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")

// 体力配置
let STAMINA_MAX = 10000

// 客户端体力状态
let staminaValue = STAMINA_MAX
let staminaDoc = null
let staminaInitialized = false
let staminaTickCount = 0

if (global.pfStaminaHudVisible === undefined) {
    global.pfStaminaHudVisible = 1
}

/**
 * 更新体力条显示
 */
function updateStaminaBar(doc, stamina, max) {
    if (doc == null) return
    try {
        let fillEl = doc.getElementById("staminaFill")
        let textEl = doc.getElementById("staminaText")

        if (fillEl != null) {
            let percent = Math.max(0, Math.min(100, (stamina / max) * 100))

            // 颜色阶段
            let cls = "bar-fill"
            if (percent <= 25) {
                cls += " low"
            } else if (percent <= 60) {
                cls += " mid"
            } else {
                cls += " high"
            }
            fillEl.setAttribute("class", cls)
            fillEl.setAttribute("style", "width: " + percent + "%")
        }

        if (textEl != null) {
            // KubeJS 侧改文本必须调 Java 方法 setTextContent（官方 Overlay 示例用法）；
            // innerText 属性赋值只在 Rhino 包装对象上挂 expando，到不了元素，静默无效
            let s = Math.max(0, Math.floor(stamina)) + "/" + max
            try {
                textEl.setTextContent(s)
            } catch (e2) {
                textEl.innerText = s
            }
        }
    } catch (e) {
        console.log("[STAMINA-HUD] 更新失败: " + e)
    }
}

// ===== 接收服务端推送的体力值 =====

NetworkEvents.dataReceived('stamina_sync', event => {
    let stamina = event.data.getInt('stamina')
    if (Math.abs(stamina - staminaValue) >= 50) {
        console.log("[STAMINA-HUD] 同步体力: " + staminaValue + " -> " + stamina)
    }
    staminaValue = stamina
    if (staminaInitialized && staminaDoc != null) {
        updateStaminaBar(staminaDoc, staminaValue, STAMINA_MAX)
    }
})

// ===== 客户端Tick =====

ClientEvents.tick(event => {
    let player = event.player
    if (player == null) return

    if (global.pfStaminaHudVisible === 0) {
        if (staminaInitialized) {
            try {
                ApricityUI.removeDocument("kubejs/stamina_hud.html")
            } catch (e) {}
            staminaDoc = null
            staminaInitialized = false
            staminaTickCount = 0
        }
        return
    }

    // 首次创建Overlay
    if (!staminaInitialized) {
        // 先清理脚本重载/重登遗留的同路径孤儿Overlay，
        // 否则旧文档叠在上层显示冻结数值，新文档的更新看不见
        try {
            ApricityUI.removeDocument("kubejs/stamina_hud.html")
        } catch (e) {}
        try {
            staminaDoc = ApricityUI.createDocument("kubejs/stamina_hud.html")
            staminaInitialized = true
            staminaTickCount = 0
            updateStaminaBar(staminaDoc, staminaValue, STAMINA_MAX)
            try {
                player.sendData('stamina_request', {})
            } catch (e) {
                console.log("[STAMINA-HUD] 请求体力失败: " + e)
            }
            console.log("[STAMINA-HUD] Overlay已创建")
        } catch (e) {
            console.log("[STAMINA-HUD] 创建Overlay失败: " + e)
            return
        }
    }

    // 每20tick向服务端请求体力值
    staminaTickCount++
    if (staminaTickCount % 20 === 0) {
        try {
            player.sendData('stamina_request', {})
        } catch (e) {}
    }

    // 更新显示
    updateStaminaBar(staminaDoc, staminaValue, STAMINA_MAX)
})

// ===== 清理 =====

ClientEvents.loggedIn(event => {
    // 与 foot_ui.js 相同模式：登录时清掉上次会话/重载残留的同路径文档
    try {
        ApricityUI.removeDocument("kubejs/stamina_hud.html")
    } catch (e) {}
    staminaDoc = null
    staminaInitialized = false
    staminaTickCount = 0
})

ClientEvents.loggedOut(event => {
    if (staminaDoc != null) {
        try {
            ApricityUI.removeDocument("kubejs/stamina_hud.html")
        } catch (e) {}
        staminaDoc = null
        staminaInitialized = false
    }
    staminaValue = STAMINA_MAX
    staminaTickCount = 0
})
