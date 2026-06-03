// priority: 10
// ============================================================
// 实体生成模块
// 生成女仆实体并初始化数据
// ============================================================

// 生成寻路实体
function pfSpawnWalker(level, baseX, baseY, baseZ, routeStr, blueCarpetPos, player, modelOverride, bossDef, silent) {
    let walker = level.createEntity(global.pfConstants.PF_ENTITY_TYPE)
    let spawnX = baseX + 0.5
    let spawnZ = baseZ + 0.5
    
    // 设置位置和基础NBT
    walker.setPositionAndRotation(spawnX, baseY, spawnZ, 0, 0)
    walker.setNoAi(true)
    
    // 随机选择模型
    let randomModel = modelOverride || (global.getRandomMaidModel ? global.getRandomMaidModel() : "touhou_little_maid:hakurei_reimu")
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
    
    // 把寻路方块坐标 + 开店玩家 UUID 持久化到实体本身，
    // 用于跨重启后从实体反查触发店铺与玩家上下文
    walker.persistentData.putInt("pfShopBaseX", baseX | 0)
    walker.persistentData.putInt("pfShopBaseY", baseY | 0)
    walker.persistentData.putInt("pfShopBaseZ", baseZ | 0)
    if (player) {
        walker.persistentData.putString("pfSpawnerPlayerUuid", "" + player.getUuid())
    }
    
    // 保存蓝色地毯位置
    global.pfEntityData.pfSetBlueCarpetPos(walker, blueCarpetPos.x, blueCarpetPos.z)
    
    // 预扫描床位
    let pathBeds = global.pfBedManager.pfScanBedsAlongRoute(level, routeStr, spawnX, baseY, spawnZ)
    global.pfEntityData.pfSetBedList(walker, global.pfBedManager.pfSerializeBeds(pathBeds))
    console.log("[PF] 预扫描床位数量=" + pathBeds.length)
    
    // 生成需求清单
    let demandList = global.pfEntityData.pfGenerateDemandList()
    // Boss 需求倍率：每部位次数 × bossDef.demandMultiplier
    if (bossDef && bossDef.demandMultiplier && bossDef.demandMultiplier > 1) {
        let mul = bossDef.demandMultiplier
        for (let key in demandList) {
            demandList[key] = demandList[key] * mul
        }
        console.log("[PF-BOSS] 需求倍率x" + mul + " 应用后: " + JSON.stringify(demandList))
    }
    console.log("[PF-DATA] 生成需求清单: " + JSON.stringify(demandList))
    // 检查玩家是否设置了跳过泡脚
    let skipSoak = false
    if (player && global.pfGetSetting) {
        skipSoak = global.pfGetSetting(player, 'pfSkipSoak') === 1
    }
    if (skipSoak) {
        console.log("[PF-DATA] 玩家设置跳过泡脚，直接标记pfSoakDone=1")
    }
    global.pfNbtSync.pfSyncDemandList(walker, demandList, skipSoak)
    
    // Boss 标识写入 persistentData（供满意度倍率查询）
    if (bossDef && bossDef.id) {
        walker.persistentData.putString('pfBossId', bossDef.id)
        console.log("[PF-BOSS] 实体标记 pfBossId=" + bossDef.id)
    }
    
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
    // 自动开店场景传 silent=true，跳过状态栏提示，只保留顾客话语广播
    if (!silent) {
        player.setStatusMessage("§a寻路开始！路径长度：" + routeStr.length + " 格")
    }

    // 顾客生成后向 100 格内玩家广播话语
    try {
        let lines = [
            "今天天气不错，我来看看。",
            "这家店看起来蛮不错的，好期待~",
            "听说这家洗脚店的手艺很棒呢。",
            "走了一天的路，正好脚酸。",
            "嗯哼，老板看起来很专业。",
            "希望能有舒服的服务。",
            "终于有一家像样的店了。",
            "这家店人气挺旺的呀。",
            "诶，这里就是传说中的洗脚名店？",
            "我可是慕名而来哦~"
        ]
        let line = lines[Math.floor(Math.random() * lines.length)]
        let msg = "§e顾客：§f" + line
        let cx = baseX + 0.5
        let cy = baseY + 0.5
        let cz = baseZ + 0.5
        let players = level.getPlayers()
        let radius = 100
        let radiusSq = radius * radius
        for (let i = 0; i < players.size(); i++) {
            let p = players.get(i)
            let dx = p.x - cx
            let dy = p.y - cy
            let dz = p.z - cz
            if (dx * dx + dy * dy + dz * dz <= radiusSq) {
                p.tell(msg)
            }
        }
    } catch (e) { console.log("[PF-SPAWN] 顾客话语广播失败: " + e) }

    return walker
}

// 导出到全局
global.pfEntitySpawner = {
    pfSpawnWalker: pfSpawnWalker
}
