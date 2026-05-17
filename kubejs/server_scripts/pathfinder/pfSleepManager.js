// priority: 10
// ============================================================
// 睡眠管理模块
// 躺床、起床、睡眠状态管理
// ------------------------------------------------------------
// 时间状态规范（参照 pfSoakManager 范式）：
//   - 所有睡眠相关时间状态以"秒/计数"为单位独立存储于实体 persistentData
//   - 不依赖 server.getTickCount() 差值，避免跨重启失效
//   - 关键字段：
//       * pfSleepSubTick    : 0~19 秒内 tick 计数器，每 tick +1，到 20 触发"秒事件"
//       * pfSleepSeconds    : 已睡累计秒数，秒事件 +1
//       * pfSleepInitTicks  : 0~60 前 60 tick 设置睡姿计数器，每 tick +1，封顶 60
//   - 这些字段都存实体 persistentData，跨重启保留
// ============================================================

// 重置秒驱动相关字段（开始睡眠时调用）
function pfResetSleepSubTick(ent) {
    ent.persistentData.putInt("pfSleepSubTick", 0)
    ent.persistentData.putInt("pfSleepSeconds", 0)
    ent.persistentData.putInt("pfSleepInitTicks", 0)
}

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
    
    // 重置秒驱动字段（独立于 currTick）
    pfResetSleepSubTick(ent)
    
    // 设置实体位置到床上
    ent.setPositionAndRotation(bedPos.x, bedPos.blockY + 0.2, bedPos.z, bedPos.yaw, 0)
    
    console.log("[PF-SLEEP] 开始睡眠: bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ")")
    
    // 调用睡眠开始回调（定义在 sleep.js）
    if (typeof global.pfOnStartSleep === "function") {
        global.pfOnStartSleep(ent, level, bedPos, currTick)
    }
}

// 处理睡眠中的实体（每tick调用）
// 设计：完全按"秒/计数"驱动；不依赖 currTick - sleepStart 差值，跨重启友好
function pfProcessSleeping(ent, level, currTick) {
    let sleepStart = global.pfEntityData.pfGetSleepStartTick(ent)
    if (sleepStart <= 0) {
        return { shouldWakeUp: false, sleepDuration: 0 }
    }
    
    let bedPos = global.pfEntityData.pfGetBedInfo(ent)
    let server = level.getServer()
    let uuid = "" + ent.getUuid()
    
    // ---- 前 60 tick 设置睡姿 NBT 与朝向（独立计数器，不依赖差值） ----
    let initTicks = (ent.persistentData.getInt("pfSleepInitTicks") | 0)
    if (initTicks < 60) {
        let cmd = "data merge entity " + uuid + " {SleepingX:" + bedPos.blockX + ",SleepingY:" + bedPos.blockY + ",SleepingZ:" + bedPos.blockZ + "}"
        if (initTicks === 0) {
            console.log("[PF-SLEEP] 设置躺姿 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)
        }
        server.runCommandSilent(cmd)
        ent.setYaw(bedPos.yaw)
        ent.persistentData.putInt("pfSleepInitTicks", initTicks + 1)
    }
    
    // ---- 秒驱动：pfSleepSubTick (0~19) → pfSleepSeconds ----
    let subTick = (ent.persistentData.getInt("pfSleepSubTick") | 0) + 1
    let sleepSeconds = (ent.persistentData.getInt("pfSleepSeconds") | 0)
    let secondTriggered = false
    
    if (subTick >= 20) {
        ent.persistentData.putInt("pfSleepSubTick", 0)
        sleepSeconds = sleepSeconds + 1
        ent.persistentData.putInt("pfSleepSeconds", sleepSeconds)
        secondTriggered = true
    } else {
        ent.persistentData.putInt("pfSleepSubTick", subTick)
    }
    
    // ---- 秒事件：同步倒计时 + 驱动 basin 自动泡脚 ----
    if (secondTriggered) {
        // 倒计时显示：从 10 秒倒数到 0
        let remainingSeconds = 10 - sleepSeconds
        if (remainingSeconds < 0) remainingSeconds = 0
        if (remainingSeconds > 10) remainingSeconds = 10
        global.pfNbtSync.pfSyncCountdown(ent, remainingSeconds)
        
        // 床旁 Create Basin 自动泡脚：每秒驱动一次倒计时
        try {
            if (global.pfBasinSoakManager) {
                global.pfBasinSoakManager.pfTickBasinSoak(ent, level, sleepSeconds * 20)
            }
        } catch (e) {
            console.log("[PF-SLEEP] basin soak tick 异常: " + e)
        }
    }
    
    // ---- 调用接口检测是否应该起床 ----
    // 传入秒数换算的伪 sleepDuration 仅用于兼容旧签名
    let sleepDurationLike = sleepSeconds * 20
    let shouldWakeUp = false
    if (typeof global.pfShouldWakeUp === "function") {
        shouldWakeUp = global.pfShouldWakeUp(ent, level, bedPos, sleepDurationLike)
    }
    
    return { shouldWakeUp: shouldWakeUp, sleepDuration: sleepDurationLike }
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
    
    // 清理秒驱动字段（与 pfResetSleepSubTick 对应）
    ent.persistentData.putInt("pfSleepSubTick", 0)
    ent.persistentData.putInt("pfSleepSeconds", 0)
    ent.persistentData.putInt("pfSleepInitTicks", 0)
    
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
    pfWakeUp: pfWakeUp,
    pfResetSleepSubTick: pfResetSleepSubTick
}
