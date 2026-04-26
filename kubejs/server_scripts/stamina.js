// ============================================================
// 体力系统 - 服务端NBT管理
// 在 player.persistentData 中维护 pfStamina 字段
// 通过 sendData 同步到客户端
// ============================================================

let STAMINA_MAX_SERVER = 10000
let STAMINA_COST_PER_RUB = 100

// 通过网络包推送体力值到客户端
function pfSyncStamina(player) {
    let stamina = player.persistentData.getInt("pfStamina")
    player.sendData('stamina_sync', { stamina: stamina })
}

// 客户端请求体力值
NetworkEvents.dataReceived('stamina_request', event => {
    let player = event.player
    let stamina = player.persistentData.getInt("pfStamina")
    player.sendData('stamina_sync', { stamina: stamina })
})

// 玩家登录时初始化体力值并同步
PlayerEvents.loggedIn(event => {
    let player = event.player
    let data = player.persistentData
    if (!data.contains("pfStamina")) {
        data.putInt("pfStamina", STAMINA_MAX_SERVER)
    }
    pfSyncStamina(player)
})

// 消耗体力 - 返回true表示成功
global.pfConsumeStamina = function(player, amount) {
    let data = player.persistentData
    let stamina = data.getInt("pfStamina")
    if (stamina < amount) {
        return false
    }
    stamina -= amount
    data.putInt("pfStamina", stamina)
    pfSyncStamina(player)
    return true
}

// 恢复体力
global.pfRestoreStamina = function(player, amount) {
    let data = player.persistentData
    let stamina = data.getInt("pfStamina")
    stamina = Math.min(STAMINA_MAX_SERVER, stamina + amount)
    data.putInt("pfStamina", stamina)
    pfSyncStamina(player)
}
