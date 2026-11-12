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

// 服务结算由玩家发起，但顾客女仆也可以装备遗物。
// 保留玩家当前值，再叠加女仆相对自身基础值的 modifier，避免女仆的默认值覆盖玩家遗物。
function pfGetServiceAttributeValue(player, target, id, fallback) {
    let playerValue = pfGetAttributeValue(player, id, fallback)
    if (!target || target === player) return playerValue
    try {
        let maidAttr = target.getAttribute(id)
        if (maidAttr != null) {
            let base = Number(maidAttr.getBaseValue())
            return playerValue + (maidAttr.getValue() - base)
        }
    } catch (e) {}
    return playerValue
}

function pfRefreshCustomerAttributes(target) {
    try {
        if (!target || !global.updateMaidBackpack) return
        let probe = target.getAttribute('kubejs:serve.money_gain.jiaozhi')
        if (probe != null) global.updateMaidBackpack(target)
    } catch (e) {}
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

// 搓脚成功后把最新需求值直接推送给客户端，避免只依赖实体手持物品的延迟同步。
function pfSendDemandSync(player, entityUuid, nbt, part) {
    player.sendData('pf_serve_success', {
        entityUuid: entityUuid,
        part: part || '',
        demandJiaozhang: nbt.getInt('pfDemandJiaozhang'),
        demandJiaogen: nbt.getInt('pfDemandJiaogen'),
        demandJiaozhi: nbt.getInt('pfDemandJiaozhi'),
        demandJiaoxin: nbt.getInt('pfDemandJiaoxin'),
        satisfaction: nbt.getInt('pfSatisfaction'),
        foodServed: nbt.getInt('pfFoodServed')
    })
}

// 设置网络事件监听
function setupNetworkHandlers() {
    // 客户端点击需求按钮
    NetworkEvents.dataReceived('foot_click_demand', event => {
        let entityUuid = event.data.entityUuid
        let partKey = event.data.partKey
        let clientRequestId = event.data.clientRequestId
        let player = event.player
        let level = player.level
        let autoSequenceGun = global.pfFasciaGunInterface &&
            global.pfFasciaGunInterface.isAutoSequenceGun(player.getMainHandItem())
        
        console.log("[FOOT-DRAG] receive requestId=" + clientRequestId + " player=" + player.getUsername() +
            " uuid=" + entityUuid + " mainHand=" + player.getMainHandItem().id + " autoSequence=" + autoSequenceGun)

        // 羽毛搓脚 = 送客：顾客直接起床离开，不结算、不发奖励、不计评价
        let dismissHeld = player.getMainHandItem()
        if (dismissHeld && dismissHeld.id === 'minecraft:feather') {
            let dismissEntities = level.getEntities()
            let dismissTarget = null
            for (let di = 0; di < dismissEntities.size(); di++) {
                let dEnt = dismissEntities.get(di)
                if ("" + dEnt.getUuid() === entityUuid) {
                    dismissTarget = dEnt
                    break
                }
            }
            if (!dismissTarget) {
                console.log("[PF-DISMISS] 未找到实体 uuid=" + entityUuid)
                return
            }
            // 拖动会连续触发事件，只对仍躺床（phase=3）的顾客执行起床
            if (global.pfEntityData.pfGetPhase(dismissTarget) !== 3) {
                return
            }
            global.pfSleepManager.pfWakeUp(dismissTarget, level)
            player.tell("§7已送客（未结算，无奖励）")
            console.log("[PF-DISMISS] 羽毛送客成功 uuid=" + entityUuid)
            return
        }

        // 确定需求键
        let demandKey = null
        if (!autoSequenceGun) {
            if (partKey && global.pfConstants.DEMAND_KEY_TO_CODE[partKey]) {
                demandKey = partKey
            } else {
                let playerMainHand = player.getMainHandItem()
                if (playerMainHand && playerMainHand.id) {
                    demandKey = global.pfConstants.WOOL_TO_DEMAND[playerMainHand.id]
                }
            }
        }
        
        if (!demandKey && !autoSequenceGun) {
            console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=no_demand_key partKey=" + partKey)
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
            console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=entity_not_found uuid=" + entityUuid)
            return
        }

        // 旧存档中的女仆不会重新触发 EntityJoinLevelEvent；在首次服务前补做一次重算。
        pfRefreshCustomerAttributes(targetEntity)

        if (autoSequenceGun) {
            let sequence = [
                'pfDemandJiaozhang',
                'pfDemandJiaogen',
                'pfDemandJiaozhi',
                'pfDemandJiaoxin'
            ]
            let demandItem = targetEntity.getMainHandItem()
            if (demandItem && demandItem.id === global.pfConstants.SYNC_ITEM_ID && demandItem.nbt) {
                for (let i = 0; i < sequence.length; i++) {
                    if ((demandItem.nbt.getInt(sequence[i]) | 0) > 0) {
                        demandKey = sequence[i]
                        break
                    }
                }
            }
            if (!demandKey) {
                player.setStatusMessage("§7该顾客的搓脚需求已全部满足")
                console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=no_remaining_auto_demand")
                return
            }
        }
        
        // 读取并更新需求
        let item = targetEntity.getMainHandItem()
        if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
            let nbt = item.nbt
            let currentValue = nbt.getInt(demandKey) || 0
            console.log("[FOOT-DRAG] resolved requestId=" + clientRequestId + " demand=" + demandKey +
                " remaining=" + currentValue + " upgraded=" +
                (global.pfFasciaGunInterface && global.pfFasciaGunInterface.isUpgradedGun(player.getMainHandItem())))
            
            // 获取部位名
            let part = null
            if (demandKey === "pfDemandJiaozhang") part = "jiaozhang"
            else if (demandKey === "pfDemandJiaogen") part = "jiaogen"
            else if (demandKey === "pfDemandJiaozhi") part = "jiaozhi"
            else if (demandKey === "pfDemandJiaoxin") part = "jiaoxin"
            
            // 检查是否开启一键满足
            // 四合一枪逐部位搓完再切换；即使开启一键满足，也保留这套顺序。
            let oneClickSatisfy = !autoSequenceGun &&
                (global.pfGetSetting ? (global.pfGetSetting(player, 'pfOneClickSatisfy') === 1) : false)
            
            if (oneClickSatisfy) {
                // 一键满足：清零所有需求（无论当前部位是否已为0）
                // 体力消耗取所有部位体力之和
                let allKeys = ['pfDemandJiaozhang', 'pfDemandJiaogen', 'pfDemandJiaozhi', 'pfDemandJiaoxin']
                let partNames = { 'pfDemandJiaozhang': 'jiaozhang', 'pfDemandJiaogen': 'jiaogen', 'pfDemandJiaozhi': 'jiaozhi', 'pfDemandJiaoxin': 'jiaoxin' }
                
                // 计算总体力消耗（只计算有需求的部位）
                let totalStaminaCost = 0
                let totalClicks = 0
                for (let k = 0; k < allKeys.length; k++) {
                    let dk = allKeys[k]
                    let val = nbt.getInt(dk) || 0
                    if (val > 0) {
                        let pn = partNames[dk]
                        let stPerClick = Math.floor(pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.stamina_cost." + pn, 100.0))
                        totalStaminaCost += stPerClick * val
                        totalClicks += val
                    }
                }

                // 一键满足时仅让真正的通用枪替代整笔体力消耗；单部位枪保持旧行为。
                let universalGunUsed = false
                if (totalClicks > 0 && global.pfFasciaGunInterface) {
                    let candidateGun = global.pfFasciaGunInterface.getMatchingGun(player, demandKey)
                    if (global.pfFasciaGunInterface.isUniversalGun(candidateGun)) {
                        universalGunUsed = global.pfFasciaGunInterface.tryConsume(
                            player, candidateGun, totalStaminaCost, totalClicks)
                        if (!universalGunUsed) {
                            player.setStatusMessage("§c筋膜枪电量不足，请充电！")
                            targetEntity.setMainHandItem(item.withNBT(nbt))
                            return
                        }
                    }
                }

                if (totalStaminaCost > 0 && !universalGunUsed && (!global.pfConsumeStamina || !global.pfConsumeStamina(player, totalStaminaCost))) {
                    player.setStatusMessage("§c体力不足，无法搛脚！")
                    targetEntity.setMainHandItem(item.withNBT(nbt))
                    return
                }
                
                let totalSatGain = 0
                let totalMoneyGain = 0
                for (let k = 0; k < allKeys.length; k++) {
                    let dk = allKeys[k]
                    let val = nbt.getInt(dk) || 0
                    if (val > 0) {
                        let pn = partNames[dk]
                        let satPer = pn ? pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.sat_gain." + pn, 10.0) : 10.0
                        let moneyPer = pn ? pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.money_gain." + pn, 1.0) : 1.0
                        totalSatGain += Math.max(0, Math.floor(satPer)) * val
                        totalMoneyGain += Math.floor(moneyPer) * val
                        let clearPatch = {}
                        clearPatch[dk] = 0
                        nbt.merge(clearPatch)
                    }
                }
                
                let satisfaction = nbt.getInt('pfSatisfaction') || 0
                let satApplied = pfApplyBossSatMul(targetEntity, totalSatGain)
                satisfaction = Math.min(100, satisfaction + satApplied)
                nbt.merge({ pfSatisfaction: satisfaction })
                let money = nbt.getInt('pfMoney') || 0
                nbt.pfMoney = money + totalMoneyGain
                
                player.tell("§a+" + totalMoneyGain + "§6💰 §7| §b+" + satApplied + "§d❤ §e(一键满足)")
                // 撳脚成功音效：叮
                try { player.getLevel().getServer().runCommandSilent('playsound minecraft:block.note_block.bell master ' + player.getUsername() + ' ~ ~ ~ 1 2 1') } catch (e) {}
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

                try { pfSendDemandSync(player, entityUuid, nbt, part) } catch (e) {
                    console.log('[PF-NETWORK] 需求同步失败(一键满足): ' + e)
                }
            } else if (currentValue > 0) {
                // 正常模式：只减少当前部位
                // ============================================================
                // 筋膜枪优先消耗自身FE；持枪但电量不足时阻止服务，不回退到体力消耗。
                // ============================================================
                let staminaCost = part ? Math.floor(pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.stamina_cost." + part, 100.0)) : 100
                let requestedServiceCount = global.pfFasciaGunInterface &&
                    global.pfFasciaGunInterface.isUpgradedGun(player.getMainHandItem())
                    ? global.pfFasciaGunInterface.upgradedGunServiceCount
                    : 1
                let serviceCount = Math.min(requestedServiceCount, currentValue)
                console.log("[FOOT-DRAG] plan requestId=" + clientRequestId + " requested=" +
                    requestedServiceCount + " actual=" + serviceCount + " feCost=" + staminaCost)
                let fasciaGunUsed = false
                let fasciaGunHeld = false
                let gunInfo = null
                if (global.pfFasciaGunInterface) {
                    gunInfo = global.pfFasciaGunInterface.getMatchingGun(player, demandKey)
                    if (gunInfo) {
                        fasciaGunHeld = true
                        if (global.pfFasciaGunInterface.tryConsume(player, gunInfo, staminaCost)) {
                            fasciaGunUsed = true
                            let currentFE = global.pfFasciaGunInterface.getCurrentFE(gunInfo.item)
                            console.log('[PF-NETWORK] 筋膜枪(' + part + ')消耗 ' + staminaCost + ' FE, 剩余: ' + currentFE + ' FE')
                        }
                    }
                }

                // 筋膜枪能源不足时阻断搓脚并提示对应补能方式。
                if (fasciaGunHeld && !fasciaGunUsed) {
                    player.setStatusMessage("§c筋膜枪电量不足，请充电！")
                    console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=gun_energy_insufficient demand=" + demandKey)
                    targetEntity.setMainHandItem(item.withNBT(nbt))
                    return
                }

                // 没有持有筋膜枪时，消耗体力
                if (!fasciaGunUsed) {
                    if (!global.pfConsumeStamina || !global.pfConsumeStamina(player, staminaCost)) {
                        player.setStatusMessage("§c体力不足，无法搛脚！")
                        console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=stamina_insufficient demand=" + demandKey)
                        targetEntity.setMainHandItem(item.withNBT(nbt))
                        return
                    }
                }
                // FE 本次只扣一次；服务收益按实际完成次数逐次结算。
                let satPart = part ? pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.sat_gain." + part, 10.0) : 10.0
                let moneyPart = part ? pfGetServiceAttributeValue(player, targetEntity, "kubejs:serve.money_gain." + part, 1.0) : 1.0
                let satGain = Math.max(0, Math.floor(satPart))
                let moneyGain = Math.floor(moneyPart)
                let satisfaction = nbt.getInt('pfSatisfaction') || 0
                let totalSatApplied = 0
                let totalMoneyGain = 0
                let completedServices = 0

                for (let i = 0; i < serviceCount; i++) {
                    let remainingDemand = nbt.getInt(demandKey) || 0
                    if (remainingDemand <= 0) break

                    let demandPatch = {}
                    demandPatch[demandKey] = remainingDemand - 1
                    nbt.merge(demandPatch)

                    let satApplied = pfApplyBossSatMul(targetEntity, satGain)
                    satisfaction = Math.min(100, satisfaction + satApplied)
                    totalSatApplied += satApplied
                    totalMoneyGain += moneyGain

                    let stepCode = global.pfConstants.DEMAND_KEY_TO_CODE[demandKey]
                    let currentSteps = nbt.pfSteps
                    if (currentSteps && currentSteps.length > 0) {
                        nbt.merge({ 'pfSteps': currentSteps + "," + stepCode })
                    } else {
                        nbt.merge({ 'pfSteps': String(stepCode) })
                    }
                    completedServices++
                }

                nbt.merge({ pfSatisfaction: satisfaction })
                let money = nbt.getInt('pfMoney') || 0
                nbt.pfMoney = money + totalMoneyGain

                // 一条提示合并显示本次请求累计收益。
                if (completedServices > 0) {
                    player.tell("§a+" + totalMoneyGain + "§6💰 §7| §b+" + totalSatApplied + "§d❤")
                }

                let updatedDemand = nbt.getInt(demandKey) || 0
                console.log("[FOOT-DRAG] complete requestId=" + clientRequestId + " demand=" + demandKey +
                    " remaining=" + updatedDemand + " completed=" + completedServices + " upgraded=" +
                    (global.pfFasciaGunInterface && global.pfFasciaGunInterface.isUpgradedGun(player.getMainHandItem())))
                console.log("[PF-NETWORK] 需求更新: " + demandKey + "=" + updatedDemand +
                    ", 满意度=" + satisfaction + "%, 金钱=" + nbt.pfMoney + ", 本次服务=" + completedServices)

                // 每次有效服务独立随机掉落；搓泥宝按本次请求只扣一点耐久。
                try {
                    if (global.pfCunDrop && completedServices > 0) {
                        let dropCount = global.pfCunDrop.getDropCount(player, targetEntity, part, completedServices)
                        if (dropCount > 0) {
                            player.give(Item.of('marguerite:cun', dropCount))
                        }
                    }
                } catch (e) { console.log('[PF-NETWORK] 皴掉落失败: ' + e) }

                // 每个请求只同步一次最终需求状态。
                try { if (completedServices > 0) pfSendDemandSync(player, entityUuid, nbt, part) } catch (e) {
                    console.log('[PF-NETWORK] 需求同步失败: ' + e)
                }
                // 搓脚成功音效：叮
                if (completedServices > 0) {
                    try { player.getLevel().getServer().runCommandSilent('playsound minecraft:block.note_block.bell master ' + player.getUsername() + ' ~ ~ ~ 1 2 1') } catch (e) {}
                }
            } else {
                // 需求已为0：不消耗体力，仅提示
                player.setStatusMessage("§7该部位已满足，无额外收益")
                console.log("[FOOT-DRAG] reject requestId=" + clientRequestId + " reason=demand_zero demand=" + demandKey)
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

    // 客户端点击需求清单的“茶”按钮：消耗手持已登记食物（global.foodRegister），
    // 为服务中的顾客增加需求/满意度，并尝试召唤该食物对应的稀客（路径上已有则不重复召唤）
    NetworkEvents.dataReceived('foot_serve_food', event => {
        let entityUuid = "" + event.data.entityUuid
        let player = event.player
        let level = player.level

        let mainHand = player.getMainHandItem()
        let heldId = mainHand ? ("" + mainHand.id) : ""
        let food = global.foodRegister ? global.foodRegister.getFood(heldId) : null
        if (!food) {
            player.setStatusMessage("§c需要手持可招待的茶水！")
            return
        }

        let entities = level.getEntities()
        let targetEntity = null
        for (let i = 0; i < entities.size(); i++) {
            let ent = entities.get(i)
            if ("" + ent.getUuid() === entityUuid) {
                targetEntity = ent
                break
            }
        }
        if (!targetEntity || global.pfEntityData.pfGetPhase(targetEntity) !== 3) {
            player.setStatusMessage("§c只能招待正在服务中的顾客")
            return
        }
        let item = targetEntity.getMainHandItem()
        if (!item || item.id !== global.pfConstants.SYNC_ITEM_ID || !item.nbt) {
            console.log("[PF-FOOD] 顾客缺少同步物品 uuid=" + entityUuid)
            return
        }
        if (item.nbt.getInt('pfFoodServed') === 1) {
            player.setStatusMessage("§c这位顾客已经喝过茶了")
            return
        }

        if (!player.isCreative()) {
            mainHand.setCount(mainHand.getCount() - 1)
            if (food.container) player.give(Item.of(food.container))
        }

        let partKeys = { jiaozhang: 'pfDemandJiaozhang', jiaogen: 'pfDemandJiaogen', jiaozhi: 'pfDemandJiaozhi', jiaoxin: 'pfDemandJiaoxin' }
        let partNames = { jiaozhang: '推', jiaogen: '揉', jiaozhi: '按', jiaoxin: '搓' }
        let nbt = item.nbt
        let effectTexts = []
        let addDemand = function (part, n) {
            let key = partKeys[part]
            if (!key || n <= 0) return
            let patch = {}
            patch[key] = (nbt.getInt(key) || 0) + n
            nbt.merge(patch)
            effectTexts.push(partNames[part] + "需求+" + n)
        }
        for (let part in food.demands) addDemand(part, food.demands[part] | 0)
        if (food.randomDemand > 0) {
            let parts = ['jiaozhang', 'jiaogen', 'jiaozhi', 'jiaoxin']
            addDemand(parts[Math.floor(Math.random() * parts.length)], food.randomDemand)
        }
        if (food.satisfaction > 0) {
            let satApplied = pfApplyBossSatMul(targetEntity, food.satisfaction)
            nbt.merge({ pfSatisfaction: Math.min(100, (nbt.getInt('pfSatisfaction') || 0) + satApplied) })
            effectTexts.push("满意度+" + satApplied)
        }
        nbt.pfActionPlayerUuid = "" + player.getUuid()
        nbt.merge({ pfFoodServed: 1 })
        targetEntity.setMainHandItem(item.withNBT(nbt))
        try { pfSendDemandSync(player, entityUuid, nbt, '') } catch (e) {
            console.log('[PF-FOOD] 需求同步失败: ' + e)
        }
        player.tell("§a招待了 §e" + (food.name || heldId) + (effectTexts.length > 0 ? " §7| §b" + effectTexts.join("，") : ""))
        console.log("[PF-FOOD] 招待 " + heldId + " uuid=" + entityUuid + " 效果=" + effectTexts.join(","))

        if (!food.rareGuests || food.rareGuests.length === 0) return

        let shop = global.pfShopManager
        let bx = targetEntity.persistentData.getInt("pfShopBaseX") | 0
        let by = targetEntity.persistentData.getInt("pfShopBaseY") | 0
        let bz = targetEntity.persistentData.getInt("pfShopBaseZ") | 0
        let be = shop.pfShopGetBE(level, bx, by, bz)
        if (!be || !shop.pfShopGetIsOpen(be) || !shop.pfShopGetRouteStr(be) || !shop.pfShopGetQueuePos(be)) {
            player.tell("§7店铺未开张，稀客不会前来")
            return
        }
        let dimId = shop.pfDimId(level)
        let rareDef = null
        for (let i = 0; i < food.rareGuests.length && !rareDef; i++) {
            rareDef = global.pfCustomerTypes.pfRareFind(dimId, food.rareGuests[i])
        }
        if (!rareDef) {
            player.tell("§7这里没有会被这杯茶吸引的稀客")
            return
        }
        if (shop.pfShopHasRareOnRoute(level, be, rareDef.id)) {
            player.tell("§d稀客 §e" + rareDef.name + " §d已经在店里了，不会重复出现")
            return
        }
        let playerUuid = "" + be.persistentData.getString("pfShopPlayerUuid")
        let shopPlayer = null
        try { shopPlayer = playerUuid ? level.getPlayerByUUID(playerUuid) : null } catch (e) { shopPlayer = null }
        shop.pfShopSpawnRare(level, be, rareDef, shopPlayer || player)
    })
}

// 导出到全局
global.pfNetworkHandler = {
    setupNetworkHandlers: setupNetworkHandlers
}
