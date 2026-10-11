// ============================================================
// 人物图鉴界面 - 客户端脚本
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/character_gallery.html（Screen 类型）。
// - 数据流：配置界面"人物图鉴"按钮 → sendData('pf_character_gallery_open')
//   → 服务端 pfConfigUiHandler 回传 pf_character_gallery_open_ui
//   → 本文件收到后 closeScreen() 关闭配置容器 → screen() 打开图鉴。
// - 与 rare_affection_ui.js 同模式：客户端脚本负责关闭容器再打开新 Screen。
// - 图鉴数据为页面内嵌静态角色表（6 位已确立绘角色），无需服务端推送 JSON。
// ============================================================

let ApricityUIGallery = Java.loadClass("com.sighs.apricityui.ApricityUI")

NetworkEvents.dataReceived('pf_character_gallery_open_ui', event => {
    try {
        // 先关闭配置容器 Screen，再打开图鉴 Screen（串行，保证顺序）
        try { ApricityUIGallery.closeScreen() } catch (e) {}
        ApricityUIGallery.screen("kubejs/character_gallery.html")
        console.log("[PF-GALLERY-UI] 打开人物图鉴")
    } catch (e) {
        console.log("[PF-GALLERY-UI] 打开人物图鉴失败: " + e)
    }
})
