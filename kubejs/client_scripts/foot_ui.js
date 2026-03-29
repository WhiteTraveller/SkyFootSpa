// ============================================================
// 睡眠实体UI显示模块 - 客户端脚本
// foot_ui.js - 在世界中显示睡眠实体的脚部UI
// ============================================================




let WorldWindow = Java.loadClass("com.sighs.apricityui.instance.WorldWindow")
let Minecraft = Java.loadClass("net.minecraft.client.Minecraft")

// WorldWindow.clear()

// 全局状态管理
let sleepWindows = new Map()
let trackedEntities = new Map()
let entityCountdowns = new Map()  // 存储每个实体的上次倒计时值

// UI配置
let BAR_WIDTH = 700.0
let BAR_HEIGHT = 700.0
let SCALE = 0.01
let MAX_DISTANCE = 16
let PI = 3.1415926

/**
 * 根据床的 yaw 计算脚的位置（床尾位置）
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    let footX = bedX
    let footZ = bedZ

    if (yaw === 0) {
        footZ = bedZ - 1
    } else if (yaw === 180 || yaw === -180) {
        footZ = bedZ + 1
    } else if (yaw === 90) {
        footX = bedX + 1
    } else if (yaw === -90) {
        footX = bedX - 1
    }

    return { x: footX + 0.5, y: bedY, z: footZ + 0.5 }
}

/**
 * 创建睡眠实体的UI窗口
 */
function createSleepWindow(entity) {
    if (entity == null || !entity.isAlive()) {
        return null
    }

    let uuid = "" + entity.getUuid()
    
    // 从手持物品NBT读取床位信息（物品NBT自动同步）
    let mainHand = entity.getMainHandItem()
    let bedX = 0, bedY = 0, bedZ = 0, bedYaw = 0
    if (mainHand && mainHand.id === 'minecraft:redstone') {
        bedX = mainHand.nbt.getInt('pfBedX')
        bedY = mainHand.nbt.getInt('pfBedY')
        bedZ = mainHand.nbt.getInt('pfBedZ')
        bedYaw = mainHand.nbt.getInt('pfBedYaw')
        console.log("[FOOT-UI-DATA] 读取pfBedNBT: " + bedX + ", " + bedY + ", " + bedZ + ", " + bedYaw)
    }

    // 计算脚的位置
    let footPos = pfGetFootPosition(bedX, bedY, bedZ, bedYaw)
    let footBlockPos = new BlockPos(footPos.x, footPos.y - 1, footPos.z)

    // 读取当前倒计时和需求清单
    let countdown = getCountdown(entity)
    entityCountdowns.set(uuid, countdown)
    console.log("[FOOT-UI-DATA] 创建窗口 - entity uuid=" + uuid)
    let demandList = getDemandList(entity)
    console.log("[FOOT-UI-DATA] 最终需求清单: " + JSON.stringify(demandList))

    // 注意：路径是相对于 apricity/ 目录的
    let window = new WorldWindow("kubejs/footui.html", footBlockPos, BAR_WIDTH, BAR_HEIGHT, MAX_DISTANCE)
    window.setRotation(180 - (PI * bedYaw / 180), 0)
    window.setScale(SCALE)

    WorldWindow.addWindow(window)
    
    sleepWindows.set(uuid, window)
    trackedEntities.set(uuid, entity)
    
    // 设置初始倒计时和需求清单显示
    updateCountdownDisplay(window, countdown)
    updateDemandListDisplay(window, demandList)
    
    console.log("[FOOT-UI] 创建UI窗口 uuid=" + uuid + " countdown=" + countdown)
    return window
}

/**
 * 移除睡眠实体的UI窗口
 */
function removeSleepWindow(uuid) {
    let window = sleepWindows.get(uuid)
    if (window != null) {
        WorldWindow.removeWindow(window)
        sleepWindows.delete(uuid)
        console.log("[FOOT-UI] 移除UI窗口 uuid=" + uuid)
    }
    trackedEntities.delete(uuid)
    entityCountdowns.delete(uuid)
}

/**
 * 更新窗口中的倒计时显示
 */
