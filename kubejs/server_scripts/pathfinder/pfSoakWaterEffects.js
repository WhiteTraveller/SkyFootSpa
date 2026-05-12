// priority: 10
// ============================================================
// 洗脚水效果应用模块
// 在泡脚倒计时结束时（pfSoakDone 由 0→1 的瞬间）调用
// 根据实体 NBT 的 pfSoakWaterType 字段查找对应水配置并应用效果
// ------------------------------------------------------------
// 效果方向（不修改玩家体力）：
//   1) 增加顾客各部位需求（pfDemandJiaozhang/Jiaogen/Jiaozhi/Jiaoxin）
//   2) 提高满意度（pfSatisfaction）
//   3) 即时掉落钱（按 coinsje 贪心拆分硬币，参考 sleep.js）
//   4) 增加每次搓脚掉落皴数量（写入 pfCunBonusPerClick，独立计算）
//   5) 玩家/实体药水附加（视觉 & 额外 buff）
//   6) 自定义 onFinish 回调
// ============================================================

// 金币面额表（copper 基准，与 sleep.js 一致）
const PF_SOAK_COIN_TIERS = [
    { id: 'coinsje:netherite_coin', value: 6561 },
    { id: 'coinsje:diamond_coin', value: 729 },
    { id: 'coinsje:gold_coin', value: 81 },
    { id: 'coinsje:iron_coin', value: 9 },
    { id: 'coinsje:copper_coin', value: 1 }
]

// 4 部位需求 NBT key
const PF_SOAK_DEMAND_KEYS = {
    jiaozhang: 'pfDemandJiaozhang',
    jiaogen: 'pfDemandJiaogen',
    jiaozhi: 'pfDemandJiaozhi',
    jiaoxin: 'pfDemandJiaoxin'
}

// 根据桶 id 查回水定义
function pfResolveSoakWater(bucketId) {
    if (!bucketId || bucketId === 'minecraft:water_bucket') return null
    if (!global.soakWaterRegister) return null
    return global.soakWaterRegister.getByBucketId(bucketId)
}

// 通过 NBT 中的 pfActionPlayerUuid 查回玩家
function pfFindActionPlayer(entity) {
    let item = entity.getMainHandItem()
    if (!item || !item.nbt) return null
    let uuid = '' + item.nbt.getString('pfActionPlayerUuid')
    if (!uuid || uuid.length === 0) return null
    let level = entity.level
    let players = level.getPlayers()
    for (let i = 0; i < players.size(); i++) {
        let p = players.get(i)
        if (('' + p.getUuid()) === uuid) return p
    }
    return null
}

// 把 copper 数量按面额贪心拆分，在坐标掉落硬币实体
function pfDropCoinsGreedy(level, x, y, z, totalCopper) {
    if (totalCopper <= 0) return
    // 优先走硬币掉落调度器：每 2 tick 以随机微小速度弹出一枚
    if (global.pfCoinQueue && typeof global.pfCoinQueue.enqueueCoins === 'function') {
        global.pfCoinQueue.enqueueCoins(level, x, y, z, totalCopper)
        return
    }
    // 降级：调度器未就绪时使用一次性 summon
    let remaining = Math.floor(totalCopper)
    let server = level.getServer()
    for (let t = 0; t < PF_SOAK_COIN_TIERS.length; t++) {
        let tier = PF_SOAK_COIN_TIERS[t]
        let cnt = Math.floor(remaining / tier.value)
        if (cnt <= 0) continue
        remaining -= cnt * tier.value
        let batch = cnt
        while (batch > 0) {
            let c = Math.min(64, batch)
            let cmd = 'summon item ' + x + ' ' + y + ' ' + z + ' {Item:{id:"' + tier.id + '",Count:' + c + 'b}}'
            server.runCommandSilent(cmd)
            batch -= c
        }
    }
}

// 计算每部位需求增量
// - demandBonusPerPart：精细控制，每部位独立 roll [0, upper] 随机
// - demandBonus：4 部位通用上限，每部位独立 roll [0, demandBonus] 随机
function pfResolveDemandDelta(water) {
    let delta = { jiaozhang: 0, jiaogen: 0, jiaozhi: 0, jiaoxin: 0 }
    let rollUpTo = function (u) {
        let up = (u | 0)
        if (up <= 0) return 0
        return Math.floor(Math.random() * (up + 1)) // [0, up]
    }
    if (water.demandBonusPerPart) {
        let p = water.demandBonusPerPart
        delta.jiaozhang = rollUpTo(p.jiaozhang)
        delta.jiaogen = rollUpTo(p.jiaogen)
        delta.jiaozhi = rollUpTo(p.jiaozhi)
        delta.jiaoxin = rollUpTo(p.jiaoxin)
    } else if (water.demandBonus && water.demandBonus > 0) {
        let v = water.demandBonus | 0
        delta.jiaozhang = rollUpTo(v)
        delta.jiaogen = rollUpTo(v)
        delta.jiaozhi = rollUpTo(v)
        delta.jiaoxin = rollUpTo(v)
    }
    return delta
}

