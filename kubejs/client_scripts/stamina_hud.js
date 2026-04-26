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
            fillEl.setAttribute("style", "height: " + percent + "%")
        }

        if (textEl != null) {
            textEl.innerText = String(Math.max(0, Math.floor(stamina)))
        }
    } catch (e) {
        console.log("[STAMINA-HUD] 更新失败: " + e)
    }
}

// ===== 接收服务端推送的体力值 =====

NetworkEvents.dataReceived('stamina_sync', event => {
    let stamina = event.data.getInt('stamina')
    staminaValue = stamina
})

// ===== 客户端Tick =====

ClientEvents.tick(event => {
    let player = event.player
    if (player == null) return

    // 首次创建Overlay
    if (!staminaInitialized) {
        try {
            staminaDoc = ApricityUI.createDocument("kubejs/stamina_hud.html")
            staminaInitialized = true
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
