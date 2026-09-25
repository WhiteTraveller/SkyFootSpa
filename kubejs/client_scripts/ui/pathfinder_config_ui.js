// ============================================================
// 开店方块配置界面 - 客户端关闭处理
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/pathfinder_config.html。
// - 该界面是服务端 menu(...).bind(...) 打开的真实容器 Screen
//   （ApricityContainerScreen），不是 createDocument 建的 Overlay；
//   因此关闭必须用 ApricityUI.closeScreen()，removeDocument 对容器 Screen 无效。
// - 关闭流程：HTML 关闭按钮 player.sendData("pathfinder_config_close")
//   → 服务端 pfConfigUiHandler 回传 pathfinder_config_close_ui
//   → 本文件调用 closeScreen() 关闭容器 Screen（SavedData 自动标 dirty 持久化）。
// - 物品槽位同步、玩家背包显示、放入/取出全部由 AUI 容器机制处理，
//   客户端脚本只负责关闭，不碰物品数据。
// ============================================================

let ApricityUIPathfinderConfig = Java.loadClass("com.sighs.apricityui.ApricityUI")

NetworkEvents.dataReceived('pathfinder_config_close_ui', event => {
    try {
        ApricityUIPathfinderConfig.closeScreen()
    } catch (e) {
        console.log("[PF-CONFIG-UI] 关闭配置界面失败: " + e)
    }
})

ClientEvents.loggedOut(event => {
    try {
        ApricityUIPathfinderConfig.closeScreen()
    } catch (e) {}
})
