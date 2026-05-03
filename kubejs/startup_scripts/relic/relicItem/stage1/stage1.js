// priority: 9
// 阶段一：初入幻想乡（2×3，6格）— 24个芯片遗物
// 4部位体系：脚趾(高钱低满高耗) / 脚掌(低钱高满中高耗) / 脚心(低收益低耗) / 脚跟(均衡)
global.relicRegister.currentStage = 1

// ===== 普通 ⚪ ×5 =====

// 1. 基础芯片：脚趾 - 脚趾金钱+2，脚趾体力+20
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_toe")
        .setNameZH("基础芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+20")))
        .setStory("最基本的脚趾增强芯片，提升金钱收益的同时也增加了体力负担。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, 20.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 2. 基础芯片：脚掌 - 脚掌满意度+3，脚掌体力+15
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_sole")
        .setNameZH("基础芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+3")).append(Text.gray(" 脚掌体力消耗")).append(Text.red("+15")))
        .setStory("标准的脚掌护理芯片，温柔的触感让顾客更满意。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhang', relic.nameZH + i, 15.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 3. 基础芯片：脚心 - 脚心金钱+1，脚心体力-15
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_center")
        .setNameZH("基础芯片：脚心")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+1")).append(Text.gray(" 脚心体力消耗")).append(Text.green("-15")))
        .setStory("轻柔型脚心芯片，节省体力的同时带来微薄收入。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + i, -15.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 4. 基础芯片：脚跟 - 脚跟金钱+1，脚跟满意度+2，脚跟体力+10
global.relicRegister.register(function(relic) {
    relic.setName("basic_chip_heel")
        .setNameZH("基础芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+1")).append(Text.gray(" 脚跟满意度")).append(Text.green("+2")).append(Text.gray(" 脚跟体力消耗")).append(Text.red("+10")))
        .setStory("均衡型脚跟芯片，各项数值小幅提升。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaogen', relic.nameZH + i, 10.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 5. 通用芯片：全部 - 全部位金钱+1，全部位满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("general_chip_all")
        .setNameZH("通用芯片：全部")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+1")).append(Text.gray(" 全部位满意度")).append(Text.red("-2")))
        .setStory("泛用型芯片，广撒网式的金钱收益，代价是顾客满意度略降。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllMoney(player, relic.nameZH + i, 1.0)
            global.modifyAllSat(player, relic.nameZH + i, -2.0)
        })
        .setPool(global.relicPool.common)
})

// ===== 少见 🔵 ×4 =====

