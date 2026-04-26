// priority: 10
// ============================================================
// 床位管理模块
// 床位扫描、序列化、占用检测
// ============================================================

// 路径生成时扫描路径每一格旁边的所有床
// 每个床位：{blockX, blockY, blockZ, yaw}
// facing属性指向床头方向，床头坐标即实体躺下位置
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

                // 计算床头坐标（facing指向床头方向）
                let headX = ax, headZ = az
                if (partProp === "foot") {
                    if (facingProp === "north") headZ = az - 1
                    else if (facingProp === "south") headZ = az + 1
                    else if (facingProp === "east") headX = ax + 1
                    else if (facingProp === "west") headX = ax - 1
                }

                // 去重
                let key = headX + "," + ay + "," + headZ
                if (foundHeads[key]) break
                foundHeads[key] = true

                // 计算躺床朝向（yaw）
                let yaw = 0
                if (facingProp === "south") yaw = 0
                else if (facingProp === "north") yaw = 180
                else if (facingProp === "west") yaw = 90
                else if (facingProp === "east") yaw = -90

                beds.push({ blockX: headX, blockY: ay, blockZ: headZ, yaw: yaw })
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

// 将床位列表序列化为字符串存入persistentData
// 格式：bx1,by1,bz1,yaw1;bx2,...
function pfSerializeBeds(beds) {
    if (beds.length === 0) return ""
    let parts = []
    for (let i = 0; i < beds.length; i++) {
        let b = beds[i]
        parts.push(b.blockX + "," + b.blockY + "," + b.blockZ + "," + b.yaw)
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
        let yaw = (fields[3] | 0)
        beds.push({ blockX: bx, blockY: by, blockZ: bz, yaw: yaw, x: bx + 0.5, z: bz + 0.5 })
    }
    return beds
}

// 检查指定床是否被占用（pfPhase=3 的实体在床附近）
function pfIsBedOccupied(level, bed, selfEnt) {
    let bedArea = new AABB.of(bed.blockX - 1, bed.blockY, bed.blockZ - 1,
        bed.blockX + 1, bed.blockY + 1, bed.blockZ + 1)
    let nearbyEnts = level.getEntitiesWithin(bedArea)
    for (let e = 0; e < nearbyEnts.length; e++) {
        let other = nearbyEnts[e]
        if (other === selfEnt) continue
        if (other.persistentData.getInt("pfPhase") === 3) return true
    }
    return false
}

// 导出到全局
global.pfBedManager = {
    pfScanBedsAlongRoute: pfScanBedsAlongRoute,
    pfSerializeBeds: pfSerializeBeds,
    pfParseBeds: pfParseBeds,
    pfIsBedOccupied: pfIsBedOccupied
}
