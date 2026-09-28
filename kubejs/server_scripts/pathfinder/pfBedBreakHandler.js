// priority: 10
// ============================================================
// 玩家破坏床处理模块
// ------------------------------------------------------------
// 只处理玩家挖掘床的场景：
//   1. 以被破坏床方块为中心，在 3x3x3 范围内筛选 pfPhase=3 顾客；
//   2. 只按顾客保存的床头坐标精确匹配，不使用空间范围兜底；
//   3. 顾客异常送客，不结算、不掉落奖励。
// ============================================================

function pfBedBreakGetHeadAndFoot(block) {
    let pos = block.pos
    let x = pos.getX() | 0
    let y = pos.getY() | 0
    let z = pos.getZ() | 0
    let part = "" + block.getProperties().get("part")
    let facing = "" + block.getProperties().get("facing")

    // Pathfinder 当前只注册/接受床头朝北的床，但这里保留四方向推导，
    // 这样玩家破坏旧版本或非法朝向床时仍能得到合理的候选范围。
    let headX = x, headZ = z
    let footX = x, footZ = z
    if (facing === "north") {
        if (part === "head") footZ = z + 1
        else if (part === "foot") { headZ = z - 1; footZ = z }
    } else if (facing === "south") {
        if (part === "head") footZ = z - 1
        else if (part === "foot") { headZ = z + 1; footZ = z }
    } else if (facing === "east") {
        if (part === "head") footX = x - 1
        else if (part === "foot") { headX = x + 1; footX = x }
    } else if (facing === "west") {
        if (part === "head") footX = x + 1
        else if (part === "foot") { headX = x - 1; footX = x }
    }

    return {
        head: { x: headX, y: y, z: headZ },
        foot: { x: footX, y: y, z: footZ }
    }
}

function pfBedBreakIsExactMatch(ent, bed) {
    try {
        let info = global.pfEntityData.pfGetBedInfo(ent)
        return info.blockX === bed.head.x &&
            info.blockY === bed.head.y &&
            info.blockZ === bed.head.z
    } catch (e) {
        return false
    }
}

function pfBedBreakCollectPlayers(level, base, playersByUuid) {
    if (!base) return
    let players = level.getPlayers()
    for (let i = 0; i < players.size(); i++) {
        let player = players.get(i)
        let px = player.getX(), py = player.getY(), pz = player.getZ()
        if (px < base.x - global.pfConstants.GRID_HALF - 5 ||
            px > base.x + global.pfConstants.GRID_HALF + 5 ||
            py < base.y - 5 || py > base.y + 10 ||
            pz < base.z - global.pfConstants.GRID_HALF - 5 ||
            pz > base.z + global.pfConstants.GRID_HALF + 5) continue
        playersByUuid["" + player.getUuid()] = player
    }
}

function pfBedBreakGetShopBase(ent) {
    return {
        x: ent.persistentData.getInt("pfShopBaseX") | 0,
        y: ent.persistentData.getInt("pfShopBaseY") | 0,
        z: ent.persistentData.getInt("pfShopBaseZ") | 0
    }
}

