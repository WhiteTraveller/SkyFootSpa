// priority: 10
// ============================================================
// 实体移动与排队模块
// 实体移动、排队检测、进度管理
// ============================================================

// 收集所有实体并按phase分类
function pfCollectEntities(level, pos) {
    let searchRange = new AABB.of(
        pos.getX() - global.pfConstants.GRID_HALF - 5, pos.getY() - 5, pos.getZ() - global.pfConstants.GRID_HALF - 5,
        pos.getX() + global.pfConstants.GRID_HALF + 5, pos.getY() + 10, pos.getZ() + global.pfConstants.GRID_HALF + 5
    )
    let allEntities = level.getEntitiesWithin(searchRange)
    let walkers = []      // pfPhase=2 行走中
    let sleepers = []     // pfPhase=3 躺床中
    let waiters = []      // pfPhase=4 等待床位中
    let blueWaiters = []  // pfPhase=5 蓝色地毯等待中
    
    for (let i = 0; i < allEntities.length; i++) {
        let ent = allEntities[i]
        let phase = ent.persistentData.getInt("pfPhase")
        if (phase === 2) {
            walkers.push(ent)
        } else if (phase === 3) {
            sleepers.push(ent)
        } else if (phase === 4) {
            waiters.push(ent)
        } else if (phase === 5) {
            blueWaiters.push(ent)
        }
    }
    
    return { walkers: walkers, sleepers: sleepers, waiters: waiters, blueWaiters: blueWaiters }
}

// 构建排队信息
function pfBuildWalkerInfos(entities) {
    let infos = []
    for (let i = 0; i < entities.length; i++) {
        let ent = entities[i]
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let progress = time * 10 + sub
        infos.push({
            ent: ent,
            progress: progress,
            x: ent.getX(),
            z: ent.getZ()
        })
    }
    return infos
}

// 检查是否需要排队
function pfCheckQueue(myInfo, allInfos) {
    let myId = myInfo.ent.getId()
    
    for (let j = 0; j < allInfos.length; j++) {
        let other = allInfos[j]
        if (other.ent === myInfo.ent) continue
        
        let dx = other.x - myInfo.x
        let dz = other.z - myInfo.z
        let dist = Math.sqrt(dx * dx + dz * dz)
        
        if (dist < 1.5) {
            if (other.progress > myInfo.progress) {
                return true
            }
            if (other.progress == myInfo.progress) {
                let otherId = other.ent.getId()
                if (otherId < myId) {
                    return true
                }
            }
        }
    }
    return false
}

// 计算当前位置（基于路径进度）
function pfCalcCurrentPos(ent) {
    let origin = global.pfEntityData.pfGetOrigin(ent)
    let routeStr = global.pfEntityData.pfGetRoute(ent)
    let routeChars = routeStr.split('')
    let time = global.pfEntityData.pfGetTime(ent)
    
    let cx = origin.x, cz = origin.z
    for (let k = 0; k < time; k++) {
        let d = routeChars[k]
        if (d === 'N') cz -= 1
        else if (d === 'S') cz += 1
        else if (d === 'E') cx += 1
        else if (d === 'W') cx -= 1
    }
    
    return { x: cx, z: cz }
}

// 执行一步移动
function pfMoveStep(ent, level) {
    let routeStr = global.pfEntityData.pfGetRoute(ent)
    let routeChars = routeStr.split('')
    let time = global.pfEntityData.pfGetTime(ent)
    let sub = global.pfEntityData.pfGetSubStep(ent)
    let routeLen = routeChars.length
    
    if (time < 0 || time >= routeLen || routeLen === 0) {
        return { finished: false, moved: false }
    }
    
    let stepChar = routeChars[time]
    let origin = global.pfEntityData.pfGetOrigin(ent)
    let entY = ent.getY()
    
    // 计算从起点到当前格起点的偏移
    let cx = origin.x, cz = origin.z
    for (let k = 0; k < time; k++) {
        let d = routeChars[k]
        if (d === 'N') cz -= 1
        else if (d === 'S') cz += 1
        else if (d === 'E') cx += 1
        else if (d === 'W') cx -= 1
    }
    
    // 当前格内移动：从本格中心向下一格中心插值
    let t = sub / 10.0
    let nx = cx, nz = cz
    let yaw = 0
    if (stepChar === 'N') { nz = cz - t; yaw = 180 }
    else if (stepChar === 'S') { nz = cz + t; yaw = 0 }
    else if (stepChar === 'E') { nx = cx + t; yaw = -90 }
    else if (stepChar === 'W') { nx = cx - t; yaw = 90 }
    
    ent.setPositionAndRotation(nx, entY, nz, yaw, 0)
    
    // 子步+1，满10则归零并推进格数
    let newSub = sub + 1
    if (newSub >= 10) {
        global.pfEntityData.pfSetSubStep(ent, 0)
        let newTime = time + 1
        if (newTime >= routeLen) {
            // 到达终点
            let fx = cx, fz = cz
            if (stepChar === 'N') fz -= 1
            else if (stepChar === 'S') fz += 1
            else if (stepChar === 'E') fx += 1
            else if (stepChar === 'W') fx -= 1
            ent.setPositionAndRotation(fx, entY, fz, yaw, 0)
            level.spawnParticles("minecraft:poof", false, fx, entY + 1, fz, 0.5, 1, 0.5, 50, 0)
            console.log("[PF] FINISH at (" + fx.toFixed(1) + "," + fz.toFixed(1) + ")")
            ent.discard()
            return { finished: true, moved: true }
        } else {
            global.pfEntityData.pfSetTime(ent, newTime)
            return { finished: false, moved: true }
        }
    } else {
        global.pfEntityData.pfSetSubStep(ent, newSub)
        return { finished: false, moved: true }
    }
}

// 清除残留的睡眠NBT
function pfClearSleepNbt(ent, level) {
    let clearTick = global.pfEntityData.pfGetClearSleepTick(ent)
    if (clearTick > 0) {
        let server = level.getServer()
        let uuid = "" + ent.getUuid()
        server.runCommandSilent("data remove entity " + uuid + " SleepingX")
        server.runCommandSilent("data remove entity " + uuid + " SleepingY")
        server.runCommandSilent("data remove entity " + uuid + " SleepingZ")
        global.pfEntityData.pfSetClearSleepTick(ent, clearTick - 1)
    }
}

// 导出到全局
global.pfMovement = {
    pfCollectEntities: pfCollectEntities,
    pfBuildWalkerInfos: pfBuildWalkerInfos,
    pfCheckQueue: pfCheckQueue,
    pfCalcCurrentPos: pfCalcCurrentPos,
    pfMoveStep: pfMoveStep,
    pfClearSleepNbt: pfClearSleepNbt
}
