// ============================================================
// 睡眠控制模块 - pathfinder.js 的睡眠回调扩展
// sleep.js L1-L152
// ============================================================

let WorldWindow = Java.loadClass("com.sighs.apricityui.instance.WorldWindow")

// 全局 Window 管理器，用于跟踪每个实体的 UI 窗口
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
 * 在这里可以添加自定义逻辑，例如：
 * - 设置自定义睡眠时长
 * - 记录睡眠统计
 * - 触发其他效果
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} currentTick     当前游戏tick
 */
global.pfOnStartSleep = function (entity, level, bedPos, currentTick) {
    let uuid = "" + entity.getUuid()
    console.log("[SLEEP-JS] 开始睡觉 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)

    // 计算脚的位置
    let footPos = pfGetFootPosition(bedPos.blockX, bedPos.blockY, bedPos.blockZ, bedPos.yaw)
    console.log("[SLEEP-JS] 脚位置: (" + footPos.x.toFixed(1) + "," + footPos.y + "," + footPos.z.toFixed(1) + ")")

    // 创建 WorldWindow
    let footBlockPos = new BlockPos(footPos.x, footPos.y, footPos.z)
    var myWindow = WorldWindow("kubejs/test.html", footBlockPos, 700, 700, 10)

    // 设置朝向
    myWindow.setRotation(bedPos.yaw, 0)

    // // 设置缩放
    myWindow.setScale(0.01)

    // // 添加窗口到世界
    WorldWindow.addWindow(myWindow)

    // 保存窗口引用
    global.pfSleepWindows.set(uuid, myWindow)
    console.log("[SLEEP-JS] UI窗口已创建 uuid=" + uuid)
}

/**
 * 检测是否应该起床
 * 返回 true 时实体会起床，返回 false 则继续睡觉
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
    if (sleepDuration > 20) {
        console.log("[SLEEP-JS] 睡眠超时 200 tick，起床 uuid=" + uuid)
        removeSleepWindow(uuid)
        return true
    }

    // 检测 serve_finish 字段，存在则起床
    let serveFinish = entity.persistentData.getInt("serve_finish")
    if (serveFinish === 1) {
        console.log("[SLEEP-JS] 检测到 serve_finish 标记，起床")
        // 清除标记
        entity.persistentData.putInt("serve_finish", 0)
        // 移除 UI 窗口（在客户端线程）
        removeSleepWindow(uuid)
        return true
    }

    return false
}

/**
 * 移除睡眠 UI 窗口（在客户端线程执行）
 * @param {string} uuid  实体的 UUID
 */
function removeSleepWindow(uuid) {
    console.log("[SLEEP-JS] UI窗口移除请求 uuid=" + uuid)

            let window = global.pfSleepWindows.get(uuid)
            if (window) {
                WorldWindow.removeWindow(window)
                global.pfSleepWindows.delete(uuid)
                console.log("[SLEEP-JS] UI窗口已移除 uuid=" + uuid)
            }
}
