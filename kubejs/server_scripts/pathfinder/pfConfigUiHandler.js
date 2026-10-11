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
    // 1) 先推数据：客户端 rare_affection_ui.js 收到后仅存入 global.pfRareAffectionView，
    //    rare_affection.html 页面脚本轮询读取渲染（menu 打开与数据到达顺序由页面轮询容错）。
    player.sendData('pf_rare_affection_data', { json: JSON.stringify(payload) })
    // 2) 服务端用 menu(...).bind(...) 打开稀客列表【容器 Screen】，替换当前配置容器。
    //    按需求“稀客页面不设计物品槽位绑定”：只 bind player() 作为容器最小数据源，HTML 内不放 <container>，
    //    页面纯展示 + <item> 渲染手办，无任何库存槽位交互。改用 menu（而非客户端 screen）意在让
    //    物品图标进入容器 Screen 的原生渲染上下文，尝试修复 plain Screen 下 TLM 3D 手办 <item> 渲染发黑。
    let ApricityUIRareMenu = Java.loadClass("com.sighs.apricityui.ApricityUI")
    ApricityUIRareMenu.menu(player, "kubejs/rare_affection.html").bind(function (binding) {
        binding.player()
    })
    console.log('[PF-CONFIG-UI] menu 打开稀客好感度容器 dim=' + dim + ' 稀客数=' + view.length)
})

// "人物图鉴"按钮：无需服务端数据，直接通知客户端关闭配置容器并打开图鉴 Screen
NetworkEvents.dataReceived('pf_character_gallery_open', event => {
    let player = event.player
    if (!player) return
    player.sendData('pf_character_gallery_open_ui', {})
    console.log('[PF-CONFIG-UI] 打开人物图鉴')
})

// 图鉴对话跳转：客户端点击对话条目后发送 chatbox 命令，服务端执行
NetworkEvents.dataReceived('pf_gallery_play_dialogue', event => {
    let player = event.player
    if (!player) return
    let cmd = '' + event.data.getString('cmd')
    // 安全校验：只允许 chatbox skip skyfootspa: 前缀的命令
    if (!cmd || cmd.indexOf('chatbox skip skyfootspa:') !== 0) {
        console.log('[PF-GALLERY] 拒绝非法命令: ' + cmd)
        return
    }
    player.runCommandSilent(cmd)
    console.log('[PF-GALLERY] 执行对话命令: ' + cmd)
})

console.log("[PF-CONFIG-UI] 配置界面事件已加载")