// 泡脚完成时的效果应用
// 参数：entity - 顾客实体；bucketId - 泡脚使用的桶 id（NBT 中 pfSoakWaterType）
function pfApplySoakEffects(entity, bucketId) {
    let water = pfResolveSoakWater(bucketId)
    if (!water) return
    let player = pfFindActionPlayer(entity)
    let level = entity.level
    let server = level.getServer()

    // 预拿顾客手持 paper（承载全部 pfXxx NBT）
    let item = entity.getMainHandItem()
    let nbt = (item && item.nbt) ? item.nbt : null
    let syncItemOk = (item && global.pfConstants && item.id === global.pfConstants.SYNC_ITEM_ID && nbt)

    // 1) 追加 4 部位需求
    if (syncItemOk) {
        try {
            let delta = pfResolveDemandDelta(water)
            let addedSummary = []
            let keys = ['jiaozhang', 'jiaogen', 'jiaozhi', 'jiaoxin']
            for (let i = 0; i < keys.length; i++) {
                let k = keys[i]
                let add = delta[k]
                if (add > 0) {
                    let nbtKey = PF_SOAK_DEMAND_KEYS[k]
                    let curr = nbt.getInt(nbtKey) || 0
                    nbt[nbtKey] = curr + add
                    addedSummary.push(k + '+' + add)
                }
            }
            if (addedSummary.length > 0) {
                console.log('[SOAK-WATER] 需求增量: ' + addedSummary.join(', ') + ' (' + water.name + ')')
            }
        } catch (e) {
            console.log("[SOAK-WATER] 需求追加失败: " + e)
        }
    }

    // 2) 追加满意度
    if (syncItemOk && water.satisfactionBonus > 0) {
        try {
            let curr = nbt.getInt('pfSatisfaction') || 0
            nbt.pfSatisfaction = curr + water.satisfactionBonus
        } catch (e) {
            console.log("[SOAK-WATER] 满意度追加失败: " + e)
        }
    }

    // 3) 写入皴加成（独立计算，由 pfCunDrop 在搓脚时读取）
    if (syncItemOk && water.cunBonusPerClick && water.cunBonusPerClick > 0) {
        try {
            let curr = nbt.getInt('pfCunBonusPerClick') || 0
            nbt.pfCunBonusPerClick = curr + (water.cunBonusPerClick | 0)
            console.log('[SOAK-WATER] 皴加成: +' + water.cunBonusPerClick + '/click (累计 ' + nbt.pfCunBonusPerClick + ')')
        } catch (e) {
            console.log("[SOAK-WATER] 皴加成写入失败: " + e)
        }
    }

    // 将以上 NBT 变更写回 paper
    if (syncItemOk) {
        try { entity.setMainHandItem(item.withNBT(nbt)) } catch (e) { console.log("[SOAK-WATER] NBT 回写失败: " + e) }
    }

    // 4) 即时掉落钱（贪心硬币）
    if (water.moneyDrop && water.moneyDrop > 0) {
        try {
            pfDropCoinsGreedy(level, entity.x, entity.y + 0.5, entity.z, water.moneyDrop | 0)
            console.log('[SOAK-WATER] 掉落钱 copper=' + water.moneyDrop + ' @ (' + entity.x.toFixed(1) + ',' + entity.y.toFixed(1) + ',' + entity.z.toFixed(1) + ')')
        } catch (e) {
            console.log("[SOAK-WATER] 掉钱失败: " + e)
        }
    }

    // 5) 给玩家施加附加药水效果
    if (player && water.playerEffects && water.playerEffects.length > 0) {
        let name = player.getUsername()
        for (let i = 0; i < water.playerEffects.length; i++) {
            let ef = water.playerEffects[i]
            try {
                let sec = Math.max(1, Math.floor(ef.duration / 20))
                let amp = ef.amp || 0
                server.runCommandSilent('effect give ' + name + ' ' + ef.id + ' ' + sec + ' ' + amp)
            } catch (e) {
                console.log("[SOAK-WATER] 玩家效果失败: " + e)
            }
        }
    }

    // 6) 给实体施加附加药水效果（通常用于视觉）
    if (water.entityEffects && water.entityEffects.length > 0) {
        for (let i = 0; i < water.entityEffects.length; i++) {
            let ef = water.entityEffects[i]
            try {
                let sec = Math.max(1, Math.floor(ef.duration / 20))
                let amp = ef.amp || 0
                server.runCommandSilent('effect give ' + entity.getUuid() + ' ' + ef.id + ' ' + sec + ' ' + amp)
            } catch (e) { }
        }
    }

    // 7) 自定义回调
    if (typeof water.onFinish === 'function') {
        try { water.onFinish(player, entity, water) } catch (e) {
            console.log("[SOAK-WATER] onFinish 回调异常: " + e)
        }
    }

    // 通知玩家
    if (player) {
        let parts = []
        if (water.demandBonus || water.demandBonusPerPart) parts.push('§e需求+')
        if (water.satisfactionBonus > 0) parts.push('§d满意度+' + water.satisfactionBonus)
        if (water.moneyDrop > 0) parts.push('§6💰+' + water.moneyDrop)
        if (water.cunBonusPerClick > 0) parts.push('§f皴+' + water.cunBonusPerClick + '/次')
        player.tell('§b✦ §f' + water.nameZH + ' §b泡脚完成！§7' + (parts.length > 0 ? '(' + parts.join(' §7| ') + '§7)' : ''))
    }

    console.log("[SOAK-WATER] 应用效果完成: " + water.name + " uuid=" + entity.getUuid())
}

// 导出到全局
global.pfSoakWaterEffects = {
    pfApplySoakEffects: pfApplySoakEffects,
    pfResolveSoakWater: pfResolveSoakWater
}
