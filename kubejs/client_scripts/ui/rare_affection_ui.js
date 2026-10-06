// ============================================================
// 稀客好感度列表界面 - 客户端脚本
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/rare_affection.html（Screen 类型，服务端 openScreen 打开）。
// - 数据流：配置界面“稀客好感度”按钮 → sendData('pf_rare_affection_open')
//   → 服务端 pfConfigUiHandler 读方块好感度、构建 JSON、sendData('pf_rare_affection_data')
//   → 本文件把 JSON 存入 global.pfRareAffectionView → 页面脚本读取并渲染。
// - 与 phone_ui.js 同模式：客户端脚本负责把服务端数据落到 global，页面 HTML 读 global。
// - 收到数据后由本文件串行执行：closeScreen() 关闭配置容器 → screen() 打开稀客列表。
// ============================================================

let ApricityUIRare = Java.loadClass("com.sighs.apricityui.ApricityUI")

// 稀客好感度视图数据（JSON 字符串），供 rare_affection.html 页面脚本读取
global.pfRareAffectionView = global.pfRareAffectionView || null

NetworkEvents.dataReceived('pf_rare_affection_data', event => {
    try {
        global.pfRareAffectionView = '' + event.data.getString('json')
        console.log("[PF-RARE-UI] 收到稀客好感度数据，长度=" + global.pfRareAffectionView.length)
        // 先关闭配置容器 Screen（closeScreen 会自动持久化 SavedData），再打开稀客列表 Screen。
        // 两步在同一客户端主线程回调内串行执行，保证“关闭容器 → 打开列表”顺序。
        try { ApricityUIRare.closeScreen() } catch (e) {}
        ApricityUIRare.screen("kubejs/rare_affection.html")
    } catch (e) {
        console.log("[PF-RARE-UI] 打开稀客好感度列表失败: " + e)
    }
})

// 登出清理，避免残留上一次的数据
ClientEvents.loggedOut(event => {
    global.pfRareAffectionView = null
})
