// priority: 20
// ============================================================
// 女仆搓脚工作模式
// ------------------------------------------------------------
// 1. 在 TLM 女仆面板新增“搓脚服务”工作模式（kubejs:foot_service）
// 2. 由 TLM 原生 walkToBlockTask 寻找床位旁的车万女仆坐垫并走过去
// 3. 到位后坐到该床位的坐垫上，只服务这张坐垫相邻床位的顾客：
//    一个坐垫挨着多张床时随机选一名，服务到该顾客需求全部完成才换人
//    泡脚阶段由机械动力自动化完成，不属于搓脚；未完成泡脚的顾客不列入目标，
//    女仆保持空闲去搜索其他已进入搓脚环节的顾客
// 4. 顾客服务完后等待 1 秒：有新顾客继续服务，没有则起身换到下一个床位的坐垫
// 5. 工作期间顺带拾取周围掉落物
// 6. 女仆收益单独记账，顾客起床时在女仆脚下独立结算
// ============================================================

let $PFMResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
let $PFMAABB = Java.loadClass('net.minecraft.world.phys.AABB')

const PFM_TASK_ID = new $PFMResourceLocation('kubejs:foot_service')
const PFM_TASK_ID_STR = '' + PFM_TASK_ID
const PFM_TASK_ICON_ID = 'touhou_little_maid:chair'
const PFM_TASK_ICON_NBT = '{ModelId:"touhou_little_maid:cushion",MountedHeight:0.0f,TameableCanRide:1b,IsNoGravity:0b}'
const PFM_CHAIR_TYPE = 'touhou_little_maid:chair'
const PFM_SERVE_INTERVAL = 100    // 5 秒
const PFM_IDLE_WAIT = 20          // 顾客离开后等待 1 秒
// 坐垫必须与床位方块紧邻（含斜对角）才认这个床位，隔了方块一律不算，避免虚空搓脚
const PFM_ADJACENT_DY = 1         // 坐垫到床位的垂直容差
const PFM_SEARCH_RANGE = 20       // 女仆搜索顾客/坐垫的半径
const PFM_CHAIR_SCAN = 3          // 床位周围扫描坐垫的水平半径
const PFM_CHAIR_SCAN_Y = 2        // 床位周围扫描坐垫的垂直半径
const PFM_CACHE_TICKS = 20        // 目标坐垫缓存刷新间隔
const PFM_PICKUP_INTERVAL = 10    // 拾取掉落物间隔
const PFM_PICKUP_RANGE = 4        // 拾取掉落物半径
const PFM_SYNC_ITEM_ID = 'minecraft:paper'

const PFM_DEMAND_KEYS = [
    'pfDemandJiaozhang',
    'pfDemandJiaogen',
    'pfDemandJiaozhi',
    'pfDemandJiaoxin'
]

const PFM_PART_BY_DEMAND = {
    pfDemandJiaozhang: 'jiaozhang',
    pfDemandJiaogen: 'jiaogen',
    pfDemandJiaozhi: 'jiaozhi',
    pfDemandJiaoxin: 'jiaoxin'
}

// 诊断日志节流（毫秒）、坐垫目标缓存、坐垫自动上人开关的待恢复记录
let pfmLastDiagAt = 0
let pfmSeatCache = {}
let pfmChairRestore = {}

function pfmPosKey(x, y, z) {
    return x + ',' + y + ',' + z
}

// 与 pfNetworkHandler.js 保持一致的属性读取方式：
// 先取服务者自身数值，再叠加顾客相对自身基础值的 modifier。
function pfmGetAttributeValue(entity, id, fallback) {
    try {
        let inst = entity.getAttribute(id)
        if (inst != null) {
            let v = inst.getValue()
            if (v != null) return v
        }
    } catch (e) { }
    return fallback
}

function pfmGetServiceAttributeValue(worker, target, id, fallback) {
    let workerValue = pfmGetAttributeValue(worker, id, fallback)
    if (!target || target === worker) return workerValue
    try {
        let targetAttr = target.getAttribute(id)
        if (targetAttr != null) {
            return workerValue + (targetAttr.getValue() - Number(targetAttr.getBaseValue()))
        }
    } catch (e) {}
    return workerValue
}

