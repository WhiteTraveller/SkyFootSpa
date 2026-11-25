// priority: 9
// ============================================================
// Boss 顾客管理模块 (服务端)
// ------------------------------------------------------------
// 入口：pfBlockHandler.js 在检测到玩家手持 boss triggerItem 时，
// 调用 pfSpawnBossOnRoute 生成单个 boss 顾客。
// Boss 触发不会改变 pfShopState.isOpen 状态；
// 若 shop 已开，boss 会注册到 spawnedEntities，统一随关店清理。
// ============================================================

function pfSpawnBossOnRoute(player, level, baseX, baseY, baseZ, routeStr, queuePos, bossDef) {
    if (!bossDef) return
    try {
        // 走 pfEntitySpawner 主流程，通过 bossDef 参数走 boss 分支
        // （需求范围随机 + pfBossId 写入 persistentData）
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, baseX, baseY, baseZ, routeStr, queuePos, player, bossDef.model, bossDef
        )

        // Boss 不参与常规顾客类别评价系统（pfShouldWakeUp 里根据 category 判断）
        walker.persistentData.putString('pfCustomerCategory', '')
        // 头顶名牌：显示 Boss 名
        walker.setCustomName(Text.of(bossDef.name || '顾客'))
        walker.setCustomNameVisible(true)

        // 如果 shop 已开，把 boss uuid 纳入统一管理（开店状态持久化在 BlockEntity NBT 中）
        try {
            if (global.pfShopManager && typeof global.pfShopManager.pfShopAddSpawnedAt === "function") {
                global.pfShopManager.pfShopAddSpawnedAt(level, baseX, baseY, baseZ, "" + walker.getUuid())
            }
        } catch (e) {
            console.log("[BOSS] 注册到 shop spawnedUuids 失败: " + e)
        }

        // 提示玩家
        player.tell('§4⚡⚡⚡ ' + bossDef.name + ' §4来了！')
        if (bossDef.hint && bossDef.hint.length > 0) {
            player.tell(bossDef.hint)
        }
        player.tell('§7满意度倍率 §ex' + bossDef.satisfactionMultiplier.toFixed(2) +
            ' §7| 目标 §e' + bossDef.satisfactionTarget + '% §7| 限时 §e' + bossDef.time + 's')

        // 红色粒子特效
        level.spawnParticles("minecraft:flame", false, baseX + 0.5, baseY + 1.2, baseZ + 0.5, 0.8, 1.5, 0.8, 80, 0)

        console.log("[BOSS] 生成 boss=" + bossDef.id +
            ", 玩家=" + player.getName().getString() +
            ", uuid=" + walker.getUuid())
    } catch (e) {
        console.log("[BOSS] 生成失败: " + e)
        player.tell('§c[Boss] 召唤失败：' + e)
    }
}

// 回查 boss 相关玩家：优先开店召唤者（pfSpawnerPlayerUuid），其次服务操作者（pfActionPlayerUuid）
function pfBossFindPlayer(ent, level) {
    let spawnerUuid = '' + ent.persistentData.getString('pfSpawnerPlayerUuid')
    if (spawnerUuid && spawnerUuid.length > 0) {
        try { let p = level.getPlayerByUUID(spawnerUuid); if (p) return p } catch (e) {}
    }
    let item = ent.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        let actionUuid = '' + item.nbt.getString('pfActionPlayerUuid')
        if (actionUuid && actionUuid.length > 0) {
            try { let p = level.getPlayerByUUID(actionUuid); if (p) return p } catch (e) {}
        }
    }
    return null
}

// Boss 挑战失败：自动下床（不结算、不发奖励），返还召唤券并提示。
// reason: 'timeout'（倒计时归零）| 'satisfaction'（需求清零但满意度未达标）
// 由 pfProcessSleeping（超时）与 pfShouldWakeUp（满意度未达标）调用；pfBossFailed 防重复处理。
function pfBossFail(ent, level, reason) {
    if (!ent || !ent.isAlive()) return
    if ((ent.persistentData.getInt('pfBossFailed') | 0) === 1) return
    ent.persistentData.putInt('pfBossFailed', 1)

    let bossId = '' + ent.persistentData.getString('pfBossId')
    let bossDef = (global.bossRegister && global.bossRegister.byId) ? global.bossRegister.byId[bossId] : null
    console.log('[BOSS] 挑战失败 uuid=' + ent.getUuid() + ' boss=' + bossId + ' reason=' + reason)

    // 下床：与羽毛送客一致，恢复路线继续行走，不结算
    global.pfSleepManager.pfWakeUp(ent, level)

    // 返还召唤券：玩家在线则直接给予，离线则掉落在顾客位置避免丢失
    let target = pfBossFindPlayer(ent, level)
    if (bossDef && bossDef.triggerItemId) {
        if (target) {
            target.give(Item.of(bossDef.triggerItemId))
        } else {
            let x = ent.x, y = ent.y + 1, z = ent.z
            level.getServer().runCommandSilent('summon item ' + x + ' ' + y + ' ' + z + ' {Item:{id:"' + bossDef.triggerItemId + '",Count:1b}}')
        }
    }
    if (target) {
        let reasonText = reason === 'timeout' ? '时间耗尽' : '满意度未达标'
        let bossName = bossDef ? bossDef.name : 'Boss'
        target.tell('§c' + bossName + ' §c挑战失败（' + reasonText + '）！§7召唤券已返还。')
    }
    try {
        level.spawnParticles('minecraft:angry_villager', false, ent.x, ent.y + 1, ent.z, 0.6, 0.8, 0.6, 20, 0.05)
    } catch (e) {}
}

// Boss 考核成就：挑战成功时授予对应自定义进度（kubejs/data/marguerite/advancements/boss_challenge/）。
// 进度为 minecraft:impossible 触发器，只能由命令授予；until 连带父级 root 一起授予（各 boss 为叶子，不会误发子级）。
// 授予对象为完成考核的玩家（pfActionPlayerUuid）；未配置对应成就文件的 boss 命令会静默失败并记日志。
function pfBossGrantAdvancement(level, bossId, player) {
    if (!bossId || !player) return
    let advId = 'marguerite:boss_challenge/' + bossId
    let name = player.getName().getString()
    try {
        level.getServer().runCommandSilent('advancement grant ' + name + ' until ' + advId)
        console.log('[BOSS] 考核成就授予 ' + advId + ' → ' + name)
    } catch (e) {
        console.log('[BOSS] 考核成就授予失败 ' + advId + ': ' + e)
    }
}

// ===== 导出到全局 =====
global.pfBossManager = {
    pfSpawnBossOnRoute: pfSpawnBossOnRoute,
    pfBossFail: pfBossFail,
    pfBossGrantAdvancement: pfBossGrantAdvancement
}

console.log("[BOSS-MGR] Boss 管理模块已加载")
