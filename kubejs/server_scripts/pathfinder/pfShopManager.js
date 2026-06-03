// priority: 10
// ============================================================
// 开店管理模块
// 状态全部持久化在触发的 pathfinder_block 方块实体 persistentData 中：
//   pfShopIsOpen        (int 0/1)
//   pfShopTickCounter   (int) 累计 tick 计数器，达到 PF_SPAWN_INTERVAL 即触发判定
//   pfShopPlayerUuid    (string) 开店玩家 UUID
//   pfShopRouteStr      (string) 路径字符串
//   pfShopBaseX/Y/Z     (int)    寻路方块坐标（与方块自身一致，便于自检）
//   pfShopBlueX/Z       (double) 蓝色地毯位置
//   pfShopBlueSet       (int 0/1) 蓝色地毯是否已写入
//   pfShopSpawnedUuids  (string) 已生成顾客 UUID，逗号分隔
// 不再使用 global.pfShopState 作为状态源（仅保留空对象做兼容防御）
// 不再使用 server.getTickCount() 差值（跨重启会失效）
// ============================================================

// MC时间常量
let PF_DAY_END = 12000    // 白天结束（日落开始）
let PF_SPAWN_INTERVAL = 100  // 每100 tick（5秒）判定一次

// 兼容防御：旧代码若仍读 global.pfShopState.isOpen，给个安全空对象
global.pfShopState = { isOpen: false, spawnedEntities: [] }

// BlockPos 用于 level.getBlockEntity（KubeJS LevelJS 仅接受 BlockPos）
let PF_SHOP_BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

// ========== BlockEntity NBT 读写工具 ==========

function pfShopGetBE(level, baseX, baseY, baseZ) {
    try {
        return level.getBlockEntity(new PF_SHOP_BlockPos(baseX | 0, baseY | 0, baseZ | 0))
    } catch (e) {
        return null
    }
}

function pfShopGetIsOpen(be) {
    if (!be) return false
    return (be.persistentData.getInt("pfShopIsOpen") | 0) === 1
}

function pfShopSetIsOpen(be, isOpen) {
    if (!be) return
    be.persistentData.putInt("pfShopIsOpen", isOpen ? 1 : 0)
}

function pfShopGetTickCounter(be) {
    return (be.persistentData.getInt("pfShopTickCounter") | 0)
}

function pfShopSetTickCounter(be, n) {
    be.persistentData.putInt("pfShopTickCounter", n | 0)
}

function pfShopGetPlayerUuid(be) {
    return "" + be.persistentData.getString("pfShopPlayerUuid")
}

function pfShopSetPlayerUuid(be, uuid) {
    be.persistentData.putString("pfShopPlayerUuid", "" + (uuid || ""))
}

function pfShopGetRouteStr(be) {
    return "" + be.persistentData.getString("pfShopRouteStr")
}

function pfShopSetRouteStr(be, s) {
    be.persistentData.putString("pfShopRouteStr", "" + (s || ""))
}

function pfShopGetBase(be) {
    return {
        x: (be.persistentData.getInt("pfShopBaseX") | 0),
        y: (be.persistentData.getInt("pfShopBaseY") | 0),
        z: (be.persistentData.getInt("pfShopBaseZ") | 0)
    }
}

function pfShopSetBase(be, x, y, z) {
    be.persistentData.putInt("pfShopBaseX", x | 0)
    be.persistentData.putInt("pfShopBaseY", y | 0)
    be.persistentData.putInt("pfShopBaseZ", z | 0)
}

function pfShopGetBluePos(be) {
    if ((be.persistentData.getInt("pfShopBlueSet") | 0) !== 1) return null
    return {
        x: be.persistentData.getDouble("pfShopBlueX"),
        z: be.persistentData.getDouble("pfShopBlueZ")
    }
}

function pfShopSetBluePos(be, pos) {
    if (pos) {
        be.persistentData.putDouble("pfShopBlueX", pos.x)
        be.persistentData.putDouble("pfShopBlueZ", pos.z)
        be.persistentData.putInt("pfShopBlueSet", 1)
    } else {
        be.persistentData.putInt("pfShopBlueSet", 0)
    }
}