function pfmApplyBossSatMul(entity, gain) {
    if (!entity || gain <= 0) return gain
    try {
        let bossId = '' + entity.persistentData.getString('pfBossId')
        if (!bossId || bossId.length === 0) return gain
        if (!global.bossRegister || !global.bossRegister.byId) return gain
        let boss = global.bossRegister.byId[bossId]
        if (!boss) return gain
        let scaled = Math.floor(gain * boss.satisfactionMultiplier)
        return scaled < 0 ? 0 : scaled
    } catch (e) {
        return gain
    }
}

function pfmGetTaskId(maid) {
    try {
        let task = maid.getTask()
        if (task == null) return ''
        return '' + task.getUid()
    } catch (e) {
        return ''
    }
}

function pfmHasRemainingDemand(nbt) {
    for (let i = 0; i < PFM_DEMAND_KEYS.length; i++) {
        if ((nbt.getInt(PFM_DEMAND_KEYS[i]) | 0) > 0) return true
    }
    return false
}

// 泡脚是否已完成（pfSoakDone=1）。泡脚阶段由机械动力自动化完成，不属于搓脚。
function pfmIsSoakDone(ent) {
    try {
        if (global.pfSoakManager && typeof global.pfSoakManager.pfIsSoakDone === 'function') {
            return !!global.pfSoakManager.pfIsSoakDone(ent)
        }
    } catch (e) { }
    try {
        let item = ent.getMainHandItem()
        if (!item || item.id !== PFM_SYNC_ITEM_ID || !item.nbt) return false
        return (item.nbt.getInt('pfSoakDone') | 0) === 1
    } catch (e) {
        return false
    }
}

// 车万女仆坐垫是实体（entity.touhou_little_maid.chair / touhou_little_maid:chair）
function pfmIsChairEntity(ent) {
    try {
        let t = '' + ent.type
        return t.indexOf(PFM_CHAIR_TYPE) >= 0 || t.indexOf('touhou_little_maid.chair') >= 0
    } catch (e) {
        return false
    }
}

function pfmIsItemEntity(ent) {
    try {
        return ('' + ent.type) === 'minecraft:item'
    } catch (e) {
        return false
    }
}

// 取顾客床位方块（床头 + 床尾）。店铺床位固定朝北，床尾在床头 z+1。
function pfmCustomerBedInfo(ent) {
    try {
        let bed = global.pfEntityData.pfGetBedInfo(ent)
        let hx = bed.blockX | 0
        let hy = bed.blockY | 0
        let hz = bed.blockZ | 0
        if (hx !== 0 || hz !== 0) {
            return { hx: hx, hy: hy, hz: hz, fx: hx, fy: hy, fz: hz + 1 }
        }
    } catch (e) { }
    let cp = ent.blockPosition()
    let x = cp.getX()
    let y = cp.getY()
    let z = cp.getZ()
    return { hx: x, hy: y, hz: z, fx: x, fy: y, fz: z }
}

// 坐垫方块与床位某个方块是否紧邻（水平 Chebyshev ≤1，含斜对角；允许 1 格高度差）
function pfmIsAdjacentBlock(x, y, z, bx, by, bz) {
    if (Math.abs(y - by) > PFM_ADJACENT_DY) return false
    return Math.abs(x - bx) <= 1 && Math.abs(z - bz) <= 1
}

// 坐垫方块是否紧邻该顾客的床头或床尾方块
function pfmChairAdjacentToBed(x, y, z, bed) {
    return pfmIsAdjacentBlock(x, y, z, bed.hx, bed.hy, bed.hz) ||
        pfmIsAdjacentBlock(x, y, z, bed.fx, bed.fy, bed.fz)
}

