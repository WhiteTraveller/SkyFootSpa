// ============================================================
// 稀客好感度列表界面 - 客户端脚本
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/rare_affection.html（普通 Screen，与人物图鉴同宿主）。
// - 数据流：配置界面/图鉴页签 → sendData('pf_rare_affection_open')
//   → 服务端 pfConfigUiHandler 读方块好感度、构建 JSON、sendData('pf_rare_affection_data')
//   → 本文件把 JSON 存入 global.pfRareAffectionView；服务端再发 'pf_rare_affection_open_ui'
//   → 本文件 closeScreen() 关闭当前界面后 screen() 打开稀客页（与 character_gallery_ui.js 同模式）。
// - 出 UI 方式已于 2026-10 从服务端 menu(...) 容器宿主统一为客户端 screen()。
// ============================================================

let ApricityUIRare = Java.loadClass("com.sighs.apricityui.ApricityUI")

// 稀客好感度视图数据（JSON 字符串），供 rare_affection.html 页面脚本读取
// 读 global 中 null 值键会直接抛 Rhino NPE 中断脚本加载（1.2.4-hotfix 实测），
// 这里用 try/catch 兜底并修复历史遗留的 null 值
try {
    if (!global.pfRareAffectionView) global.pfRareAffectionView = ""
} catch (e) {
    global.pfRareAffectionView = ""
}

NetworkEvents.dataReceived('pf_rare_affection_data', event => {
    try {
        global.pfRareAffectionView = '' + event.data.getString('json')
        console.log("[PF-RARE-UI] 收到稀客好感度数据，长度=" + global.pfRareAffectionView.length)
    } catch (e) {
        console.log("[PF-RARE-UI] 接收稀客好感度数据失败: " + e)
    }
})

NetworkEvents.dataReceived('pf_rare_affection_open_ui', event => {
    try {
        // 不要先 closeScreen()：setScreen(null) 会触发原版 grabMouse 把光标瞬移到屏幕中心；
        // screen() 直接替换当前界面（配置容器或图鉴 Screen），旧界面 removed() 自动通知服务端关容器。
        ApricityUIRare.screen("kubejs/rare_affection.html")
        console.log("[PF-RARE-UI] 打开稀客好感度界面")
    } catch (e) {
        console.log("[PF-RARE-UI] 打开稀客好感度界面失败: " + e)
    }
})

// 登出清理，避免残留上一次的数据
ClientEvents.loggedOut(event => {
    // 不写 null：下次重载读该键会 NPE 中断脚本加载
    global.pfRareAffectionView = ""
})