function pfShopGetSpawnedUuids(be) {
    let s = "" + be.persistentData.getString("pfShopSpawnedUuids")
    if (!s) return []
    let arr = s.split(",")
    let out = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i].length > 0) out.push(arr[i])
    }
    return out
}

function pfShopSetSpawnedUuids(be, arr) {
    be.persistentData.putString("pfShopSpawnedUuids", (arr || []).join(","))
}

function pfShopAddSpawnedUuid(be, uuid) {
    let arr = pfShopGetSpawnedUuids(be)
    arr.push("" + uuid)
    pfShopSetSpawnedUuids(be, arr)
}

// 通过寻路方块坐标取 BE 并判断是否开店（提供给 voucher/boss 等模块）
function pfShopIsOpenAt(level, baseX, baseY, baseZ) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be) return false
    return pfShopGetIsOpen(be)
}

// 通过寻路方块坐标取 BE 并追加生成的顾客 uuid（提供给 voucher/boss 等模块）
function pfShopAddSpawnedAt(level, baseX, baseY, baseZ, uuid) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be) return false
    if (!pfShopGetIsOpen(be)) return false
    pfShopAddSpawnedUuid(be, uuid)
    return true
}

/**
 * 检查当前是否为白天
 */
function pfIsDaytime(level) {
    let dayTime = level.getDayTime() % 24000
    return dayTime >= 0 && dayTime < PF_DAY_END
}

/**
 * 开店：将状态写入触发方块 BE 的 persistentData
 */
function pfOpenShop(player, level, baseX, baseY, baseZ, routeStr, blueCarpetPos) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be) {
        console.log("[PF-SHOP] 开店失败：找不到寻路方块实体 at (" + baseX + "," + baseY + "," + baseZ + ")")
        if (player) player.tell("§c开店失败：寻路方块异常")
        return
    }
    pfShopSetIsOpen(be, true)
    pfShopSetTickCounter(be, 0)
    pfShopSetPlayerUuid(be, "" + player.getUuid())
    pfShopSetRouteStr(be, routeStr)
    pfShopSetBase(be, baseX, baseY, baseZ)
    pfShopSetBluePos(be, blueCarpetPos)
    pfShopSetSpawnedUuids(be, [])

    player.tell("§a☀ 开店成功！每5秒将判定是否有顾客光临")
    player.tell("§7日落后将自动关店，也可再次右键手动关店")
    console.log("[PF-SHOP] 开店 player=" + player.getName().getString() +
        " base=(" + baseX + "," + baseY + "," + baseZ + ")")
}

/**
 * 关店：清除还在行走/等待的顾客；可由 BE 或 baseX/Y/Z 触发
 * 调用形式：
 *   pfCloseShop(level, beOrUndefined, reason)
 *   pfCloseShop(level, {x,y,z}, reason)
 *   pfCloseShop(level, reason)        // 旧签名兼容（无 BE 上下文则跳过）
 */
