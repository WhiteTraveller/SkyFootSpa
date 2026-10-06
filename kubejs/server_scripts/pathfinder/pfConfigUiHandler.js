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

// “稀客好感度”按钮：读取当前配置方块的好感度，构建列表 JSON 推给客户端，再打开列表界面
// 方块上下文（维度+坐标）在 pfBlockHandler.js 开配置界面时已写入 player.persistentData
NetworkEvents.dataReceived('pf_rare_affection_open', event => {
    let player = event.player
    if (!player) return
    if (!global.pfRareAffection || !global.pfShopManager) {
        player.tell('§c[稀客] 好感度模块未加载')
        return
    }
    let level = player.getLevel()
    // 读方块上下文；缺失时回退到玩家当前维度
    let dim = '' + player.persistentData.getString('pfCfgDim')
    if (!dim || dim.length === 0) dim = global.pfRareAffection.pfAffDimId(level)
    let x = player.persistentData.getInt('pfCfgX')
    let y = player.persistentData.getInt('pfCfgY')
    let z = player.persistentData.getInt('pfCfgZ')
    let be = global.pfShopManager.pfShopGetBE(level, x, y, z)
    if (!be) {
        player.tell('§c[稀客] 未找到寻路方块实体，无法读取好感度')
        return
    }
    let view = global.pfRareAffection.pfBuildRareAffectionView(be, dim)
    let payload = { dim: dim, x: x, y: y, z: z, list: view }
    // 只推数据；客户端 rare_affection_ui.js 收到后先 closeScreen() 关闭配置容器（自动持久化 SavedData），
    // 再 screen() 打开稀客列表 Screen（客户端串行执行，保证关闭→打开顺序，避免在容器之上直接开屏导致菜单悬挂）
    player.sendData('pf_rare_affection_data', { json: JSON.stringify(payload) })
    console.log('[PF-CONFIG-UI] 推送稀客好感度数据 dim=' + dim + ' 稀客数=' + view.length)
})

console.log("[PF-CONFIG-UI] 配置界面事件已加载")
