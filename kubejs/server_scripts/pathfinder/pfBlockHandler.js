// priority: 10
// ============================================================
// 方块事件处理模块
// 处理右键触发方块事件
// ============================================================

// 扫描地图并生成实体
BlockEvents.rightClicked("kubejs:pathfinder_block", event => {
    console.log("[PF] 右键触发方块")
    if (event.hand != "main_hand") return
    
    let player = event.player
    let blockPos = event.block.pos
    let level = event.level
    
    let baseX = blockPos.getX() | 0
    let baseY = blockPos.getY() | 0
    let baseZ = blockPos.getZ() | 0
    
    // 扫描区域
    let pfMap = []
    let finishSet = new Set()
    for (let dx = -global.pfConstants.GRID_HALF; dx <= global.pfConstants.GRID_HALF; dx++) {
        for (let dz = -global.pfConstants.GRID_HALF; dz <= global.pfConstants.GRID_HALF; dz++) {
            let wx = baseX + dx
            let wz = baseZ + dz
            let block = level.getBlock(wx, baseY, wz)
            let idx = (wx - (baseX - global.pfConstants.GRID_HALF)) + (wz - (baseZ - global.pfConstants.GRID_HALF)) * global.pfConstants.GRID_W
            if (block.id == "minecraft:red_carpet") {
                pfMap[idx] = 0
            } else if (block.id == "minecraft:blue_carpet") {
                pfMap[idx] = 0
            } else if (block.id == "minecraft:yellow_carpet") {
                pfMap[idx] = 0
                finishSet.add(idx)
            } else {
                pfMap[idx] = -1
            }
        }
    }
    
    let startIdx = global.pfConstants.GRID_HALF + global.pfConstants.GRID_HALF * global.pfConstants.GRID_W
    
    if (finishSet.size === 0) {
        player.setStatusMessage("§c范围内未找到黄色地毯（终点）！")
        return
    }
    
    let result = global.pfPathfinding.pfBfs(startIdx, finishSet, pfMap, [])
    if (result === -1) {
        player.setStatusMessage("§c无法到达终点，请检查红地毯是否连通到黄色地毯！")
        return
    }
    console.log("[PF] 路径=" + result[0] + " 长度=" + result[0].length)
    
    // 检测蓝色地毯
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
    
    // 生成实体
    global.pfEntitySpawner.pfSpawnWalker(level, baseX, baseY, baseZ, result[0], blueCarpetPos, player)
})

console.log("[PF-BLOCK] 方块事件处理器已加载")
