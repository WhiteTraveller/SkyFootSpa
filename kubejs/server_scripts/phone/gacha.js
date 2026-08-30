// ============================================================
// 手机抽卡（补给）服务端处理
// 客户端事件：phone_gacha_pull { count: 1 或 10 }
// 规则：
//   - 每次抽卡消耗 6 个下界之星（minecraft:nether_star）
//   - 不足则拒绝；足够则按 count 次执行盲盒抽奖
//   - 抽奖池复用 blindbox.js 的阶段2权重池（覆盖 Stage1~Stage2）
// ============================================================

let GACHA_COST_PER_PULL = 6               // 每次抽卡消耗的下界之星数量
let GACHA_POOL_STAGE = 2                  // 抽卡使用的盲盒阶段（Stage1~Stage2 遗物池）
let GACHA_MAX_PULLS_PER_REQUEST = 10      // 防御：单次请求上限
let NETHER_STAR_ID = 'minecraft:nether_star'

/**
 * 统计玩家背包中的下界之星总数
 */
function pfCountNetherStars(player) {
    let items = player.getInventory().getAllItems()
    let total = 0
    for (let i = 0; i < items.size(); i++) {
        let stack = items.get(i)
        if (stack && stack.id === NETHER_STAR_ID) {
            total += stack.getCount()
        }
    }
    return total
}

/**
 * 从玩家背包消耗指定数量的下界之星
 * @returns {number} 实际消耗数量
 */
function pfConsumeNetherStars(player, amount) {
    if (amount <= 0) return 0
    let items = player.getInventory().getAllItems()
    let remaining = amount
    for (let i = 0; i < items.size(); i++) {
        if (remaining <= 0) break
        let stack = items.get(i)
        if (stack && stack.id === NETHER_STAR_ID) {
            let cnt = stack.getCount()
            if (cnt <= 0) continue
            let take = Math.min(cnt, remaining)
            stack.setCount(cnt - take)
            remaining -= take
        }
    }
    return amount - remaining
}

// ===== 接收客户端抽卡请求 =====
NetworkEvents.dataReceived('phone_gacha_pull', event => {
    let player = event.player
    if (!player) return

    let count = 1
    try {
        count = event.data.getInt('count')
    } catch (e) { count = 1 }
    if (!count || count < 1) count = 1
    if (count > GACHA_MAX_PULLS_PER_REQUEST) count = GACHA_MAX_PULLS_PER_REQUEST

    let totalCost = GACHA_COST_PER_PULL * count
    console.log("[GACHA] 玩家=" + player.getName().getString() + " 请求抽卡, count=" + count + ", 需要下界之星=" + totalCost)

    // 创意玩家免费
    let isCreative = player.isCreative()

    // 检测数量
    if (!isCreative) {
        let owned = pfCountNetherStars(player)
        if (owned < totalCost) {
            player.tell('§c[补给] 下界之星不足！需要 §e' + totalCost + '§c 个，当前 §e' + owned + '§c 个')
            player.setStatusMessage('§c下界之星不足')
            return
        }
    }

    // 校验抽奖 API 是否就绪
    if (!global.pfGachaApi || typeof global.pfGachaApi.buildWeightedPool !== 'function') {
        console.log("[GACHA] 抽奖 API 未加载")
        player.tell('§c[补给] 抽奖系统未就绪')
        return
    }

    // 构建加权池
    let pool = global.pfGachaApi.buildWeightedPool(GACHA_POOL_STAGE)
    if (!pool || pool.length === 0) {
        player.tell('§c[补给] 当前阶段无可用遗物！')
        return
    }

    // 消耗下界之星
    if (!isCreative) {
        let consumed = pfConsumeNetherStars(player, totalCost)
        if (consumed < totalCost) {
            player.tell('§c[补给] 下界之星消耗失败')
            console.log("[GACHA] 消耗失败，实际=" + consumed + "/" + totalCost)
            return
        }
    }

    // 执行 count 次抽奖
    player.tell('§6[补给] §7消耗 §e' + totalCost + ' §7个下界之星，开始抽取 §b' + count + ' §7次')
    let rarityCounter = { '普通': 0, '少见': 0, '稀有': 0, '史诗': 0 }
    for (let i = 0; i < count; i++) {
        let picked = global.pfGachaApi.weightedRandomPick(pool)
        if (!picked) continue
        let relicItemId = 'marguerite:' + picked.name
        player.give(Item.of(relicItemId))
        if (rarityCounter[picked.rarity.name] !== undefined) {
            rarityCounter[picked.rarity.name]++
        }
        let rarityColor = global.pfGachaApi.RARITY_COLOR[picked.rarity.name] || '§f'
        let displayName = picked.nameZH || picked.name
        player.tell(
            Text.gray('  [' + (i + 1) + '/' + count + '] ')
                .append(Text.of(rarityColor + '[' + picked.rarity.name + '] '))
                .append(Text.gold(displayName))
        )
    }

    // 汇总
    let summary = '§a[补给] 完成！ '
    let parts = []
    if (rarityCounter['史诗'] > 0) parts.push('§d史诗×' + rarityCounter['史诗'])
    if (rarityCounter['稀有'] > 0) parts.push('§9稀有×' + rarityCounter['稀有'])
    if (rarityCounter['少见'] > 0) parts.push('§e少见×' + rarityCounter['少见'])
    if (rarityCounter['普通'] > 0) parts.push('§f普通×' + rarityCounter['普通'])
    if (parts.length > 0) summary += parts.join(' §7| ')
    player.tell(summary)
    console.log("[GACHA] 抽卡完成 count=" + count + " 结果=" + JSON.stringify(rarityCounter))
})

console.log("[GACHA] 手机抽卡模块已加载，单抽=" + GACHA_COST_PER_PULL + "星，阶段=" + GACHA_POOL_STAGE)
