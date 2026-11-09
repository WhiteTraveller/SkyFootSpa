// priority: 9
// 阶段二：红雾异变 —— 12 个进阶芯片遗物（对齐第一章设计规范）
// 效果模型：全部"所有部位"的 金钱/满意度/体力消耗 三属性权衡（数值约为第一章 1.5~2 倍）
// 设计铁律：加强金钱必须以"降低满意度"或"提高体力消耗"作为代价
// 少量位置特色：仅 #8 热忱（相邻金属减半）、#12 游刃（中心 2×3 加满意度）引入联动
//   普通 ⚪ ×5 - 2 个高级电子元件合成
//   高级 🔵 ×3 - 4 个高级电子元件合成
//   稀有 🟣 ×4 - 无法合成，仅通过特殊渠道获取
global.relicRegister.currentStage = 2

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

// 统一应用"所有部位" 金钱/满意度/体力消耗
function applyAll(player, i, name, money, sat, stamina) {
    if (money   !== 0) global.modifyAllMoney      (player, name + i, money)
    if (sat     !== 0) global.modifyAllSat        (player, name + i, sat)
    if (stamina !== 0) global.modifyAllStaminaCost(player, name + i, stamina)
}

// ==================== 普通 ⚪ ×5（2 高级电子元件合成） ====================

// 1. 压榨 — 金钱+2，满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("squeeze_chip_toe")
        .setNameZH("进阶芯片：压榨")
        .setTexture("chip_lv2_pt1.png")
        .setDescription(descMoney(2).append(descSat(-2)))
        .setStory("压榨型芯片：把产线拧到极限，多赚的每一分都从顾客的体验里抠出来。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 2.0, -2.0, 0)
        })
        .setPool(global.relicPool.common)
})

// 2. 赶工 — 金钱+2，体力消耗+15
global.relicRegister.register(function(relic) {
    relic.setName("rush_chip_sole")
        .setNameZH("进阶芯片：赶工")
        .setTexture("chip_lv2_pt2.png")
        .setDescription(descMoney(2).append(descStamina(15)))
        .setStory("赶工型芯片：加班赶出来的产量，全靠自己的汗水顶上。")
        .setTags([global.margueriteTags.conductive])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 2.0, 0, 15.0)
        })
        .setPool(global.relicPool.common)
})

// 3. 偷懒 — 体力消耗-15，满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("slack_chip_center")
        .setNameZH("进阶芯片：偷懒")
        .setTexture("chip_lv2_pt3.png")
        .setDescription(descStamina(-15).append(descSat(-2)))
        .setStory("偷懒型芯片：省下的力气，都是从顾客的满意度里悄悄扣的。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, -2.0, -15.0)
        })
        .setPool(global.relicPool.common)
})

// 4. 清闲 — 体力消耗-15，金钱-2
global.relicRegister.register(function(relic) {
    relic.setName("idle_chip_heel")
        .setNameZH("进阶芯片：清闲")
        .setTexture("chip_lv2_pt4.png")
        .setDescription(descStamina(-15).append(descMoney(-2)))
        .setStory("清闲型芯片：少赚一点换来的悠哉，机器慢了人也轻松了。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -2.0, 0, -15.0)
        })
        .setPool(global.relicPool.common)
})

// 5. 匠心 — 满意度+2，体力消耗+15
global.relicRegister.register(function(relic) {
    relic.setName("craft_chip_all")
        .setNameZH("进阶芯片：匠心")
        .setTexture("chip_lv2_pt5.png")
        .setDescription(descSat(2).append(descStamina(15)))
        .setStory("匠心型芯片：多一分打磨换顾客的满意，也就多累一分。")
        .setTags([global.margueriteTags.artifact])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 2.0, 15.0)
        })
        .setPool(global.relicPool.common)
})

// ==================== 高级 🔵 ×3（4 高级电子元件合成） ====================

// 6. 垄断 — 金钱+3，满意度-3
global.relicRegister.register(function(relic) {
    relic.setName("monopoly_chip_toe")
        .setNameZH("进阶芯片：垄断")
        .setTexture("chip_lv2_pt1.png")
        .setDescription(descMoney(3).append(descSat(-3)))
        .setStory("垄断型芯片：独揽生意、抬高价格，顾客的怨气也一并涨了起来。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 3.0, -3.0, 0)
        })
        .setPool(global.relicPool.common)
})

