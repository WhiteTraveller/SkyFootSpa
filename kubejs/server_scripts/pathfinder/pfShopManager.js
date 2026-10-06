// priority: 10
// ============================================================
// 开店管理模块
// 状态全部持久化在触发的 pathfinder_block 方块实体 persistentData 中：
//   pfShopIsOpen        (int 0/1)
//   pfShopTickCounter   (int) 累计 tick 计数器，达到 PF_SPAWN_INTERVAL 即触发判定
//   pfShopPlayerUuid    (string) 开店玩家 UUID
//   pfShopRouteStr      (string) 路径字符串
//   pfShopBaseX/Y/Z     (int)    寻路方块坐标（与方块自身一致，便于自检）
//   pfShopQueueX/Z      (double) 开店时确定的固定排队区位置
//   pfShopQueueSet      (int 0/1) 排队区是否已写入
//   pfShopSpawnedUuids  (string) 已生成顾客 UUID，逗号分隔
//   pfShopBedList       (string) 合法床位表，含坐标、占用状态和 ownerUuid
//   pfShopBedCount      (int)    当前合法床总数
// 不再使用 global.pfShopState 作为状态源（仅保留空对象做兼容防御）
// 不再使用 server.getTickCount() 差值（跨重启会失效）
// ============================================================

// MC时间常量
let PF_DAY_END = 12000    // 白天结束（日落开始）
let PF_SPAWN_INTERVAL = 100  // 每100 tick（5秒）判定一次
// 旧地狱维度：dimension_type fixed_time=18000 恒为夜晚，故开店无视昼夜、不自动关店
let PF_OLD_HELL_DIM = 'marguerite:old_hell'
// “等待中”顾客（行走中 phase2 + 排队等待 phase5，口径同 pfCloseShop）超过此数则暂停生成
let PF_MAX_WAITING_CUSTOMERS = 5

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

function pfShopGetQueuePos(be) {
    if ((be.persistentData.getInt("pfShopQueueSet") | 0) !== 1) return null
    return {
        x: be.persistentData.getDouble("pfShopQueueX"),
        z: be.persistentData.getDouble("pfShopQueueZ")
    }
}

function pfShopSetQueuePos(be, pos) {
    if (pos) {
        be.persistentData.putDouble("pfShopQueueX", pos.x)
        be.persistentData.putDouble("pfShopQueueZ", pos.z)
        be.persistentData.putInt("pfShopQueueSet", 1)
    } else {
        be.persistentData.putInt("pfShopQueueSet", 0)
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

function pfShopGetBedList(be) {
    return "" + be.persistentData.getString("pfShopBedList")
}

function pfShopGetBedCount(be) {
    return be ? (be.persistentData.getInt("pfShopBedCount") | 0) : 0
}

function pfShopSetBedList(be, bedListStr) {
    be.persistentData.putString("pfShopBedList", bedListStr || "")
    let beds = global.pfBedManager ? global.pfBedManager.pfParseBeds(bedListStr || "") : []
    be.persistentData.putInt("pfShopBedCount", beds.length)
}

function pfShopRefreshBeds(level, baseX, baseY, baseZ, routeStr) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be || !global.pfBedManager) return []
    let scanned = global.pfBedManager.pfScanBedsAlongRoute(level, routeStr, baseX + 0.5, baseY, baseZ + 0.5)
    let old = global.pfBedManager.pfParseBeds(pfShopGetBedList(be))
    let merged = global.pfBedManager.pfMergeBeds(level, scanned, old)
    pfShopSetBedList(be, global.pfBedManager.pfSerializeBeds(merged))
    console.log("[PF-BED] 刷新合法床位：" + merged.length + " 张")
    return merged
}

function pfShopReserveBed(level, baseX, baseY, baseZ, bedKey, ownerUuid) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be || !global.pfBedManager) return null
    let beds = global.pfBedManager.pfParseBeds(pfShopGetBedList(be))
    for (let i = 0; i < beds.length; i++) {
        if (global.pfBedManager.pfBedKey(beds[i]) !== bedKey) continue
        if (beds[i].used) return null
        // 床位表可能在关店时被清空，而正在服务中的实体仍然存在。
        // 锁床前再次检查世界实体，防止新顾客与旧顾客重叠上床。
        if (global.pfBedManager.pfIsBedOccupied(level, beds[i], null)) return null
        beds[i].used = true
        beds[i].ownerUuid = "" + ownerUuid
        pfShopSetBedList(be, global.pfBedManager.pfSerializeBeds(beds))
        return beds[i]
    }
    return null
}