// 从这张坐垫上挑一名可服务的顾客：
// 1. 只认坐垫方块与顾客床位方块紧邻的顾客，隔了一个方块也视为虚空搓脚
// 2. 泡脚阶段不算搓脚：pfSoakDone 之前该顾客不列入服务目标
// 3. 一个坐垫紧邻多张床时，在这些顾客里随机选一名
// 4. 选中后锁定 pfFootTargetUuid，服务到该顾客需求全部完成才换人
function pfmPickCustomer(maid, chairPos) {
    try {
        let level = maid.level
        let cx = chairPos.getX()
        let cy = chairPos.getY()
        let cz = chairPos.getZ()
        let r = PFM_CHAIR_SCAN + 1
        let box = new $PFMAABB(
            cx - r, cy - PFM_ADJACENT_DY - 1, cz - r,
            cx + r + 1, cy + PFM_ADJACENT_DY + 1, cz + r + 1
        )
        let entities = level.getEntitiesWithin(box)
        let candidates = []
        for (let i = 0; i < entities.length; i++) {
            let ent = entities[i]
            if (!ent || ent === maid) continue
            if (global.pfEntityData.pfGetPhase(ent) !== 3) continue
            let item = ent.getMainHandItem()
            if (!item || item.id !== PFM_SYNC_ITEM_ID || !item.nbt) continue
            if (!pfmHasRemainingDemand(item.nbt)) continue
            if (!pfmIsSoakDone(ent)) continue
            if (!pfmChairAdjacentToBed(cx, cy, cz, pfmCustomerBedInfo(ent))) continue
            candidates.push({ ent: ent, uuid: '' + ent.getUuid() })
        }
        if (candidates.length === 0) return null

        // 已锁定的顾客仍可服务 → 继续服务到完成，不中途换人
        let locked = '' + maid.persistentData.getString('pfFootTargetUuid')
        if (locked && locked.length > 0) {
            for (let i = 0; i < candidates.length; i++) {
                if (candidates[i].uuid === locked) return candidates[i].ent
            }
            maid.persistentData.putString('pfFootTargetUuid', '')
        }

        let pick = candidates[Math.floor(Math.random() * candidates.length)]
        maid.persistentData.putString('pfFootTargetUuid', pick.uuid)
        return pick.ent
    } catch (e) {
        return null
    }
}

// 共享的搜索缓存：每个顾客床位周围可用的空闲坐垫（缓存 20 tick）
function pfmServiceCache(maid) {
    let now = Number(maid.level.getDayTime())
    let uuid = '' + maid.getUuid()
    let cache = pfmSeatCache[uuid]
    if (cache && now - cache.at < PFM_CACHE_TICKS) return cache

    let seats = {}
    let chairs = []
    let count = 0
    try {
        let level = maid.level
        let r = PFM_SEARCH_RANGE
        let box = new $PFMAABB(
            maid.x - r, maid.y - 8, maid.z - r,
            maid.x + r, maid.y + 8, maid.z + r
        )
        let entities = level.getEntitiesWithin(box)
        for (let i = 0; i < entities.length; i++) {
            let ent = entities[i]
            if (!ent || ent === maid) continue
            if (global.pfEntityData.pfGetPhase(ent) !== 3) continue
            let item = ent.getMainHandItem()
            if (!item || item.id !== PFM_SYNC_ITEM_ID || !item.nbt) continue
            if (!pfmHasRemainingDemand(item.nbt)) continue
            // 泡脚阶段的顾客还没进入搓脚环节，不作为寻路目标，女仆应保持空闲去找其他顾客
            if (!pfmIsSoakDone(ent)) continue

            let bed = pfmCustomerBedInfo(ent)
            let chairBox = new $PFMAABB(
                bed.hx - PFM_CHAIR_SCAN - 0.5, bed.hy - PFM_CHAIR_SCAN_Y, bed.hz - PFM_CHAIR_SCAN - 0.5,
                bed.hx + PFM_CHAIR_SCAN + 1.5, bed.hy + PFM_CHAIR_SCAN_Y + 1, bed.fz + PFM_CHAIR_SCAN + 1.5
            )
            let nearChairs = level.getEntitiesWithin(chairBox)
            for (let c = 0; c < nearChairs.length; c++) {
                let chair = nearChairs[c]
                if (!chair || chair === maid) continue
                if (!pfmIsChairEntity(chair)) continue
                try { if (chair.hasPassenger()) continue } catch (e) { continue }
                let cp = chair.blockPosition()
                let x = cp.getX()
                let y = cp.getY()
                let z = cp.getZ()
                // 只把与床位方块紧邻的坐垫作为目标，隔一个方块都不派过去
                if (!pfmChairAdjacentToBed(x, y, z, bed)) continue
                let key = pfmPosKey(x, y, z)
                if (seats[key]) continue
                seats[key] = true
                chairs.push({ key: key, x: x, y: y, z: z })
                count++
            }
        }
    } catch (e) {
        let ts = Date.now()
        if (ts - pfmLastDiagAt > 5000) {
            pfmLastDiagAt = ts
            console.log('[PF-MAID] 搜索坐垫异常: ' + e)
        }
    }

    cache = { at: now, seats: seats, chairs: chairs, count: count }
    pfmSeatCache[uuid] = cache
    return cache
}

