// priority: 9
// 阶段一：初入幻想乡（2×3，6格）— 11个芯片遗物
// 前 6 个：简化为"服务任意部位"的全局增益（通用池），后 5 个保留 4 部位权衡设计
global.relicRegister.currentStage = 1

// ===== 普通 ⚪ ×5 =====

// 1. 基础芯片：脚趾 - 脚趾金钱+2，脚趾体力+20
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_toe")
        .setTexture("kubejs:item/chip_lv1_0")
        .setNameZH("基础芯片：悦心")
        .setDescription(Text.gray("服务任意部位满意度").append(Text.green("+1")))
        .setStory("最基本的脚趾增强芯片，提升金钱收益的同时也增加了体力负担。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllSat(player, relic.nameZH + i, 1.0)
        })
        .setPool(global.relicPool.common)
})

// 2. 基础芯片：脚掌 - 服务任意部位金钱+1
global.relicRegister.register(function(relic) {e
    relic.setName("basic_chip_sole")
        .setTexture("kubejs:item/chip_lv1_1")
        .setNameZH("基础芯片：敛财")
        .setDescription(Text.gray("服务任意部位金钱").append(Text.green("+1")))
        .setStory("标准的脚掌护理芯片，温柔的触感让顾客更满意。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllMoney(player, relic.nameZH + i, 1.0)
        })
        .setPool(global.relicPool.common)
})

// 3. 基础芯片：脚心 - 服务任意部位体力消耗-10
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_center")
        .setTexture("kubejs:item/chip_lv1_2")
        .setNameZH("基础芯片：省力")
        .setDescription(Text.gray("服务任意部位体力消耗").append(Text.green("-10")))
        .setStory("轻柔型脚心芯片，节省体力的同时带来微薄收入。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllStaminaCost(player, relic.nameZH + i, -10.0)
        })
        .setPool(global.relicPool.common)
})

// 4. 基础芯片：脚跟 - 服务任意部位金钱+2，满意度-1
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_heel")
        .setTexture("kubejs:item/chip_lv1_3")
        .setNameZH("基础芯片：逐利")
        .setDescription(Text.gray("服务任意部位金钱").append(Text.green("+2")).append(Text.gray(" 满意度")).append(Text.red("-1")))
        .setStory("均衡型脚跟芯片，各项数值小幅提升。")
        .setTags([])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllMoney(player, relic.nameZH + i, 2.0)
            global.modifyAllSat(player, relic.nameZH + i, -1.0)
        })
        .setPool(global.relicPool.common)
})

// 5. 通用芯片：全部 - 服务任意部位满意度+2，金钱-1
global.relicRegister.register(function(relic) {
    relic.setName("general_chip_all")
        .setTexture("kubejs:item/chip_lv1_4")
        .setNameZH("基础芯片：温柔")
        .setDescription(Text.gray("服务任意部位满意度").append(Text.green("+2")).append(Text.gray(" 金钱")).append(Text.red("-1")))
        .setStory("泛用型芯片，广撒网式的金钱收益，代价是顾客满意度略降。")
        .setTags([global.margueriteTags.metal])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllSat(player, relic.nameZH + i, 2.0)
            global.modifyAllMoney(player, relic.nameZH + i, -1.0)
        })
        .setPool(global.relicPool.common)
})

// ===== 少见 🔵 ×4 =====

// 6. 协力芯片：脚趾 - 服务任意部位满意度+1，金钱+1，体力消耗+10
global.relicRegister.register(function(relic) {
    relic.setName("synergy_chip_toe")
        .setTexture("kubejs:item/chip_lv1_5")
        .setNameZH("基础芯片：全能")
        .setDescription(Text.gray("服务任意部位满意度").append(Text.green("+1")).append(Text.gray(" 金钱")).append(Text.green("+1")).append(Text.gray(" 体力消耗")).append(Text.red("+10")))
        .setStory("协同型芯片，周围的伙伴越多，脚趾的赚钱效率越高。")
        .setTags([])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllSat(player, relic.nameZH + i, 1.0)
            global.modifyAllMoney(player, relic.nameZH + i, 1.0)
            global.modifyAllStaminaCost(player, relic.nameZH + i, 10.0)
        })
        .setPool(global.relicPool.common)
})

