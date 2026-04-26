// priority: 10
// ============================================================
// 睡眠管理模块
// 躺床、起床、睡眠状态管理
// ============================================================

// 开始睡眠
function pfStartSleep(ent, level, bedPos, currTick) {
    let cx = ent.persistentData.getFloat("pfOriginX")
    let cz = ent.persistentData.getFloat("pfOriginZ")
    let time = global.pfEntityData.pfGetTime(ent)
    let routeStr = global.pfEntityData.pfGetRoute(ent)
    let routeChars = routeStr.split('')
    
    // 计算当前位置
    for (let k = 0; k < time; k++) {
        let d = routeChars[k]
        if (d === 'N') cz -= 1
        else if (d === 'S') cz += 1
        else if (d === 'E') cx += 1
        else if (d === 'W') cz -= 1
    }
    
    let entY = ent.getY()
    
    // 保存睡眠前位置
    global.pfEntityData.pfSetBeforeSleepPos(ent, cx, entY, cz)
    global.pfEntityData.pfSetSleepStartTick(ent, currTick)
    global.pfEntityData.pfSetHasSlept(ent, true)
    global.pfEntityData.pfSetPhase(ent, 3)
    global.pfEntityData.pfSetBedInfo(ent, bedPos)
    
    // 设置实体位置到床上
    ent.setPositionAndRotation(bedPos.x, bedPos.blockY + 0.2, bedPos.z, bedPos.yaw, 0)
    
    console.log("[PF-SLEEP] 开始睡眠: bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ")")
    
    // 调用睡眠开始回调（定义在 sleep.js）
    if (typeof global.pfOnStartSleep === "function") {
        global.pfOnStartSleep(ent, level, bedPos, currTick)
    }
}

// 处理睡眠中的实体（每tick调用）
function pfProcessSleeping(ent, level, currTick) {
    let sleepStart = global.pfEntityData.pfGetSleepStartTick(ent)
    let sleepDuration = currTick - sleepStart
    
    if (sleepStart <= 0 || sleepDuration < 1) {
        return { shouldWakeUp: false, sleepDuration: sleepDuration }
    }
    
    let bedPos = global.pfEntityData.pfGetBedInfo(ent)
    let server = level.getServer()
    let uuid = "" + ent.getUuid()
    
    // 躺下后每tick：设置睡觉姿势NBT和保持朝向
    if (sleepDuration >= 1 && sleepDuration < 60) {
        let cmd = "data merge entity " + uuid + " {SleepingX:" + bedPos.blockX + ",SleepingY:" + bedPos.blockY + ",SleepingZ:" + bedPos.blockZ + "}"
        if (sleepDuration == 1) {
            console.log("[PF-SLEEP] 设置躺姿 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)
        }
        server.runCommandSilent(cmd)
        ent.setYaw(bedPos.yaw)
    }
    
    // 同步倒计时到客户端（每20tick更新一次，即每秒）
    let remainingSeconds = Math.ceil((200 - sleepDuration) / 20)
    if (remainingSeconds < 0) remainingSeconds = 0
    if (remainingSeconds > 10) remainingSeconds = 10
    if (sleepDuration % 20 === 1) {
        global.pfNbtSync.pfSyncCountdown(ent, remainingSeconds)
    }
    
    // 调用接口检测是否应该起床
    let shouldWakeUp = false
    if (typeof global.pfShouldWakeUp === "function") {
        shouldWakeUp = global.pfShouldWakeUp(ent, level, bedPos, sleepDuration)
    }
    
    return { shouldWakeUp: shouldWakeUp, sleepDuration: sleepDuration }
}

// 执行起床
function pfWakeUp(ent, level) {
    let bedPos = global.pfEntityData.pfGetBedInfo(ent)
    let uuid = "" + ent.getUuid()
    
    console.log("[PF-SLEEP] 起床 uuid=" + uuid)
    
    // 直接调用 stopSleeping() 方法
    ent.stopSleeping()
    
    // 同时用命令移除NBT
    let server = level.getServer()
    server.runCommandSilent("data remove entity " + uuid + " SleepingX")
    server.runCommandSilent("data remove entity " + uuid + " SleepingY")
    server.runCommandSilent("data remove entity " + uuid + " SleepingZ")
    
    // 计算下床位置
    let fromBlueWait = global.pfEntityData.pfIsFromBlueWait(ent)
    let bsx, bsy, bsz
    
    if (fromBlueWait) {
        // 从蓝色地毯等待后躺床，查找床位周围的红色地毯
        let redCarpetPos = null
        for (let dx = -2; dx <= 2 && redCarpetPos === null; dx++) {
            for (let dz = -2; dz <= 2 && redCarpetPos === null; dz++) {
                if (dx === 0 && dz === 0) continue
                let checkX = bedPos.blockX + dx
                let checkZ = bedPos.blockZ + dz
                let checkBlock = level.getBlock(checkX, bedPos.blockY, checkZ)
                if (checkBlock.id == "minecraft:red_carpet") {
                    redCarpetPos = { x: checkX + 0.5, z: checkZ + 0.5 }
                }
            }
        }
        
        if (redCarpetPos !== null) {
            bsx = redCarpetPos.x
            bsy = bedPos.blockY
            bsz = redCarpetPos.z
            console.log("[PF-SLEEP] 从蓝色地毯等待后下床，定位到红色地毯: (" + bsx.toFixed(1) + "," + bsz.toFixed(1) + ")")
        } else {
            let beforePos = global.pfEntityData.pfGetBeforeSleepPos(ent)
            bsx = beforePos.x
            bsy = beforePos.y
            bsz = beforePos.z
            console.log("[PF-SLEEP] 未找到床位旁红色地毯，使用原位置")
        }
        global.pfEntityData.pfSetFromBlueWait(ent, false)
    } else {
        let beforePos = global.pfEntityData.pfGetBeforeSleepPos(ent)
        bsx = beforePos.x
        bsy = beforePos.y
        bsz = beforePos.z
    }
    
    global.pfEntityData.pfSetSleepStartTick(ent, 0)
    global.pfEntityData.pfSetClearSleepTick(ent, 10)
    ent.setPositionAndRotation(bsx, bsy, bsz, 0, 0)
    global.pfEntityData.pfSetPhase(ent, 2)
    
    // 根据下床位置更新 pfTime
    let routeStr = global.pfEntityData.pfGetRoute(ent)
    let routeChars = routeStr.split('')
    let origin = global.pfEntityData.pfGetOrigin(ent)
    let bestTime = 0
    let bestDist = 9999
    
    for (let t = 0; t <= routeChars.length; t++) {
        let px = origin.x, pz = origin.z
        for (let k = 0; k < t; k++) {
            let d = routeChars[k]
            if (d === 'N') pz -= 1
            else if (d === 'S') pz += 1
            else if (d === 'E') px += 1
            else if (d === 'W') px -= 1
        }
        let dist = Math.sqrt((px - bsx) * (px - bsx) + (pz - bsz) * (pz - bsz))
        if (dist < bestDist) {
            bestDist = dist
            bestTime = t
        }
    }
    
    global.pfEntityData.pfSetTime(ent, bestTime)
    global.pfEntityData.pfSetSubStep(ent, 0)
    
    console.log("[PF-SLEEP] 离开床，继续行走 at (" + bsx.toFixed(1) + "," + bsz.toFixed(1) + ") 更新路径进度 time=" + bestTime)
}

// 导出到全局
global.pfSleepManager = {
    pfStartSleep: pfStartSleep,
    pfProcessSleeping: pfProcessSleeping,
    pfWakeUp: pfWakeUp
}
