// priority: 10
// ============================================================
// 方块事件处理模块
//
// 开店方块配置界面交接说明：
// 1. 普通右键继续执行原有开店/关店、预约凭证和 Boss 触发逻辑。
// 2. Shift+右键只打开配置界面，不得进入开店/关店流程。
// 3. 界面文件为 apricity/kubejs/pathfinder_config.html，资源路径传给
//    ApricityUI 时使用 "kubejs/pathfinder_config.html"。
// 4. ApricityUI-forge 1.2.2-hotfix1 的服务端容器打开方式是：
//    ApricityUI.menu(player, path).bind(function(binding){ ... })
//    不要改回 openScreen(player, path, null)，该重载不存在。
// 5. 配置界面是真实容器 Screen：blockEntity(方块坐标,27) 绑定开店方块自身的
//    9x3 持久库存，player() 显示玩家背包，可双向点击/拖拽/shift-click 移动物品。
//    HTML 容器 id 必须为 block_entity / player，
//    与绑定方法一一对应，否则槽位退化成展示型（看得见点不动）。
// ============================================================

const PF_CONFIG_INVENTORY_SIZE = 27

BlockEvents.rightClicked("kubejs:pathfinder_block", event => {
    console.log("[PF] 右键触发方块")
    if (event.hand != "main_hand") return

    let player = event.player
    let blockPos = event.block.pos
    let level = event.level

    // Shift+右键只打开配置界面（真实容器 Screen），不触发开店/关店流程。
    if (player.isCrouching()) {
        let ApricityUIPathfinder = Java.loadClass("com.sighs.apricityui.ApricityUI")
        let cfgX = blockPos.getX() | 0
        let cfgY = blockPos.getY() | 0
        let cfgZ = blockPos.getZ() | 0

        // 容量契约：方块注册、服务端绑定和 HTML size 固定为 27 格。
        // 多名玩家打开同一方块时直接共享这个服务端 Container，由原版菜单同步槽位变化；
        // 不为每个玩家复制库存，避免并发关闭时互相覆盖。
        // 不要在 Rhino 脚本中调用 inventory.kjs$getSlots() 等 Java 内部接口：
        // KubeJS 会把 inventory 暴露成物品列表视图，调用这些方法会让右键事件直接报错。

        // 记住当前配置的方块上下文，供“稀客好感度”按钮读取（好感度按方块存储）
        try {
            player.persistentData.putInt('pfCfgX', cfgX)
            player.persistentData.putInt('pfCfgY', cfgY)
            player.persistentData.putInt('pfCfgZ', cfgZ)
            player.persistentData.putString('pfCfgDim', global.pfRareAffection.pfAffDimId(level))
        } catch (e) { console.log("[PF] 记录配置方块上下文失败: " + e) }
        // 服务端容器 API：menu(...).bind(fn) 立即解析数据源并打开真实容器 Screen。
        // blockEntity(blockPos, 27) → HTML 容器 id=block_entity（方块自身的 9x3 持久库存）；
        // player() → HTML 容器 id=player（玩家背包）。blockEntity 先绑定成为 primary，
        // 决定 shift-click 主方向（背包 <-> 配置库存）。
        ApricityUIPathfinder.menu(player, "kubejs/pathfinder_config.html").bind(function (binding) {
            binding.blockEntity(blockPos, PF_CONFIG_INVENTORY_SIZE).player()
        })
        event.cancel()
        console.log("[PF] 打开开店方块配置界面, 坐标=" + cfgX + "," + cfgY + "," + cfgZ)
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

    // 白天检测（boss/开店需白天；voucher 绕过；旧地狱维度 fixed_time 恒夜，无视昼夜）
    if (!voucherCategory && !global.pfShopManager.pfIsOldHell(level) && !global.pfShopManager.pfIsDaytime(level)) {
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