// 方块坐标是否对应缓存里的某个坐垫（坐垫实体位置允许上下浮动 1 格）
function pfmFindChairAt(cache, x, y, z) {
    for (let i = 0; i < cache.chairs.length; i++) {
        let c = cache.chairs[i]
        if (Math.abs(c.x - x) <= 1 && Math.abs(c.z - z) <= 1 && Math.abs(c.y - y) <= 1) return c
    }
    return null
}

// 在指定坐标附近找实际坐垫实体（寻路到位后重新取实体，避免缓存过期）
function pfmFindChairEntityNear(maid, x, y, z) {
    try {
        let box = new $PFMAABB(x - 2.5, y - 2.5, z - 2.5, x + 3.5, y + 3.5, z + 3.5)
        let ents = maid.level.getEntitiesWithin(box)
        let best = null
        let bestDist = 999999
        for (let i = 0; i < ents.length; i++) {
            let ent = ents[i]
            if (!ent || !pfmIsChairEntity(ent)) continue
            try { if (ent.hasPassenger()) continue } catch (e) { continue }
            let dx = ent.x - (x + 0.5)
            let dz = ent.z - (z + 0.5)
            let dist = dx * dx + dz * dz
            if (dist < bestDist) {
                best = ent
                bestDist = dist
            }
        }
        return best
    } catch (e) {
        return null
    }
}

function pfmIsSitting(maid) {
    try {
        return maid.persistentData.getInt('pfFootSitting') === 1
    } catch (e) {
        return false
    }
}

// 坐垫会自动把站在上面的驯服生物吸上去；工作结束时先关掉，
// 等女仆走远再恢复，避免“坐下/站起来”反复抽搐。
function pfmSuspendChairAutoRide(maid, chair, original) {
    try {
        if (!original) return
        pfmChairRestore['' + maid.getUuid()] = { chair: chair, original: true }
    } catch (e) {}
    try { chair.setTameableCanRide(false) } catch (e) {}
}

function pfmRestoreChairs(maid) {
    let uuid = '' + maid.getUuid()
    let rec = pfmChairRestore[uuid]
    if (!rec) return
    try {
        let chair = rec.chair
        if (chair == null || !chair.isAlive()) {
            delete pfmChairRestore[uuid]
            return
        }
        if (chair.hasPassenger()) return
        let dx = maid.x - chair.x
        let dz = maid.z - chair.z
        if (dx * dx + dz * dz < 4) return
        if (rec.original) chair.setTameableCanRide(true)
        delete pfmChairRestore[uuid]
    } catch (e) {
        delete pfmChairRestore[uuid]
    }
}

function pfmDismount(maid) {
    try {
        let vehicle = maid.getVehicle()
        if (vehicle != null && pfmIsChairEntity(vehicle)) {
            let original = true
            try { original = vehicle.isTameableCanRide() } catch (e) { original = true }
            pfmSuspendChairAutoRide(maid, vehicle, original)
        }
        if (maid.isPassenger()) maid.stopRiding()
        try { maid.setInSittingPose(false) } catch (e) {}
    } catch (e) {}
}

function pfmClearState(maid, dismount) {
    try {
        let pd = maid.persistentData
        if (dismount) pfmDismount(maid)
        pd.putInt('pfFootSitting', 0)
        pd.putLong('pfFootNextServe', 0)
        pd.putLong('pfFootIdleSince', 0)
        pd.putString('pfFootTargetUuid', '')
    } catch (e) {}
}

