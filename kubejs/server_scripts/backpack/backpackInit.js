// ============================================================
// 玩家首次登录背包镶板初始化
// ------------------------------------------------------------
// 在玩家第一次进入服务器时，按预设矩阵将 curios:package 槽位
// 填充为 mk1~mk5 背包镶板，0 表示留空。
// 通过 player.persistentData 中的 pfBackpackInited 标志位防止重复执行。
// ------------------------------------------------------------
// 矩阵布局（6 行 × 9 列，0 = 留空）：
//   5 4 3 3 3 3 3 4 5
//   5 4 2 1 1 1 2 4 5
//   5 4 2 0 0 0 2 4 5
//   5 4 2 0 0 0 2 4 5
//   5 4 2 1 1 1 2 4 5
//   5 4 3 3 3 3 3 4 5
// ============================================================

let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')

// 6 × 9 矩阵（按行展平）
let BACKPACK_INIT_MATRIX = [
    5, 4, 3, 3, 3, 3, 3, 4, 5,
    5, 4, 2, 1, 1, 1, 2, 4, 5,
    5, 4, 2, 0, 0, 0, 2, 4, 5,
    5, 4, 2, 0, 0, 0, 2, 4, 5,
    5, 4, 2, 1, 1, 1, 2, 4, 5,
    5, 4, 3, 3, 3, 3, 3, 4, 5
]

function pfInitBackpackPanels(player) {
    try {
        let curiosHelper = curiosApi.getCuriosHelper()
        let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get()
        let total = curiosAll.getSlots()
        for (let i = 0; i < BACKPACK_INIT_MATRIX.length && i < total; i++) {
            let lv = BACKPACK_INIT_MATRIX[i]
            if (lv <= 0) continue  // 0 = 空槽，不放镶板
            let id = "marguerite:backpack_space_mk" + lv
            let stack = Item.of(id)
            curiosAll.setStackInSlot(i, stack)
        }
        // 触发一次背包重算，使属性等状态正确
        if (typeof global.updatePlayerBackpack === "function") {
            global.updatePlayerBackpack(player)
        }
        console.log("[BACKPACK-INIT] 已为玩家 " + player.getName().getString() + " 初始化镶板矩阵")
    } catch (e) {
        console.log("[BACKPACK-INIT] 初始化失败: " + e)
    }
}

PlayerEvents.loggedIn(event => {
    let player = event.player
    if (!player) return
    let data = player.persistentData
    if (data.contains("pfBackpackInited")) return
    pfInitBackpackPanels(player)
    data.putBoolean("pfBackpackInited", true)
})

// 调试用：手动重置初始化状态并重新装备（管理员可用 /kubejs js 触发，或保留供后续）
global.pfResetBackpackInit = function(player) {
    if (!player) return
    player.persistentData.putBoolean("pfBackpackInited", false)
    pfInitBackpackPanels(player)
    player.persistentData.putBoolean("pfBackpackInited", true)
}