function pfHandlePlayerBrokenBed(event) {
    let block = event.block
    console.log("[DEBUG-BEDBREAK] BlockEvents.broken fired; hasBlock=" + (!!block))
    if (!block) {
        console.log("[DEBUG-BEDBREAK] stop: event.block is null")
        return
    }
    let blockId = "" + block.id
    console.log("[DEBUG-BEDBREAK] block=" + blockId + " pos=" + block.pos)
    if (blockId.indexOf("_bed") === -1) {
        console.log("[DEBUG-BEDBREAK] stop: block is not a bed")
        return
    }

    let level = event.level || block.level
    console.log("[DEBUG-BEDBREAK] levelAvailable=" + (!!level))
    if (!level) {
        console.log("[DEBUG-BEDBREAK] stop: level unavailable")
        return
    }
    let bed = pfBedBreakGetHeadAndFoot(block)
    console.log("[DEBUG-BEDBREAK] derived bed head=(" + bed.head.x + "," + bed.head.y + "," + bed.head.z + ")" +
        " foot=(" + bed.foot.x + "," + bed.foot.y + "," + bed.foot.z + ")")
    let brokenX = block.pos.getX() | 0
    let brokenY = block.pos.getY() | 0
    let brokenZ = block.pos.getZ() | 0
    // AABB 上边界为排他边界，实际覆盖破坏方块周围的 3x3x3 方块空间。
    let area = new AABB.of(brokenX - 1, brokenY, brokenZ - 1,
        brokenX + 2, brokenY + 3, brokenZ + 2)
    console.log("[DEBUG-BEDBREAK] search AABB=(" + (brokenX - 1) + "," + brokenY + "," + (brokenZ - 1) + ") -> (" +
        (brokenX + 2) + "," + (brokenY + 3) + "," + (brokenZ + 2) + ")")
    let nearby = level.getEntitiesWithin(area)
    console.log("[DEBUG-BEDBREAK] nearbyCount=" + nearby.length)
    let candidates = []
    for (let i = 0; i < nearby.length; i++) {
        let ent = nearby[i]
        if (!ent || !ent.isAlive()) continue
        let phase = ent.persistentData.getInt("pfPhase") | 0
        if (phase !== 3) continue
        console.log("[DEBUG-BEDBREAK] candidate uuid=" + ent.getUuid() +
            " pos=(" + ent.getX() + "," + ent.getY() + "," + ent.getZ() + ") phase=" + phase)
        candidates.push(ent)
    }
    console.log("[DEBUG-BEDBREAK] candidateCount=" + candidates.length)

    let exact = []
    for (let i = 0; i < candidates.length; i++) {
        let matched = pfBedBreakIsExactMatch(candidates[i], bed)
        let info = global.pfEntityData.pfGetBedInfo(candidates[i])
        console.log("[DEBUG-BEDBREAK] bedMatch uuid=" + candidates[i].getUuid() +
            " exact=" + matched + " savedBed=(" + info.blockX + "," + info.blockY + "," + info.blockZ + ")")
        if (matched) exact.push(candidates[i])
    }
    let targets = exact
    console.log("[DEBUG-BEDBREAK] exactCount=" + exact.length + " targetCount=" + targets.length +
        " fallback=false")
    if (targets.length === 0) {
        console.log("[DEBUG-BEDBREAK] stop: no target customer")
        return
    }

    let playersByUuid = {}
    let dismissed = 0
    let bedKey = bed.head.x + "," + bed.head.y + "," + bed.head.z
    let removedShopBedKeys = {}

    for (let i = 0; i < targets.length; i++) {
        let ent = targets[i]
        if (!ent || !ent.isAlive()) continue
        console.log("[DEBUG-BEDBREAK] processing uuid=" + ent.getUuid() + " aliveBefore=" + ent.isAlive())
        let base = pfBedBreakGetShopBase(ent)
        console.log("[DEBUG-BEDBREAK] shopBase uuid=" + ent.getUuid() + " base=(" + base.x + "," + base.y + "," + base.z + ")")
        pfBedBreakCollectPlayers(level, base, playersByUuid)

        if (global.pfShopManager && global.pfShopManager.pfShopReleaseBed) {
            try {
                global.pfShopManager.pfShopReleaseBed(level, base.x, base.y, base.z,
                    bedKey, "" + ent.getUuid())
            } catch (e) {}
        }
        if (global.pfShopManager && global.pfShopManager.pfShopRemoveBedAt) {
            let removeKey = base.x + "," + base.y + "," + base.z + "|" + bedKey
            if (!removedShopBedKeys[removeKey]) {
                try {
                    global.pfShopManager.pfShopRemoveBedAt(level, base.x, base.y, base.z, bedKey)
                } catch (e) {}
                removedShopBedKeys[removeKey] = true
            }
        }

        if (global.pfSleepManager && global.pfSleepManager.pfDismissBrokenBedCustomer) {
            let dismissedNow = global.pfSleepManager.pfDismissBrokenBedCustomer(ent, level, "玩家破坏床位")
            console.log("[DEBUG-BEDBREAK] dismissResult uuid=" + ent.getUuid() +
                " result=" + dismissedNow + " aliveAfter=" + ent.isAlive())
            if (dismissedNow) {
                dismissed++
            }
        } else {
            console.log("[DEBUG-BEDBREAK] dismiss unavailable: global.pfSleepManager.pfDismissBrokenBedCustomer missing")
        }
    }

    console.log("[DEBUG-BEDBREAK] dismissedCount=" + dismissed + " notifyPlayerCount=" + Object.keys(playersByUuid).length)
    if (dismissed <= 0) return
    let message = "§c床位被破坏，" + dismissed + "位顾客已离场，本次服务未结算。"
    for (let uuid in playersByUuid) {
        try { playersByUuid[uuid].tell(message) } catch (e) {}
    }
}

BlockEvents.broken(event => {
    try { pfHandlePlayerBrokenBed(event) } catch (e) {
        console.log("[PF-BED-BREAK] 处理玩家破坏床失败: " + e)
    }
})

console.log("[PF-BED-BREAK] 玩家破坏床处理器已加载")