// 起身后立刻让 TLM 重新评估寻路目标。
// TLM 的 MaidMoveToBlockTask 构造里把检查间隔设为 120 + random(120) tick（6~12 秒），
// 重建 brain 会把 behavior 的检查计数归零，下一个 tick 就能搜索下一个床位。
function pfmRestartSearch(maid) {
    try {
        delete pfmSeatCache['' + maid.getUuid()]
    } catch (e) {}
    try {
        maid.refreshBrain(maid.level)
    } catch (e) {
        let ts = Date.now()
        if (ts - pfmLastDiagAt > 5000) {
            pfmLastDiagAt = ts
            console.log('[PF-MAID] 重置寻路失败: ' + e)
        }
    }
}

function pfmSitOnChair(maid, chair) {
    try {
        if (maid.isPassenger()) return false
        // 与 TLM 坐垫自动上人使用同一个单参数 startRiding
        maid.startRiding(chair)
        if (!maid.isPassenger()) return false

        let original = true
        try { original = chair.isTameableCanRide() } catch (e) { original = true }
        pfmSuspendChairAutoRide(maid, chair, original)

        let pd = maid.persistentData
        pd.putInt('pfFootSitting', 1)
        pd.putLong('pfFootNextServe', Number(maid.level.getDayTime()) + 20)
        pd.putLong('pfFootIdleSince', 0)
        pd.putInt('pfFootIdleSearch', 0)
        console.log('[PF-MAID] 女仆坐上坐垫 maid=' + maid.getUuid() +
            ' seat=' + chair.blockPosition().getX() + ',' + chair.blockPosition().getY() +
            ',' + chair.blockPosition().getZ())
        return true
    } catch (e) {
        let ts = Date.now()
        if (ts - pfmLastDiagAt > 5000) {
            pfmLastDiagAt = ts
            console.log('[PF-MAID] 坐上坐垫失败: ' + e)
        }
        return false
    }
}

// TLM 寻路到位回调：只有这张坐垫对应的床位仍有需要服务的顾客才坐下
function pfmArriveSeat(maid, pos) {
    try {
        if (maid.isPassenger()) return
        if (pfmIsSitting(maid)) return
        let px = pos.getX()
        let py = pos.getY()
        let pz = pos.getZ()
        let cache = pfmServiceCache(maid)
        let entry = pfmFindChairAt(cache, px, py, pz)
        let chair = null
        if (entry) {
            chair = pfmFindChairEntityNear(maid, entry.x, entry.y, entry.z)
        } else {
            chair = pfmFindChairEntityNear(maid, px, py, pz)
        }
        if (!chair) return
        if (!pfmPickCustomer(maid, chair.blockPosition())) return
        pfmSitOnChair(maid, chair)
    } catch (e) {}
}

// 工作期间顺带拾取附近掉落物（包括女仆自己服务掉在地上的硬币）
function pfmCollectDrops(maid) {
    try {
        let level = maid.level
        let r = PFM_PICKUP_RANGE
        let box = new $PFMAABB(
            maid.x - r, maid.y - 2, maid.z - r,
            maid.x + r, maid.y + 2, maid.z + r
        )
        let ents = level.getEntitiesWithin(box)
        for (let i = 0; i < ents.length; i++) {
            let ent = ents[i]
            if (!ent || !pfmIsItemEntity(ent)) continue
            try { maid.pickupItem(ent, false) } catch (e) {}
        }
    } catch (e) {}
}

function pfmReadEarnings(nbt) {
    let raw = '' + nbt.getString('pfMaidEarnings')
    if (!raw || raw.length === 0) return []
    try {
        let arr = JSON.parse(raw)
        return Array.isArray(arr) ? arr : []
    } catch (e) {
        return []
    }
}

function pfmFindEarningEntry(earnings, maidUuid) {
    for (let i = 0; i < earnings.length; i++) {
        if ('' + earnings[i].uuid === maidUuid) return earnings[i]
    }
    return null
}

