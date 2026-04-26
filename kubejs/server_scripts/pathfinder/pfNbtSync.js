// priority: 10
// ============================================================
// NBT同步模块
// 使用实体手持物品的NBT存储和同步数据
// 物品NBT会自动同步到客户端
// ============================================================

// 设置pfPhase（阶段状态）
function pfSyncPhase(entity, phase) {
    let item = entity.getMainHandItem()
    if (!item || item.id === 'minecraft:air') {
        item = Item.of(global.pfConstants.SYNC_ITEM_ID, { pfPhase: phase })
    } else {
        item = item.withNBT({ pfPhase: phase })
    }
    entity.setMainHandItem(item)
}

// 设置床位信息
function pfSyncBed(entity, bedX, bedY, bedZ, bedYaw) {
    let item = entity.getMainHandItem()
    let nbtData = { pfBedX: bedX, pfBedY: bedY, pfBedZ: bedZ, pfBedYaw: bedYaw }
    if (!item || item.id === 'minecraft:air') {
        item = Item.of(global.pfConstants.SYNC_ITEM_ID, nbtData)
    } else {
        item = item.withNBT(nbtData)
    }
    entity.setMainHandItem(item)
}

// 同步倒计时到手持物品NBT
// countdown: 剩余秒数（0-10）
function pfSyncCountdown(entity, countdown) {
    let item = entity.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID) {
        let nbt = item.nbt || {}
        nbt.pfCountdown = countdown
        item = item.withNBT(nbt)
        entity.setMainHandItem(item)
    }
}

// 同步需求清单到手持物品NBT
// skipSoak: 可选，为true时直接设置pfSoakDone=1跳过泡脚
function pfSyncDemandList(entity, demandList, skipSoak) {
    let soakDoneValue = skipSoak ? 1 : 0
    let item = entity.getMainHandItem()
    let nbtData = {
        pfDemandJiaobei: demandList['脚背'],
        pfDemandJiaozhang: demandList['脚掌'],
        pfDemandJiaogen: demandList['脚后跟'],
        pfDemandJiaozhi: demandList['脚趾'],
        pfDemandJiaoxin: demandList['脚心'],
        pfSatisfaction: 0,
        pfMoney: 0,
        pfIsSoaking: 0,
        pfSoakDone: soakDoneValue,
        pfSoakTimeLeft: 0
    }
    if (!item || item.id === 'minecraft:air') {
        item = Item.of(global.pfConstants.SYNC_ITEM_ID, nbtData)
    } else {
        let nbt = item.nbt || {}
        nbt.pfDemandJiaobei = demandList['脚背']
        nbt.pfDemandJiaozhang = demandList['脚掌']
        nbt.pfDemandJiaogen = demandList['脚后跟']
        nbt.pfDemandJiaozhi = demandList['脚趾']
        nbt.pfDemandJiaoxin = demandList['脚心']
        nbt.pfSatisfaction = nbt.pfSatisfaction || 0
        nbt.pfMoney = nbt.pfMoney || 0
        nbt.pfIsSoaking = nbt.pfIsSoaking || 0
        nbt.pfSoakDone = skipSoak ? 1 : (nbt.pfSoakDone || 0)
        nbt.pfSoakTimeLeft = nbt.pfSoakTimeLeft || 0
        item = item.withNBT(nbt)
    }
    entity.setMainHandItem(item)
}

// 从手持物品读取pfPhase（服务端用）
function pfGetPhase(entity) {
    let item = entity.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID) {
        return item.nbt.getInt('pfPhase')
    }
    return 0
}

// 导出到全局
global.pfNbtSync = {
    pfSyncPhase: pfSyncPhase,
    pfSyncBed: pfSyncBed,
    pfSyncCountdown: pfSyncCountdown,
    pfSyncDemandList: pfSyncDemandList,
    pfGetPhase: pfGetPhase
}
