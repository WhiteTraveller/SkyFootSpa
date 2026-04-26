// priority: 10
// ============================================================
// 实体生成模块
// 生成女仆实体并初始化数据
// ============================================================

// 生成寻路实体
function pfSpawnWalker(level, baseX, baseY, baseZ, routeStr, blueCarpetPos, player) {
    let walker = level.createEntity(global.pfConstants.PF_ENTITY_TYPE)
    let spawnX = baseX + 0.5
    let spawnZ = baseZ + 0.5
    
    // 设置位置和基础NBT
    walker.setPositionAndRotation(spawnX, baseY, spawnZ, 0, 0)
    walker.setNoAi(true)
    
    // 随机选择模型
    let randomModel = global.getRandomMaidModel ? global.getRandomMaidModel() : "touhou_little_maid:hakurei_reimu"
    console.log("[PF] 生成女仆，随机模型: " + randomModel)
    
    // 设置NBT
    walker.mergeNbt({
        NoAI: 1,
        Invulnerable: 1,
        PersistenceRequired: 1,
        NoGravity: 1,
        DeathLootTable: "entities/empty",
        ModelId: randomModel
    })
    walker.spawn()
    
    // 初始化persistentData
    global.pfEntityData.pfSetOrigin(walker, spawnX, spawnZ)
    global.pfEntityData.pfSetRoute(walker, routeStr)
    global.pfEntityData.pfSetPhase(walker, 2)
    global.pfEntityData.pfSetTime(walker, 0)
    global.pfEntityData.pfSetSubStep(walker, 0)
    
    // 保存蓝色地毯位置
    global.pfEntityData.pfSetBlueCarpetPos(walker, blueCarpetPos.x, blueCarpetPos.z)
    
    // 预扫描床位
    let pathBeds = global.pfBedManager.pfScanBedsAlongRoute(level, routeStr, spawnX, baseY, spawnZ)
    global.pfEntityData.pfSetBedList(walker, global.pfBedManager.pfSerializeBeds(pathBeds))
    console.log("[PF] 预扫描床位数量=" + pathBeds.length)
    
    // 生成需求清单
    let demandList = global.pfEntityData.pfGenerateDemandList()
    console.log("[PF-DATA] 生成需求清单: " + JSON.stringify(demandList))
    global.pfNbtSync.pfSyncDemandList(walker, demandList)
    
    // 验证存储结果
    let verifyItem = walker.getMainHandItem()
    if (verifyItem && verifyItem.id === global.pfConstants.SYNC_ITEM_ID) {
        console.log("[PF-DATA] 存储验证 - 脚背=" + verifyItem.nbt.getInt('pfDemandJiaobei') +
            ", 脚掌=" + verifyItem.nbt.getInt('pfDemandJiaozhang') +
            ", 脚后跟=" + verifyItem.nbt.getInt('pfDemandJiaogen') +
            ", 脚趾=" + verifyItem.nbt.getInt('pfDemandJiaozhi') +
            ", 脚心=" + verifyItem.nbt.getInt('pfDemandJiaoxin'))
    } else {
        console.log("[PF-DATA] 存储验证失败 - 手持物品: " + (verifyItem ? verifyItem.id : "null"))
    }
    
    level.spawnParticles("minecraft:poof", false, spawnX, baseY + 1, spawnZ, 0.5, 1, 0.5, 50, 0)
    player.setStatusMessage("§a寻路开始！路径长度：" + routeStr.length + " 格")
    
    return walker
}

// 导出到全局
global.pfEntitySpawner = {
    pfSpawnWalker: pfSpawnWalker
}
