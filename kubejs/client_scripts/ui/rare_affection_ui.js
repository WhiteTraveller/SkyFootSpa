// ============================================================
// 稀客好感度列表界面 - 客户端脚本
//
// 交接说明：
// - 对应 HTML：apricity/kubejs/rare_affection.html（容器 Screen 类型，服务端 menu(...).bind(...) 打开）。
// - 数据流：配置界面“稀客好感度”按钮 → sendData('pf_rare_affection_open')
//   → 服务端 pfConfigUiHandler 读方块好感度、构建 JSON、sendData('pf_rare_affection_data')
//   → 本文件把 JSON 存入 global.pfRareAffectionView → 页面脚本读取并渲染。
// - 与 phone_ui.js 同模式：客户端脚本负责把服务端数据落到 global，页面 HTML 读 global。
// - 稀客列表由服务端 pfConfigUiHandler 用 menu(...).bind(...) 打开（替换配置容器）；本文件只把数据落到 global。
// ============================================================

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
        // 稀客列表已改由服务端 pfConfigUiHandler 用 menu(...).bind(...) 打开【容器 Screen】，
        // 客户端此处只把数据落到 global 供页面脚本轮询读取，不再 closeScreen()/screen()。
    } catch (e) {
        console.log("[PF-RARE-UI] 接收稀客好感度数据失败: " + e)
    }
})

// 登出清理，避免残留上一次的数据
ClientEvents.loggedOut(event => {
    // 不写 null：下次重载读该键会 NPE 中断脚本加载
    global.pfRareAffectionView = ""
})
