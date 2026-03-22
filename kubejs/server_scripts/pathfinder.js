// ============================================================
// 寻路系统 - 参照 kubejstest/server_scripts/src/counter.js
// ============================================================

// 网格参数：以方块为中心，向四周延伸 GRID_HALF 格
let GRID_HALF = 10
let GRID_W = GRID_HALF * 2 + 1  // 49

/**
 * 将世界坐标转换为网格数字索引
 * @param {$BlockPos_} base  触发方块坐标
 * @param {$BlockPos_} target 目标坐标
 * @returns {number}
 */
function pfPos2num(base, target) {
    let bx = base.getX() | 0
    let bz = base.getZ() | 0
    let tx = target.getX() | 0
    let tz = target.getZ() | 0
    return (tx - (bx - GRID_HALF)) + (tz - (bz - GRID_HALF)) * GRID_W
}

/**
 * 从数字坐标按 NSWE 方向移动一格
 * @param {number} pos
 * @param {string} dir
 * @returns {number} 边界外返回 -1
 */
function pfPosmv(pos, dir) {
    let maxIdx = GRID_W * GRID_W - 1
    switch (dir) {
        case 'N': return (pos - GRID_W >= 0) ? (pos - GRID_W) : -1
        case 'S': return (pos + GRID_W <= maxIdx) ? (pos + GRID_W) : -1
        case 'W': return (pos % GRID_W !== 0) ? (pos - 1) : -1
        case 'E': return (pos % GRID_W !== GRID_W - 1) ? (pos + 1) : -1
    }
    return -1
}

let PF_DIRLIST = ['N', 'S', 'W', 'E']
let PF_OPPODIRLIST = ['S', 'N', 'E', 'W']

/**
 * 广度优先搜索（与 counter.js 逻辑完全一致）
 * @param {number} start    起点数字索引
 * @param {Set}    finish   终点数字索引集合
 * @param {Array}  map      地图数组：0=可走, -1=不可走
 * @param {Array}  routes   已有路径列表（用于避让，此处传空数组即可）
 * @returns {Array|number}  [路径字符串, 终点索引] 或 -1（无法到达）
 */
function pfBfs(start, finish, map, routes) {
    let visitmark = []
    let bfsqueue = []
    bfsqueue.push([start, 0])
    visitmark[start] = -1
    let now = []
    while (bfsqueue.length > 0) {
        now = bfsqueue.shift()
        if (finish.has(now[0])) break
        for (let i = 0; i < 4; i++) {
            let target = pfPosmv(now[0], PF_DIRLIST[i])
            if (target === -1) continue
            if (visitmark[target] !== undefined) continue
            if (map[target] === -1) continue
            // 避让逻辑（与原代码保持一致）
            let invalidflag = false
            for (let j = 0; j < routes.length; j++) {
                if (routes[j][now[1] + 1] === target ||
                    routes[j][now[1]] === target ||
                    routes[j][now[1] - 1] === target) {
                    invalidflag = true
                    break
                }
            }
            if (invalidflag) continue
            bfsqueue.push([target, now[1] + 1])
            visitmark[target] = i
        }
    }
    if (!finish.has(now[0])) return -1
    let end = now[0]
    let str = ""
    while (end !== start) {
        str = PF_DIRLIST[visitmark[end]] + str
        end = pfPosmv(end, PF_OPPODIRLIST[visitmark[end]])
    }
    return [str, now[0]]
}

// 可生成的实体类型列表（与 counter.js 保持一致）
let PF_ENTITY_TYPES = [
    "minecraft:husk",
    "minecraft:drowned",
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:stray",
]

// ============================================================
// BlockEntity Tick：每tick执行移动，每10tick推进时间轴
// pfPhase: 2=行走中, 3=躺床中, 4=等待床位中(已禁用), 5=蓝色地毯等待中
// ============================================================

// 路径生成时扫描路径每一格旁边（1格内）的所有床，返回床位列表
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
        // 检查当前格周围2格范围内是否有床（覆盖床头在第2格的情况）
        let checkR = 2
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
                break  // 找到床后跳出dy循环
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
    let bedArea = new AABB.of(bed.blockX - 1.5, bed.blockY, bed.blockZ - 1.5,
        bed.blockX + 1.5, bed.blockY + 1.5, bed.blockZ + 1.5)
    let nearbyEnts = level.getEntitiesWithin(bedArea)
    for (let e = 0; e < nearbyEnts.length; e++) {
        let other = nearbyEnts[e]
        if (other === selfEnt) continue
        if (other.persistentData.getInt("pfPhase") === 3) return true
    }
    return false
}


