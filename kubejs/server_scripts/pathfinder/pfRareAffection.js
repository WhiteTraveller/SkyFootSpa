// priority: 9
// ============================================================
// 稀客好感度模块 (服务端)
// ------------------------------------------------------------
// 职责：
//   - 好感度持久化：按稀客 id 存储在“寻路方块”BlockEntity 的 persistentData
//     （键 pfRareAff_<rareId>，int，最小 0，无上限）
//   - 爱心文本 / 头顶名牌（爱心行 + 名字行，两行）
//   - 结算：按“更新前好感度”决定爱心档位并掉落对应物品，
//     随后把 (满意度 - 偏移) 累加到方块好感度（可为负即扣除，clamp 最小 0）
//   - 供配置界面读取某方块在某维度下所有稀客的好感度视图
// 好感度阈值 / 掉落配置 / 手办物品表达式 等纯配置 helper 在 pfCustomerTypes.js。
// ============================================================

let PF_AFF_BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

// ========== 维度 id 解析（兼容 ResourceKey[...] 格式）==========
function pfAffDimId(level) {
    let d = '' + level.getDimension()
    let s = d.indexOf(' / ')
    if (s >= 0) {
        d = d.substring(s + 3)
        if (d.charAt(d.length - 1) === ']') d = d.substring(0, d.length - 1)
    }
    return d
}

// ========== 方块好感度存取 ==========

/**
 * 读取方块中某稀客的好感度
 * @param {$BlockEntity_} be 寻路方块实体
 * @param {string} rareId 稀客 id
 * @returns {number} 好感度（无记录返回 0）
 */
function pfGetBeAffection(be, rareId) {
    if (!be || !rareId) return 0
    return be.persistentData.getInt('pfRareAff_' + rareId) | 0
}

/**
 * 设置方块中某稀客的好感度（clamp 最小 0，无上限）
 */
function pfSetBeAffection(be, rareId, value) {
    if (!be || !rareId) return
    let v = value | 0
    if (v < 0) v = 0
    be.persistentData.putInt('pfRareAff_' + rareId, v)
}

/**
 * 累加好感度（delta 可为负），返回累加后的值（clamp 最小 0）
 */
function pfAddBeAffection(be, rareId, delta) {
    let next = pfGetBeAffection(be, rareId) + (delta | 0)
    if (next < 0) next = 0
    pfSetBeAffection(be, rareId, next)
    return next
}

/**
 * 通过实体持久化的开店方块坐标取回方块 BE
 * @returns {$BlockEntity_|null}
 */
function pfEntityShopBe(entity, level) {
    try {
        let x = entity.persistentData.getInt('pfShopBaseX')
        let y = entity.persistentData.getInt('pfShopBaseY')
        let z = entity.persistentData.getInt('pfShopBaseZ')
        if (global.pfShopManager && global.pfShopManager.pfShopGetBE) {
            return global.pfShopManager.pfShopGetBE(level, x, y, z)
        }
        return level.getBlockEntity(new PF_AFF_BlockPos(x | 0, y | 0, z | 0))
    } catch (e) {
        return null
    }
}

// ========== 头顶名牌（爱心行 + 名字行）==========

/**
 * 为稀客实体设置两行头顶名牌：上一行爱心，下一行“★稀客 名字 Lv.x”
 * 好感度取实体生成时的快照（本次服务期间不变）
 * @param {$LivingEntity_} entity 稀客实体
 * @param {Object} rareDef 稀客定义
 * @param {number} affection 好感度快照
 */
function pfApplyRareNameTag(entity, rareDef, affection) {
    try {
        let lvl = global.pfCustomerLevel.pfGetLevel(entity)
        let hearts = global.pfCustomerTypes.pfRareHeartsText(affection)
        let nameLine = '§d★稀客§r ' + (rareDef ? rareDef.name : '稀客') + ' §7Lv.' + lvl
        // 两行名牌：爱心行 + 名字行。
        // 用 append 把换行拆成独立组件段，而不是把 '\n' 塞进整串交给 Text.of 的 § 遗留解析
        // （整串解析时 '\n' 会被处理掉，导致头顶只显示一行）。
        let nameComp = Text.of(hearts).append('\n').append(Text.of(nameLine))
        entity.setCustomName(nameComp)
        entity.setCustomNameVisible(true)
    } catch (e) {
        console.log("[PF-RARE] 名牌设置失败: " + e)
    }
}

// ========== 掉落 roll 与生成 ==========

/**
 * 按掉落配置 roll 出实际物品与数量
 * @param {Array} drops [{item,min,max}]
 * @returns {Array} [{item,count}]（count>0 的项）
 */
function pfRollDropItems(drops) {
    let out = []
    if (!drops) return out
    for (let i = 0; i < drops.length; i++) {
        let d = drops[i]
        if (!d || !d.item) continue
        let min = d.min | 0
        let max = d.max | 0
        if (max < min) max = min
        let count = min + Math.floor(Math.random() * (max - min + 1))
        if (count > 0) out.push({ item: '' + d.item, count: count })
    }
    return out
}

/**
 * 在指定位置生成掉落物（每种物品按 64 上限分批 summon）
 */
function pfSpawnDropItems(level, x, y, z, dropItems) {
    if (!dropItems || dropItems.length === 0) return
    for (let i = 0; i < dropItems.length; i++) {
        let di = dropItems[i]
        let batch = di.count | 0
        while (batch > 0) {
            let c = Math.min(64, batch)
            let cmd = 'summon item ' + x + ' ' + y + ' ' + z +
                ' {Item:{id:"' + di.item + '",Count:' + c + 'b}}'
            try { level.getServer().runCommandSilent(cmd) } catch (e) {
                console.log("[PF-RARE] 掉落物生成失败 " + di.item + ": " + e)
            }
            batch -= c
        }
    }
}

