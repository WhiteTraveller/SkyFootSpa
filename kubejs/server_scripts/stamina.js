// ============================================================
// 体力系统 - 服务端NBT管理
// 在 player.persistentData 中维护 pfStamina 字段
// 通过 sendData 同步到客户端
// ============================================================

let STAMINA_MAX_SERVER = 10000
// 体力消耗量现在从玩家属性 kubejs:serve.stamina_cost 读取（默认100）

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

// ============================================================
// 自动回复：每秒（20 tick）为所有在线玩家恢复 4 点体力
// 通过玩家 persistentData 上的 pfStaminaRegenSubTick (0~19) 子 tick 计数器驱动，
// 跨重启友好；体力封顶 STAMINA_MAX_SERVER。
// ============================================================
let STAMINA_REGEN_PER_SECOND = 4

PlayerEvents.tick(event => {
    let player = event.player
    if (!player) return
    let data = player.persistentData
    let sub = (data.getInt("pfStaminaRegenSubTick") | 0) + 1
    if (sub < 20) {
        data.putInt("pfStaminaRegenSubTick", sub)
        return
    }
    data.putInt("pfStaminaRegenSubTick", 0)
    
    let stamina = data.getInt("pfStamina")
    if (stamina >= STAMINA_MAX_SERVER) return
    let next = Math.min(STAMINA_MAX_SERVER, stamina + STAMINA_REGEN_PER_SECOND)
    if (next === stamina) return
    data.putInt("pfStamina", next)
    pfSyncStamina(player)
})

