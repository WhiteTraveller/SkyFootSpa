// priority: 9
// 阶段一：初入幻想乡 —— 6 个芯片遗物（全部"所有手法"效果）
// 设计准则：加强金钱必须以"降低满意度"或"提高体力消耗"作为代价
//   基础 ⚪ ×4 - 2 个精密构件合成
//   位置 🟣 ×2 - 可合成；需上方/下方相邻槽位为空才生效
global.relicRegister.currentStage = 1

// 描述片段拼装（正值绿色，负值红色；体力消耗方向相反：+体力红色、-体力绿色）
function descMoney(n) {
    return Text.gray("所有手法金钱").append(n >= 0 ? Text.green("+" + n) : Text.red("" + n))
}
function descSat(n) {
    return Text.gray(" 满意度").append(n >= 0 ? Text.green("+" + n) : Text.red("" + n))
}
function descStamina(n) {
    return Text.gray(" 体力消耗").append(n > 0 ? Text.red("+" + n) : Text.green("" + n))
}

// 统一应用"所有手法" 金钱/满意度/体力消耗
function applyAll(player, i, name, money, sat, stamina) {
    if (money   !== 0) global.modifyAllMoney      (player, name + i, money)
    if (sat     !== 0) global.modifyAllSat        (player, name + i, sat)
    if (stamina !== 0) global.modifyAllStaminaCost(player, name + i, stamina)
}

// 判定某槽位是否为"真实空位"：在边界内、不是背包镶板、且没有物品。
// 背包镶板视为"不存在"，不算空位（与 countEmptyInSlots 约定一致）。
function isSlotEmpty(curiosAll, idx) {
    if (idx < 0 || idx >= curiosAll.getSlots()) return false
    let stack = curiosAll.getStackInSlot(idx)
    if (global.isSpacePanelId('' + stack.getId())) return false
    return stack.isEmpty()
}

// 背包列数：玩家 9 列、女仆 6 列，两者均为 6 行，故 列数 = 总槽位 / 6。
// 这样位置芯片在玩家与女仆（含 maid_stats 6×6 沙盘）下都按正确网格判定上下相邻格。
function backpackCols(curiosAll) {
    return (curiosAll.getSlots() / 6) | 0
}

// ==================== 基础 ⚪ ×4（2 精密构件合成） ====================

// 1. 勤劳 — 金钱+1，体力消耗+10
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_sole")
        .setNameZH("基础芯片：Ⅰ")
        .setTexture("chip_lv1_pt2.png")
        .setDescription(descMoney(1).append(descStamina(10)))
        .setStory("勤劳型芯片：多赚的每一分钱，都是用自己多流的汗水换来的。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 1.0, 0, 10.0)
        })
        .setPool(global.relicPool.common)
})

// 2. 敛财 — 金钱+1，满意度-1
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_toe")
        .setNameZH("基础芯片：Ⅱ")
        .setTexture("chip_lv1_pt1.png")
        .setDescription(descMoney(1).append(descSat(-1)))
        .setStory("敛财型芯片：薄利多收，代价是顾客对价格的一丝不满。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 1.0, -1.0, 0)
        })
        .setPool(global.relicPool.common)
})

// 3. 懈怠 — 体力消耗-20，满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_center")
        .setNameZH("基础芯片：Ⅲ")
        .setTexture("chip_lv1_pt3.png")
        .setDescription(descStamina(-20).append(descSat(-2)))
        .setStory("懈怠型芯片：大幅省下的力气，从顾客的满意度里悄悄扣回来。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, -2.0, -20.0)
        })
        .setPool(global.relicPool.common)
})

// 4. 热情 — 满意度+1，体力消耗+20
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_heel")
        .setNameZH("基础芯片：Ⅳ")
        .setTexture("chip_lv1_pt4.png")
        .setDescription(descSat(1).append(descStamina(20)))
        .setStory("热情型芯片：多费些力气，换来顾客由衷的满意。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 1.0, 20.0)
        })
        .setPool(global.relicPool.common)
})

// ==================== 位置 🟣 ×2（可合成，需相邻空位） ====================

// 5. 留白 — 满意度+1；其上方相邻槽位必须为空，否则不生效
global.relicRegister.register(function(relic) {
    relic.setName("void_chip_all")
        .setNameZH("基础芯片：Ⅴ")
        .setTexture("chip_lv1_pt5.png")
        .setDescription(descSat(1))
        .setSpecialDescription(Text.gray("仅当").append(Text.yellow("上方相邻槽位为空")).append(Text.gray("时生效，否则无效果")))
        .setStory("留白型芯片：上方留出一格空白，心境才得以舒展，顾客也随之满意。")
        .setTags([])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let cols = backpackCols(curiosAll)
            if (isSlotEmpty(curiosAll, (i - cols) | 0)) {
                global.modifyAllSat(player, relic.nameZH + i, 1.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 6. 余地 — 金钱+1；其下方相邻槽位必须为空，否则不生效
global.relicRegister.register(function(relic) {
    relic.setName("margin_chip_all")
        .setNameZH("基础芯片：Ⅵ")
        .setTexture("chip_lv1_pt5.png")
        .setDescription(descMoney(1))
        .setSpecialDescription(Text.gray("仅当").append(Text.yellow("下方相邻槽位为空")).append(Text.gray("时生效，否则无效果")))
        .setStory("余地型芯片：下方留有一格余地，财路才转得开，小费自然多上一分。")
        .setTags([])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let cols = backpackCols(curiosAll)
            if (isSlotEmpty(curiosAll, (i + cols) | 0)) {
                global.modifyAllMoney(player, relic.nameZH + i, 1.0)
            }
        })
        .setPool(global.relicPool.common)
})
