// priority: 9
// 阶段二：红雾异变（3×4，12格）— 26个芯片遗物
// 4部位体系：脚趾(高钱低满高耗) / 脚掌(低钱高满中高耗) / 脚心(低收益低耗) / 脚跟(均衡)
global.relicRegister.currentStage = 2

// ===== 普通 ⚪ ×5 =====

// 13. 增幅芯片：脚趾 - 脚趾金钱+3，全部位满意度-3；九宫格每有1遗物，脚趾满意度+1
global.relicRegister.register(function(relic) {
    relic.setName("boost_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("增幅芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+3")).append(Text.gray(" 全部位满意度")).append(Text.red("-3")))
        .setSpecialDescription(Text.gray("九宫格每有1个遗物，脚趾满意度").append(Text.green("+1")))
        .setStory("高功率脚趾芯片，周围的同伴越多越能弥补满意度的损失。")
        .setTags([])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nineGrid = global.getNineGrid(i, 6, 9)
            let count = global.countRelicsInSlots(nineGrid, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 3.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, -3.0)
            if (count > 0) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + '_nine_' + i, count * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 14. 治愈芯片：脚掌 - 全部位满意度+3，脚心金钱-1
global.relicRegister.register(function(relic) {
    relic.setName("heal_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("治愈芯片：脚掌")
        .setDescription(Text.gray("全部位满意度").append(Text.green("+3")).append(Text.gray(" 脚心金钱")).append(Text.red("-1")))
        .setStory("温和的治愈芯片，全面提升满意度，但会削弱脚心的收入。")
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
            global.modifyAllSat(player, relic.nameZH + i, 3.0)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, -1.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 15. 共振芯片：脚跟 - 脚跟金钱+3，全部位满意度-3；相邻有"金属"遗物时惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("resonance_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("共振芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+3")).append(Text.gray(" 全部位满意度")).append(Text.red("-3")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("金属")).append(Text.gray("遗物时，惩罚消失")))
        .setStory("共振型芯片，旁边有金属物品时共鸣抵消了负面效果。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let adjacent = global.getTenGrid(i, 6, 9)
            let hasMetalNear = global.hasTagInSlots(adjacent, "marguerite:tag_metal", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            if (!hasMetalNear) {
                global.modifyAllSat(player, relic.nameZH + i, -3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 16. 轻载芯片：脚心 - 全部位体力-10，脚心满意度-2
global.relicRegister.register(function(relic) {
    relic.setName("light_chip_center")
        .setTexture("chip_lv2_pt3.png")
        .setNameZH("轻载芯片：脚心")
        .setDescription(Text.gray("全部位体力消耗").append(Text.green("-10")).append(Text.gray(" 脚心满意度")).append(Text.red("-2")))
        .setStory("轻量化芯片，全面降低体力消耗，但脚心满意度略有下降。")
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
            global.modifyAllStaminaCost(player, relic.nameZH + i, -10.0)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, -2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 17. 精准芯片：脚趾 - 脚心金钱+2，脚趾金钱-1；九宫格每空位，脚趾金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("precise_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("精准芯片：脚趾")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+2")).append(Text.gray(" 脚趾金钱")).append(Text.red("-1")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚趾金钱").append(Text.green("+1")))
        .setStory("精密型芯片，空旷的环境反而让它发挥更好。")
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nineGrid = global.getNineGrid(i, 6, 9)
            let emptyCount = global.countEmptyInSlots(nineGrid, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, -1.0 + emptyCount, 'addition')
        })
        .setPool(global.relicPool.common)
})

// ===== 少见 🔵 ×4 =====

// 18. 超频芯片：脚趾 - 脚趾金钱+4，脚心满意度-4；相邻有"金属"遗物时惩罚减半
global.relicRegister.register(function(relic) {
    relic.setName("overclock_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("超频芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+4")).append(Text.gray(" 脚心满意度")).append(Text.red("-4")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("金属")).append(Text.gray("遗物时，惩罚减半")))
        .setStory("超频运行的芯片，金属同伴能帮助散热减少副作用。")
        .setTags([global.margueriteTags.metal])
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
            let hasMetalNear = global.hasTagInSlots(adjacent, "marguerite:tag_metal", curiosAll)
            let penalty = hasMetalNear ? -2.0 : -4.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, penalty, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 19. 延伸芯片：脚掌 - 脚掌金钱+3；同列每有1遗物，脚掌满意度+1
global.relicRegister.register(function(relic) {
    relic.setName("extend_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("延伸芯片：脚掌")
        .setDescription(Text.gray("脚掌金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同列每有1个遗物，脚掌满意度").append(Text.green("+1")))
        .setStory("纵向延伸型芯片，同列的物品越多力量越强。")
        .setTags([])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            if (colCount > 0) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, colCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 20. 回收芯片：脚心 - 脚心满意度+5；九宫格每有2遗物，脚心体力-10
global.relicRegister.register(function(relic) {
    relic.setName("recycle_chip_center")
        .setTexture("chip_lv2_pt3.png")
        .setNameZH("回收芯片：脚心")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+5")))
        .setSpecialDescription(Text.gray("九宫格每有2个遗物，脚心体力消耗").append(Text.green("-10")))
        .setStory("能量回收芯片，周围的物品成双成对时回收效率大增。")
        .setTags([global.margueriteTags.magic])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nineGrid = global.getNineGrid(i, 6, 9)
            let count = global.countRelicsInSlots(nineGrid, curiosAll)
            let bonus = Math.floor(count / 2)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 5.0, 'addition')
            if (bonus > 0) {
                player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + i, bonus * -10.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 21. 强化芯片：脚跟 - 脚趾满意度+2，脚跟满意度+2；同行每有1遗物，脚跟金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("enhance_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("强化芯片：脚跟")
        .setDescription(Text.gray("脚趾/脚跟满意度").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚跟金钱").append(Text.green("+1")))
        .setStory("强化型芯片，同排的物品越多越能激发脚跟的潜力。")
        .setTags([global.margueriteTags.wooden])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            if (rowCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, rowCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4 =====

// 22. 知识芯片：全部 - 全部位满意度+2；九宫格每空位，脚掌金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("knowledge_chip_all")
        .setTexture("chip_lv2_pt5.png")
        .setNameZH("知识芯片：全部")
        .setDescription(Text.gray("全部位满意度").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚掌金钱").append(Text.green("+1")))
        .setStory("知识型芯片，周围空旷时知识涌出，转化为脚掌的收益。")
        .setTags([global.margueriteTags.book])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nineGrid = global.getNineGrid(i, 6, 9)
            let emptyCount = global.countEmptyInSlots(nineGrid, curiosAll)
            global.modifyAllSat(player, relic.nameZH + i, 2.0)
            if (emptyCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, emptyCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 23. 统御芯片：脚掌 - 脚掌金钱+2；位于首行时，全部位满意度+3
global.relicRegister.register(function(relic) {
    relic.setName("command_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("统御芯片：脚掌")
        .setDescription(Text.gray("脚掌金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位满意度")).append(Text.green("+3")))
        .setStory("统御型芯片，高居首位时指挥全局，提升整体满意度。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllSat(player, relic.nameZH + '_top_' + i, 3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 24. 扎根芯片：脚跟 - 脚跟金钱+2，脚掌金钱+2；位于末行时，全部位金钱+2
global.relicRegister.register(function(relic) {
    relic.setName("root_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("扎根芯片：脚跟")
        .setDescription(Text.gray("脚跟/脚掌金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，全部位金钱")).append(Text.green("+2")))
        .setStory("扎根型芯片，沉在底部时绽放出全部力量。")
        .setTags([])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            if (global.isBottomRow(i, curiosAll)) {
                global.modifyAllMoney(player, relic.nameZH + '_bottom_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 25. 共鸣芯片：全部 - 脚掌金钱+2，脚趾金钱+2；同行有"魔法"遗物时全部位金钱+2
global.relicRegister.register(function(relic) {
    relic.setName("harmony_chip_all")
        .setTexture("chip_lv2_pt5.png")
        .setNameZH("共鸣芯片：全部")
        .setDescription(Text.gray("脚掌/脚趾金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("魔法")).append(Text.gray("遗物时，全部位金钱")).append(Text.green("+2")))
        .setStory("共鸣型芯片，与同行的魔法之物产生共鸣时爆发全面收益。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.artifact])
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
            let hasMagic = global.hasTagInSlots(sameRow, "marguerite:tag_magic", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            if (hasMagic) {
                global.modifyAllMoney(player, relic.nameZH + '_magic_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 普通 ⚪ ×5（新增） =====

// 26. 锐利芯片：脚趾 - 脚趾金钱+2，脚趾满意度-2，脚趾体力+15
global.relicRegister.register(function(relic) {
    relic.setName("sharp_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("锐利芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")).append(Text.gray(" 脚趾满意度")).append(Text.red("-2")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+15")))
        .setStory("锐利型芯片，牺牲满意度换取金钱，脚趾特色的高收益高消耗。")
        .setTags([global.margueriteTags.knife])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, -2.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, 15.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 27. 按压芯片：脚掌 - 脚掌满意度+4，脚掌体力+20
global.relicRegister.register(function(relic) {
    relic.setName("press_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("按压芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+4")).append(Text.gray(" 脚掌体力消耗")).append(Text.red("+20")))
        .setStory("按压型芯片，强力的满意度提升需要更多的体力支撑。")
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhang', relic.nameZH + i, 20.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 28. 舒缓芯片：脚心 - 脚心满意度+2，全部位体力-5
global.relicRegister.register(function(relic) {
    relic.setName("soothe_chip_center")
        .setTexture("chip_lv2_pt3.png")
        .setNameZH("舒缓芯片：脚心")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+2")).append(Text.gray(" 全部位体力消耗")).append(Text.green("-5")))
        .setStory("舒缓型芯片，脚心的放松感延伸到全身，降低整体负担。")
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
            global.modifyAllStaminaCost(player, relic.nameZH + i, -5.0)
        })
        .setPool(global.relicPool.common)
})

// 29. 稳固芯片：脚跟 - 脚跟金钱+2，脚跟满意度+1，脚跟体力+10
global.relicRegister.register(function(relic) {
    relic.setName("solid_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("稳固芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+2")).append(Text.gray(" 脚跟满意度")).append(Text.green("+1")).append(Text.gray(" 脚跟体力消耗")).append(Text.red("+10")))
        .setStory("稳固型芯片，脚跟的均衡特性得到全面提升。")
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaogen', relic.nameZH + i, 10.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 30. 泛用芯片：全部 - 全部位金钱+1，全部位体力+10
global.relicRegister.register(function(relic) {
    relic.setName("versatile_chip_all")
        .setTexture("chip_lv2_pt5.png")
        .setNameZH("泛用芯片：全部")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+1")).append(Text.gray(" 全部位体力消耗")).append(Text.red("+10")))
        .setStory("泛用型芯片，广播式的金钱加成，但体力负担也全面提升。")
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
            global.modifyAllStaminaCost(player, relic.nameZH + i, 10.0)
        })
        .setPool(global.relicPool.common)
})

// ===== 少见 🔵 ×4（新增） =====

// 31. 贪婪芯片：脚趾 - 脚趾金钱+5，脚趾体力+35；位于末行时体力惩罚减半
global.relicRegister.register(function(relic) {
    relic.setName("greed_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("贪婪芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+5")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+35")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，体力惩罚减半")))
        .setStory("贪婪型芯片，沉在底层时能抑制自己的贪婪降低消耗。")
        .setTags([global.margueriteTags.conductive])
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
            let staminaPenalty = global.isBottomRow(i, curiosAll) ? 17.0 : 35.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 5.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, staminaPenalty, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 32. 抚慰芯片：脚掌 - 脚掌满意度+3，脚掌金钱+1；相邻有"布制品"遗物时，脚掌满意度额外+3
global.relicRegister.register(function(relic) {
    relic.setName("comfort_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("抚慰芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+3")).append(Text.gray(" 脚掌金钱")).append(Text.green("+1")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("布制品")).append(Text.gray("遗物时，脚掌满意度额外")).append(Text.green("+3")))
        .setStory("抚慰型芯片，柔软的布制品能让它发挥更大的满意度。")
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
            let hasFabric = global.hasTagInSlots(adjacent, "marguerite:tag_fabric", curiosAll)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 1.0, 'addition')
            if (hasFabric) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + '_fabric_' + i, 3.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 33. 吐纳芯片：脚心 - 脚心满意度+3，脚心体力-15；九宫格每有1空位，脚心金钱+1
global.relicRegister.register(function(relic) {
    relic.setName("breathe_chip_center")
        .setTexture("chip_lv2_pt3.png")
        .setNameZH("吐纳芯片：脚心")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+3")).append(Text.gray(" 脚心体力消耗")).append(Text.green("-15")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚心金钱").append(Text.green("+1")))
        .setStory("吐纳型芯片，周围的空间让它能自由呼吸，转化为金钱。")
        .setTags([global.margueriteTags.magic])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nineGrid = global.getNineGrid(i, 6, 9)
            let emptyCount = global.countEmptyInSlots(nineGrid, curiosAll)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaoxin', relic.nameZH + i, -15.0, 'addition')
            if (emptyCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + '_empty_' + i, emptyCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 34. 平衡芯片：脚跟 - 脚跟金钱+2，脚跟满意度+2；同列每有1遗物，全部位体力-3
global.relicRegister.register(function(relic) {
    relic.setName("equilibrium_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("平衡芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+2")).append(Text.gray(" 脚跟满意度")).append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同列每有1个遗物，全部位体力消耗").append(Text.green("-3")))
        .setStory("平衡型芯片，纵向同伴的支撑让全身更加轻松。")
        .setTags([global.margueriteTags.artifact])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            if (colCount > 0) {
                global.modifyAllStaminaCost(player, relic.nameZH + '_col_' + i, colCount * -3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4（新增） =====

// 35. 压榨芯片：脚趾 - 脚趾金钱+6，脚趾体力+50；背包不同标签每≥2种，脚趾体力-10
global.relicRegister.register(function(relic) {
    relic.setName("exploit_chip_toe")
        .setTexture("chip_lv2_pt1.png")
        .setNameZH("压榨芯片：脚趾")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+6")).append(Text.gray(" 脚趾体力消耗")).append(Text.red("+50")))
        .setSpecialDescription(Text.gray("背包中每有2种不同标签，脚趾体力消耗").append(Text.green("-10")))
        .setStory("压榨型芯片，背包中的多样性让它的贪婪得到控制。")
        .setTags([global.margueriteTags.conductive, global.margueriteTags.metal])
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
            let curiosAll = global.getCuriosAll(player)
            let uniqueTags = global.countUniqueTagsInBackpack(curiosAll)
            let reduction = Math.floor(uniqueTags / 2) * -10.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 6.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhi', relic.nameZH + i, 50.0 + reduction, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 36. 涌泉芯片：脚掌 - 脚掌满意度+5，脚掌体力+25；位于首行时全部位满意度+2
global.relicRegister.register(function(relic) {
    relic.setName("spring_chip_sole")
        .setTexture("chip_lv2_pt2.png")
        .setNameZH("涌泉芯片：脚掌")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+5")).append(Text.gray(" 脚掌体力消耗")).append(Text.red("+25")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位满意度")).append(Text.green("+2")))
        .setStory("涌泉型芯片，在顶部时如泉涌出满意度润泽全身。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.book])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 5.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaozhang', relic.nameZH + i, 25.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllSat(player, relic.nameZH + '_top_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 37. 宁静芯片：脚心 - 全部位体力-15；对角线每有1遗物，脚心满意度+1
global.relicRegister.register(function(relic) {
    relic.setName("serene_chip_center")
        .setTexture("chip_lv2_pt3.png")
        .setNameZH("宁静芯片：脚心")
        .setDescription(Text.gray("全部位体力消耗").append(Text.green("-15")))
        .setSpecialDescription(Text.gray("对角线每有1个遗物，脚心满意度").append(Text.green("+1")))
        .setStory("宁静型芯片，周围的谐振让全身感到平静，对角线上的同伴带来温暖。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.mushroom])
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
            global.modifyAllStaminaCost(player, relic.nameZH + i, -15.0)
            if (diagCount > 0) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + '_diag_' + i, diagCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 38. 磐石芯片：脚跟 - 脚跟金钱+3，脚跟满意度+3，脚跟体力+20；位于末行时全部位体力-10
global.relicRegister.register(function(relic) {
    relic.setName("bedrock_chip_heel")
        .setTexture("chip_lv2_pt4.png")
        .setNameZH("磐石芯片：脚跟")
        .setDescription(Text.gray("脚跟金钱").append(Text.green("+3")).append(Text.gray(" 脚跟满意度")).append(Text.green("+3")).append(Text.gray(" 脚跟体力消耗")).append(Text.red("+20")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，全部位体力消耗")).append(Text.green("-10")))
        .setStory("磐石型芯片，如岩石般坚定，沉在底部时发挥最大力量。")
        .setTags([global.margueriteTags.wooden, global.margueriteTags.artifact])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.stamina_cost.jiaogen', relic.nameZH + i, 20.0, 'addition')
            if (global.isBottomRow(i, curiosAll)) {
                global.modifyAllStaminaCost(player, relic.nameZH + '_bottom_' + i, -10.0)
            }
        })
        .setPool(global.relicPool.common)
})
