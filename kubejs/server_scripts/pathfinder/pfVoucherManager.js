// priority: 9
// ============================================================
// 预约凭证管理模块 (服务端)
// ------------------------------------------------------------
// 入口：pfBlockHandler.js 检测到玩家手持 voucher 时调用 pfSpawnVoucherCustomer。
// 规则：
//   - 消耗 1 个凭证（创意模式免）
//   - 依据 voucherKey 选定类别 / 随机类别，从该类 models 随机选模型
//   - 调用 pfEntitySpawner.pfSpawnWalker（不传 bossDef）
//   - 写入 pfCustomerCategory，参与评价系统
//   - 不改变 pfShopState.isOpen；若已开店则纳入 spawnedEntities 统一清理
// ============================================================

function pfSpawnVoucherCustomer(player, level, baseX, baseY, baseZ, routeStr, blueCarpetPos, voucherKey) {
    if (!global.pfCustomerTypes || !global.pfCustomerTypes.PF_CUSTOMER_TYPES) {
        player.tell("§c[预约] 顾客类型系统未加载")
        return
    }
    let types = global.pfCustomerTypes.PF_CUSTOMER_TYPES

    // ===== 确定目标类别 =====
    let chosenKey = voucherKey
    let chosenCategory = null

    if (voucherKey === "random") {
        let keys = []
        for (let k in types) {
            if (types[k] && types[k].models && types[k].models.length > 0) keys.push(k)
        }
        if (keys.length === 0) {
            player.tell("§c[预约] 无可用顾客类型")
            return
        }
        chosenKey = keys[Math.floor(Math.random() * keys.length)]
        chosenCategory = types[chosenKey]
    } else {
        chosenCategory = types[voucherKey]
        if (!chosenCategory) {
            player.tell("§c[预约] 未知类别：" + voucherKey)
            return
        }
    }

    if (!chosenCategory.models || chosenCategory.models.length === 0) {
        player.tell("§c[预约] " + chosenCategory.name + " 无可用模型")
        return
    }
    let chosenModel = chosenCategory.models[Math.floor(Math.random() * chosenCategory.models.length)]

    // ===== 调用实体生成 =====
    try {
        let walker = global.pfEntitySpawner.pfSpawnWalker(
            level, baseX, baseY, baseZ, routeStr, blueCarpetPos, player, chosenModel, null
        )
        walker.persistentData.putString("pfCustomerCategory", chosenKey)

        // 已开店则纳入统一管理（开店状态持久化在 pathfinder_block 的 BlockEntity 中）
        try {
            if (global.pfShopManager && typeof global.pfShopManager.pfShopAddSpawnedAt === "function") {
                global.pfShopManager.pfShopAddSpawnedAt(level, baseX, baseY, baseZ, "" + walker.getUuid())
            }
        } catch (e) {
            console.log("[预约] 注册到 shop spawnedUuids 失败: " + e)
        }

        // 反馈
        player.tell("§b✉ 您预约的 §f" + chosenCategory.name + "§b类顾客已到达")
        if (voucherKey === "random") {
            player.tell("§7(随机凭证抽中：§f" + chosenCategory.name + "§7)")
        }

        level.spawnParticles("minecraft:happy_villager", false,
            baseX + 0.5, baseY + 1.2, baseZ + 0.5, 0.6, 1.2, 0.6, 40, 0)

        console.log("[VOUCHER] 生成顾客 category=" + chosenKey +
            ", model=" + chosenModel +
            ", player=" + player.getName().getString() +
            ", uuid=" + walker.getUuid())
    } catch (e) {
        console.log("[VOUCHER] 生成失败: " + e)
        player.tell("§c[预约] 召唤失败：" + e)
    }
}

global.pfVoucherManager = {
    pfSpawnVoucherCustomer: pfSpawnVoucherCustomer
}

console.log("[VOUCHER-MGR] 预约凭证管理模块已加载")
