// ============================================================
// 手机物品 - 服务端右键事件
// 右键使用手机时，通过 ApricityUI.openScreen 打开 Screen 类型UI
// ============================================================

let ApricityUIServer = Java.loadClass("com.sighs.apricityui.ApricityUI")

ItemEvents.rightClicked(event => {
    let item = event.item
    if (item.id !== 'marguerite:phone_s23ultra') return

    let player = event.player
    if (player == null) return

    // 使用 Screen 类型打开手机UI
    ApricityUIServer.openScreen(player, 'kubejs/phone.html', null)
    console.log("[PHONE] 玩家 " + player.getName().getString() + " 右键使用手机")

    // 同步手机设置到客户端
    if (global.pfSyncPhoneSettings) {
        global.pfSyncPhoneSettings(player)
    }
})