function pfmBroadcastServe(customer, nbt, part) {
    try {
        let players = customer.level.getPlayers()
        for (let i = 0; i < players.size(); i++) {
            let p = players.get(i)
            if (p.distanceToSqr(customer) > 1024) continue
            p.sendData('pf_serve_success', {
                entityUuid: '' + customer.getUuid(),
                part: part || '',
                demandJiaozhang: nbt.getInt('pfDemandJiaozhang'),
                demandJiaogen: nbt.getInt('pfDemandJiaogen'),
                demandJiaozhi: nbt.getInt('pfDemandJiaozhi'),
                demandJiaoxin: nbt.getInt('pfDemandJiaoxin'),
                satisfaction: nbt.getInt('pfSatisfaction'),
                foodServed: nbt.getInt('pfFoodServed')
            })
        }
    } catch (e) {
        console.log('[PF-MAID] 需求同步失败: ' + e)
    }
}

// 女仆的搓脚收益按主人属性（含遗物加成）计算；主人不在线时退回女仆自身属性
function pfmGetOwnerPlayer(maid) {
    try {
        let u = maid.getOwnerUUID()
        if (u == null) return null
        return maid.level.getPlayerByUUID('' + u)
    } catch (e) {
        return null
    }
}

// 女仆每 5 秒完成一次：随机部位 -1，收益记到女仆独立账本
function pfmServeOnce(maid, customer) {
    let item = customer.getMainHandItem()
    if (!item || item.id !== PFM_SYNC_ITEM_ID || !item.nbt) return
    // 泡脚未完成时不服务（正常流程已在 tick 中拦截，这里再兜一次）
    if (!pfmIsSoakDone(customer)) return
    let nbt = item.nbt

    let available = []
    for (let i = 0; i < PFM_DEMAND_KEYS.length; i++) {
        let key = PFM_DEMAND_KEYS[i]
        if ((nbt.getInt(key) | 0) > 0) available.push(key)
    }
    if (available.length === 0) return

    let demandKey = available[Math.floor(Math.random() * available.length)]
    let part = PFM_PART_BY_DEMAND[demandKey]
    let remaining = nbt.getInt(demandKey) | 0

    // 与玩家搓脚一致：服务者属性（女仆取主人属性，含遗物加成）+ 顾客 modifier
    let worker = pfmGetOwnerPlayer(maid) || maid
    let satPer = pfmGetServiceAttributeValue(worker, customer, 'kubejs:serve.sat_gain.' + part, 10.0)
    let moneyPer = pfmGetServiceAttributeValue(worker, customer, 'kubejs:serve.money_gain.' + part, 1.0)
    let satGain = Math.max(0, Math.floor(satPer))
    let moneyGain = Math.floor(moneyPer)
    let satApplied = pfmApplyBossSatMul(customer, satGain)

    let oldSat = nbt.getInt('pfSatisfaction') | 0
    let newSat = Math.min(100, oldSat + satApplied)
    let actualSat = Math.max(0, newSat - oldSat)

    let demandPatch = {}
    demandPatch[demandKey] = remaining - 1
    nbt.merge(demandPatch)
    nbt.merge({ pfSatisfaction: newSat })
    nbt.merge({ pfMaidSat: (nbt.getInt('pfMaidSat') | 0) + actualSat })

    // 女仆独立收益账本（按女仆 UUID 汇总，顾客起床时逐个结算）
    let maidUuid = '' + maid.getUuid()
    let ownerUuid = ''
    try {
        let u = maid.getOwnerUUID()
        if (u != null) ownerUuid = '' + u
    } catch (e) {}
    let earnings = pfmReadEarnings(nbt)
    let entry = pfmFindEarningEntry(earnings, maidUuid)
    if (!entry) {
        entry = {
            uuid: maidUuid,
            name: '' + maid.getDisplayName().getString(),
            owner: ownerUuid,
            money: 0,
            sat: 0
        }
        earnings.push(entry)
    }
    entry.money = (entry.money | 0) + moneyGain
    entry.sat = (entry.sat | 0) + actualSat
    nbt.merge({ pfMaidEarnings: JSON.stringify(earnings) })

    // 女仆自身累计业绩
    let mpd = maid.persistentData
    mpd.putInt('pfMaidTotalMoney', (mpd.getInt('pfMaidTotalMoney') | 0) + moneyGain)
    mpd.putInt('pfMaidTotalSat', (mpd.getInt('pfMaidTotalSat') | 0) + actualSat)
    if (!pfmHasRemainingDemand(nbt)) {
        mpd.putInt('pfMaidServedCount', (mpd.getInt('pfMaidServedCount') | 0) + 1)
    }

    // 覆盖主手纸 NBT 以触发实体装备同步，再给附近玩家推送 UI 更新
    customer.setMainHandItem(item.withNBT(nbt))
    pfmBroadcastServe(customer, nbt, part)

    console.log('[PF-MAID] 女仆服务 maid=' + maidUuid + ' customer=' + customer.getUuid() +
        ' demand=' + demandKey + ' -> ' + (remaining - 1) +
        ' money+' + moneyGain + ' sat+' + actualSat)
}

