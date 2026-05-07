// priority: 9
// ============================================================
// Boss 顾客管理模块 (服务端)
// ------------------------------------------------------------
// 入口：pfBlockHandler.js 在检测到玩家手持 boss triggerItem 时，
// 调用 pfSpawnBossOnRoute 生成单个 boss 顾客。
// Boss 触发不会改变 pfShopState.isOpen 状态；
// 若 shop 已开，boss 会注册到 spawnedEntities，统一随关店清理。
// ============================================================

function pfSpawnBossOnRoute(player, level, baseX, baseY, baseZ, routeStr, blueCarpetPos, bossDef) {
    if (!bossDef) return
    try {
        // 走 pfEntitySpawner 主流程，通过 bossDef 参数走 boss 分支
        // （需求倍率应用 + pfBossId 写入 persistentData）
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, baseX, baseY, baseZ, routeStr, blueCarpetPos, player, bossDef.model, bossDef
        )

        // Boss 不参与常规顾客类别评价系统（pfShouldWakeUp 里根据 category 判断）
        walker.persistentData.putString('pfCustomerCategory', '')

        // 如果 shop 已开，把 boss uuid 纳入统一管理
        if (global.pfShopState && global.pfShopState.isOpen && global.pfShopState.spawnedEntities) {
            global.pfShopState.spawnedEntities.push('' + walker.getUuid())
        }

        // 提示玩家
        player.tell('§4⚡⚡⚡ ' + bossDef.name + ' §4来了！')
        if (bossDef.hint && bossDef.hint.length > 0) {
            player.tell(bossDef.hint)
        }
        player.tell('§7需求倍率 §ex' + bossDef.demandMultiplier +
            ' §7| 满意度倍率 §ex' + bossDef.satisfactionMultiplier.toFixed(2))

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

// ===== 导出到全局 =====
global.pfBossManager = {
    pfSpawnBossOnRoute: pfSpawnBossOnRoute
}

console.log("[BOSS-MGR] Boss 管理模块已加载")
