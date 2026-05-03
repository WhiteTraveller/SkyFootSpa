// ============================================================
// 芯片盲盒 - 加权随机抽取遗物
// ============================================================
// 规则：
//   1. 盲盒阶段N → 只能抽出阶段 1~N 的遗物
//   2. 稀有度越高，权重越低
//   3. 遗物阶段与盲盒阶段越接近，权重越高
//   4. 仅从"普通"池(common pool)中抽取
// ============================================================

// ===== 稀有度基础权重 =====
let RARITY_WEIGHTS = {
    '普通': 100,
    '少见': 40,
    '稀有': 15,
    '史诗': 5
}

// ===== 阶段距离权重倍率 =====
// distance = blindbox_stage - relic_stage
// distance 0 (同阶段): ×4.0
// distance 1: ×2.5
// distance 2: ×1.5
// distance 3: ×1.0
// distance 4+: ×0.5
let STAGE_DISTANCE_MULTIPLIER = [4.0, 2.5, 1.5, 1.0, 0.5]

function getStageMultiplier(distance) {
    if (distance < 0) return 0
    if (distance >= STAGE_DISTANCE_MULTIPLIER.length) {
        return STAGE_DISTANCE_MULTIPLIER[STAGE_DISTANCE_MULTIPLIER.length - 1]
    }
    return STAGE_DISTANCE_MULTIPLIER[distance]
}

/**
 * 构建加权遗物池
 * @param {number} boxStage - 盲盒阶段 1~5
 * @returns {Array<{relic: object, weight: number}>}
 */
function buildWeightedPool(boxStage) {
    let pool = []
    let relics = global.relicRegister.relics
    for (let i = 0; i < relics.length; i++) {
        let relic = relics[i]
        // 仅从普通池抽取
        if (relic.pool.name !== '普通') continue
        // 只能抽 <= 当前阶段的遗物
        if (relic.stage < 1 || relic.stage > boxStage) continue

        // 计算权重
        let rarityWeight = RARITY_WEIGHTS[relic.rarity.name] || 50
        let distance = boxStage - relic.stage
        let stageMultiplier = getStageMultiplier(distance)
        let finalWeight = rarityWeight * stageMultiplier

        if (finalWeight > 0) {
            pool.push({ relic: relic, weight: finalWeight })
        }
    }
    return pool
}

/**
 * 从加权池中随机抽取一个遗物
 * @param {Array<{relic: object, weight: number}>} pool
 * @returns {object|null} relic对象
 */
function weightedRandomPick(pool) {
    if (pool.length === 0) return null

    let totalWeight = 0
    for (let i = 0; i < pool.length; i++) {
        totalWeight += pool[i].weight
    }

    let roll = Math.random() * totalWeight
    let cumulative = 0
    for (let i = 0; i < pool.length; i++) {
        cumulative += pool[i].weight
        if (roll < cumulative) {
            return pool[i].relic
        }
    }
    // 兜底返回最后一个
    return pool[pool.length - 1].relic
}

// ===== 稀有度颜色映射 =====
let RARITY_COLOR = {
    '普通': '§f',
    '少见': '§e',
    '稀有': '§9',
    '史诗': '§d'
}

// ===== 右键使用盲盒 =====
ItemEvents.rightClicked(event => {
    let player = event.getPlayer()
    if (!player || player.getLevel().isClientSide()) return

    let item = event.getItem()
    let itemId = item.getId()

    // 检查是否是盲盒物品
    if (itemId.indexOf('marguerite:chip_blindbox_') !== 0) return

    let stageStr = itemId.replace('marguerite:chip_blindbox_', '')
    let boxStage = parseInt(stageStr)
    if (isNaN(boxStage) || boxStage < 1 || boxStage > 5) return

    // 构建加权池并抽取
    let pool = buildWeightedPool(boxStage)
    if (pool.length === 0) {
        player.tell(Text.red('[盲盒] 当前阶段无可用遗物！'))
        return
    }

    let picked = weightedRandomPick(pool)
    if (!picked) {
        player.tell(Text.red('[盲盒] 抽取失败！'))
        return
    }

    // 消耗盲盒
    if (!player.isCreative()) {
        item.shrink(1)
    }

    // 给予遗物
    let relicItemId = 'marguerite:' + picked.name
    player.give(Item.of(relicItemId))

    // 发送抽取结果消息
    let rarityColor = RARITY_COLOR[picked.rarity.name] || '§f'
    let displayName = picked.nameZH || picked.name
    player.tell(
        Text.gray('[芯片盲盒] 获得了 ')
            .append(Text.of(rarityColor + '[' + picked.rarity.name + '] '))
            .append(Text.gold(displayName))
    )

    // 设置冷却防连点 (10tick = 0.5秒)
    player.addItemCooldown(item.getItem(), 10)
})