// ========== 结算 ==========

/**
 * 稀客服务结算：按“更新前好感度”决定爱心档位掉落物品，再把 (满意度 - 偏移) 累加进方块好感度
 * 在 sleep.js 需求清零结算分支中调用（仅对带 pfRareId 的实体生效）
 * @param {$LivingEntity_} entity 稀客实体
 * @param {$Level_} level 世界
 * @param {number} satisfaction 本单满意度
 * @returns {Object|null} 结算信息（非稀客返回 null）
 */
function pfApplyRareSettlement(entity, level, satisfaction) {
    let rareId = '' + entity.persistentData.getString('pfRareId')
    if (!rareId || rareId.length === 0) return null

    // 更新前好感度快照（生成时写入），据此决定爱心档位与掉落
    let preAffection = entity.persistentData.getInt('pfRareAffSnapshot') | 0
    let dimId = pfAffDimId(level)
    let rareDef = global.pfCustomerTypes.pfRareFind(dimId, rareId)
    let heartCount = global.pfCustomerTypes.pfRareHeartCount(preAffection)
    let drops = global.pfCustomerTypes.pfRareDropsFor(rareDef, heartCount)
    let rolled = pfRollDropItems(drops)
    pfSpawnDropItems(level, entity.x, entity.y + 1, entity.z, rolled)

    // 好感度增量 = 满意度 - 偏移（可为负），写回开店方块 BE
    let delta = (satisfaction | 0) - global.pfCustomerTypes.PF_RARE_AFFECTION_SAT_OFFSET
    let be = pfEntityShopBe(entity, level)
    let newAffection = 0
    if (be) {
        newAffection = pfAddBeAffection(be, rareId, delta)
    } else {
        console.log("[PF-RARE] 结算未找到开店方块 BE，好感度未持久化 rareId=" + rareId)
    }

    let name = rareDef ? rareDef.name : rareId
    console.log("[PF-RARE] 结算 " + name + "(" + rareId + "): 更新前好感=" + preAffection +
        " 爱心=" + heartCount + " 增量=" + delta + " 更新后好感=" + newAffection +
        " 掉落=" + rolled.length + "种")
    return {
        rareId: rareId, name: name, heartCount: heartCount,
        delta: delta, newAffection: newAffection, drops: rolled
    }
}

// ========== 配置界面视图 ==========

/**
 * 构建某方块在某维度下“所有稀客”的好感度视图（供配置界面列表 + 详情展示）
 * @param {$BlockEntity_} be 寻路方块实体
 * @param {string} dimId 维度干净 id
 * @returns {Array} 视图数组，每项含 id/name/model/figure/affection/hearts/tiers
 */
function pfBuildRareAffectionView(be, dimId) {
    let pool = global.pfCustomerTypes.pfRareGetPool(dimId)
    let maxHearts = global.pfCustomerTypes.PF_RARE_HEART_THRESHOLDS.length
    let out = []
    for (let i = 0; i < pool.length; i++) {
        let r = pool[i]
        let aff = pfGetBeAffection(be, r.id)
        let hearts = global.pfCustomerTypes.pfRareHeartCount(aff)
        // 各爱心档位（0..maxHearts）的掉落配置
        let tiers = []
        let thresholds = global.pfCustomerTypes.PF_RARE_HEART_THRESHOLDS
        for (let hc = 0; hc <= maxHearts; hc++) {
            let drops = global.pfCustomerTypes.pfRareDropsFor(r, hc)
            let items = []
            for (let j = 0; j < drops.length; j++) {
                let d = drops[j]
                items.push({ item: '' + d.item, min: d.min | 0, max: d.max | 0 })
            }
            // 该爱心档位对应的好感度阈值（0 心=0，n 心=第 n 个阈值），供界面显示“好感度达到 xxx”
            let threshold = (hc === 0) ? 0 : (thresholds[hc - 1] | 0)
            tiers.push({ hearts: hc, threshold: threshold, items: items })
        }
        let lore = (global.pfCustomerTypes.PF_RARE_LORE && global.pfCustomerTypes.PF_RARE_LORE[r.id]) || {}
        out.push({
            id: '' + r.id,
            name: '' + r.name,
            model: '' + r.model,
            figure: global.pfCustomerTypes.pfRareFigureItemExpr(r.model),
            race: '' + (lore.race || ''),
            work: '' + (lore.work || ''),
            desc: '' + (lore.desc || ''),
            affection: aff,
            hearts: hearts,
            tiers: tiers
        })
    }
    return out
}

// 导出到全局
global.pfRareAffection = {
    pfAffDimId: pfAffDimId,
    pfGetBeAffection: pfGetBeAffection,
    pfSetBeAffection: pfSetBeAffection,
    pfAddBeAffection: pfAddBeAffection,
    pfEntityShopBe: pfEntityShopBe,
    pfApplyRareNameTag: pfApplyRareNameTag,
    pfRollDropItems: pfRollDropItems,
    pfSpawnDropItems: pfSpawnDropItems,
    pfApplyRareSettlement: pfApplyRareSettlement,
    pfBuildRareAffectionView: pfBuildRareAffectionView
}

console.log("[PF-RARE] 稀客好感度模块已加载")
