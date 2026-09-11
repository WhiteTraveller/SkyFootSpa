// priority: 10
// ============================================================
// 方块事件处理模块
//
// 开店方块配置界面交接说明：
// 1. 普通右键继续执行原有开店/关店、预约凭证和 Boss 触发逻辑。
// 2. Shift+右键只打开配置界面，不得进入开店/关店流程。
// 3. 当前界面文件为 apricity/kubejs/pathfinder_config.html，资源路径传给
//    ApricityUI 时使用 "kubejs/pathfinder_config.html"。
// 4. ApricityUI-forge 1.2.2-hotfix1 的服务端打开方式是：
//    ApricityUI.menu(player, path).bind(null)
//    不要改回 openScreen(player, path, null)，该重载不存在。
// 5. 当前界面只是视觉上的 9x3 箱子布局，没有真实物品槽位。
//    后续若接入背包整理或配置功能，应通过独立 NetworkEvents 数据事件通信。
// ============================================================

BlockEvents.rightClicked("kubejs:pathfinder_block", event => {
    console.log("[PF] 右键触发方块")
    if (event.hand != "main_hand") return

    let player = event.player
    let blockPos = event.block.pos
    let level = event.level

    // Shift+右键只打开配置界面，不触发开店/关店流程。
    if (player.isCrouching()) {
        let ApricityUIPathfinder = Java.loadClass("com.sighs.apricityui.ApricityUI")
        // ApricityUI 1.2.2-hotfix1 的服务端 Screen API 使用 menu(...).bind(...)
        ApricityUIPathfinder.menu(player, "kubejs/pathfinder_config.html").bind(null)
        event.cancel()
        console.log("[PF] 打开开店方块配置界面")
        return
    }
    let teachingStage = global.aTip && typeof global.aTip.getStage === 'function'
        ? global.aTip.getStage(player)
        : ""
    let openShopTeaching = teachingStage === "wait_pathfinder_click"
    let voucherTeaching = teachingStage === "wait_voucher_click"

    // 预约凭证检测：手持 voucher_* 时走凭证分支（无视昼夜）
    let voucherCategory = null
    let mainHand = player.getMainHandItem()
    let mainHandId = mainHand && mainHand.id ? '' + mainHand.id : ''
    if (mainHandId.indexOf('marguerite:voucher_') === 0) {
        voucherCategory = mainHandId.replace('marguerite:voucher_', '')
    }

    // Boss 触发检测：手持 boss triggerItem 时走 boss 分支
    let bossDef = null
    if (!voucherCategory && mainHandId && global.bossRegister && global.bossRegister.byTriggerItem) {
        bossDef = global.bossRegister.byTriggerItem[mainHandId] || null
    }

    // 非 voucher / boss 模式下，已开店则手动关店
    // 状态持久化在被点击方块自身的 BlockEntity NBT 中
    if (!bossDef && !voucherCategory) {
        let be = level.getBlockEntity(blockPos)
        if (be && global.pfShopManager.pfShopGetIsOpen(be)) {
            global.pfShopManager.pfCloseShop(level, be, "手动关店")
            return
        }
    }

    // 白天检测（boss/开店需白天；voucher 绕过）
    if (!voucherCategory && !global.pfShopManager.pfIsDaytime(level)) {
        player.tell("§c🌙 现在是晚上，无法" + (bossDef ? "召唤 Boss" : "开店") + "！请等到白天")
        if (openShopTeaching && global.aTip && typeof global.aTip.showNightClose === 'function') {
            global.aTip.showNightClose(player)
        }
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
                // 蓝色地毯已取消路径与排队功能，视为不可通行。
                pfMap[idx] = -1
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

    // 按路径顺序扫描合法床位；第一张床所在的路径地毯作为固定排队区。
    let routeBeds = global.pfBedManager.pfScanBedsAlongRoute(
        level, result[0], baseX + 0.5, baseY, baseZ + 0.5)
    if (routeBeds.length === 0) {
        player.tell("§c至少得有一张符合规则的床")
        return
    }
    let queuePos = {
        x: routeBeds[0].queueX,
        z: routeBeds[0].queueZ
    }
    // 如果第一张床紧邻寻路触发器，不使用触发器所在格，改用路径上的第一块地毯。
    if (queuePos.x === baseX + 0.5 && queuePos.z === baseZ + 0.5 && result[0].length > 0) {
        let firstDirection = result[0].charAt(0)
        let firstX = baseX
        let firstZ = baseZ
        if (firstDirection === 'N') firstZ -= 1
        else if (firstDirection === 'S') firstZ += 1
        else if (firstDirection === 'E') firstX += 1
        else if (firstDirection === 'W') firstX -= 1
        queuePos = { x: firstX + 0.5, z: firstZ + 0.5 }
    }
    console.log("[PF] 固定排队区位置: (" + queuePos.x + "," + queuePos.z + ")")

    // Voucher 分支：消耗凭证，立即生成指定类别顾客，不改变 shop 状态
    if (voucherCategory) {
        if (!global.pfVoucherManager || typeof global.pfVoucherManager.pfSpawnVoucherCustomer !== 'function') {
            player.tell("§c[预约] 管理模块未加载！")
            return
        }
        if (!player.isCreative() && mainHand && mainHand.getCount() > 0) {
            mainHand.setCount(mainHand.getCount() - 1)
        }
        global.pfVoucherManager.pfSpawnVoucherCustomer(player, level, baseX, baseY, baseZ, result[0], queuePos, voucherCategory)
        if (voucherTeaching && global.aTip && typeof global.aTip.advance === 'function') {
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
            global.pfBossManager.pfSpawnBossOnRoute(player, level, baseX, baseY, baseZ, result[0], queuePos, bossDef)
        } else {
            player.tell("§c[Boss] 管理模块未加载！")
        }
        return
    }

    // 开店：保存路线数据，启动定时生成顾客
    global.pfShopManager.pfOpenShop(player, level, baseX, baseY, baseZ, result[0], queuePos)
    if (openShopTeaching && global.aTip && typeof global.aTip.advance === 'function') {
        global.aTip.advance(player, "wait_pathfinder_click", "wait_voucher_click", "pathfinder_voucher_click_tip")
    }
})

console.log("[PF-BLOCK] 方块事件处理器已加载")
