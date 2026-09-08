// ============================================================
// 开店方块配置界面 - 服务端事件
//
// 交接说明：
// - pathfinder_config.html 是 ApricityUI Screen 类型的视觉箱子界面。
// - 当前只有关闭按钮，HTML 通过 player.sendData("pathfinder_config_close", {})
//   请求关闭界面。
// - 后续新增按钮时，应在本文件注册对应 NetworkEvents.dataReceived，
//   并在这里完成服务端校验和实际状态修改，不要让 HTML 直接修改游戏数据。
// ============================================================

NetworkEvents.dataReceived('pathfinder_config_close', event => {
    let player = event.player
    if (!player) return
    player.sendData('pathfinder_config_close_ui', {})
})

console.log("[PF-CONFIG-UI] 配置界面事件已加载")
