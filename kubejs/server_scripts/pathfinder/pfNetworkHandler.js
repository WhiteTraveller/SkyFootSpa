// priority: 10
// ============================================================
// 网络事件处理模块
// 处理客户端发来的点击事件
// ============================================================

// 获取属性值（带fallback）
function pfGetAttributeValue(player, id, fallback) {
    try {
        let inst = player.getAttribute(id)
        if (inst != null) {
            let v = inst.getValue()
            if (v != null) return v
        }
    } catch (e) { }
    return fallback
}

// 应用 Boss 满意度倍率：读取实体 persistentData.pfBossId，查 global.bossRegister 的倍率
function pfApplyBossSatMul(entity, gain) {
    if (!entity || gain <= 0) return gain
    try {
        let bossId = '' + entity.persistentData.getString('pfBossId')
        if (!bossId || bossId.length === 0) return gain
        if (!global.bossRegister || !global.bossRegister.byId) return gain
        let boss = global.bossRegister.byId[bossId]
        if (!boss) return gain
        let scaled = Math.floor(gain * boss.satisfactionMultiplier)
        if (scaled < 0) scaled = 0
        return scaled
    } catch (e) {
        return gain
    }
}

// 设置网络事件监听
function setupNetworkHandlers() {
    // 客户端点击需求按钮
    NetworkEvents.dataReceived('foot_click_demand', event => {
        let entityUuid = event.data.entityUuid
        let partKey = event.data.partKey
        let player = event.player
        let level = player.level
        
        console.log("[PF-NETWORK] 收到点击请求 entityUuid=" + entityUuid + ", partKey=" + partKey)
        
        // 确定需求键
        let demandKey = null
        if (partKey && global.pfConstants.DEMAND_KEY_TO_CODE[partKey]) {
            demandKey = partKey
        } else {
            let playerMainHand = player.getMainHandItem()
            if (playerMainHand && playerMainHand.id) {
                demandKey = global.pfConstants.WOOL_TO_DEMAND[playerMainHand.id]
            }
        }
        
        if (!demandKey) {
            console.log("[PF-NETWORK] 无法确定操作部位")
            return
        }
        
        // 查找实体
        let entities = level.getEntities()
        let targetEntity = null
        for (let i = 0; i < entities.size(); i++) {
            let ent = entities.get(i)
            if ("" + ent.getUuid() === entityUuid) {
                targetEntity = ent
                break
            }
        }
        
        if (!targetEntity) {
            console.log("[PF-NETWORK] 未找到实体 uuid=" + entityUuid)
            return
        }
        
        // 读取并更新需求
        let item = targetEntity.getMainHandItem()
        if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
            let nbt = item.nbt
            let currentValue = nbt.getInt(demandKey) || 0
            
            // 获取部位名
            let part = null
            if (demandKey === "pfDemandJiaozhang") part = "jiaozhang"
            else if (demandKey === "pfDemandJiaogen") part = "jiaogen"
            else if (demandKey === "pfDemandJiaozhi") part = "jiaozhi"
            else if (demandKey === "pfDemandJiaoxin") part = "jiaoxin"
            
            // 检查是否开启一键满足
            let oneClickSatisfy = global.pfGetSetting ? (global.pfGetSetting(player, 'pfOneClickSatisfy') === 1) : false
            
            if (oneClickSatisfy) {
                // 一键满足：清零所有需求（无论当前部位是否已为0）
                // 体力消耗取所有部位体力之和
                let allKeys = ['pfDemandJiaozhang', 'pfDemandJiaogen', 'pfDemandJiaozhi', 'pfDemandJiaoxin']
                let partNames = { 'pfDemandJiaozhang': 'jiaozhang', 'pfDemandJiaogen': 'jiaogen', 'pfDemandJiaozhi': 'jiaozhi', 'pfDemandJiaoxin': 'jiaoxin' }
                
                // 计算总体力消耗（只计算有需求的部位）
                let totalStaminaCost = 0
                for (let k = 0; k < allKeys.length; k++) {
                    let dk = allKeys[k]
                    let val = nbt.getInt(dk) || 0
                    if (val > 0) {
                        let pn = partNames[dk]
                        let stPerClick = Math.floor(pfGetAttributeValue(player, "kubejs:serve.stamina_cost." + pn, 100.0))
                        totalStaminaCost += stPerClick * val
                    }
                }
                
                if (totalStaminaCost > 0 && (!global.pfConsumeStamina || !global.pfConsumeStamina(player, totalStaminaCost))) {
                    player.setStatusMessage("§c体力不足，无法搛脚！")
                    targetEntity.setMainHandItem(item.withNBT(nbt))
                    return
                }
                
                let totalSatGain = 0
                let totalMoneyGain = 0
                let totalClicks = 0
                for (let k = 0; k < allKeys.length; k++) {
                    let dk = allKeys[k]
                    let val = nbt.getInt(dk) || 0
                    if (val > 0) {
                        let pn = partNames[dk]
                        let satPer = pn ? pfGetAttributeValue(player, "kubejs:serve.sat_gain." + pn, 10.0) : 10.0
                        let moneyPer = pn ? pfGetAttributeValue(player, "kubejs:serve.money_gain." + pn, 1.0) : 1.0
                        totalSatGain += Math.max(0, Math.floor(satPer)) * val
                        totalMoneyGain += Math.floor(moneyPer) * val
                        totalClicks += val
                        nbt[dk] = 0
                    }
                }
                
                let satisfaction = nbt.getInt('pfSatisfaction') || 0
                let satApplied = pfApplyBossSatMul(targetEntity, totalSatGain)
                satisfaction = Math.min(100, satisfaction + satApplied)
                nbt.pfSatisfaction = satisfaction
                let money = nbt.getInt('pfMoney') || 0
                nbt.pfMoney = money + totalMoneyGain
                
                player.tell("§a+" + totalMoneyGain + "§6💰 §7| §b+" + satApplied + "§d❤ §e(一键满足)")
                console.log("[PF-NETWORK] 一键满足所有需求, 满意度=" + satisfaction + "%, 金钱=" + nbt.pfMoney)

                // 掉落"皴"：一键满足按总清零次数结算
                try {
                    if (global.pfCunDrop && totalClicks > 0) {
                        let dropCount = global.pfCunDrop.getDropCount(player, targetEntity, null, totalClicks)
                        if (dropCount > 0) {
                            player.give(Item.of('marguerite:cun', dropCount))
                        }
                    }
                } catch (e) { console.log('[PF-NETWORK] 皴掉落失败(一键满足): ' + e) }
            } else if (currentValue > 0) {
                // 正常模式：只减少当前部位
                // 从对应部位属性读取体力消耗
                let staminaCost = part ? Math.floor(pfGetAttributeValue(player, "kubejs:serve.stamina_cost." + part, 100.0)) : 100
                if (!global.pfConsumeStamina || !global.pfConsumeStamina(player, staminaCost)) {
                    player.setStatusMessage("§c体力不足，无法搛脚！")
                    targetEntity.setMainHandItem(item.withNBT(nbt))
                    return
                }
                currentValue--
                nbt[demandKey] = currentValue
                
                // 计算收益
                let satPart = part ? pfGetAttributeValue(player, "kubejs:serve.sat_gain." + part, 10.0) : 10.0
                let moneyPart = part ? pfGetAttributeValue(player, "kubejs:serve.money_gain." + part, 1.0) : 1.0
                let satGain = Math.max(0, Math.floor(satPart))
                let moneyGain = Math.floor(moneyPart)
                
                // 更新NBT
                let satisfaction = nbt.getInt('pfSatisfaction') || 0
                let satApplied = pfApplyBossSatMul(targetEntity, satGain)
                satisfaction = Math.min(100, satisfaction + satApplied)
                nbt.pfSatisfaction = satisfaction
                
                let money = nbt.getInt('pfMoney') || 0
                nbt.pfMoney = money + moneyGain
                
                // 通知玩家
                player.tell("§a+" + moneyGain + "§6💰 §7| §b+" + satApplied + "§d❤")
                
                // 记录步骤
                let stepCode = global.pfConstants.DEMAND_KEY_TO_CODE[demandKey]
                let currentSteps = nbt.pfSteps
                if (currentSteps && currentSteps.length > 0) {
                    nbt.merge({ 'pfSteps': currentSteps + "," + stepCode })
                } else {
                    nbt.merge({ 'pfSteps': String(stepCode) })
                }
                
                console.log("[PF-NETWORK] 需求更新: " + demandKey + "=" + currentValue + 
                    ", 满意度=" + satisfaction + "%, 金钱=" + nbt.pfMoney)

                // 掉落"皴"：正常模式每次点击结算一次
                try {
                    if (global.pfCunDrop) {
                        let dropCount = global.pfCunDrop.getDropCount(player, targetEntity, part, 1)
                        if (dropCount > 0) {
                            player.give(Item.of('marguerite:cun', dropCount))
                        }
                    }
                } catch (e) { console.log('[PF-NETWORK] 皴掉落失败: ' + e) }
            } else {
                console.log("[PF-NETWORK] 需求已为0，无法减少")
            }
            
            // 记录操作玩家 UUID（用于后续结算时回查，避免依赖商店方块状态）
            nbt.pfActionPlayerUuid = "" + player.getUuid()
            targetEntity.setMainHandItem(item.withNBT(nbt))
        }
    })
    
    // 客户端点击泡脚按钮
    NetworkEvents.dataReceived('foot_click_soak', event => {
        let entityUuid = event.data.entityUuid
        let player = event.player
        let level = player.level
        
        console.log("[PF-SOAK] 收到泡脚点击请求 entityUuid=" + entityUuid)
        
        // 检查玩家手持水桶（原版水桶 或 任何已注册的洗脚水桶）
        let playerMainHand = player.getMainHandItem()
        let bucketId = playerMainHand ? ("" + playerMainHand.id) : ""
        let isVanillaWater = bucketId === 'minecraft:water_bucket'
        let soakWaterDef = null
        if (!isVanillaWater && global.soakWaterRegister) {
            soakWaterDef = global.soakWaterRegister.getByBucketId(bucketId)
        }
        if (!isVanillaWater && !soakWaterDef) {
            console.log("[PF-SOAK] 玩家没有手持水桶 / 洗脚水桶, 实际手持: " + bucketId)
            player.setStatusMessage("§c需要手持水桶或洗脚水桶才能开始泡脚！")
            return
        }
        
        // 查找实体
        let entities = level.getEntities()
        let targetEntity = null
        for (let i = 0; i < entities.size(); i++) {
            let ent = entities.get(i)
            if ("" + ent.getUuid() === entityUuid) {
                targetEntity = ent
                break
            }
        }
        
        if (!targetEntity) {
            console.log("[PF-SOAK] 未找到实体 uuid=" + entityUuid)
            return
        }
        
        // 开始泡脚（传入桶 id 以便后续根据水种类应用效果）
        global.pfSoakManager.pfStartSoak(targetEntity, player, bucketId)

        // 记录操作玩家 UUID（用于后续结算时回查）
        let soakItem = targetEntity.getMainHandItem()
        if (soakItem && soakItem.id === global.pfConstants.SYNC_ITEM_ID && soakItem.nbt) {
            let soakNbt = soakItem.nbt
            soakNbt.pfActionPlayerUuid = "" + player.getUuid()
            targetEntity.setMainHandItem(soakItem.withNBT(soakNbt))
        }
    })
}

// 导出到全局
global.pfNetworkHandler = {
    setupNetworkHandlers: setupNetworkHandlers
}
