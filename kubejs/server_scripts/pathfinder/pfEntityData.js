// priority: 10
// ============================================================
// 实体数据控制模块
// 封装实体persistentData的存取操作
// ============================================================

// 生成随机需求清单
// 返回对象: {脚背: x, 脚掌: x, 脚后跟: x, 脚趾: x, 脚心: x}
function pfGenerateDemandList() {
    let demandList = {}
    for (let i = 0; i < global.pfConstants.PF_DEMAND_TYPES.length; i++) {
        let type = global.pfConstants.PF_DEMAND_TYPES[i]
        demandList[type] = Math.floor(Math.random() * 3)
    }
    return demandList
}

// ========== 基础数据存取 ==========

function pfGetOrigin(ent) {
    return {
        x: ent.persistentData.getFloat("pfOriginX"),
        z: ent.persistentData.getFloat("pfOriginZ")
    }
}

function pfSetOrigin(ent, x, z) {
    ent.persistentData.putFloat("pfOriginX", x)
    ent.persistentData.putFloat("pfOriginZ", z)
}

function pfGetRoute(ent) {
    return "" + ent.persistentData.getString("pfRoute")
}

function pfSetRoute(ent, routeStr) {
    ent.persistentData.putString("pfRoute", routeStr)
}

function pfGetTime(ent) {
    return (ent.persistentData.getInt("pfTime") | 0)
}

function pfSetTime(ent, time) {
    ent.persistentData.putInt("pfTime", time)
}

function pfGetSubStep(ent) {
    return (ent.persistentData.getInt("pfSubStep") | 0)
}

function pfSetSubStep(ent, subStep) {
    ent.persistentData.putInt("pfSubStep", subStep)
}

function pfGetPhase(ent) {
    return ent.persistentData.getInt("pfPhase")
}

function pfSetPhase(ent, phase) {
    ent.persistentData.putInt("pfPhase", phase)
    global.pfNbtSync.pfSyncPhase(ent, phase)
}

// ========== 床位信息 ==========

function pfGetBedInfo(ent) {
    return {
        blockX: ent.persistentData.getInt("pfBedX"),
        blockY: ent.persistentData.getInt("pfBedY"),
        blockZ: ent.persistentData.getInt("pfBedZ"),
        yaw: ent.persistentData.getInt("pfBedYaw")
    }
}

function pfSetBedInfo(ent, bedPos) {
    ent.persistentData.putInt("pfBedX", bedPos.blockX)
    ent.persistentData.putInt("pfBedY", bedPos.blockY)
    ent.persistentData.putInt("pfBedZ", bedPos.blockZ)
    ent.persistentData.putInt("pfBedYaw", bedPos.yaw)
    global.pfNbtSync.pfSyncBed(ent, bedPos.blockX, bedPos.blockY, bedPos.blockZ, bedPos.yaw)
}

// ========== 睡眠相关 ==========

function pfGetSleepStartTick(ent) {
    return (ent.persistentData.getInt("pfSleepStartTick") | 0)
}

function pfSetSleepStartTick(ent, tick) {
    ent.persistentData.putInt("pfSleepStartTick", tick)
}

function pfGetBeforeSleepPos(ent) {
    return {
        x: ent.persistentData.getFloat("pfBeforeSleepX"),
        y: ent.persistentData.getFloat("pfBeforeSleepY"),
        z: ent.persistentData.getFloat("pfBeforeSleepZ")
    }
}

function pfSetBeforeSleepPos(ent, x, y, z) {
    ent.persistentData.putFloat("pfBeforeSleepX", x)
    ent.persistentData.putFloat("pfBeforeSleepY", y)
    ent.persistentData.putFloat("pfBeforeSleepZ", z)
}

function pfHasSlept(ent) {
    return (ent.persistentData.getInt("pfHasSlept") | 0) === 1
}

function pfSetHasSlept(ent, hasSlept) {
    ent.persistentData.putInt("pfHasSlept", hasSlept ? 1 : 0)
}