// 顾客起床时调用：女仆那份硬币/星星在女仆脚下单独掉落
function pfmSettleMaidEarnings(entity, level, nbt) {
    let earnings = pfmReadEarnings(nbt)
    if (earnings.length === 0) return

    for (let i = 0; i < earnings.length; i++) {
        let entry = earnings[i]
        let maid = null
        try { maid = level.getEntity('' + entry.uuid) } catch (e) { maid = null }
        let dropX = maid ? maid.x : entity.x
        let dropY = maid ? maid.y + 1 : entity.y + 1
        let dropZ = maid ? maid.z : entity.z

        let money = Math.max(0, Math.floor(entry.money || 0))
        if (money > 0) {
            if (global.pfCoinQueue && typeof global.pfCoinQueue.enqueueCoins === 'function') {
                global.pfCoinQueue.enqueueCoins(level, dropX, dropY, dropZ, money)
            } else {
                console.log('[PF-MAID] pfCoinQueue 未就绪，女仆硬币未掉落 amount=' + money)
            }
        }

        let sat = Math.max(0, Math.floor(entry.sat || 0))
        if (sat > 60) {
            let starCmd = 'summon item ' + dropX + ' ' + dropY + ' ' + dropZ +
                ' {Item:{id:"minecraft:nether_star",Count:1b}}'
            level.getServer().runCommandSilent(starCmd)
        }

        let owner = null
        let ownerUuid = entry.owner ? ('' + entry.owner) : ''
        if (ownerUuid && ownerUuid.length > 0) {
            owner = level.getPlayerByUUID(ownerUuid)
        }
        if (owner) {
            if (money > 0) {
                owner.tell('§6女仆 ' + entry.name + ' §7本次服务赚取 §e' + money + '§6💰 §7(满意度 +' + sat + '%)')
            }
            if (sat > 60) {
                owner.tell('§d✦ 女仆 ' + entry.name + ' §7服务满意度 ' + sat + '% ，获得下界之星 ×1')
            }
        }
        console.log('[PF-MAID] 独立结算 maid=' + entry.uuid + ' money=' + money +
            ' sat=' + sat + ' drop=' + dropX + ',' + dropY + ',' + dropZ)
    }

    // 防止同一顾客重复结算女仆账本
    nbt.merge({ pfMaidEarnings: '' })
}

// 注册工作模式：由 TLM 原生按条件寻路，找到对应床位旁的坐垫后坐上去
MaidRegister.TASK.walkToBlockTask(PFM_TASK_ID, Item.of(PFM_TASK_ICON_ID, PFM_TASK_ICON_NBT))
    .setSearchCondition(maid => !maid.isPassenger() && pfmServiceCache(maid).count > 0)
    .setBlockPredicate((maid, pos) => {
        let cache = pfmServiceCache(maid)
        return pfmFindChairAt(cache, pos.getX(), pos.getY(), pos.getZ()) != null
    })
    .setArriveAction((maid, pos) => pfmArriveSeat(maid, pos))
    .setCloseEnoughDist(1.5)
    .setVerticalSearchRange(4)
    .enableLookAndRandomWalk(maid => false)
    .enableEating(maid => false)

