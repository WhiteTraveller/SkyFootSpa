// priority: 10
// ============================================================
// 床位管理模块
// 床位扫描、序列化、占用检测
// ============================================================

// 路径生成时扫描路径每一格旁边的所有床。
// 本项目只接受“床头在北、床尾在南”的床：facing=north。
// 床头坐标作为床位唯一键。
function pfScanBedsAlongRoute(level, routeStr, startX, startY, startZ) {
    let beds = []
    let foundHeads = {}
    let cx = Math.floor(startX)
    let cz = Math.floor(startZ)
    let baseY = Math.floor(startY)
    let routeChars = routeStr.split('')

    for (let i = 0; i <= routeChars.length; i++) {
        // 检查当前格周围1格范围内是否有床
        let checkR = 1
        let adjacent = []
        for (let ddx = -checkR; ddx <= checkR; ddx++) {
            for (let ddz = -checkR; ddz <= checkR; ddz++) {
                if (ddx === 0 && ddz === 0) continue
                adjacent.push([cx + ddx, cz + ddz])
            }
        }
        for (let a = 0; a < adjacent.length; a++) {
            let ax = adjacent[a][0]
            let az = adjacent[a][1]
            // 检查Y-1, Y, Y+1三个高度
            for (let dy = -1; dy <= 1; dy++) {
                let ay = baseY + dy
                let block = level.getBlock(ax, ay, az)
                let blockId = "" + block.id
                if (blockId.indexOf("_bed") === -1) continue

                let partProp = "" + block.getProperties().get("part")
                let facingProp = "" + block.getProperties().get("facing")

                // 固定朝向：床头在北，床尾在南。
                if (facingProp !== "north") continue
                let headX = ax
                let headZ = az
                let otherPart = "foot"
                let otherX = ax
                let otherZ = az + 1
                if (partProp === "head") {
                    otherPart = "foot"
                } else if (partProp === "foot") {
                    headZ = az - 1
                    otherPart = "head"
                    otherX = ax
                    otherZ = az - 1
                } else {
                    continue
                }

                // 必须验证另一半确实是同色、相反 part、同朝向的床。
                let otherBlock = level.getBlock(otherX, ay, otherZ)
                let otherId = "" + otherBlock.id
                let otherPartProp = "" + otherBlock.getProperties().get("part")
                let otherFacingProp = "" + otherBlock.getProperties().get("facing")
                if (otherId !== blockId || otherPartProp !== otherPart || otherFacingProp !== "north") continue

                // 去重
                let key = headX + "," + ay + "," + headZ
                if (foundHeads[key]) break
                foundHeads[key] = true

                beds.push({ blockX: headX, blockY: ay, blockZ: headZ,
                    footX: ax, footY: ay, footZ: az, yaw: 180,
                    queueX: cx + 0.5, queueZ: cz + 0.5,
                    used: false, ownerUuid: "" })
                break
            }
        }

        // 移动到下一格
        if (i < routeChars.length) {
            let d = routeChars[i]
            if (d === 'N') cz -= 1
            else if (d === 'S') cz += 1
            else if (d === 'E') cx += 1
            else if (d === 'W') cx -= 1
        }
    }
    return beds
}

// 用新扫描结果刷新店铺床位表。相同床头坐标保留占用状态，失效床位直接删除。
function pfMergeBeds(level, scannedBeds, oldBeds) {
    let oldByKey = {}
    for (let i = 0; i < oldBeds.length; i++) oldByKey[pfBedKey(oldBeds[i])] = oldBeds[i]
    let result = []
    for (let i = 0; i < scannedBeds.length; i++) {
        let bed = scannedBeds[i]
        let old = oldByKey[pfBedKey(bed)]
        // 关店会清空店铺床位表，但正在服务中的实体（phase=3）会保留。
        // 重新开店时优先从世界中的实体恢复真实占用状态，避免床位表被清空后重用。
        let occupant = pfFindBedOccupant(level, bed, null)
        if (occupant) {
            bed.used = true
            bed.ownerUuid = "" + occupant.getUuid()
        } else if (old && old.used && old.ownerUuid) {
            let owner = null
            try { owner = level.getEntity(old.ownerUuid) } catch (e) { owner = null }
            if (owner && owner.isAlive() && global.pfEntityData.pfGetPhase(owner) === 3) {
                bed.used = true
                bed.ownerUuid = old.ownerUuid
            }
        }
        result.push(bed)
    }
    return result
}

function pfBedKey(bed) {
    return bed.blockX + "," + bed.blockY + "," + bed.blockZ
}

// 检查顾客保存的床头坐标处是否仍然存在同一张完整床。
// 该检查不依赖破坏事件，因此能覆盖玩家挖掘、TNT、活塞、命令和其他模组改方块。
function pfIsBedIntact(level, bed) {
    if (!level || !bed) return false

    let headX = bed.blockX | 0
    let headY = bed.blockY | 0
    let headZ = bed.blockZ | 0
    let yaw = ((bed.yaw | 0) % 360 + 360) % 360
    let footX = headX
    let footZ = headZ
    let expectedFacing = "north"

    if (yaw === 0) {
        footZ = headZ - 1
        expectedFacing = "south"
    } else if (yaw === 180) {
        footZ = headZ + 1
        expectedFacing = "north"
    } else if (yaw === 90) {
        footX = headX + 1
        expectedFacing = "west"
    } else if (yaw === 270) {
        footX = headX - 1
        expectedFacing = "east"
    } else {
        return false
    }

    let head = level.getBlock(headX, headY, headZ)
    let headId = "" + head.id
    if (headId.indexOf("_bed") === -1) return false
    if (("" + head.getProperties().get("part")) !== "head") return false
    if (("" + head.getProperties().get("facing")) !== expectedFacing) return false

    let foot = level.getBlock(footX, headY, footZ)
    if (("" + foot.id) !== headId) return false
    if (("" + foot.getProperties().get("part")) !== "foot") return false
    if (("" + foot.getProperties().get("facing")) !== expectedFacing) return false
    return true
}