function pfShopReleaseBed(level, baseX, baseY, baseZ, bedKey, ownerUuid) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be || !global.pfBedManager) return false
    let beds = global.pfBedManager.pfParseBeds(pfShopGetBedList(be))
    for (let i = 0; i < beds.length; i++) {
        if (global.pfBedManager.pfBedKey(beds[i]) !== bedKey) continue
        if (beds[i].ownerUuid !== ("" + ownerUuid)) return false
        beds[i].used = false
        beds[i].ownerUuid = ""
        pfShopSetBedList(be, global.pfBedManager.pfSerializeBeds(beds))
        return true
    }
    return false
}

// 从店铺持久化床位表中移除已经被破坏的床。
// bedKey 使用床头坐标；即使床位当前没有占用者，也应删除失效条目。
function pfShopRemoveBedAt(level, baseX, baseY, baseZ, bedKey) {
    let be = pfShopGetBE(level, baseX, baseY, baseZ)
    if (!be || !global.pfBedManager) return false
    let beds = global.pfBedManager.pfParseBeds(pfShopGetBedList(be))
    let kept = []
    let removed = false
    for (let i = 0; i < beds.length; i++) {
        if (global.pfBedManager.pfBedKey(beds[i]) === bedKey) {
            removed = true
        } else {
            kept.push(beds[i])
        }
    }
    if (removed) {
        pfShopSetBedList(be, global.pfBedManager.pfSerializeBeds(kept))
        console.log("[PF-BED] 移除已破坏床位: " + bedKey)
    }
    return removed
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

// 取维度干净 ID（兼容 ResourceKey[minecraft:dimension / ns:path] 格式）
function pfDimId(level) {
    let d = '' + level.getDimension()
    let s = d.indexOf(' / ')
    if (s >= 0) {
        d = d.substring(s + 3)
        if (d.charAt(d.length - 1) === ']') d = d.substring(0, d.length - 1)
    }
    return d
}

// 是否旧地狱维度（fixed_time 恒夜，开店无视昼夜、不自动关店）
function pfIsOldHell(level) {
    return pfDimId(level) === PF_OLD_HELL_DIM
}

// 统计店铺当前“等待中”的顾客数：还未服务过(!pfHasSlept)的 行走中(phase2) 或 排队中(phase5)
// 已服务过的顾客完成后会回到 phase2 离开，用 pfHasSlept 排除避免误计；服务中(3)/等床(4)本就不计
function pfCountWaitingCustomers(level, be) {
    let uuids = pfShopGetSpawnedUuids(be)
    let count = 0
    for (let i = 0; i < uuids.length; i++) {
        let ent = null
        try { ent = level.getEntity(uuids[i]) } catch (e) { ent = null }
        if (!ent || !ent.isAlive()) continue
        // 排除已服务过的顾客（pfHasSlept=1：完成后回到 phase2 离开中，不算“还未服务过的等待”）
        if (global.pfEntityData.pfHasSlept(ent)) continue
        let phase = global.pfEntityData.pfGetPhase(ent)
        if (phase === 2 || phase === 5) count++
    }
    return count
}

/**
 * 开店：将状态写入触发方块 BE 的 persistentData
 */
function pfOpenShop(player, level, baseX, baseY, baseZ, routeStr, queuePos) {
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
    pfShopSetQueuePos(be, queuePos)
    pfShopSetSpawnedUuids(be, [])
    let shopBeds = pfShopRefreshBeds(level, baseX, baseY, baseZ, routeStr)
    if (global.pfBedManager && global.pfBedManager.pfHighlightBeds) {
        global.pfBedManager.pfHighlightBeds(level, shopBeds)
    }

    player.tell("§a☀ 开店成功！每5秒将判定是否有顾客光临")
    player.tell("§b有效床位数量：§e" + shopBeds.length + "§b 张")
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
    pfShopSetBedList(be, "")
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

    // 判定1: 是否为晚上（旧地狱维度 fixed_time 恒夜，无视昼夜、不自动关店）
    if (!pfIsOldHell(level) && !pfIsDaytime(level)) {
        pfCloseShop(level, be, "天黑了，自动关店！")
        return
    }

    // 取开店玩家
    let playerUuid = pfShopGetPlayerUuid(be)
    let player = null
    if (playerUuid) {
        try { player = level.getPlayerByUUID(playerUuid) } catch (e) { player = null }
    }

    // 判定2: 等待中顾客（行走 phase2 + 排队 phase5）超过上限则本轮暂停生成（不关店，下轮再判）
    let waiting = pfCountWaitingCustomers(level, be)
    if (waiting > PF_MAX_WAITING_CUSTOMERS) {
        console.log("[PF-SHOP] 等待中顾客 " + waiting + " 位 > " + PF_MAX_WAITING_CUSTOMERS + "，本轮暂停生成新顾客")
        return
    }

    // 判定3: 稀客判定（默认 10% 概率，可配置）：命中则生成当前维度稀客池中的一位，否则走普通顾客抽取
    let rareDef = global.pfCustomerTypes.pfTryRollRare(level)
    let base = pfShopGetBase(be)
    let routeStr = pfShopGetRouteStr(be)
    let queuePos = pfShopGetQueuePos(be)

    if (rareDef) {
        console.log("[PF-SHOP] ★稀客光临: " + rareDef.name + "(" + rareDef.id + "), 模型: " + rareDef.model + ", 维度: " + level.getDimension())
        try {
            let walker = global.pfEntitySpawner.pfSpawnWalker(
                level, base.x, base.y, base.z,
                routeStr, queuePos, player, rareDef.model, null, true, '', rareDef
            )
            // 稀客不参与种族评价系统（与 Boss 一致，置空类别）
            walker.persistentData.putString('pfCustomerCategory', '')
            // 读取本方块已存储的该稀客好感度，作为本次服务的快照（结算掉落档位按“更新前好感度”判定）
            let affection = global.pfRareAffection.pfGetBeAffection(be, rareDef.id)
            walker.persistentData.putInt('pfRareAffSnapshot', affection)
            // 头顶名牌：上一行爱心（好感度），下一行 ★稀客 + 名字 + 等级（等级已在 pfSpawnWalker 中 roll 好并存入手持物品）
            global.pfRareAffection.pfApplyRareNameTag(walker, rareDef, affection)
            pfShopAddSpawnedUuid(be, "" + walker.getUuid())
            // 向开店玩家提示稀客光临（含当前好感度与爱心）
            if (player) {
                let hearts = global.pfCustomerTypes.pfRareHeartsText(affection)
                player.tell('§d★ 稀客 §e' + rareDef.name + ' §d光临了本店！' + hearts + ' §7好感度 ' + affection)
                player.tell('§7需求是普通顾客的 §e1.5 §7倍，好好招待可提升好感度！')
            }
        } catch (e) {
            console.log("[PF-SHOP] 生成稀客失败: " + e)
        }
        return
    }

    // 普通顾客抽取（按店铺所在维度过滤可生成类别）
    let result = global.pfCustomerTypes.pfRollCustomer(player, level)
    if (result === null) return

    console.log("[PF-SHOP] 抽中顾客类别: " + result.name + "(" + result.category + "), 模型: " + result.model + ", 维度: " + level.getDimension())

    try {
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, base.x, base.y, base.z,
            routeStr, queuePos, player, result.model, null, true, result.category
        )
        walker.persistentData.putString('pfCustomerCategory', result.category)
        // 头顶名牌：种族 + 等级（等级已在 pfSpawnWalker 中 roll 好并存入手持物品）
        global.pfCustomerLevel.pfRefreshNameTag(walker, result.name)
        pfShopAddSpawnedUuid(be, "" + walker.getUuid())
        // 自动开店不再发送“××类顾客来了！”，只保留 pfSpawnWalker 内部的顾客话语广播
    } catch (e) {
        console.log("[PF-SHOP] 生成顾客失败: " + e)
    }
}

// 导出到全局
global.pfShopManager = {
    pfIsDaytime: pfIsDaytime,
    pfIsOldHell: pfIsOldHell,
    pfOpenShop: pfOpenShop,
    pfCloseShop: pfCloseShop,
    pfShopTick: pfShopTick,
    // 持久化访问 API（提供给 voucher/boss 等模块使用）
    pfShopIsOpenAt: pfShopIsOpenAt,
    pfShopAddSpawnedAt: pfShopAddSpawnedAt,
    pfShopGetIsOpen: pfShopGetIsOpen,
    pfShopAddSpawnedUuid: pfShopAddSpawnedUuid,
    pfShopGetBE: pfShopGetBE,
    pfShopGetBedList: pfShopGetBedList,
    pfShopGetQueuePos: pfShopGetQueuePos,
    pfShopGetBedCount: pfShopGetBedCount,
    pfShopSetBedList: pfShopSetBedList,
    pfShopRefreshBeds: pfShopRefreshBeds,
    pfShopReserveBed: pfShopReserveBed,
    pfShopReleaseBed: pfShopReleaseBed,
    pfShopRemoveBedAt: pfShopRemoveBedAt
}

console.log("[PF-SHOP] 开店管理模块已加载")
