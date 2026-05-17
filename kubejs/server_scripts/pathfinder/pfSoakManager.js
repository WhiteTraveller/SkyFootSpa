// priority: 10
// ============================================================
// 泡脚管理模块
// 泡脚流程、倒计时管理
// ------------------------------------------------------------
// 时间状态规范：
//   - 所有泡脚相关时间状态以"秒"为单位存储（pfSoakTimeLeft = 剩余秒数）
//   - 不依赖 server.getTickCount() 差值，避免跨重启失效
//   - 实体侧维护 pfSoakSubTick (0~19) 作为秒内 tick 计数器，
//     每 tick +1，达到 20 即触发一次"秒事件"：
//       * 若洗脚水可用：剩余秒数 -1
//       * 若洗脚水无可用：重置剩余秒数为 PF_SOAK_DEFAULT_SECONDS
//   - pfSoakSubTick 存在实体 persistentData，不同步给客户端，节省带宽
// ============================================================

// 默认泡脚倒计时（秒），重置时也使用此值
let PF_SOAK_DEFAULT_SECONDS = 10

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

// 判定当前 bucketId 是否对应一个可用的洗脚水
//   - 'minecraft:water_bucket' 视为始终可用（清水兜底）
//   - 其它桶 id 必须能在 global.soakWaterRegister 中查到定义
function pfIsSoakWaterAvailable(bucketId) {
    if (!bucketId) return false
    if (bucketId === 'minecraft:water_bucket') return true
    try {
        if (global.soakWaterRegister && typeof global.soakWaterRegister.getByBucketId === 'function') {
            return !!global.soakWaterRegister.getByBucketId(bucketId)
        }
    } catch (e) {
        console.log("[PF-SOAK] 查询洗脚水注册表异常: " + e)
    }
    return false
}

// 处理泡脚倒计时（在 global.pathfinderTick 中调用）
// 设计：完全按"秒"驱动；与 sleep 流程的 sleepDuration 解耦
function pfProcessSoaking(ent, currTick) {
    let state = pfGetSoakStateFromItem(ent)
    
    if (state.isSoaking !== 1 || state.soakDone === 1) {
        return false
    }
    
    // 秒内 tick 计数器（0~19），达到 20 触发"秒事件"
    let subTick = (ent.persistentData.getInt("pfSoakSubTick") | 0) + 1
    if (subTick < 20) {
        ent.persistentData.putInt("pfSoakSubTick", subTick)
        return false
    }
    // 进入秒事件，归零计数器
    ent.persistentData.putInt("pfSoakSubTick", 0)
    
    // 判定洗脚水是否可用
    let bucketId = pfGetSoakWaterType(ent)
    if (!pfIsSoakWaterAvailable(bucketId)) {
        // 无可用洗脚水 → 重置剩余倒计时秒数
        let prev = state.soakTimeLeft
        state.soakTimeLeft = PF_SOAK_DEFAULT_SECONDS
        pfSetSoakStateToItem(ent, state)
        console.log("[PF-SOAK] 无可用洗脚水(bucketId='" + bucketId + "')，剩余秒数重置 " + prev + "→" + PF_SOAK_DEFAULT_SECONDS + " uuid=" + ent.getUuid())
        return false
    }
    
    // 洗脚水可用 → 剩余秒数 -1
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
    console.log("[PF-SOAK] 开始泡脚，设置倒计时" + PF_SOAK_DEFAULT_SECONDS + "秒，水桶=" + (bucketId || "minecraft:water_bucket"))
    state.isSoaking = 1
    state.soakTimeLeft = PF_SOAK_DEFAULT_SECONDS
    state.soakDone = 0
    state.waterType = bucketId || 'minecraft:water_bucket'
    pfSetSoakStateToItem(ent, state)
    
    // 重置秒内 tick 计数器，确保第一秒完整计时
    ent.persistentData.putInt("pfSoakSubTick", 0)
    
    // 消耗水桶，变成空桶
    player.setMainHandItem(Item.of('minecraft:bucket', 1))
    console.log("[PF-SOAK] 水桶已消耗，变为空桶")
    
    let waterName = '清水'
    if (bucketId && bucketId !== 'minecraft:water_bucket' && global.soakWaterRegister) {
        let def = global.soakWaterRegister.getByBucketId(bucketId)
        if (def) waterName = def.nameZH
    }
    player.setStatusMessage('§a开始泡脚（' + waterName + '）！倒计时' + PF_SOAK_DEFAULT_SECONDS + '秒...')
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
