// priority: 10
// ============================================================
// 开店管理模块
// 管理开店状态、定时生成顾客、关店清除
// ============================================================

// MC时间常量
let PF_DAY_END = 12000    // 白天结束（日落开始）
let PF_SPAWN_INTERVAL = 100  // 每100 tick（5秒）判定一次

// 全局开店状态
global.pfShopState = {
    isOpen: false,
    lastCheckTick: 0,
    player: null,       // 开店的玩家
    level: null,
    // 寻路预计算数据（开店时扫描一次）
    routeStr: '',
    baseX: 0,
    baseY: 0,
    baseZ: 0,
    blueCarpetPos: null,
    // 已生成的顾客UUID列表
    spawnedEntities: []
}

/**
 * 检查当前是否为白天
 * @param {$Level_} level 世界对象
 * @returns {boolean} true=白天, false=晚上
 */
function pfIsDaytime(level) {
    let dayTime = level.getDayTime() % 24000
    return dayTime >= 0 && dayTime < PF_DAY_END
}

/**
 * 开店：保存路线数据，开始定时生成
 * @param {$Player_} player 开店的玩家
 * @param {$Level_} level 世界对象
 * @param {number} baseX 寻路方块X
 * @param {number} baseY 寻路方块Y
 * @param {number} baseZ 寻路方块Z
 * @param {string} routeStr 路径字符串
 * @param {Object} blueCarpetPos 蓝色地毯位置 {x, z}
 */
function pfOpenShop(player, level, baseX, baseY, baseZ, routeStr, blueCarpetPos) {
    global.pfShopState.isOpen = true
    global.pfShopState.lastCheckTick = level.getServer().getTickCount()
    global.pfShopState.player = player
    global.pfShopState.level = level
    global.pfShopState.routeStr = routeStr
    global.pfShopState.baseX = baseX
    global.pfShopState.baseY = baseY
    global.pfShopState.baseZ = baseZ
    global.pfShopState.blueCarpetPos = blueCarpetPos
    global.pfShopState.spawnedEntities = []
    
    player.tell("§a☀ 开店成功！每5秒将判定是否有顾客光临")
    player.tell("§7日落后将自动关店，也可再次右键手动关店")
    console.log("[PF-SHOP] 开店 player=" + player.getName().getString())
}

/**
 * 关店：清除所有还在行走/等待的顾客
 * @param {$Level_} level 世界对象
 * @param {string} reason 关店原因
 */
function pfCloseShop(level, reason) {
    let removedCount = 0
    for (let i = 0; i < global.pfShopState.spawnedEntities.length; i++) {
        let uuid = global.pfShopState.spawnedEntities[i]
        try {
            let entity = level.getEntity(uuid)
            if (entity && entity.isAlive()) {
                let phase = global.pfEntityData.pfGetPhase(entity)
                // 只清除行走中(2)和等待中(5)的顾客，正在服务中(3)的保留
                if (phase === 2 || phase === 5) {
                    // 播放消失粒子
                    level.spawnParticles("minecraft:poof", false, entity.getX(), entity.getY() + 1, entity.getZ(), 0.5, 1, 0.5, 30, 0)
                    entity.kill()
                    removedCount++
                }
            }
        } catch (e) {
            console.log("[PF-SHOP] 清除实体失败: " + e)
        }
    }
    
    global.pfShopState.isOpen = false
    global.pfShopState.spawnedEntities = []
    
    if (global.pfShopState.player) {
        global.pfShopState.player.tell("§c🌙 " + reason + " §7清除了 " + removedCount + " 位等待中的顾客")
    }
    console.log("[PF-SHOP] 关店: " + reason + ", 清除" + removedCount + "个实体")
}

/**
 * 开店tick处理 - 由pfMain每tick调用
 * 每5秒判定一次是否生成顾客
 * @param {$Level_} level 世界对象
 * @param {number} currentTick 当前tick
 */
function pfShopTick(level, currentTick) {
    if (!global.pfShopState.isOpen) return
    
    // 检查间隔
    let elapsed = currentTick - global.pfShopState.lastCheckTick
    if (elapsed < PF_SPAWN_INTERVAL) return
    global.pfShopState.lastCheckTick = currentTick
    
    // 判定1: 是否为晚上
    if (!pfIsDaytime(level)) {
        pfCloseShop(level, "天黑了，自动关店！")
        return
    }
    
    // 判定2: 尝试生成顾客（传入玩家用于评价加权）
    let result = global.pfCustomerTypes.pfRollCustomer(global.pfShopState.player)
    if (result === null) {
        // 本轮未生成顾客
        return
    }
    
    // 命中！生成顾客
    console.log("[PF-SHOP] 抽中顾客类别: " + result.name + "(" + result.category + "), 模型: " + result.model)
    
    let state = global.pfShopState
    try {
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, state.baseX, state.baseY, state.baseZ,
            state.routeStr, state.blueCarpetPos, state.player, result.model
        )
        
        // 存储顾客类别到实体persistentData，结算时用于更新评价
        walker.persistentData.putString('pfCustomerCategory', result.category)
        
        // 记录UUID
        let uuid = "" + walker.getUuid()
        state.spawnedEntities.push(uuid)
        
        state.player.tell("§e⚡ " + result.name + "§e类顾客来了！")
    } catch (e) {
        console.log("[PF-SHOP] 生成顾客失败: " + e)
    }
}

// 导出到全局
global.pfShopManager = {
    pfIsDaytime: pfIsDaytime,
    pfOpenShop: pfOpenShop,
    pfCloseShop: pfCloseShop,
    pfShopTick: pfShopTick
}

console.log("[PF-SHOP] 开店管理模块已加载")