/**
 * 寻路系统每 tick 驱动入口，由 pathfinder_block 方块实体调用
 * @param {$BlockEntity_} entity  触发方块的方块实体对象
 */
global.pathfinderTick = function (entity) {
    let level = entity.getLevel()
    let pos = entity.getBlockPos()
    let currentTick = level.getServer().getTickCount()

    // 收集所有正在寻路的实体（扩大搜索范围到整个网格）
    let searchRange = new AABB.of(
        pos.getX() - GRID_HALF - 5, pos.getY() - 5, pos.getZ() - GRID_HALF - 5,
        pos.getX() + GRID_HALF + 5, pos.getY() + 10, pos.getZ() + GRID_HALF + 5
    )
    let allEntities = level.getEntitiesWithin(searchRange)
    let walkers = []      // pfPhase=2 行走中
    let sleepers = []     // pfPhase=3 躺床中
    let waiters = []      // pfPhase=4 等待床位中
    let blueWaiters = []  // pfPhase=5 蓝色地毯等待中
    for (let i = 0; i < allEntities.length; i++) {
        let ent = allEntities[i]
        let phase = ent.persistentData.getInt("pfPhase")
        if (phase === 2) {
            walkers.push(ent)
        } else if (phase === 3) {
            sleepers.push(ent)
        } else if (phase === 4) {
            waiters.push(ent)
        } else if (phase === 5) {
            blueWaiters.push(ent)
        }
    }

    // ---- 处理等待床位中的实体（pfPhase=4，普通床位等待，现已禁用，只使用蓝色地毯机制）----
    // 注意：普通行走时的床位等待已禁用，只保留蓝色地毯等待机制（pfPhase=5）

    // ---- 处理蓝色地毯等待中的实体 ----
    for (let i = 0; i < blueWaiters.length; i++) {
        let ent = blueWaiters[i]

        // 防止重复处理
        let lastTick = (ent.persistentData.getInt("pfLastTick") | 0)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        ent.persistentData.putInt("pfLastTick", currTick)

        // 检查是否已经上过床，只上床一次
        let hasSlept = (ent.persistentData.getInt("pfHasSlept") | 0)
        if (hasSlept === 1) {
            // 已经上过床，继续行走
            ent.persistentData.putInt("pfPhase", 2)
            console.log("[PF] 蓝色地毯等待：已上过床，继续行走")
            continue
        }

        // 获取当前路径进度
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let routeStr = "" + ent.persistentData.getString("pfRoute")
        let routeChars = routeStr.split('')
        let routeLen = routeChars.length

        // 从预扫描的床位列表中，查找当前进度之后的床位（后面的路径旁）
        let bedListStr = "" + ent.persistentData.getString("pfBedList")
        let allBeds = pfParseBeds(bedListStr)

        // 计算当前位置
        let ox = ent.persistentData.getFloat("pfOriginX")
        let oz = ent.persistentData.getFloat("pfOriginZ")
        let cx = ox, cz = oz
        for (let k = 0; k < time; k++) {
            let d = routeChars[k]
            if (d === 'N') cz -= 1
            else if (d === 'S') cz += 1
            else if (d === 'E') cx += 1
            else if (d === 'W') cx -= 1
        }

        // 查找后面路径旁的空床
        let foundEmptyBed = null
        for (let b = 0; b < allBeds.length; b++) {
            let bed = allBeds[b]
            // 检查床是否在"后面"（距离当前位置有一定距离，且在路径上）
            let dx = bed.x - cx
            let dz = bed.z - cz
            let dist = Math.sqrt(dx * dx + dz * dz)
            // 床在当前位置前方（距离2~10格）且未被占用
            if (dist >= 2 && dist <= 10 && !pfIsBedOccupied(level, bed, ent)) {
                foundEmptyBed = bed
                break
            }
        }

        if (foundEmptyBed !== null) {
            // 有空床，直接去躺
            let bedPos = foundEmptyBed
            let entY = ent.getY()

            ent.persistentData.putFloat("pfBeforeSleepX", cx)
            ent.persistentData.putFloat("pfBeforeSleepY", entY)
            ent.persistentData.putFloat("pfBeforeSleepZ", cz)
            ent.persistentData.putInt("pfSleepStartTick", currTick)
            ent.persistentData.putInt("pfHasSlept", 1)
            ent.persistentData.putInt("pfPhase", 3)
            ent.persistentData.putInt("pfBedX", bedPos.blockX)
            ent.persistentData.putInt("pfBedY", bedPos.blockY)
            ent.persistentData.putInt("pfBedZ", bedPos.blockZ)
            ent.persistentData.putInt("pfBedYaw", bedPos.yaw)
            // 标记这是从蓝色地毯等待后去躺床，下床时需要找红色地毯
            ent.persistentData.putInt("pfFromBlueWait", 1)
            ent.setPositionAndRotation(bedPos.x, bedPos.blockY + 0.2, bedPos.z, bedPos.yaw, 0)
            console.log("[PF-SLEEP] 蓝色地毯等待后躺床: bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ")")
        }
        // 否则继续等待
    }

    // ---- 处理躺床中的实体 ----
    for (let i = 0; i < sleepers.length; i++) {
        let ent = sleepers[i]

        // 防止重复处理
        let lastTick = (ent.persistentData.getInt("pfLastTick") | 0)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        ent.persistentData.putInt("pfLastTick", currTick)

        let sleepStart = (ent.persistentData.getInt("pfSleepStartTick") | 0)
        let sleepDuration = currTick - sleepStart

        console.log("[PF-SLEEP] duration=" + sleepDuration + " sleepStart=" + sleepStart + " currTick=" + currTick)

        // 确保至少睡了1tick才开始计时
        if (sleepStart <= 0 || sleepDuration < 1) {
            console.log("[PF-SLEEP] 跳过: sleepStart=" + sleepStart + " duration=" + sleepDuration)
            continue
        }

        // 超时保护：如果睡了超过200tick（10秒）还没起床，强制清除
        if (sleepDuration > 200) {
            let server = level.getServer()
            let uuid = "" + ent.getUuid()
            console.log("[PF-SLEEP] 超时强制清除 uuid=" + uuid)
            ent.stopSleeping()
            server.runCommandSilent("data remove entity " + uuid + " SleepingX")
            server.runCommandSilent("data remove entity " + uuid + " SleepingY")
            server.runCommandSilent("data remove entity " + uuid + " SleepingZ")
            ent.persistentData.putInt("pfSleepStartTick", 0)
            ent.persistentData.putInt("pfClearSleepTick", 10)
            ent.persistentData.putInt("pfPhase", 2)
            continue
        }

        // 躺下后每tick：设置睡觉姿势NBT和保持朝向
        if (sleepDuration >= 1 && sleepDuration < 60) {
            let server = level.getServer()
            let bedX = ent.persistentData.getInt("pfBedX")
            let bedY = ent.persistentData.getInt("pfBedY")
            let bedZ = ent.persistentData.getInt("pfBedZ")
            let bedYaw = ent.persistentData.getInt("pfBedYaw")
            // 每tick都设置睡觉姿势NBT和朝向，强制保持躺姿
            let uuid = "" + ent.getUuid()
            let cmd = "data merge entity " + uuid + " {SleepingX:" + bedX + ",SleepingY:" + bedY + ",SleepingZ:" + bedZ + "}"
            if (sleepDuration == 1) {
                console.log("[PF-SLEEP] 设置躺姿 uuid=" + uuid + " bedPos=(" + bedX + "," + bedY + "," + bedZ + ") yaw=" + bedYaw)
            }
            server.runCommandSilent(cmd)
            // 保持朝向和位置
            ent.setYaw(bedYaw)
        }

        // 3秒 = 60 tick 后离开床
        if (sleepDuration >= 60 && sleepDuration <= 65) {
            let uuid = "" + ent.getUuid()
            if (sleepDuration == 60) {
                console.log("[PF-SLEEP] 移除躺姿 uuid=" + uuid)
            }

            // 直接调用 stopSleeping() 方法，正确清除游戏内部睡眠状态
            ent.stopSleeping()

            // 同时用命令移除NBT（双重保险）
            let server = level.getServer()
            server.runCommandSilent("data remove entity " + uuid + " SleepingX")
            server.runCommandSilent("data remove entity " + uuid + " SleepingY")
            server.runCommandSilent("data remove entity " + uuid + " SleepingZ")

            // 第60tick时：重置状态并恢复位置
            if (sleepDuration == 60) {
                // 检查是否是从蓝色地毯等待后去躺床的
                let fromBlueWait = (ent.persistentData.getInt("pfFromBlueWait") | 0)
                let bsx, bsy, bsz

                if (fromBlueWait === 1) {
                    // 从蓝色地毯等待后躺床，需要在床位紧挨的红色地毯下床
                    let bedX = ent.persistentData.getInt("pfBedX")
                    let bedY = ent.persistentData.getInt("pfBedY")
                    let bedZ = ent.persistentData.getInt("pfBedZ")

                    // 查找床位周围2格范围内的红色地毯（包括床头和可能的床尾位置）
                    let redCarpetPos = null
                    for (let dx = -2; dx <= 2 && redCarpetPos === null; dx++) {
                        for (let dz = -2; dz <= 2 && redCarpetPos === null; dz++) {
                            if (dx === 0 && dz === 0) continue
                            let checkX = bedX + dx
                            let checkZ = bedZ + dz
                            let checkBlock = level.getBlock(checkX, bedY, checkZ)
                            if (checkBlock.id == "minecraft:red_carpet") {
                                redCarpetPos = { x: checkX + 0.5, z: checkZ + 0.5 }
                            }
                        }
                    }

                    if (redCarpetPos !== null) {
                        bsx = redCarpetPos.x
                        bsy = bedY
                        bsz = redCarpetPos.z
                        console.log("[PF-SLEEP] 从蓝色地毯等待后下床，定位到红色地毯: (" + bsx.toFixed(1) + "," + bsz.toFixed(1) + ")")
                    } else {
                        // 没找到红色地毯，使用原位置
                        bsx = ent.persistentData.getFloat("pfBeforeSleepX")
                        bsy = ent.persistentData.getFloat("pfBeforeSleepY")
                        bsz = ent.persistentData.getFloat("pfBeforeSleepZ")
                        console.log("[PF-SLEEP] 未找到床位旁红色地毯，使用原位置")
                    }
                    // 清除标记
                    ent.persistentData.putInt("pfFromBlueWait", 0)
                } else {
                    // 普通情况：恢复到躺床前的位置
                    bsx = ent.persistentData.getFloat("pfBeforeSleepX")
                    bsy = ent.persistentData.getFloat("pfBeforeSleepY")
                    bsz = ent.persistentData.getFloat("pfBeforeSleepZ")
                }

                ent.persistentData.putInt("pfSleepStartTick", 0)
                ent.persistentData.putInt("pfClearSleepTick", 10)
                ent.setPositionAndRotation(bsx, bsy, bsz, 0, 0)
                ent.persistentData.putInt("pfPhase", 2)

                // 根据下床位置更新 pfTime，确保实体从正确的路径位置继续行走
                let routeStr = "" + ent.persistentData.getString("pfRoute")
                let routeChars = routeStr.split('')
                let ox = ent.persistentData.getFloat("pfOriginX")
                let oz = ent.persistentData.getFloat("pfOriginZ")
                // 找到最接近下床位置的路径点
                let bestTime = 0
                let bestDist = 9999
                for (let t = 0; t <= routeChars.length; t++) {
                    let px = ox, pz = oz
                    for (let k = 0; k < t; k++) {
                        let d = routeChars[k]
                        if (d === 'N') pz -= 1
                        else if (d === 'S') pz += 1
                        else if (d === 'E') px += 1
                        else if (d === 'W') px -= 1
                    }
                    let dist = Math.sqrt((px - bsx) * (px - bsx) + (pz - bsz) * (pz - bsz))
                    if (dist < bestDist) {
                        bestDist = dist
                        bestTime = t
                    }
                }
                ent.persistentData.putInt("pfTime", bestTime)
                ent.persistentData.putInt("pfSubStep", 0)
                console.log("[PF-SLEEP] 离开床，继续行走 at (" + bsx.toFixed(1) + "," + bsz.toFixed(1) + ") 更新路径进度 time=" + bestTime)
            }
        }
    }



    // ---- 每 tick：按路径移动，精确对齐格子中心 ----
    // pfTime = 已完成的整格数（每10tick+1）
    // pfSubStep = 当前格内子步（0~9，每tick+1）

    // 先计算每个实体的进度和位置，用于排队检测（包括行走、等待、睡眠中的实体）
    let walkerInfos = []
    for (let i = 0; i < walkers.length; i++) {
        let ent = walkers[i]
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let progress = time * 10 + sub
        walkerInfos.push({
            ent: ent,
            progress: progress,
            x: ent.getX(),
            z: ent.getZ()
        })
    }
    // 等待中的实体也加入排队检测（进度设为较大值，优先级高）
    for (let i = 0; i < waiters.length; i++) {
        let ent = waiters[i]
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let progress = time * 10 + sub
        walkerInfos.push({
            ent: ent,
            progress: progress,
            x: ent.getX(),
            z: ent.getZ()
        })
    }
    // 睡眠中的实体也加入（在床上的位置）
    for (let i = 0; i < sleepers.length; i++) {
        let ent = sleepers[i]
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let progress = time * 10 + sub
        walkerInfos.push({
            ent: ent,
            progress: progress,
            x: ent.getX(),
            z: ent.getZ()
        })
    }
    // 蓝色地毯等待中的实体也加入排队检测
    for (let i = 0; i < blueWaiters.length; i++) {
        let ent = blueWaiters[i]
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let progress = time * 10 + sub
        walkerInfos.push({
            ent: ent,
            progress: progress,
            x: ent.getX(),
            z: ent.getZ()
        })
    }

    for (let i = 0; i < walkers.length; i++) {
        let ent = walkers[i]

        // 防止多个方块实体重复处理同一实体：检查上次处理tick
        let lastTick = (ent.persistentData.getInt("pfLastTick") | 0)
        let currTick = (currentTick | 0)
        if (lastTick != 0 && lastTick == currTick) continue
        ent.persistentData.putInt("pfLastTick", currTick)

        let phase = ent.persistentData.getInt("pfPhase")
        if (phase !== 2) continue

        // 离床后持续清除残留的睡觉NBT（防止某些情况下NBT没有被正确移除）
        let clearTick = ent.persistentData.getInt("pfClearSleepTick")
        if (clearTick > 0) {
            let server = level.getServer()
            let uuid = "" + ent.getUuid()
            server.runCommandSilent("data remove entity " + uuid + " SleepingX")
            server.runCommandSilent("data remove entity " + uuid + " SleepingY")
            server.runCommandSilent("data remove entity " + uuid + " SleepingZ")
            ent.persistentData.putInt("pfClearSleepTick", clearTick - 1)
        }

        // 用 split('') 将路径字符串拆分为字符数组，避免 Rhino charCodeAt 问题
        let routeStr = "" + ent.persistentData.getString("pfRoute")
        let routeChars = routeStr.split('')
        let time = (ent.persistentData.getInt("pfTime") | 0)
        let sub = (ent.persistentData.getInt("pfSubStep") | 0)
        let routeLen = routeChars.length

        if (time < 0 || time >= routeLen || routeLen === 0) {
            continue
        }

        // 排队检测：检查是否有前方实体距离过近
        let myProgress = time * 10 + sub
        let myX = ent.getX()
        let myZ = ent.getZ()
        let myId = ent.getId()  // 实体唯一ID
        let shouldWait = false

        for (let j = 0; j < walkerInfos.length; j++) {
            let other = walkerInfos[j]
            if (other.ent === ent) continue  // 跳过自己

            // 计算距离
            let dx = other.x - myX
            let dz = other.z - myZ
            let dist = Math.sqrt(dx * dx + dz * dz)

            // 距离小于1.5时需要排队
            if (dist < 1.5) {
                // 进度更大的优先走
                if (other.progress > myProgress) {
                    shouldWait = true
                    break
                }
                // 进度相等时，用实体ID打破平局（ID较小的优先）
                if (other.progress == myProgress) {
                    let otherId = other.ent.getId()
                    if (otherId < myId) {
                        shouldWait = true
                        break
                    }
                }
            }
        }

        if (shouldWait) {
            continue  // 排队等待，不移动
        }

        let stepChar = routeChars[time]

        // 用 pfOriginX/Z 存储生成时的起始坐标，避免浮点漂移
        let ox = ent.persistentData.getFloat("pfOriginX")
        let oz = ent.persistentData.getFloat("pfOriginZ")

        // 计算从起点到当前格起点的偏移（用字符串比较）
        let cx = ox, cz = oz
        for (let k = 0; k < time; k++) {
            let d = routeChars[k]
            if (d === 'N') cz -= 1
            else if (d === 'S') cz += 1
            else if (d === 'E') cx += 1
            else if (d === 'W') cx -= 1
        }

        // 获取实体Y坐标（在床检测和移动中都需要）
        let entY = ent.getY()

        // 当前格内移动：从本格中心向下一格中心插值
        let t = sub / 10.0
        let nx = cx, nz = cz
        let yaw = 0
        if (stepChar === 'N') { nz = cz - t; yaw = 180 }
        else if (stepChar === 'S') { nz = cz + t; yaw = 0 }
        else if (stepChar === 'E') { nx = cx + t; yaw = -90 }
        else if (stepChar === 'W') { nx = cx - t; yaw = 90 }

        // 调试log：每格开始打印一次
        if (sub === 0) {
            console.log("[PF] t=" + time + "/" + routeLen + " d=" + stepChar + " pos=(" + cx.toFixed(1) + "," + cz.toFixed(1) + ")")

            // 检查是否到达蓝色地毯位置（优先使用保存的位置，防止地毯被打掉）
            let savedBlueX = ent.persistentData.getFloat("pfBlueCarpetX")
            let savedBlueZ = ent.persistentData.getFloat("pfBlueCarpetZ")
            let dx = cx - savedBlueX
            let dz = cz - savedBlueZ
            let distToBlue = Math.sqrt(dx * dx + dz * dz)

            // 距离保存的蓝色地毯位置小于0.5格即认为到达（或当前格确实是蓝色地毯）
            let blockX = Math.floor(cx)
            let blockZ = Math.floor(cz)
            let currentBlock = level.getBlock(blockX, entY, blockZ)
            let isBlueCarpet = (currentBlock.id == "minecraft:blue_carpet") || (distToBlue < 0.5)

            if (isBlueCarpet) {
                // 检查是否已经上过床，上过床的实体不再进入蓝色地毯等待
                let hasSlept = (ent.persistentData.getInt("pfHasSlept") | 0)
                if (hasSlept === 1) {
                    console.log("[PF] 到达蓝色地毯但已上过床，继续行走")
                } else {
                    // 进入蓝色地毯等待状态
                    ent.persistentData.putFloat("pfWaitX", cx)
                    ent.persistentData.putFloat("pfWaitY", entY)
                    ent.persistentData.putFloat("pfWaitZ", cz)
                    ent.persistentData.putInt("pfPhase", 5)
                    console.log("[PF] 到达蓝色地毯，进入等待状态 pos=(" + cx.toFixed(1) + "," + cz.toFixed(1) + ")")
                    continue
                }
            }

            // 注意：普通行走时不再自动上床，只通过蓝色地毯机制触发上床
        }

        ent.setPositionAndRotation(nx, entY, nz, yaw, 0)

        // 子步+1，满10则归零并推进格数
        let newSub = sub + 1
        if (newSub >= 10) {
            ent.persistentData.putInt("pfSubStep", 0)
            let newTime = time + 1
            if (newTime >= routeLen) {
                // 到达终点：对齐最后一格中心后消失
                let fx = cx, fz = cz
                if (stepChar === 'N') fz -= 1
                else if (stepChar === 'S') fz += 1
                else if (stepChar === 'E') fx += 1
                else if (stepChar === 'W') fx -= 1
                ent.setPositionAndRotation(fx, entY, fz, yaw, 0)
                level.spawnParticles("minecraft:poof", false, fx, entY + 1, fz, 0.5, 1, 0.5, 50, 0)
                console.log("[PF] FINISH at (" + fx.toFixed(1) + "," + fz.toFixed(1) + ")")
                ent.discard()
            } else {
                ent.persistentData.putInt("pfTime", newTime)
            }
        } else {
            ent.persistentData.putInt("pfSubStep", newSub)
        }
    }
}

