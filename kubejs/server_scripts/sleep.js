// ============================================================
// 睡眠控制模块 - pathfinder.js 的睡眠回调扩展
// sleep.js L1-L120
// UI显示由 client_scripts/foot_ui.js 管理
// ============================================================

// 常量定义
let SYNC_ITEM_ID = 'minecraft:paper'  // 用于同步数据的手持物品ID

// 全局 Window 管理器（保留用于客户端脚本访问）
global.pfSleepWindows = global.pfSleepWindows || new Map()

/**
 * 根据床的 yaw 计算脚的位置（床尾位置）
 * yaw 是实体面向的方向（头朝向），脚在相反方向
 * 
 * @param {number} bedX    床头X坐标
 * @param {number} bedY    床Y坐标
 * @param {number} bedZ    床头Z坐标
 * @param {number} yaw     实体朝向（头朝向）
 * @returns {Object} 脚位置 {x, y, z}
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    // yaw=0: 头朝南(+Z), 脚朝北(-Z)
    // yaw=180: 头朝北(-Z), 脚朝南(+Z)
    // yaw=90: 头朝西(-X), 脚朝东(+X)
    // yaw=-90: 头朝东(+X), 脚朝西(-X)
    let footX = bedX
    let footZ = bedZ

    if (yaw === 0) {
        // 头朝南，脚在北
        footZ = bedZ - 1
    } else if (yaw === 180 || yaw === -180) {
        // 头朝北，脚在南
        footZ = bedZ + 1
    } else if (yaw === 90) {
        // 头朝西，脚在东
        footX = bedX + 1
    } else if (yaw === -90) {
        // 头朝东，脚在西
        footX = bedX - 1
    }

    return { x: footX + 0.5, y: bedY, z: footZ + 0.5 }
}

/**
 * 开始睡觉时触发的回调函数
 * UI创建由客户端脚本（foot_ui.js）处理，此处仅记录日志
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} currentTick     当前游戏tick
 */
