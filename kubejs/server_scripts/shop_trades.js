// ============================================================
// 商店NPC - 按阶段随机遗物交易
// ============================================================
// 5个方块 kubejs:shop_block_1 ~ shop_block_5 分别对应5个阶段
// 放置后下一tick：
//   1) 变为草方块
//   2) 上方生成村民NPC，交易为该阶段随机3~5个遗物
//   3) 货币: 金块，价格按阶段区间随机生成
//   4) 每项交易 maxUses=1
//   5) 遗物池从 global.relicRegister 动态获取
// ============================================================

// ===== 各阶段价格区间 (金锭) =====

let STAGE_PRICE_RANGE = {
    1: [100, 400],
    2: [250, 1000],
    3: [600, 2500],
    4: [1500, 6000],
    5: [3500, 13000]
}

let STAGE_NAMES = {
    1: "§eSTAGE · 1",
    2: "§6STAGE · 2",
    3: "§cSTAGE · 3",
    4: "§dSTAGE · 4",
    5: "§5STAGE · 5"
}

// ===== 动态遗物池 =====

/**
 * 从 global.relicRegister 中获取指定阶段的遗物列表
 * 返回 relic 对象数组
 */
function getStageRelics(stage) {
    let result = []
    let relics = global.relicRegister.relics
    for (let i = 0; i < relics.length; i++) {
        if (relics[i].stage === stage) {
            result.push(relics[i])
        }
    }
    return result
}

/**
 * 在 [min, max] 范围内生成随机整数
 */
function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}

// ===== 随机抽取工具 =====

/**
 * 从数组中随机抽取 count 个不重复元素 (Fisher-Yates洗牌)
 */
function randomPick(arr, count) {
    let pool = arr.slice()
    let result = []
    let n = Math.min(count, pool.length)
    for (let i = 0; i < n; i++) {
        let j = i + Math.floor(Math.random() * (pool.length - i))
        let tmp = pool[i]
        pool[i] = pool[j]
        pool[j] = tmp
        result.push(pool[i])
    }
    return result
}

// ===== NBT 构建 =====

/**
 * 金锭价格 → 金块数 (原价 / 100, 向上取整, 上限128)
 * 两个槽位均放金块: buy + buyB, 各上限64
 */
function calcTradeBlocks(originalPrice) {
    return Math.min(128, Math.max(1, Math.ceil(originalPrice / 100)))
}

/**
 * 将遗物列表转为村民 Offers NBT 字符串
 * relics: Relic对象数组
 * stage: 阶段编号, 用于价格区间
 */
function buildRelicOffersNBT(relics, stage) {
    let priceRange = STAGE_PRICE_RANGE[stage] || [100, 400]
    let parts = []
    for (let i = 0; i < relics.length; i++) {
        let itemId = 'marguerite:' + relics[i].name
        let price = randomInt(priceRange[0], priceRange[1])
        let totalBlocks = calcTradeBlocks(price)

        let buyA = Math.min(totalBlocks, 64)
        let buyB = totalBlocks > 64 ? totalBlocks - 64 : 0

        let recipe = '{' +
            'buy:{id:"minecraft:gold_block",Count:' + buyA + 'b}'

        if (buyB > 0) {
            recipe += ',buyB:{id:"minecraft:gold_block",Count:' + buyB + 'b}'
        }

        recipe += ',sell:{id:"' + itemId + '",Count:1b}' +
            ',maxUses:1' +
            ',uses:0' +
            ',rewardExp:0b' +
            ',xp:0' +
            ',priceMultiplier:0.0f' +
            ',specialPrice:0' +
            ',demand:0' +
            '}'

        parts.push(recipe)
    }
    return 'Offers:{Recipes:[' + parts.join(',') + ']}'
}

// ===== 方块Tick处理 =====

/**
 * @param {BlockEntity} blockEntity
 * @param {number} stage - 阶段编号 1~5
 */
global.shopBlockTick = function (blockEntity, stage) {
    let level = blockEntity.getLevel()
    if (!level || level.isClientSide()) return

    let pos = blockEntity.getBlockPos()
    let x = pos.getX()
    let y = pos.getY()
    let z = pos.getZ()
    let server = level.getServer()

    // 校验阶段
    if (!stage || stage < 1 || stage > 5) stage = 1

    // 从注册表动态获取该阶段遗物
    let pool = getStageRelics(stage)
    if (pool.length === 0) {
        console.warn("[SHOP] 阶段" + stage + " 无已注册遗物!")
        return
    }

    // 1) 替换方块为草方块
    level.setBlockAndUpdate(pos, Block.getBlock('minecraft:grass_block').defaultBlockState())

    // 2) 随机抽取 3~5 个遗物
    let count = 3 + Math.floor(Math.random() * 3) // 3, 4, 或 5
    let picked = randomPick(pool, count)

    // 3) 构建交易NBT
    let offers = buildRelicOffersNBT(picked, stage)
    let shopName = STAGE_NAMES[stage] || "商店"

    // 4) 生成村民NPC
    let cmd = 'summon villager ' +
        (x + 0.5) + ' ' + (y + 1) + ' ' + (z + 0.5) +
        ' {' +
        'NoAI:1b,' +
        'Invulnerable:1b,' +
        'PersistenceRequired:1b,' +
        'Silent:1b,' +
        'CustomName:\'{"text":"' + shopName + '"}\','+
        'CustomNameVisible:1b,' +
        'VillagerData:{level:5,profession:"minecraft:nitwit",type:"minecraft:plains"},' +
        offers +
        '}'

    let result = server.runCommandSilent(cmd)

    // 日志
    let names = []
    for (let i = 0; i < picked.length; i++) {
        names.push(picked[i].name)
    }
    if (result > 0) {
        console.log("[SHOP] 阶段" + stage + " 商店NPC已生成 pos=(" + x + "," + (y + 1) + "," + z + ") 遗物: " + names.join(', '))
    } else {
        console.error("[SHOP] 阶段" + stage + " 商店NPC生成失败!")
    }
}