// ============================================================
// 右键触发方块 → 扫描地图 → BFS → 生成实体
// ============================================================
BlockEvents.rightClicked("kubejs:pathfinder_block", event => {
    // 只响应主手右键
    if (event.hand != "main_hand") return

    let player = event.player
    let blockPos = event.block.pos
    let level = event.level

    // 将 Java BlockPos 坐标转为 JS 原生数字，避免 Rhino 引擎类型混淆
    let baseX = blockPos.getX() | 0
    let baseY = blockPos.getY() | 0
    let baseZ = blockPos.getZ() | 0

    // 扫描区域，红地毯=可走(0)，黄地毯=终点候选(0)，其他=-1
    let pfMap = []
    let finishSet = new Set()
    let block = level.getBlock(baseX, baseY, baseZ)
    for (let dx = -GRID_HALF; dx <= GRID_HALF; dx = dx + 1) {
        for (let dz = -GRID_HALF; dz <= GRID_HALF; dz = dz + 1) {
            let wx = baseX + dx
            let wz = baseZ + dz
            block = level.getBlock(wx, baseY, wz)
            let idx = (wx - (baseX - GRID_HALF)) + (wz - (baseZ - GRID_HALF)) * GRID_W
            if (block.id == "minecraft:red_carpet") {
                pfMap[idx] = 0
            } else if (block.id == "minecraft:blue_carpet") {
                pfMap[idx] = 0  // 蓝色地毯可走，作为等待点
            } else if (block.id == "minecraft:yellow_carpet") {
                pfMap[idx] = 0
                finishSet.add(idx)
            } else {
                pfMap[idx] = -1
            }
        }
    }

    // 起点：方块本身对应的网格索引
    let startIdx = GRID_HALF + GRID_HALF * GRID_W

    if (finishSet.size === 0) {
        player.setStatusMessage("§c范围内未找到黄色地毯（终点）！")
        return
    }

    let result = pfBfs(startIdx, finishSet, pfMap, [])
    if (result === -1) {
        player.setStatusMessage("§c无法到达终点，请检查红地毯是否连通到黄色地毯！")
        return
    }
    console.log("[PF] 路径=" + result[0] + " 长度=" + result[0].length)

    // 检测路径中是否存在蓝色地毯
    let routeChars = result[0].split('')
    let blueCarpetPos = null
    let cx = baseX, cz = baseZ
    for (let i = 0; i <= routeChars.length; i++) {
        let block = level.getBlock(cx, baseY, cz)
        if (block.id == "minecraft:blue_carpet") {
            blueCarpetPos = { x: cx + 0.5, z: cz + 0.5 }
            console.log("[PF] 找到蓝色地毯位置: (" + cx + "," + cz + ")")
            break
        }
        if (i < routeChars.length) {
            let d = routeChars[i]
            if (d === 'N') cz -= 1
            else if (d === 'S') cz += 1
            else if (d === 'E') cx += 1
            else if (d === 'W') cx -= 1
        }
    }

    if (blueCarpetPos === null) {
        player.setStatusMessage("§c路径中未找到蓝色地毯！")
        return
    }

    // 生成随机怪物
    let entityType = PF_ENTITY_TYPES[Math.floor(Math.random() * PF_ENTITY_TYPES.length)]
    let walker = level.createEntity(entityType)
    let spawnX = baseX + 0.5
    let spawnZ = baseZ + 0.5

    // 设置位置和NBT
    walker.setPositionAndRotation(spawnX, baseY, spawnZ, 0, 0)
    walker.setNoAi(true)
    walker.mergeNbt(`{NoAI:1b,Invulnerable:1b,PersistenceRequired:1b,NoGravity:1b,DeathLootTable:"entities/empty"}`)
    walker.spawn()

    // spawn后设置persistentData
    walker.persistentData.putFloat("pfOriginX", spawnX)
    walker.persistentData.putFloat("pfOriginZ", spawnZ)
    walker.persistentData.putString("pfRoute", result[0])
    walker.persistentData.putInt("pfPhase", 2)
    walker.persistentData.putInt("pfTime", 0)
    walker.persistentData.putInt("pfSubStep", 0)

    // 保存蓝色地毯位置（防止被打掉后丢失）
    walker.persistentData.putFloat("pfBlueCarpetX", blueCarpetPos.x)
    walker.persistentData.putFloat("pfBlueCarpetZ", blueCarpetPos.z)

    // 路径生成时预扫描路径上的所有床位，存入pfBedList
    let pathBeds = pfScanBedsAlongRoute(level, result[0], spawnX, baseY, spawnZ)
    walker.persistentData.putString("pfBedList", pfSerializeBeds(pathBeds))
    console.log("[PF] 预扫描床位数量=" + pathBeds.length)

    level.spawnParticles("minecraft:poof", false, spawnX, baseY + 1, spawnZ, 0.5, 1, 0.5, 50, 0)
    player.setStatusMessage("§a寻路开始！路径长度：" + result[0].length + " 格")
})