MaidEvents.maidTick(event => {
    let maid = event.maid
    if (!maid || maid.level.isClientSide()) return

    let pd = maid.persistentData
    let sitting = pfmIsSitting(maid)

    // 走远后恢复被临时关闭的坐垫自动上人
    pfmRestoreChairs(maid)

    // 切到其他工作模式时，让女仆从坐垫上下来并恢复拾取设置
    if (pfmGetTaskId(maid) !== PFM_TASK_ID_STR) {
        if (pd.getInt('pfFootPickupOn') === 1) {
            pd.putInt('pfFootPickupOn', 0)
            try { maid.setPickup(pd.getInt('pfFootPickupOrig') === 1) } catch (e) {}
        }
        if (sitting) pfmClearState(maid, true)
        return
    }

    let now = Number(maid.level.getDayTime())

    // 工作模式开启拾取，并周期性主动收集附近掉落物
    if (pd.getInt('pfFootPickupOn') !== 1) {
        pd.putInt('pfFootPickupOn', 1)
        try { pd.putInt('pfFootPickupOrig', maid.isPickup() ? 1 : 0) } catch (e) {}
        try { maid.setPickup(true) } catch (e) {}
    }
    if (now - Number(pd.getLong('pfFootPickupAt')) >= PFM_PICKUP_INTERVAL) {
        pd.putLong('pfFootPickupAt', now)
        pfmCollectDrops(maid)
    }

    // 没坐在任何东西上：清掉残留标记，由 TLM 寻路接管移动
    if (!maid.isPassenger()) {
        if (sitting) pfmClearState(maid, false)
        // 空闲时一旦出现已进入搓脚环节的顾客，立刻重置 TLM 的搜索检查计数，
        // 避免原生 6~12 秒的检查间隔让女仆干等
        let idleCache = pfmServiceCache(maid)
        if (idleCache.count === 0) {
            pd.putInt('pfFootIdleSearch', 0)
        } else if (pd.getInt('pfFootIdleSearch') !== 1) {
            pd.putInt('pfFootIdleSearch', 1)
            pfmRestartSearch(maid)
            return
        }
        if (now - Number(pd.getLong('pfFootDiagAt')) > 200) {
            pd.putLong('pfFootDiagAt', now)
            console.log('[PF-MAID] 搜索中 maid=' + maid.getUuid() +
                ' 目标坐垫数=' + idleCache.count +
                ' pos=' + Math.floor(maid.x) + ',' + Math.floor(maid.y) + ',' + Math.floor(maid.z))
        }
        return
    }

    // 已经坐在车万女仆坐垫上（包括玩家手动放上去的），直接纳入服务状态
    let vehicle = maid.getVehicle()
    if (vehicle == null || !pfmIsChairEntity(vehicle)) {
        if (sitting) pfmClearState(maid, true)
        return
    }

    let seatPos = vehicle.blockPosition()

    if (!sitting) {
        pd.putInt('pfFootSitting', 1)
        pd.putLong('pfFootNextServe', now + 20)
        pd.putLong('pfFootIdleSince', 0)
        console.log('[PF-MAID] 女仆已坐在坐垫上，开始服务 maid=' + maid.getUuid())
        return
    }

    let customer = pfmPickCustomer(maid, seatPos)
    if (!customer) {
        // 顾客服务完/离开：先等 1 秒，看是否有新顾客躺到这张床上
        let idleSince = Number(pd.getLong('pfFootIdleSince'))
        if (idleSince <= 0) {
            pd.putLong('pfFootIdleSince', now)
            return
        }
        if (now - idleSince < PFM_IDLE_WAIT) return
        console.log('[PF-MAID] 1 秒无新顾客，起身寻找下一个床位 maid=' + maid.getUuid())
        pfmClearState(maid, true)
        pd.putInt('pfFootIdleSearch', 0)
        return
    }
    pd.putLong('pfFootIdleSince', 0)

    if (now < Number(pd.getLong('pfFootNextServe'))) return
    pfmServeOnce(maid, customer)
    pd.putLong('pfFootNextServe', now + PFM_SERVE_INTERVAL)
})

global.pfMaidService = {
    taskId: PFM_TASK_ID_STR,
    settle: pfmSettleMaidEarnings
}
