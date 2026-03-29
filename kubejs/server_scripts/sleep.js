// ============================================================
// 睡眠控制模块 - pathfinder.js 的睡眠回调扩展
// sleep.js L1-L120
// UI显示由 client_scripts/foot_ui.js 管理
// ============================================================

// 全局 Window 管理器（保留用于客户端脚本访问）
global.pfSleepWindows = global.pfSleepWindows || new Map()

/**
 * 根据床的 yaw 计算脚的位置（床尾位置）
 * yaw 是实体面向的方向（头朝向），脚在相反方向
 * 
 * @param {number} bedX    床头X坐标
 * @param {number} bedY    床Y坐标
 * @param {number} bedZ    床头Z坐标
 * @param {number} yaw     实体朝向（头朝向）
 * @returns {Object} 脚位置 {x, y, z}
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    // yaw=0: 头朝南(+Z), 脚朝北(-Z)
    // yaw=180: 头朝北(-Z), 脚朝南(+Z)
    // yaw=90: 头朝西(-X), 脚朝东(+X)
    // yaw=-90: 头朝东(+X), 脚朝西(-X)
    let footX = bedX
    let footZ = bedZ

    if (yaw === 0) {
        // 头朝南，脚在北
        footZ = bedZ - 1
    } else if (yaw === 180 || yaw === -180) {
        // 头朝北，脚在南
        footZ = bedZ + 1
    } else if (yaw === 90) {
        // 头朝西，脚在东
        footX = bedX + 1
    } else if (yaw === -90) {
        // 头朝东，脚在西
        footX = bedX - 1
    }

    return { x: footX + 0.5, y: bedY, z: footZ + 0.5 }
}

/**
 * 开始睡觉时触发的回调函数
 * UI创建由客户端脚本（foot_ui.js）处理，此处仅记录日志
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} currentTick     当前游戏tick
 */
global.pfOnStartSleep = function (entity, level, bedPos, currentTick) {
    let uuid = "" + entity.getUuid()
    console.log("[SLEEP-JS] 开始睡觉 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)

    // 计算脚的位置（用于日志）
    let footPos = pfGetFootPosition(bedPos.blockX, bedPos.blockY, bedPos.blockZ, bedPos.yaw)
    console.log("[SLEEP-JS] 脚位置: (" + footPos.x.toFixed(1) + "," + footPos.y + "," + footPos.z.toFixed(1) + ")")
    
    // UI由客户端脚本管理，无需在此创建
}

/**
 * 检测是否应该起床
 * 返回 true 时实体会起床，返回 false 则继续睡觉
 * UI移除由客户端脚本（foot_ui.js）处理
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} sleepDuration   已睡眠时长（tick）
 * @returns {boolean} true=应该起床, false=继续睡觉
 */
global.pfShouldWakeUp = function (entity, level, bedPos, sleepDuration) {
    let uuid = "" + entity.getUuid()

    // 10秒（200 tick）超时起床
    if (sleepDuration > 200) {
        console.log("[SLEEP-JS] 睡眠超时 200 tick，起床 uuid=" + uuid)
        return true
    }

    // 检测 serve_finish 字段，存在则起床
    let serveFinish = entity.persistentData.getInt("serve_finish")
    if (serveFinish === 1) {
        console.log("[SLEEP-JS] 检测到 serve_finish 标记，起床")
        // 清除标记
        entity.persistentData.putInt("serve_finish", 0)
        return true
    }

    return false
}