function pfIsFromBlueWait(ent) {
    return (ent.persistentData.getInt("pfFromBlueWait") | 0) === 1
}

function pfSetFromBlueWait(ent, fromBlue) {
    ent.persistentData.putInt("pfFromBlueWait", fromBlue ? 1 : 0)
}

// ========== 蓝色地毯位置 ==========

function pfGetBlueCarpetPos(ent) {
    return {
        x: ent.persistentData.getFloat("pfBlueCarpetX"),
        z: ent.persistentData.getFloat("pfBlueCarpetZ")
    }
}

function pfSetBlueCarpetPos(ent, x, z) {
    ent.persistentData.putFloat("pfBlueCarpetX", x)
    ent.persistentData.putFloat("pfBlueCarpetZ", z)
}

// ========== 等待位置 ==========

function pfGetWaitPos(ent) {
    return {
        x: ent.persistentData.getFloat("pfWaitX"),
        y: ent.persistentData.getFloat("pfWaitY"),
        z: ent.persistentData.getFloat("pfWaitZ")
    }
}

function pfSetWaitPos(ent, x, y, z) {
    ent.persistentData.putFloat("pfWaitX", x)
    ent.persistentData.putFloat("pfWaitY", y)
    ent.persistentData.putFloat("pfWaitZ", z)
}

// ========== 最后处理tick（防重复处理） ==========

function pfGetLastTick(ent) {
    return (ent.persistentData.getInt("pfLastTick") | 0)
}

function pfSetLastTick(ent, tick) {
    ent.persistentData.putInt("pfLastTick", tick)
}

// ========== 清除睡眠NBT的tick计数 ==========

function pfGetClearSleepTick(ent) {
    return ent.persistentData.getInt("pfClearSleepTick")
}

function pfSetClearSleepTick(ent, tick) {
    ent.persistentData.putInt("pfClearSleepTick", tick)
}

// ========== 床位列表 ==========

function pfGetBedList(ent) {
    return "" + ent.persistentData.getString("pfBedList")
}

function pfSetBedList(ent, bedListStr) {
    ent.persistentData.putString("pfBedList", bedListStr)
}

// 导出到全局
global.pfEntityData = {
    pfGenerateDemandList: pfGenerateDemandList,
    pfGetOrigin: pfGetOrigin,
    pfSetOrigin: pfSetOrigin,
    pfGetRoute: pfGetRoute,
    pfSetRoute: pfSetRoute,
    pfGetTime: pfGetTime,
    pfSetTime: pfSetTime,
    pfGetSubStep: pfGetSubStep,
    pfSetSubStep: pfSetSubStep,
    pfGetPhase: pfGetPhase,
    pfSetPhase: pfSetPhase,
    pfGetBedInfo: pfGetBedInfo,
    pfSetBedInfo: pfSetBedInfo,
    pfGetSleepStartTick: pfGetSleepStartTick,
    pfSetSleepStartTick: pfSetSleepStartTick,
    pfGetBeforeSleepPos: pfGetBeforeSleepPos,
    pfSetBeforeSleepPos: pfSetBeforeSleepPos,
    pfHasSlept: pfHasSlept,
    pfSetHasSlept: pfSetHasSlept,
    pfIsFromBlueWait: pfIsFromBlueWait,
    pfSetFromBlueWait: pfSetFromBlueWait,
    pfGetBlueCarpetPos: pfGetBlueCarpetPos,
    pfSetBlueCarpetPos: pfSetBlueCarpetPos,
    pfGetWaitPos: pfGetWaitPos,
    pfSetWaitPos: pfSetWaitPos,
    pfGetLastTick: pfGetLastTick,
    pfSetLastTick: pfSetLastTick,
    pfGetClearSleepTick: pfGetClearSleepTick,
    pfSetClearSleepTick: pfSetClearSleepTick,
    pfGetBedList: pfGetBedList,
    pfSetBedList: pfSetBedList
}