// 6. 协力芯片：脚趾 - 脚趾金钱+2，脚跟满意度-2；同行每有1遗物，脚趾金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("synergy_chip_toe")
        .setNameZH("协力芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")).append(Text.gray(" 脚跟满意度")).append(Text.red("-2")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚趾金钱").append(Text.green("+1")))
        .setStory("协同型芯片，周围的伙伴越多，脚趾的赚钱效率越高。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0 + rowCount, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, -2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 7. 集中芯片：脚掌 - 脚掌满意度+3；位于末行时，脚掌金钱+2
global.relicRegister.register(function(relic) {
    relic.setName("focus_chip_sole")
        .setNameZH("集中芯片：脚掌")
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
        .setNameZH("节能芯片：脚心")
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
        .setNameZH("冲击芯片：脚跟")
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
        .setNameZH("连携芯片：脚趾")
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
        .setNameZH("精修芯片：脚掌")
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

// 12. 固定芯片：全部 - 全部位金钱+1；位于末行时，全部位金钱+1，全部位体力-10
global.relicRegister.register(function(relic) {
    relic.setName("stable_chip_all")
        .setNameZH("固定芯片：全部")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，全部位金钱")).append(Text.green("+1")).append(Text.gray(" 全部位体力消耗")).append(Text.green("-10")))
        .setStory("稳定型芯片，沉在最底层时不仅增加收益，还能降低全身负担。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            global.modifyAllMoney(player, relic.nameZH + i, 1.0)
            if (global.isBottomRow(i, curiosAll)) {
                global.modifyAllMoney(player, relic.nameZH + '_bottom_' + i, 1.0)
                global.modifyAllStaminaCost(player, relic.nameZH + '_bottom_' + i, -10.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 普通 ⚪ ×5（新增） =====

// 13. 蓄力芯片：脚趾 - 脚趾满意度+1，脚趾体力+25；位于首行时脚趾金钱+3
global.relicRegister.register(function(relic) {
    relic.setName("charge_chip_toe")
        .setNameZH("蓄力芯片：脚趾")
        .setDescription(Text.gray("脚趾满意度").append(Text.green("+1")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+25")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，脚趾金钱")).append(Text.green("+3")))
        .setStory("蓄力型芯片，在顶部蓄满能量后释放出强大的赚钱能力。")
        .setTags([global.margueriteTags.conductive])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, 25.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + '_top_' + i, 3.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 14. 温柔芯片：脚掌 - 脚掌金钱+1，脚掌满意度+2，脚掌体力+10
global.relicRegister.register(function(relic) {
    relic.setName("gentle_chip_sole")
        .setNameZH("温柔芯片：脚掌")
        .setDescription(Text.gray("脚掌金钱").append(Text.green("+1")).append(Text.gray(" 脚掌满意度")).append(Text.green("+2")).append(Text.gray(" 脚掌体力消耗")).append(Text.red("+10")))
        .setStory("温和的脚掌芯片，各项小幅提升，适合平稳发展。")
        .setTags([global.margueriteTags.fabric])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhang', relic.nameZH + i, 10.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 15. 放松芯片：脚心 - 脚心满意度+2，脚心体力-10
global.relicRegister.register(function(relic) {
    relic.setName("relax_chip_center")
        .setNameZH("放松芯片：脚心")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+2")).append(Text.gray(" 脚心体力消耗")).append(Text.green("-10")))
        .setStory("简单的放松芯片，让脚心更轻松地完成工作。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + i, -10.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 16. 踏实芯片：脚跟 - 脚跟金钱+2，脚跟体力+15
global.relicRegister.register(function(relic) {
    relic.setName("steady_chip_heel")
        .setNameZH("踏实芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+2")).append(Text.gray(" 脚跟体力消耗")).append(Text.red("+15")))
        .setStory("踏实型芯片，稳扎稳打的脚跟加成，一步一个脚印。")
        .setTags([global.margueriteTags.wooden])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaogen', relic.nameZH + i, 15.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 17. 均衡芯片：全部 - 全部位满意度+1，全部位体力+5
global.relicRegister.register(function(relic) {
    relic.setName("balance_chip_all")
        .setNameZH("均衡芯片：全部")
        .setDescription(Text.gray("全部位满意度").append(Text.green("+1")).append(Text.gray(" 全部位体力消耗")).append(Text.red("+5")))
        .setStory("追求平衡之道的芯片，适度的满意度提升换来适度的消耗。")
        .setTags([global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllSat(player, relic.nameZH + i, 1.0)
            global.modifyAllStaminaCost(player, relic.nameZH + i, 5.0)
        })
        .setPool(global.relicPool.common)
})

// ===== 少见 🔵 ×4（新增） =====

// 18. 聚财芯片：脚趾 - 脚趾金钱+3，脚趾体力+30；同列每有1遗物，脚趾体力-8
global.relicRegister.register(function(relic) {
    relic.setName("fortune_chip_toe")
        .setNameZH("聚财芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+3")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+30")))
        .setSpecialDescription(Text.gray("同列每有1个遗物，脚趾体力消耗").append(Text.green("-8")))
        .setStory("聚财型芯片，纵向的同伴越多，越能减轻脚趾的负担。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let sameCol = global.getSameColSlots(i, curiosAll)
            let colCount = global.countRelicsInSlots(sameCol, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, 30.0 - colCount * 8.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 19. 柔韧芯片：脚掌 - 脚掌满意度+4，脚掌体力+20；相邻有"人工制品"遗物时体力惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("flexible_chip_sole")
        .setNameZH("柔韧芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+4")).append(Text.gray(" 脚掌体力消耗")).append(Text.red("+20")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("人工制品")).append(Text.gray("遗物时，体力惩罚消失")))
        .setStory("柔韧型芯片，与人工制品搭配时完美消除体力负担。")
        .setTags([global.margueriteTags.fabric])
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
            let hasArtifact = global.hasTagInSlots(adjacent, "marguerite:tag_artifact", curiosAll)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 4.0, 'addition')
            if (!hasArtifact) {
                player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhang', relic.nameZH + i, 20.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 20. 静谧芯片：脚心 - 全部位体力-5，脚心金钱-1；位于末行时脚心体力额外-15
global.relicRegister.register(function(relic) {
    relic.setName("quiet_chip_center")
        .setNameZH("静谧芯片：脚心")
        .setDescription(Text.gray("全部位体力消耗").append(Text.green("-5")).append(Text.gray(" 脚心金钱")).append(Text.red("-1")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，脚心体力消耗额外")).append(Text.green("-15")))
        .setStory("静谧型芯片，沉在最底层时进入深度放松状态。")
        .setTags([global.margueriteTags.magic])
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
            global.modifyAllStaminaCost(player, relic.nameZH + i, -5.0)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, -1.0, 'addition')
            if (global.isBottomRow(i, curiosAll)) {
                player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + '_bottom_' + i, -15.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 21. 坚守芯片：脚跟 - 脚跟金钱+1，脚跟满意度+2；位于首行时全部位金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("guard_chip_heel")
        .setNameZH("坚守芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+1")).append(Text.gray(" 脚跟满意度")).append(Text.green("+2")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位金钱")).append(Text.green("+1")))
        .setStory("坚守型芯片，在最前线守护时激发全部位的赚钱意志。")
        .setTags([global.margueriteTags.wooden])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllMoney(player, relic.nameZH + '_top_' + i, 1.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×3（新增） =====

// 22. 爆发芯片：脚趾 - 脚趾金钱+4，脚趾体力+40；同行有"导电"遗物时脚趾体力-20
global.relicRegister.register(function(relic) {
    relic.setName("burst_chip_toe")
        .setNameZH("爆发芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+4")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+40")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("导电")).append(Text.gray("遗物时，脚趾体力消耗")).append(Text.green("-20")))
        .setStory("爆发型芯片，导电物品为其传输能量大幅降低消耗。")
        .setTags([global.margueriteTags.conductive])
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
            let hasConductive = global.hasTagInSlots(sameRow, "marguerite:tag_conductive", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, hasConductive ? 20.0 : 40.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 23. 渗透芯片：脚掌 - 脚掌满意度+3；对角线每有1遗物，脚掌金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("permeate_chip_sole")
        .setNameZH("渗透芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("对角线每有1个遗物，脚掌金钱").append(Text.green("+1")))
        .setStory("渗透型芯片，对角线上的同伴越多，越能渗透出额外的金钱。")
        .setTags([global.margueriteTags.magic])
        .setGuideTexture([
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let diagSlots = global.getDiagonalSlots(i)
            let diagCount = global.countRelicsInSlots(diagSlots, curiosAll)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            if (diagCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + '_diag_' + i, diagCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 24. 根基芯片：全部 - 全部位金钱+1，全部位满意度+1，全部位体力+15
global.relicRegister.register(function(relic) {
    relic.setName("foundation_chip_all")
        .setNameZH("根基芯片：全部")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+1")).append(Text.gray(" 全部位满意度")).append(Text.green("+1")).append(Text.gray(" 全部位体力消耗")).append(Text.red("+15")))
        .setStory("根基型芯片，全方位提升收益，但代价是全面增加体力消耗。")
        .setTags([global.margueriteTags.artifact, global.margueriteTags.wooden])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            global.modifyAllMoney(player, relic.nameZH + i, 1.0)
            global.modifyAllSat(player, relic.nameZH + i, 1.0)
            global.modifyAllStaminaCost(player, relic.nameZH + i, 15.0)
        })
        .setPool(global.relicPool.common)
})