function pfCloseShop(level, beOrPosOrReason, reasonMaybe) {
    let be = null
    let reason = ""
    if (typeof beOrPosOrReason === "string") {
        // 旧签名 pfCloseShop(level, reason) - 无方块上下文，无法找到具体 BE，跳过实体清理
        reason = beOrPosOrReason
        console.log("[PF-SHOP] 关店调用缺少方块上下文，跳过统一清理。reason=" + reason)
        return
    } else if (beOrPosOrReason && typeof beOrPosOrReason.persistentData !== "undefined") {
        be = beOrPosOrReason
        reason = reasonMaybe || ""
    } else if (beOrPosOrReason && typeof beOrPosOrReason.x !== "undefined") {
        be = pfShopGetBE(level, beOrPosOrReason.x, beOrPosOrReason.y, beOrPosOrReason.z)
        reason = reasonMaybe || ""
    }
    if (!be) {
        console.log("[PF-SHOP] 关店失败：未取到方块实体")
        return
    }

    let arr = pfShopGetSpawnedUuids(be)
    let removedCount = 0
    for (let i = 0; i < arr.length; i++) {
        let uuid = arr[i]
        try {
            let entity = level.getEntity(uuid)
            if (entity && entity.isAlive()) {
                let phase = global.pfEntityData.pfGetPhase(entity)
                // 只清除行走中(2)和等待中(5)的顾客，正在服务中(3)的保留
                if (phase === 2 || phase === 5) {
                    level.spawnParticles("minecraft:poof", false, entity.getX(), entity.getY() + 1, entity.getZ(), 0.5, 1, 0.5, 30, 0)
                    entity.kill()
                    removedCount++
                }
            }
        } catch (e) {
            console.log("[PF-SHOP] 清除实体失败: " + e)
        }
    }

    pfShopSetIsOpen(be, false)
    pfShopSetSpawnedUuids(be, [])
    pfShopSetTickCounter(be, 0)

    let playerUuid = pfShopGetPlayerUuid(be)
    if (playerUuid) {
        try {
            let p = level.getPlayerByUUID(playerUuid)
            if (p) p.tell("到晚上了，该关店了。" + reason + " §7清除了 " + removedCount + " 位等待中的顾客")
        } catch (e) {}
    }
    console.log("[PF-SHOP] 关店: " + reason + ", 清除" + removedCount + "个实体")
}

/**
 * 开店tick处理 - 由 pfMain 每 tick 调用，传入触发方块的 BE
 * 计数器满 PF_SPAWN_INTERVAL 即判定一次
 */
function pfShopTick(level, entity) {
    if (!entity) return
    let be = entity
    if (!pfShopGetIsOpen(be)) return

    // 累计计数（持久化），不依赖 server.getTickCount() 差值
    let counter = pfShopGetTickCounter(be) + 1
    if (counter < PF_SPAWN_INTERVAL) {
        pfShopSetTickCounter(be, counter)
        return
    }
    pfShopSetTickCounter(be, 0)

    // 判定1: 是否为晚上
    if (!pfIsDaytime(level)) {
        pfCloseShop(level, be, "天黑了，自动关店！")
        return
    }

    // 取开店玩家
    let playerUuid = pfShopGetPlayerUuid(be)
    let player = null
    if (playerUuid) {
        try { player = level.getPlayerByUUID(playerUuid) } catch (e) { player = null }
    }

    // 判定2: 尝试生成顾客
    let result = global.pfCustomerTypes.pfRollCustomer(player)
    if (result === null) return

    console.log("[PF-SHOP] 抽中顾客类别: " + result.name + "(" + result.category + "), 模型: " + result.model)

    let base = pfShopGetBase(be)
    let routeStr = pfShopGetRouteStr(be)
    let blueCarpetPos = pfShopGetBluePos(be)

    try {
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, base.x, base.y, base.z,
            routeStr, blueCarpetPos, player, result.model, null, true
        )
        walker.persistentData.putString('pfCustomerCategory', result.category)
        pfShopAddSpawnedUuid(be, "" + walker.getUuid())
        // 自动开店不再发送“××类顾客来了！”，只保留 pfSpawnWalker 内部的顾客话语广播
    } catch (e) {
        console.log("[PF-SHOP] 生成顾客失败: " + e)
    }
}

// 导出到全局
global.pfShopManager = {
    pfIsDaytime: pfIsDaytime,
    pfOpenShop: pfOpenShop,
    pfCloseShop: pfCloseShop,
    pfShopTick: pfShopTick,
    // 持久化访问 API（提供给 voucher/boss 等模块使用）
    pfShopIsOpenAt: pfShopIsOpenAt,
    pfShopAddSpawnedAt: pfShopAddSpawnedAt,
    pfShopGetIsOpen: pfShopGetIsOpen,
    pfShopAddSpawnedUuid: pfShopAddSpawnedUuid
}

console.log("[PF-SHOP] 开店管理模块已加载")
