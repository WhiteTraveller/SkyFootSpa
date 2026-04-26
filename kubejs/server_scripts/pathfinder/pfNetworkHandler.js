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
            if (demandKey === "pfDemandJiaobei") part = "jiaobei"
            else if (demandKey === "pfDemandJiaozhang") part = "jiaozhang"
            else if (demandKey === "pfDemandJiaogen") part = "jiaogen"
            else if (demandKey === "pfDemandJiaozhi") part = "jiaozhi"
            else if (demandKey === "pfDemandJiaoxin") part = "jiaoxin"
            
            if (currentValue > 0) {
                // 检查体力是否足够
                if (!global.pfConsumeStamina || !global.pfConsumeStamina(player, 100)) {
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
                satisfaction = Math.min(100, satisfaction + satGain)
                nbt.pfSatisfaction = satisfaction
                
                let money = nbt.getInt('pfMoney') || 0
                nbt.pfMoney = money + moneyGain
                
                // 通知玩家
                player.tell("§a+" + moneyGain + "§6💰 §7| §b+" + satGain + "§d❤")
                
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
            } else {
                console.log("[PF-NETWORK] 需求已为0，无法减少")
            }
            
            targetEntity.setMainHandItem(item.withNBT(nbt))
        }
    })
    
    // 客户端点击泡脚按钮
    NetworkEvents.dataReceived('foot_click_soak', event => {
        let entityUuid = event.data.entityUuid
        let player = event.player
        let level = player.level
        
        console.log("[PF-SOAK] 收到泡脚点击请求 entityUuid=" + entityUuid)
        
        // 检查玩家手持水桶
        let playerMainHand = player.getMainHandItem()
        if (!playerMainHand || playerMainHand.id !== 'minecraft:water_bucket') {
            console.log("[PF-SOAK] 玩家没有手持水桶")
            player.setStatusMessage("§c需要手持水桶才能开始泡脚！")
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
        
        // 开始泡脚
        global.pfSoakManager.pfStartSoak(targetEntity, player)
    })
}

// 导出到全局
global.pfNetworkHandler = {
    setupNetworkHandlers: setupNetworkHandlers
}
