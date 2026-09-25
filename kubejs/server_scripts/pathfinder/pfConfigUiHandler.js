// ============================================================
// 开店方块配置界面 - 服务端事件
//
// 交接说明：
// - pathfinder_config.html 是服务端 menu(...).bind(...) 打开的真实容器 Screen，
//   物品槽位同步 / 玩家背包显示 / 放入取出均由 AUI 容器机制处理，本文件不碰物品数据。
// - 关闭按钮：HTML 通过 player.sendData("pathfinder_config_close", {}) 请求关闭，
//   这里回传 pathfinder_config_close_ui，由客户端 pathfinder_config_ui.js
//   调用 ApricityUI.closeScreen() 真正关闭容器 Screen。
// - 后续新增按钮时，应在本文件注册对应 NetworkEvents.dataReceived，
//   并在这里完成服务端校验和实际状态修改，不要让 HTML 直接修改游戏数据。
// ============================================================

NetworkEvents.dataReceived('pathfinder_config_close', event => {
    let player = event.player
    if (!player) return
    player.sendData('pathfinder_config_close_ui', {})
})

console.log("[PF-CONFIG-UI] 配置界面事件已加载")