global.pfOnStartSleep = function (entity, level, bedPos, currentTick) {
    let uuid = "" + entity.getUuid()
    console.log("[SLEEP-JS] 开始睡觉 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)

    // 计算脚的位置（用于日志）
    let footPos = pfGetFootPosition(bedPos.blockX, bedPos.blockY, bedPos.blockZ, bedPos.yaw)
    console.log("[SLEEP-JS] 脚位置: (" + footPos.x.toFixed(1) + "," + footPos.y + "," + footPos.z.toFixed(1) + ")")
    
    // UI由客户端脚本管理，无需在此创建
}

/**
 * 检测是否应该起床
 * 返回 true 时实体会起床，返回 false 则继续睡觉
 * UI移除由客户端脚本（foot_ui.js）处理
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} sleepDuration   已睡眠时长（tick）
 * @returns {boolean} true=应该起床, false=继续睡觉
 */
global.pfShouldWakeUp = function (entity, level, bedPos, sleepDuration) {
    let uuid = "" + entity.getUuid()

    // // 10秒（200 tick）超时起床
    // if (sleepDuration > 200) {
    //     console.log("[SLEEP-JS] 睡眠超时 200 tick，起床 uuid=" + uuid)
    //     return true
    // }

    // // 检测 serve_finish 字段，存在则起床
    // let serveFinish = entity.persistentData.getInt("serve_finish")
    // if (serveFinish === 1) {
    //     console.log("[SLEEP-JS] 检测到 serve_finish 标记，起床")
    //     // 清除标记
    //     entity.persistentData.putInt("serve_finish", 0)
    //     return true
    // }

    // 检查需求清单是否全部为0ﾈ4部位）
    let item = entity.getMainHandItem()
    if (item && item.id === SYNC_ITEM_ID && item.nbt) {
        let nbt = item.nbt
        let jiaozhang = nbt.getInt('pfDemandJiaozhang') || 0
        let jiaogen = nbt.getInt('pfDemandJiaogen') || 0
        let jiaozhi = nbt.getInt('pfDemandJiaozhi') || 0
        let jiaoxin = nbt.getInt('pfDemandJiaoxin') || 0
        // console.log("[SLEEP-JS] 需求: 脚掌=" + jiaozhang + ", 脚根=" + jiaogen + ", 脚趾=" + jiaozhi + ", 脚心=" + jiaoxin)
        
        // 所有需求都为0时才能起床
        if (jiaozhang === 0 && jiaogen === 0 && jiaozhi === 0 && jiaoxin === 0) {
            console.log("[SLEEP-JS] 所有需求已清零，起床 uuid=" + uuid)
            
            // 结算规则：
            // - 本单累计金钱（pfMoney）按 coinsje 硬币体系贪心拆分，从最高面额向下
            // - 面额比例: copper=1, iron=9, gold=81, diamond=729, netherite=6561
            // - 例：10 = 1 iron + 1 copper；730 = 1 diamond + 1 copper
            let money = nbt.getInt('pfMoney') || 0
            let totalCopper = Math.max(0, Math.floor(money))
            console.log("[SLEEP-JS] 需求完成！掉落硬币 totalCopper=" + totalCopper + " (累计金钱=" + money + ")")
            if (totalCopper > 0) {
                let x = entity.x
                let y = (entity.y + 1)
                let z = entity.z
                // 改为入队到"硬币掉落调度器"，每 2 tick 以随机微小速度弹出一枚
                // 详见 kubejs/server_scripts/pathfinder/pfCoinDropScheduler.js
                if (global.pfCoinQueue && typeof global.pfCoinQueue.enqueueCoins === 'function') {
                    let pushed = global.pfCoinQueue.enqueueCoins(level, x, y, z, totalCopper)
                    console.log('[SLEEP-JS] 已入队 ' + pushed + ' 枚硬币，交由调度器逐枚弹出')
                } else {
                    // 降级：调度器未就绪时回退到一次性 summon
                    console.log('[SLEEP-JS] pfCoinQueue 未就绪，回退一次性 summon 模式')
                    let coinTiers = [
                        { id: 'coinsje:netherite_coin', value: 6561 },
                        { id: 'coinsje:diamond_coin',   value: 729 },
                        { id: 'coinsje:gold_coin',      value: 81 },
                        { id: 'coinsje:iron_coin',      value: 9 },
                        { id: 'coinsje:copper_coin',    value: 1 }
                    ]
                    let remainingCopper = totalCopper
                    for (let t = 0; t < coinTiers.length; t++) {
                        let tier = coinTiers[t]
                        let cnt = Math.floor(remainingCopper / tier.value)
                        if (cnt <= 0) continue
                        remainingCopper -= cnt * tier.value
                        let batch = cnt
                        while (batch > 0) {
                            let c = Math.min(64, batch)
                            let cmd = 'summon item ' + x + ' ' + y + ' ' + z + ' {Item:{id:"' + tier.id + '",Count:' + c + 'b}}'
                            level.getServer().runCommandSilent(cmd)
                            batch -= c
                        }
                    }
                }
            }
            
            // 评价系统：满意度 >= 60 时，该类顾客评价+1
            let satisfaction = nbt.getInt('pfSatisfaction') || 0

            // 满意度粒子特效：在顾客所在位置按满意度等级生成不同粒子
            try {
                let px = entity.x
                let py = entity.y + 1
                let pz = entity.z
                let particleType, particleCount
                if (satisfaction >= 80) {
                    // 非常满意：爱心
                    particleType = "minecraft:heart"
                    particleCount = 30
                } else if (satisfaction >= 60) {
                    // 满意：开心村民（绿色加号）
                    particleType = "minecraft:happy_villager"
                    particleCount = 25
                } else if (satisfaction >= 30) {
                    // 一般：浅烟雾
                    particleType = "minecraft:cloud"
                    particleCount = 15
                } else {
                    // 不满：生气村民
                    particleType = "minecraft:angry_villager"
                    particleCount = 10
                }
                level.spawnParticles(particleType, false, px, py, pz, 0.6, 0.8, 0.6, particleCount, 0.05)
                console.log("[SLEEP-JS] 满意度粒子: " + particleType + " x" + particleCount + " (sat=" + satisfaction + ")")
            } catch (e) { console.log("[SLEEP-JS] 满意度粒子生成失败: " + e) }

            // 服务完成对话：按满意度等级抽取一条，仅发送给操作玩家（pfActionPlayerUuid）
            try {
                let dialogPool
                if (satisfaction >= 80) {
                    // 非常满意
                    dialogPool = [
                        "啊~~太舒服了！下次还来！",
                        "老板手艺真是绝了！",
                        "感觉脚都飘起来了，谢谢老板！",
                        "这是我搓过最舒服的一次！",
                        "我要把这家店推荐给所有朋友！",
                        "老板的手简直有魔力！"
                    ]
                } else if (satisfaction >= 60) {
                    // 满意
                    dialogPool = [
                        "嗯，挺不错的，下次还会再来。",
                        "服务很到位，感谢。",
                        "比我想象的好~",
                        "舒服了，谢啦~",
                        "可以可以，值这个价。"
                    ]
                } else if (satisfaction >= 30) {
                    // 一般
                    dialogPool = [
                        "嗯...还行吧。",
                        "凑合凑合。",
                        "下次再说吧。",
                        "也就那样。",
                        "嗯，那我先走了。"
                    ]
                } else {
                    // 不满
                    dialogPool = [
                        "这就完了？",
                        "哎，不太行啊。",
                        "感觉没怎么舒服...",
                        "下次不会再来了。",
                        "希望老板能多练练。"
                    ]
                }
                let line = dialogPool[Math.floor(Math.random() * dialogPool.length)]

                // 从实体手持物品 NBT 反查“操作玩家 UUID”
                let dialogPlayer = null
                let dialogUuid = '' + nbt.getString('pfActionPlayerUuid')
                if (dialogUuid && dialogUuid.length > 0) {
                    let allPlayers = level.getPlayers()
                    for (let i = 0; i < allPlayers.size(); i++) {
                        let p = allPlayers.get(i)
                        if (('' + p.getUuid()) === dialogUuid) {
                            dialogPlayer = p
                            break
                        }
                    }
                }
                if (dialogPlayer) {
                    dialogPlayer.tell("§e顾客：§f" + line)
                    console.log("[SLEEP-JS] 服务完成对话已发送 (sat=" + satisfaction + "): " + line)
                } else {
                    console.log("[SLEEP-JS] 服务完成对话: 未找到操作玩家 uuid=" + dialogUuid)
                }
            } catch (e) { console.log("[SLEEP-JS] 服务完成对话发送失败: " + e) }
            let customerCategory = '' + entity.persistentData.getString('pfCustomerCategory')
            if (satisfaction >= global.pfCustomerTypes.PF_RATING_SAT_THRESHOLD && customerCategory && customerCategory.length > 0) {
                // 通过实体上持久化的 pfSpawnerPlayerUuid 反查开店玩家（不依赖 global.pfShopState 内存状态）
                let shopPlayer = null
                try {
                    let spawnerUuid = "" + entity.persistentData.getString("pfSpawnerPlayerUuid")
                    if (spawnerUuid && spawnerUuid.length > 0) {
                        shopPlayer = level.getPlayerByUUID(spawnerUuid)
                    }
                } catch (e) {
                    shopPlayer = null
                }
                if (shopPlayer) {
                    let newRating = global.pfCustomerTypes.pfAddRating(shopPlayer, customerCategory)
                    let catName = global.pfCustomerTypes.PF_CUSTOMER_TYPES[customerCategory]
                        ? global.pfCustomerTypes.PF_CUSTOMER_TYPES[customerCategory].name : customerCategory
                    shopPlayer.tell('§a★ ' + catName + '§a类顾客评价提升！§e(§b' + newRating + '§e/§b100§e)')
                    console.log('[SLEEP-JS] 评价更新: ' + customerCategory + ' -> ' + newRating)
                }
            }

            // 高满意度奖励：满意度 > 60 时额外掉落一个下界之星
            if (satisfaction > 60) {
                let sx = entity.x
                let sy = (entity.y + 1)
                let sz = entity.z
                let starCmd = 'summon item ' + sx + ' ' + sy + ' ' + sz + ' {Item:{id:"minecraft:nether_star",Count:1b}}'
                level.getServer().runCommandSilent(starCmd)
                console.log('[SLEEP-JS] 高满意度奖励: 掉落 1 个下界之星 (satisfaction=' + satisfaction + ')')

                // 从实体手持物品 NBT 读取"操作玩家 UUID"，回查对应玩家
                let actionPlayer = null
                let actionUuid = '' + nbt.getString('pfActionPlayerUuid')
                if (actionUuid && actionUuid.length > 0) {
                    let players = level.getPlayers()
                    for (let i = 0; i < players.size(); i++) {
                        let p = players.get(i)
                        if (('' + p.getUuid()) === actionUuid) {
                            actionPlayer = p
                            break
                        }
                    }
                }
                if (actionPlayer) {
                    actionPlayer.tell('§d✦ 顾客非常满意！获得下界之星 ×1 §7(满意度 ' + satisfaction + '%)')
                } else {
                    console.log('[SLEEP-JS] 未找到操作玩家，UUID=' + actionUuid)
                }
            }
            
            if (global.aTip && typeof global.aTip.advance === 'function') {
                let finishPlayer = null
                if (typeof global.aTip.findActionPlayer === 'function') {
                    finishPlayer = global.aTip.findActionPlayer(entity, level)
                }
                if (finishPlayer) {
                    global.aTip.advance(finishPlayer, 'wait_rub_foot', 'done', 'pathfinder_service_finish_tip')
                }
            }

            return true
        }
    }

    return false
}
