// ============================================================
// 手机UI - 客户端脚本
// Screen类型UI由服务端 ApricityUI.openScreen 打开
// 客户端负责登出清理 + 接收设置同步
// ============================================================

let ApricityUIPhone = Java.loadClass("com.sighs.apricityui.ApricityUI")

// ===== 手机设置全局变量 =====
global.pfPhoneSettings = global.pfPhoneSettings || {}

// ===== 接收服务端推送的设置 =====
NetworkEvents.dataReceived('phone_settings_sync', event => {
    try {
        let data = event.data
        // 读取所有已知设置键
        global.pfPhoneSettings.pfSkipSoak = data.getInt('pfSkipSoak')
        global.pfPhoneSettings.pfOneClickSatisfy = data.getInt('pfOneClickSatisfy')
        console.log("[PHONE-UI] 设置同步完成: pfSkipSoak=" + global.pfPhoneSettings.pfSkipSoak + ", pfOneClickSatisfy=" + global.pfPhoneSettings.pfOneClickSatisfy)
    } catch (e) {
        console.log("[PHONE-UI] 设置同步失败: " + e)
    }
})

// ===== 接收服务端推送的评价数据 =====
NetworkEvents.dataReceived('phone_ratings_sync', event => {
    try {
        let data = event.data
        let count = data.getInt('count')
        let totalPool = data.getInt('totalPool')
        let ratings = []
        for (let i = 0; i < count; i++) {
            ratings.push({
                key: '' + data.getString('k' + i),
                name: '' + data.getString('n' + i),
                rating: data.getInt('r' + i),
                weight: data.getInt('w' + i)
            })
        }
        global.pfPhoneSettings.ratings = ratings
        global.pfPhoneSettings.ratingsTotalPool = totalPool
        global.pfPhoneSettings.ratingsTimestamp = Date.now()
        console.log("[PHONE-UI] 评价数据同步完成，共" + count + "类")
    } catch (e) {
        console.log("[PHONE-UI] 评价数据同步失败: " + e)
    }
})

// ===== 登出时清理 =====
ClientEvents.loggedOut(event => {
    try {
        ApricityUIPhone.removeDocument("kubejs/phone.html")
    } catch (e) {}
    global.pfPhoneSettings = {}
})
