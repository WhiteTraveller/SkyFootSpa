// ============================================================
// 手机设置持久化框架 - 服务端
// 设置存储在 player.persistentData 的 pfSettings 复合标签中
// 通过 sendData/NetworkEvents 与客户端双向通信
// ============================================================

// 设置键与默认值
let PHONE_SETTINGS_DEFAULTS = {
    'pfSkipSoak': 0   // 0=泡脚开启, 1=跳过泡脚
}

/**
 * 读取玩家的某个设置值
 * @param {$Player_} player 玩家对象
 * @param {string} key 设置键名
 * @returns {number} 设置值（默认返回默认值）
 */
function pfGetSetting(player, key) {
    let data = player.persistentData
    if (!data.contains('pfSettings')) {
        return PHONE_SETTINGS_DEFAULTS[key] || 0
    }
    let settings = data.getCompound('pfSettings')
    if (settings.contains(key)) {
        return settings.getInt(key)
    }
    return PHONE_SETTINGS_DEFAULTS[key] || 0
}

/**
 * 写入玩家的某个设置值
 * @param {$Player_} player 玩家对象
 * @param {string} key 设置键名
 * @param {number} value 设置值
 */
function pfSetSetting(player, key, value) {
    // 验证key是否合法
    if (PHONE_SETTINGS_DEFAULTS[key] === undefined) {
        console.log("[PHONE-SETTINGS] 非法设置键: " + key)
        return false
    }
    let data = player.persistentData
    let settings = data.getCompound('pfSettings')
    settings.putInt(key, value)
    data.put('pfSettings', settings)
    console.log("[PHONE-SETTINGS] 设置更新: " + key + "=" + value + " 玩家=" + player.getName().getString())
    return true
}

/**
 * 推送所有设置到客户端
 * @param {$Player_} player 玩家对象
 */
function pfSyncPhoneSettings(player) {
    let syncData = {}
    for (let key in PHONE_SETTINGS_DEFAULTS) {
        syncData[key] = pfGetSetting(player, key)
    }
    player.sendData('phone_settings_sync', syncData)
    console.log("[PHONE-SETTINGS] 同步设置到客户端: " + JSON.stringify(syncData))
}

// ===== 接收客户端设置变更请求 =====
NetworkEvents.dataReceived('phone_set_setting', event => {
    let player = event.player
    let key = String(event.data.getString('key'))
    let value = event.data.getInt('value')

    console.log("[PHONE-SETTINGS] 收到设置变更: key=" + key + ", value=" + value)

    if (pfSetSetting(player, key, value)) {
        // 存储成功，回传最新设置
        pfSyncPhoneSettings(player)
    }
})

// ===== 接收客户端设置请求 =====
NetworkEvents.dataReceived('phone_get_settings', event => {
    let player = event.player
    console.log("[PHONE-SETTINGS] 收到设置请求")
    pfSyncPhoneSettings(player)
})

// ===== 玩家登录时初始化默认设置 =====
PlayerEvents.loggedIn(event => {
    let player = event.player
    let data = player.persistentData
    if (!data.contains('pfSettings')) {
        let settings = data.getCompound('pfSettings')
        for (let key in PHONE_SETTINGS_DEFAULTS) {
            if (!settings.contains(key)) {
                settings.putInt(key, PHONE_SETTINGS_DEFAULTS[key])
            }
        }
        data.put('pfSettings', settings)
        console.log("[PHONE-SETTINGS] 初始化默认设置")
    }
})

// ===== 导出到全局 =====
global.pfGetSetting = pfGetSetting
global.pfSetSetting = pfSetSetting
global.pfSyncPhoneSettings = pfSyncPhoneSettings
global.PHONE_SETTINGS_DEFAULTS = PHONE_SETTINGS_DEFAULTS

console.log("[PHONE-SETTINGS] 手机设置框架已加载")
