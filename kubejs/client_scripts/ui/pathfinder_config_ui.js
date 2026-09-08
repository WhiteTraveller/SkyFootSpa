// ============================================================
// 开店方块配置界面 - 客户端关闭处理
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/pathfinder_config.html。
// - 当前界面是视觉上的 9x3 箱子布局，不是真实容器，没有物品槽位同步。
// - 服务端收到 pathfinder_config_close 后，回传 pathfinder_config_close_ui；
//   本文件负责移除 ApricityUI 文档。
// - 后续增加按钮时，实际配置写入必须由服务端 NetworkEvents 处理。
// ============================================================

let ApricityUIPathfinderConfig = Java.loadClass("com.sighs.apricityui.ApricityUI")

NetworkEvents.dataReceived('pathfinder_config_close_ui', event => {
    try {
        ApricityUIPathfinderConfig.removeDocument("kubejs/pathfinder_config.html")
    } catch (e) {
        console.log("[PF-CONFIG-UI] 关闭配置界面失败: " + e)
    }
})

ClientEvents.loggedOut(event => {
    try {
        ApricityUIPathfinderConfig.removeDocument("kubejs/pathfinder_config.html")
    } catch (e) {}
})