// 7. 停摆 — 体力消耗-25，满意度-2，金钱-2
global.relicRegister.register(function(relic) {
    relic.setName("shutdown_chip_sole")
        .setNameZH("进阶芯片：停摆")
        .setTexture("chip_lv2_pt2.png")
        .setDescription(descStamina(-25).append(descSat(-2)).append(descMoney(-2)))
        .setStory("停摆型芯片：大幅省力，代价是顾客的期待与钱包一起缩水。")
        .setTags([])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -2.0, -2.0, -25.0)
        })
        .setPool(global.relicPool.common)
})

// 8. 热忱 — 满意度+3，体力消耗+24；相邻有"金属"遗物时体力惩罚减半
global.relicRegister.register(function(relic) {
    relic.setName("ardor_chip_center")
        .setNameZH("进阶芯片：热忱")
        .setTexture("chip_lv2_pt3.png")
        .setDescription(descSat(3).append(descStamina(24)))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("金属")).append(Text.gray("遗物时，体力消耗惩罚减半")))
        .setStory("热忱型芯片：满腔热情换来顾客的满意，身旁的金属帮它分担过热的负荷。")
        .setTags([global.margueriteTags.conductive])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let adjacent = global.getTenGrid(i, 6, 9)
            let hasMetalNear = global.hasTagInSlots(adjacent, "marguerite:tag_metal", curiosAll)
            global.modifyAllSat(player, relic.nameZH + i, 3.0)
            global.modifyAllStaminaCost(player, relic.nameZH + i, hasMetalNear ? 12.0 : 24.0)
        })
        .setPool(global.relicPool.common)
})

// ==================== 稀有 🟣 ×4（无法合成） ====================

// 9. 聚能 — 金钱+3（无副作用）
global.relicRegister.register(function(relic) {
    relic.setName("converge_chip_heel")
        .setNameZH("进阶芯片：聚能")
        .setTexture("chip_lv2_pt4.png")
        .setDescription(descMoney(3))
        .setStory("聚能型稀世之作：赚得更多却毫无代价——市面买不到，只在特殊奖励中出现。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 3.0, 0, 0)
        })
        .setPool(global.relicPool.common)
})

// 10. 忘我 — 满意度+4，体力消耗+40
global.relicRegister.register(function(relic) {
    relic.setName("trance_chip_all")
        .setNameZH("进阶芯片：忘我")
        .setTexture("chip_lv2_pt5.png")
        .setDescription(descSat(4).append(descStamina(40)))
        .setStory("忘我型稀世之作：让顾客获得前所未有的体验，代价是巨大的体力消耗。")
        .setTags([global.margueriteTags.magic])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 4.0, 40.0)
        })
        .setPool(global.relicPool.common)
})

// 11. 摸鱼 — 体力消耗-40，满意度-4，金钱-3
global.relicRegister.register(function(relic) {
    relic.setName("slouch_chip_toe")
        .setNameZH("进阶芯片：摸鱼")
        .setTexture("chip_lv2_pt1.png")
        .setDescription(descStamina(-40).append(descSat(-4)).append(descMoney(-3)))
        .setStory("摸鱼型稀世之作：几乎不耗体力，但顾客与收益双双大幅牺牲——摆烂到极致的艺术。")
        .setTags([])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, -3.0, -4.0, -40.0)
        })
        .setPool(global.relicPool.common)
})

// 12. 游刃 — 体力消耗-15（无副作用）；位于中心 2×3 区域时额外满意度+2
global.relicRegister.register(function(relic) {
    relic.setName("nimble_chip_sole")
        .setNameZH("进阶芯片：游刃")
        .setTexture("chip_lv2_pt2.png")
        .setDescription(descStamina(-15))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("中心 2×3 区域")).append(Text.gray("时，所有手法满意度额外")).append(Text.green("+2")))
        .setStory("游刃型稀世佳作：轻盈省力、毫无副作用；处在背包中枢时更能从容兼顾全局。")
        .setTags([global.margueriteTags.artifact])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            applyAll(player, i, relic.nameZH, 0, 0, -15.0)
            if (global.isInCenter2x3(i)) {
                global.modifyAllSat(player, relic.nameZH + '_center_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})
