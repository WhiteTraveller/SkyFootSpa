// priority: 10
// ============================================================
// 方块事件处理模块
// 处理右键触发方块事件
// ============================================================

// 扫描地图并开店/关店
BlockEvents.rightClicked("kubejs:pathfinder_block", event => {
    console.log("[PF] 右键触发方块")
    if (event.hand != "main_hand") return
    
    let player = event.player
    let blockPos = event.block.pos
    let level = event.level
    
    // ===== 预约凭证检测：手持 voucher_* 时走凭证分支（无视昼夜）=====
    let voucherCategory = null
    let mainHand = player.getMainHandItem()
    let mainHandId = mainHand && mainHand.id ? '' + mainHand.id : ''
    if (mainHandId.indexOf('marguerite:voucher_') === 0) {
        voucherCategory = mainHandId.replace('marguerite:voucher_', '')
    }
    
    // ===== Boss 触发检测：手持 boss triggerItem 时走 boss 分支 =====
    let bossDef = null
    if (!voucherCategory && mainHandId && global.bossRegister && global.bossRegister.byTriggerItem) {
        bossDef = global.bossRegister.byTriggerItem[mainHandId] || null
    }
    
    // 非 voucher / boss 模式下，已开店则手动关店
    if (!bossDef && !voucherCategory && global.pfShopState && global.pfShopState.isOpen) {
        global.pfShopManager.pfCloseShop(level, "手动关店")
        return
    }
    
    // 白天检测（boss/开店需白天；voucher 绕过）
    if (!voucherCategory && !global.pfShopManager.pfIsDaytime(level)) {
        player.tell("§c🌙 现在是晚上，无法" + (bossDef ? "召唤 Boss" : "开店") + "！请等到白天")
        return
    }
    
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
    
    // Voucher 分支：消耗凭证，立即生成指定类别顾客，不改变 shop 状态
    if (voucherCategory) {
        if (!global.pfVoucherManager || typeof global.pfVoucherManager.pfSpawnVoucherCustomer !== 'function') {
            player.tell('§c[预约] 管理模块未加载')
            return
        }
        if (!player.isCreative() && mainHand && mainHand.getCount() > 0) {
            mainHand.setCount(mainHand.getCount() - 1)
        }
        global.pfVoucherManager.pfSpawnVoucherCustomer(player, level, baseX, baseY, baseZ, result[0], blueCarpetPos, voucherCategory)
        if (global.aTip && typeof global.aTip.advance === 'function') {
            global.aTip.advance(player, "wait_voucher_click", "wait_soak_click", "pathfinder_water_soak_click_tip")
        }
        return
    }
    
    // Boss 分支：消耗触发物品，召唤 boss，不改变 shop 状态
    if (bossDef) {
        if (!player.isCreative() && mainHand && mainHand.getCount() > 0) {
            mainHand.setCount(mainHand.getCount() - 1)
        }
        if (global.pfBossManager && typeof global.pfBossManager.pfSpawnBossOnRoute === 'function') {
            global.pfBossManager.pfSpawnBossOnRoute(player, level, baseX, baseY, baseZ, result[0], blueCarpetPos, bossDef)
        } else {
            player.tell('§c[Boss] 管理模块未加载')
        }
        return
    }
    
    // 开店：保存路线数据，启动定时生成
    global.pfShopManager.pfOpenShop(player, level, baseX, baseY, baseZ, result[0], blueCarpetPos)
    if (global.aTip && typeof global.aTip.advance === 'function') {
        global.aTip.advance(player, "wait_pathfinder_click", "wait_voucher_click", "pathfinder_voucher_click_tip")
    }
})

console.log("[PF-BLOCK] 方块事件处理器已加载")
