// priority: 9
// 阶段一：初入幻想乡 —— 12 个芯片遗物（全部"所有部位"效果）
// 设计准则：加强金钱必须以"降低满意度"或"提高体力消耗"作为代价
//   普通 ⚪ ×5 - 2 个精密构件合成
//   高级 🔵 ×3 - 4 个精密构件合成
//   稀有 🟣 ×4 - 无法合成，仅通过特殊渠道获取
global.relicRegister.currentStage = 1

// 描述片段拼装（正值绿色，负值红色；体力消耗方向相反：+体力红色、-体力绿色）
function descMoney(n) {
    return Text.gray("所有部位金钱").append(n >= 0 ? Text.green("+" + n) : Text.red("" + n))
}
function descSat(n) {
    return Text.gray(" 满意度").append(n >= 0 ? Text.green("+" + n) : Text.red("" + n))
}
function descStamina(n) {
    return Text.gray(" 体力消耗").append(n > 0 ? Text.red("+" + n) : Text.green("" + n))
}

// 统一应用"所有部位" 金钱/满意度/体力消耗
function applyAll(player, i, name, money, sat, stamina) {
    if (money   !== 0) global.modifyAllMoney      (player, name + i, money)
    if (sat     !== 0) global.modifyAllSat        (player, name + i, sat)
    if (stamina !== 0) global.modifyAllStaminaCost(player, name + i, stamina)
}

// ==================== 普通 ⚪ ×5（2 精密构件合成） ====================

// 1. 悦心 — 金钱+1，满意度-1
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_toe")
        .setTexture("kubejs:item/chip_lv1_0")
        .setNameZH("基础芯片：敛财")
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

// 2. 敛财 — 金钱+1，体力消耗+10
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_sole")
        .setTexture("kubejs:item/chip_lv1_1")
        .setNameZH("基础芯片：勤劳")
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

// 3. 省力 — 体力消耗-10，满意度-1
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_center")
        .setTexture("kubejs:item/chip_lv1_2")
        .setNameZH("基础芯片：懈怠")
        .setDescription(descStamina(-10).append(descSat(-1)))
        .setStory("懈怠型芯片：省下的力气，从顾客的满意度里偷偷扣。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, -1.0, -10.0)
        })
        .setPool(global.relicPool.common)
})

// 4. 逐利 — 体力消耗-10，金钱-1
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_heel")
        .setTexture("kubejs:item/chip_lv1_3")
        .setNameZH("基础芯片：躺平")
        .setDescription(descStamina(-10).append(descMoney(-1)))
        .setStory("躺平型芯片：少赚一点换来的清闲，主打一个性价比。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -1.0, 0, -10.0)
        })
        .setPool(global.relicPool.common)
})

// 5. 温柔 — 满意度+1，体力消耗+10
global.relicRegister.register(function(relic) {
    relic.setName("general_chip_all")
        .setTexture("kubejs:item/chip_lv1_4")
        .setNameZH("基础芯片：用心")
        .setDescription(descSat(1).append(descStamina(10)))
        .setStory("用心型芯片：用多一分耐心换来顾客的微笑，也就更累一分。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 1.0, 10.0)
        })
        .setPool(global.relicPool.common)
})

// ==================== 高级 🔵 ×3（4 精密构件合成） ====================

// 6. 全能 — 金钱+2，满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("synergy_chip_toe")
        .setTexture("kubejs:item/chip_lv1_5")
        .setNameZH("基础芯片：奸商")
        .setDescription(descMoney(2).append(descSat(-2)))
        .setStory("奸商型芯片：掏空顾客钱包的同时，也悄悄榨取他们的好心情。")
        .setTags([])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 2.0, -2.0, 0)
        })
        .setPool(global.relicPool.common)
})

// 7. 沉淀 — 体力消耗-20，满意度-1，金钱-1
global.relicRegister.register(function(relic) {
    relic.setName("focus_chip_sole")
        .setTexture("kubejs:item/chip_lv1_6")
        .setNameZH("基础芯片：佛系")
        .setDescription(descStamina(-20).append(descSat(-1)).append(descMoney(-1)))
        .setStory("佛系型芯片：大幅节省体力，代价是顾客的期待与钱包一起缩水。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -1.0, -1.0, -20.0)
        })
        .setPool(global.relicPool.common)
})

// 8. 节能 — 满意度+2，体力消耗+20
global.relicRegister.register(function(relic) {
    relic.setName("eco_chip_center")
        .setTexture("kubejs:item/chip_lv1_7")
        .setNameZH("基础芯片：热情")
        .setDescription(descSat(2).append(descStamina(20)))
        .setStory("热情型芯片：多费些力气，换来顾客由衷的满意。")
        .setTags([global.margueriteTags.artifact])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 2.0, 20.0)
        })
        .setPool(global.relicPool.common)
})

// ==================== 稀有 🟣 ×4（无法合成） ====================

// 9. 爆发 — 金钱+1（无副作用）
global.relicRegister.register(function(relic) {
    relic.setName("impact_chip_heel")
        .setTexture("kubejs:item/chip_lv1_8")
        .setNameZH("基础芯片：聚财")
        .setDescription(descMoney(1))
        .setStory("聚财型稀世之作：赚得更多，却无需任何代价——市面上买不到，只能在特殊奖励中获得。")
        .setTags([])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 1.0, 0, 0)
        })
        .setPool(global.relicPool.common)
})

// 10. 连携 — 满意度+3，体力消耗+40
global.relicRegister.register(function(relic) {
    relic.setName("link_chip_toe")
        .setTexture("kubejs:item/chip_lv1_9")
        .setNameZH("基础芯片：献身")
        .setDescription(descSat(3).append(descStamina(40)))
        .setStory("献身型稀世之作：让顾客获得前所未有的体验，代价是巨大的体力消耗。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 3.0, 40.0)
        })
        .setPool(global.relicPool.common)
})

// 11. 精修 — 体力消耗-40，满意度-4，金钱-2
global.relicRegister.register(function(relic) {
    relic.setName("refine_chip_sole")
        .setTexture("kubejs:item/chip_lv1_10")
        .setNameZH("基础芯片：罢工")
        .setDescription(descStamina(-40).append(descSat(-4)).append(descMoney(-2)))
        .setStory("罢工型稀世之作：几乎不耗体力，但顾客与收益双双大幅牺牲——摆烂到极致的艺术。")
        .setTags([global.margueriteTags.magic])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -2.0, -4.0, -40.0)
        })
        .setPool(global.relicPool.common)
})

// 12. 舒缓 — 体力消耗-10（无副作用，稀有小品）
global.relicRegister.register(function(relic) {
    relic.setName("relief_chip_all")
        .setTexture("kubejs:item/chip_lv1_11")
        .setNameZH("基础芯片：悠然")
        .setDescription(descStamina(-10))
        .setStory("悠然型稀世佳作：轻盈省力，无任何副作用——只会出现在稀有奖励池中。")
        .setTags([])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 0, -10.0)
        })
        .setPool(global.relicPool.common)
})