// 7. 集中芯片：脚掌 - 脚掌满意度+3；位于末行时，脚掌金钱+2
global.relicRegister.register(function(relic) {
    relic.setName("focus_chip_sole")
        .setTexture("kubejs:item/chip_lv1_6")
        .setNameZH("基础芯片：沉淀")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，脚掌金钱")).append(Text.green("+2")))
        .setStory("沉淀型芯片，放在最底层时能释放额外的金钱能量。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            if (global.isBottomRow(i, curiosAll)) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 8. 节能芯片：脚心 - 脚心体力-20，脚心满意度+2；相邻每有1遗物，脚心体力-5
global.relicRegister.register(function(relic) {
    relic.setName("eco_chip_center")
        .setTexture("kubejs:item/chip_lv1_7")
        .setNameZH("基础芯片：节能")
        .setDescription(Text.gray("脚心体力消耗").append(Text.green("-20")).append(Text.gray(" 脚心满意度")).append(Text.green("+2")))
        .setSpecialDescription(Text.gray("相邻每有1个遗物，脚心体力消耗").append(Text.green("-5")))
        .setStory("节能型芯片，周围的同伴能分担脚心的疲劳。")
        .setTags([global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let adjacent = global.getTenGrid(i, 6, 9)
            let adjCount = global.countRelicsInSlots(adjacent, curiosAll)
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + i, -20.0 - adjCount * 5.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 9. 冲击芯片：脚跟 - 脚跟金钱+2，脚跟满意度+3，脚跟体力+30；同行每有1遗物，脚跟体力-5
global.relicRegister.register(function(relic) {
    relic.setName("impact_chip_heel")
        .setTexture("kubejs:item/chip_lv1_8")
        .setNameZH("基础芯片：爆发")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+2")).append(Text.gray(" 脚跟满意度")).append(Text.green("+3")).append(Text.gray(" 脚跟体力消耗")).append(Text.red("+30")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚跟体力消耗").append(Text.green("-5")))
        .setStory("高功率芯片，收益极高但耗能巨大，同伴能帮忙分担压力。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let sameRow = global.getSameRowSlots(i, curiosAll)
            let rowCount = global.countRelicsInSlots(sameRow, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaogen', relic.nameZH + i, 30.0 - rowCount * 5.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×3 =====

// 10. 连携芯片：脚趾 - 脚趾金钱+2；同行有"金属"遗物时，脚趾金钱+2，脚趾体力+30
global.relicRegister.register(function(relic) {
    relic.setName("link_chip_toe")
        .setTexture("kubejs:item/chip_lv1_9")
        .setNameZH("基础芯片：连携")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("金属")).append(Text.gray("遗物时，脚趾金钱")).append(Text.green("+2")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+30")))
        .setStory("连携型芯片，与金属制品产生共鸣时爆发出强大的赚钱能力。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let sameRow = global.getSameRowSlots(i, curiosAll)
            let hasMetal = global.hasTagInSlots(sameRow, "marguerite:tag_metal", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            if (hasMetal) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + '_metal_' + i, 2.0, 'addition')
                player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + '_metal_' + i, 30.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 11. 精修芯片：脚掌 - 脚掌满意度+4；位于首行时，全部位满意度+2
global.relicRegister.register(function(relic) {
    relic.setName("refine_chip_sole")
        .setTexture("kubejs:item/chip_lv1_10")
        .setNameZH("基础芯片：精修")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+4")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位满意度")).append(Text.green("+2")))
        .setStory("精密调校的芯片，高居首位时能庇护所有部位。")
        .setTags([global.margueriteTags.magic])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 4.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllSat(player, relic.nameZH + '_top_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})
