// priority: 10
// ============================================================
// 主入口模块
// 整合所有模块，提供global.pathfinderTick主循环
// ============================================================

/**
 * 寻路系统每 tick 驱动入口，由 pathfinder_block 方块实体调用
 * @param {$BlockEntity_} entity  触发方块的方块实体对象
 */
global.pathfinderTick = function (entity) {
    let level = entity.getLevel()
    let pos = entity.getBlockPos()
    let currentTick = level.getServer().getTickCount()
    
    // 收集所有实体
    let entities = global.pfMovement.pfCollectEntities(level, pos)
    let walkers = entities.walkers
    let sleepers = entities.sleepers
    let waiters = entities.waiters
    let blueWaiters = entities.blueWaiters
    
    // ---- 处理蓝色地毯等待中的实体 ----
    for (let i = 0; i < blueWaiters.length; i++) {
        let ent = blueWaiters[i]
        
        // 防止重复处理
        let lastTick = global.pfEntityData.pfGetLastTick(ent)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        global.pfEntityData.pfSetLastTick(ent, currTick)
        
        // 检查是否已经上过床
        if (global.pfEntityData.pfHasSlept(ent)) {
            global.pfEntityData.pfSetPhase(ent, 2)
            console.log("[PF] 蓝色地毯等待：已上过床，继续行走")
            continue
        }
        
        // 获取当前路径进度
        let time = global.pfEntityData.pfGetTime(ent)
        let routeStr = global.pfEntityData.pfGetRoute(ent)
        let routeChars = routeStr.split('')
        
        // 获取床位列表
        let allBeds = global.pfBedManager.pfParseBeds(global.pfEntityData.pfGetBedList(ent))
        
        // 计算当前位置
        let currPos = global.pfMovement.pfCalcCurrentPos(ent)
        
        // 查找后面路径旁的空床
        let foundEmptyBed = null
        for (let b = 0; b < allBeds.length; b++) {
            let bed = allBeds[b]
            let dx = bed.x - currPos.x
            let dz = bed.z - currPos.z
            let dist = Math.sqrt(dx * dx + dz * dz)
            if (dist >= 2 && dist <= 200 && !global.pfBedManager.pfIsBedOccupied(level, bed, ent)) {
                foundEmptyBed = bed
                break
            }
        }
        
        if (foundEmptyBed !== null) {
            // 保存睡眠前位置
            global.pfEntityData.pfSetBeforeSleepPos(ent, currPos.x, ent.getY(), currPos.z)
            global.pfEntityData.pfSetSleepStartTick(ent, currTick)
            global.pfEntityData.pfSetHasSlept(ent, true)
            global.pfEntityData.pfSetPhase(ent, 3)
            global.pfEntityData.pfSetBedInfo(ent, foundEmptyBed)
            global.pfEntityData.pfSetFromBlueWait(ent, true)
            global.pfEntityData.pfSetWaitPos(ent, currPos.x, ent.getY(), currPos.z)
            
            ent.setPositionAndRotation(foundEmptyBed.x, foundEmptyBed.blockY + 0.2, foundEmptyBed.z, foundEmptyBed.yaw, 0)
            console.log("[PF-SLEEP] 蓝色地毯等待后躺床: bedPos=(" + foundEmptyBed.blockX + "," + foundEmptyBed.blockY + "," + foundEmptyBed.blockZ + ")")
            
            // 调用睡眠开始回调
            if (typeof global.pfOnStartSleep === "function") {
                global.pfOnStartSleep(ent, level, foundEmptyBed, currTick)
            }
        }
    }
    
    // ---- 处理躺床中的实体 ----
    for (let i = 0; i < sleepers.length; i++) {
        let ent = sleepers[i]
        
        // 防止重复处理
        let lastTick = global.pfEntityData.pfGetLastTick(ent)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        global.pfEntityData.pfSetLastTick(ent, currTick)
        
        // 处理泡脚倒计时
        global.pfSoakManager.pfProcessSoaking(ent, currTick)
        
        // 处理睡眠逻辑
        let sleepResult = global.pfSleepManager.pfProcessSleeping(ent, level, currTick)
        
        if (sleepResult.shouldWakeUp) {
            global.pfSleepManager.pfWakeUp(ent, level)
        }
    }
    
    // ---- 构建排队信息 ----
    let allWalkerInfos = []
    allWalkerInfos = allWalkerInfos.concat(global.pfMovement.pfBuildWalkerInfos(walkers))
    allWalkerInfos = allWalkerInfos.concat(global.pfMovement.pfBuildWalkerInfos(waiters))
    allWalkerInfos = allWalkerInfos.concat(global.pfMovement.pfBuildWalkerInfos(sleepers))
    allWalkerInfos = allWalkerInfos.concat(global.pfMovement.pfBuildWalkerInfos(blueWaiters))
    
    // ---- 处理行走的实体 ----
    for (let i = 0; i < walkers.length; i++) {
        let ent = walkers[i]
        
        // 防止重复处理
        let lastTick = global.pfEntityData.pfGetLastTick(ent)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        global.pfEntityData.pfSetLastTick(ent, currTick)
        
        // 清除残留的睡眠NBT
        global.pfMovement.pfClearSleepNbt(ent, level)
        
        // 检查排队
        let myInfo = {
            ent: ent,
            progress: global.pfEntityData.pfGetTime(ent) * 10 + global.pfEntityData.pfGetSubStep(ent),
            x: ent.getX(),
            z: ent.getZ()
        }
        if (global.pfMovement.pfCheckQueue(myInfo, allWalkerInfos)) {
            continue
        }
        
        // 执行移动
        let moveResult = global.pfMovement.pfMoveStep(ent, level)
        if (moveResult.finished) {
            continue
        }
        
        // 检查是否到达蓝色地毯（在pfMoveStep的sub===0时）
        let sub = global.pfEntityData.pfGetSubStep(ent)
        if (sub === 0) {
            let currPos = global.pfMovement.pfCalcCurrentPos(ent)
            let bluePos = global.pfEntityData.pfGetBlueCarpetPos(ent)
            let dx = currPos.x - bluePos.x
            let dz = currPos.z - bluePos.z
            let distToBlue = Math.sqrt(dx * dx + dz * dz)
            
            let blockX = Math.floor(currPos.x)
            let blockZ = Math.floor(currPos.z)
            let currentBlock = level.getBlock(blockX, ent.getY(), blockZ)
            let isBlueCarpet = (currentBlock.id == "minecraft:blue_carpet") || (distToBlue < 0.5)
            
            if (isBlueCarpet && !global.pfEntityData.pfHasSlept(ent)) {
                global.pfEntityData.pfSetWaitPos(ent, currPos.x, ent.getY(), currPos.z)
                global.pfEntityData.pfSetPhase(ent, 5)
                console.log("[PF] 到达蓝色地毯，进入等待状态 pos=(" + currPos.x.toFixed(1) + "," + currPos.z.toFixed(1) + ")")
            }
        }
    }
}

console.log("[PF-MAIN] pathfinder模块已加载")