// 用粒子短暂标记合法床的床头和床尾，方便玩家确认扫描结果。
function pfHighlightBeds(level, beds) {
    for (let i = 0; i < beds.length; i++) {
        let bed = beds[i]
        level.spawnParticles("minecraft:end_rod", false,
            bed.blockX + 0.5, bed.blockY + 1.15, bed.blockZ + 0.5,
            0.25, 0.35, 0.25, 8, 0.01)
        level.spawnParticles("minecraft:end_rod", false,
            bed.footX + 0.5, bed.footY + 1.15, bed.footZ + 0.5,
            0.25, 0.35, 0.25, 8, 0.01)
    }
}

// 将床位列表序列化为字符串存入persistentData
// 格式：hx,hy,hz,fx,fy,fz,yaw,used,ownerUuid|...
function pfSerializeBeds(beds) {
    if (beds.length === 0) return ""
    let parts = []
    for (let i = 0; i < beds.length; i++) {
        let b = beds[i]
        parts.push(b.blockX + "," + b.blockY + "," + b.blockZ + "," +
            b.footX + "," + b.footY + "," + b.footZ + "," + b.yaw + "," +
            (b.used ? 1 : 0) + "," + (b.ownerUuid || ""))
    }
    return parts.join(";")
}

// 将字符串反序列化为床位列表
function pfParseBeds(str) {
    let beds = []
    let s = "" + str
    if (!s || s.length === 0) return beds
    let parts = s.split(";")
    for (let i = 0; i < parts.length; i++) {
        let fields = parts[i].split(",")
        if (fields.length < 4) continue
        let bx = (fields[0] | 0)
        let by = (fields[1] | 0)
        let bz = (fields[2] | 0)
        let yaw = (fields.length >= 7 ? fields[6] : fields[3]) | 0
        let fx = fields.length >= 7 ? (fields[3] | 0) : bx
        let fy = fields.length >= 7 ? (fields[4] | 0) : by
        let fz = fields.length >= 7 ? (fields[5] | 0) : bz + 1
        let used = fields.length >= 8 && (fields[7] | 0) === 1
        let ownerUuid = fields.length >= 9 ? fields[8] : ""
        beds.push({ blockX: bx, blockY: by, blockZ: bz, footX: fx, footY: fy, footZ: fz,
            yaw: yaw, used: used, ownerUuid: ownerUuid, x: bx + 0.5, z: bz + 0.5 })
    }
    return beds
}

function pfReleaseBed(level, bedKey, ownerUuid) {
    let manager = global.pfShopManager
    if (!manager || typeof manager.pfShopReleaseBed !== "function") return
    manager.pfShopReleaseBed(level, bedKey, ownerUuid)
}

// 查找指定床对应的睡眠实体。
// 优先使用实体保存的床位坐标，避免相邻床位的检测范围互相误判；
// 对没有完整床位NBT的旧实体，仅按实体实际位置做窄范围兼容检测。
function pfFindBedOccupant(level, bed, selfEnt) {
    let bedArea = new AABB.of(bed.blockX - 1, bed.blockY, bed.blockZ - 1,
        bed.blockX + 1, bed.blockY + 1, bed.blockZ + 1)
    let nearbyEnts = level.getEntitiesWithin(bedArea)
    let bedKey = pfBedKey(bed)
    for (let e = 0; e < nearbyEnts.length; e++) {
        let other = nearbyEnts[e]
        if (other === selfEnt) continue
        if (other.persistentData.getInt("pfPhase") !== 3) continue

        try {
            let otherBed = global.pfEntityData.pfGetBedInfo(other)
            if (pfBedKey(otherBed) === bedKey) return other
        } catch (e) {
            // 旧实体可能没有可读取的床位信息，继续按实际位置兼容检测。
        }

        // 不能把床位周围的任意 phase=3 实体算到当前床，
        // 否则相邻床位会互相误判。旧实体必须实际位于当前床中心附近。
        let dx = other.getX() - (bed.blockX + 0.5)
        let dz = other.getZ() - (bed.blockZ + 0.5)
        if (dx * dx + dz * dz <= 0.75 * 0.75) return other
    }
    return null
}

// 检查指定床是否被占用（pfPhase=3 的实体在床附近）
function pfIsBedOccupied(level, bed, selfEnt) {
    return pfFindBedOccupant(level, bed, selfEnt) !== null
}

// 导出到全局
global.pfBedManager = {
    pfScanBedsAlongRoute: pfScanBedsAlongRoute,
    pfMergeBeds: pfMergeBeds,
    pfBedKey: pfBedKey,
    pfHighlightBeds: pfHighlightBeds,
    pfSerializeBeds: pfSerializeBeds,
    pfParseBeds: pfParseBeds,
    pfIsBedIntact: pfIsBedIntact,
    pfFindBedOccupant: pfFindBedOccupant,
    pfIsBedOccupied: pfIsBedOccupied,
    pfReleaseBed: pfReleaseBed
}