function updateCountdownDisplay(window, countdown) {
    if (window == null || window.document == null) {
        return
    }
    try {
        // 更新倒计时数字
        let countdownNumber = window.document.getElementById("countdownNumber")
        if (countdownNumber != null) {
            countdownNumber.innerText = String(countdown)
        }
        // 更新紧迫状态样式
        let countdownContainer = window.document.getElementById("countdownContainer")
        if (countdownContainer != null) {
            if (countdown <= 3) {
                countdownContainer.setAttribute("class", "countdown-container countdown-urgent")
            } else {
                countdownContainer.setAttribute("class", "countdown-container")
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新倒计时失败: " + e)
    }
}

/**
 * 检查实体是否处于睡眠状态（pfPhase=3）
 * 从手持物品NBT读取（物品NBT自动同步）
 */
function isSleeping(entity) {
    if (entity == null) {
        return false
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === 'minecraft:redstone') {
        let phase = mainHand.nbt.getInt('pfPhase')
        return phase === 3
    }
    return false
}

/**
 * 从手持物品读取需求清单
 * 返回对象: {脚背, 脚掌, 脚后跟, 脚趾, 脚心}
 */
function getDemandList(entity) {
    if (entity == null) {
        console.log("[FOOT-UI-DATA] getDemandList: entity为null")
        return { '脚背': 0, '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === 'minecraft:redstone') {
        let result = {
            '脚背': mainHand.nbt.getInt('pfDemandJiaobei') || 0,
            '脚掌': mainHand.nbt.getInt('pfDemandJiaozhang') || 0,
            '脚后跟': mainHand.nbt.getInt('pfDemandJiaogen') || 0,
            '脚趾': mainHand.nbt.getInt('pfDemandJiaozhi') || 0,
            '脚心': mainHand.nbt.getInt('pfDemandJiaoxin') || 0
        }
        return result
    }
    console.log("[FOOT-UI-DATA] 手持物品不是红石，无法读取需求清单")
    return { '脚背': 0, '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
}

/**
 * 从手持物品读取倒计时
 * 返回剩余秒数（1-10），如果没有则返回10
 */
function getCountdown(entity) {
    if (entity == null) {
        return 10
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === 'minecraft:redstone') {
        let countdown = mainHand.nbt.getInt('pfCountdown')
        if (countdown > 0 && countdown <= 10) {
            return countdown
        }
    }
    return 10
}

/**
 * 更新窗口中的需求清单显示
 */
function updateDemandListDisplay(window, demandList) {
    if (window == null || window.document == null) {
        return
    }
    try {
        // 更新需求清单各项目，为0则隐藏（保留布局空间）
        let jiaobei = window.document.getElementById("demandJiaobei")
        if (jiaobei != null) {
            let count = demandList['脚背'] || 0
            jiaobei.innerText = "脚背: " + count + "次"
            jiaobei.isVisible = false
        }
        
        let jiaozhang = window.document.getElementById("demandJiaozhang")
        if (jiaozhang != null) {
            let count = demandList['脚掌'] || 0
            jiaozhang.innerText = "脚掌: " + count + "次"
        }
        
        let jiaogen = window.document.getElementById("demandJiaogen")
        if (jiaogen != null) {
            let count = demandList['脚后跟'] || 0
            jiaogen.innerText = "脚后跟: " + count + "次"
        }
        
        let jiaozhi = window.document.getElementById("demandJiaozhi")
        if (jiaozhi != null) {
            let count = demandList['脚趾'] || 0
            jiaozhi.innerText = "脚趾: " + count + "次"
        }
        
        let jiaoxin = window.document.getElementById("demandJiaoxin")
        if (jiaoxin != null) {
            let count = demandList['脚心'] || 0
            jiaoxin.innerText = "脚心: " + count + "次"
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新需求清单失败: " + e)
    }
}

/**
 * 客户端Tick事件 - 检测并管理睡眠实体的UI
 */
let clientTickCount = 0

ClientEvents.tick(event => {
    let player = event.player
    if (player == null) {
        return
    }

    clientTickCount++
    let level = event.level
    let playerPos = player.position()

    // 获取玩家附近的实体
    let nearbyEntities = level.getEntitiesOfClass(
        Java.loadClass("net.minecraft.world.entity.LivingEntity"),
        player.getBoundingBox().inflate(MAX_DISTANCE)
    )

    // 检测睡眠中的实体
    for (let i = 0; i < nearbyEntities.length; i++) {
        let entity = nearbyEntities[i]
        if (entity == player) continue
        
        let uuid = "" + entity.getUuid()
        
        if (isSleeping(entity)) {
            // 实体正在睡眠，检查是否已有窗口
            if (!sleepWindows.has(uuid)) {
                createSleepWindow(entity)
            } else {
                // 检查倒计时是否变化，变化则更新显示
                let currentCountdown = getCountdown(entity)
                let lastCountdown = entityCountdowns.get(uuid) || 10
                if (currentCountdown !== lastCountdown) {
                    entityCountdowns.set(uuid, currentCountdown)
                    // 通过document API更新显示
                    let window = sleepWindows.get(uuid)
                    updateCountdownDisplay(window, currentCountdown)
                    console.log("[FOOT-UI] 倒计时更新: " + lastCountdown + " -> " + currentCountdown)
                }
                let demandList = getDemandList(entity)
                updateDemandListDisplay(window, demandList)
            }
        } else {
            // 实体不在睡眠状态，移除窗口（如果存在）
            if (sleepWindows.has(uuid)) {
                removeSleepWindow(uuid)
            }
        }
    }

    // 清理超出范围的窗口
    let toRemove = []
    sleepWindows.forEach(function(window, uuid) {
        let entity = trackedEntities.get(uuid)
        if (entity == null || !entity.isAlive()) {
            toRemove.push(uuid)
        } else {
            let dist = entity.position().distanceToSqr(playerPos)
            if (dist > MAX_DISTANCE * MAX_DISTANCE) {
                toRemove.push(uuid)
            }
        }
    })
    
    for (let i = 0; i < toRemove.length; i++) {
        removeSleepWindow(toRemove[i])
    }
})

/**
 * 玩家离开世界时清理所有窗口
 */
ClientEvents.loggedIn(event => {
    sleepWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
})

ClientEvents.loggedOut(event => {
    sleepWindows.forEach(function(window, uuid) {
        WorldWindow.removeWindow(window)
    })
    sleepWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
})
