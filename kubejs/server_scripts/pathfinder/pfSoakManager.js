// priority: 10
// ============================================================
// 泡脚管理模块
// 泡脚流程、倒计时管理
// ============================================================

// 从手持物品NBT读取泡脚状态
function pfGetSoakStateFromItem(ent) {
    let item = ent.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        return {
            isSoaking: item.nbt.getInt('pfIsSoaking') || 0,
            soakDone: item.nbt.getInt('pfSoakDone') || 0,
            soakTimeLeft: item.nbt.getInt('pfSoakTimeLeft') || 0
        }
    }
    return { isSoaking: 0, soakDone: 0, soakTimeLeft: 0 }
}

// 设置泡脚状态到手持物品NBT
function pfSetSoakStateToItem(ent, state) {
    let item = ent.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        let nbt = item.nbt
        nbt.pfIsSoaking = state.isSoaking
        nbt.pfSoakDone = state.soakDone
        nbt.pfSoakTimeLeft = state.soakTimeLeft
        if (state.waterType !== undefined && state.waterType !== null) {
            nbt.pfSoakWaterType = state.waterType
        }
        ent.setMainHandItem(item.withNBT(nbt))
    }
}

// 从手持物品 NBT 读取泡脚使用的水桶 id
function pfGetSoakWaterType(ent) {
    let item = ent.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        return "" + (item.nbt.getString('pfSoakWaterType') || "")
    }
    return ""
}

// 是否正在泡脚
function pfIsSoaking(ent) {
    let state = pfGetSoakStateFromItem(ent)
    return state.isSoaking === 1
}

// 是否已完成泡脚
function pfIsSoakDone(ent) {
    let state = pfGetSoakStateFromItem(ent)
    return state.soakDone === 1
}

// 获取泡脚剩余时间
function pfGetSoakTimeLeft(ent) {
    let state = pfGetSoakStateFromItem(ent)
    return state.soakTimeLeft
}

// 处理泡脚倒计时（在global.pathfinderTick中调用）
function pfProcessSoaking(ent, currTick) {
    let state = pfGetSoakStateFromItem(ent)
    
    if (state.isSoaking !== 1 || state.soakDone === 1) {
        return false
    }
    
    let sleepStart = global.pfEntityData.pfGetSleepStartTick(ent)
    let sleepDuration = currTick - sleepStart
    
    // 每秒减少一次（每20 ticks）
    if (sleepDuration > 0 && sleepDuration % 20 === 0) {
        if (state.soakTimeLeft > 0) {
            state.soakTimeLeft--
            console.log("[PF-SOAK] 倒计时减少: " + state.soakTimeLeft + "秒 uuid=" + ent.getUuid())
        }
        
        // 倒计时结束
        if (state.soakTimeLeft <= 0) {
            state.isSoaking = 0
            state.soakDone = 1
            state.soakTimeLeft = 0
            console.log("[PF-SOAK] 倒计时结束，泡脚完成！uuid=" + ent.getUuid())
            pfSetSoakStateToItem(ent, state)
            // 应用洗脚水附加效果（根据 pfSoakWaterType）
            try {
                let bucketId = pfGetSoakWaterType(ent)
                if (bucketId && global.pfSoakWaterEffects) {
                    global.pfSoakWaterEffects.pfApplySoakEffects(ent, bucketId)
                }
            } catch (e) {
                console.log("[PF-SOAK] 应用洗脚水效果异常: " + e)
            }
            return true
        }
        
        pfSetSoakStateToItem(ent, state)
        return true
    }
    
    return false
}

// 开始泡脚（由网络事件调用）
// bucketId: 玩家使用的桶 id（原版 minecraft:water_bucket 或已注册的洗脚水桶）
function pfStartSoak(ent, player, bucketId) {
    let state = pfGetSoakStateFromItem(ent)
    
    if (state.isSoaking === 1) {
        console.log("[PF-SOAK] 实体正在泡脚中，忽略请求")
        player.setStatusMessage("§e该顾客正在泡脚中...")
        return false
    }
    
    if (state.soakDone === 1) {
        console.log("[PF-SOAK] 实体已完成泡脚，忽略请求")
        player.setStatusMessage("§e该顾客已完成泡脚！")
        return false
    }
    
    // 开始泡脚
    console.log("[PF-SOAK] 开始泡脚，设置倒计时10秒，水桶=" + (bucketId || "minecraft:water_bucket"))
    state.isSoaking = 1
    state.soakTimeLeft = 10
    state.soakDone = 0
    state.waterType = bucketId || 'minecraft:water_bucket'
    pfSetSoakStateToItem(ent, state)
    
    // 消耗水桶，变成空桶
    player.setMainHandItem(Item.of('minecraft:bucket', 1))
    console.log("[PF-SOAK] 水桶已消耗，变为空桶")
    
    let waterName = '清水'
    if (bucketId && bucketId !== 'minecraft:water_bucket' && global.soakWaterRegister) {
        let def = global.soakWaterRegister.getByBucketId(bucketId)
        if (def) waterName = def.nameZH
    }
    player.setStatusMessage('§a开始泡脚（' + waterName + '）！倒计时10秒...')
    return true
}

// 导出到全局
global.pfSoakManager = {
    pfIsSoaking: pfIsSoaking,
    pfIsSoakDone: pfIsSoakDone,
    pfGetSoakTimeLeft: pfGetSoakTimeLeft,
    pfGetSoakWaterType: pfGetSoakWaterType,
    pfProcessSoaking: pfProcessSoaking,
    pfStartSoak: pfStartSoak
}
