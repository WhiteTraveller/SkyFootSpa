// priority: 9
// 阶段二：红雾异变（3×4，12格）— 13个遗物
global.relicRegister.currentStage = 2

// ===== 普通 ⚪ ×5 =====

// 13. 花种子 - 无标签 - 脚趾+2💰；九宫格每有1遗物，脚趾+1%满意度
global.relicRegister.register(function(relic) {
    relic.setName("flower_seed")
        .setNameZH("花种子")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("九宫格每有1个遗物，脚趾满意度").append(Text.green("+1%")))
        .setStory("一颗来自太阳花田的种子，周围的生命力越旺盛它越高兴。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            if (count > 0) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, count * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 14. 药罐 - 人工制品 - 全部位+3%满意度，脚心-2💰
global.relicRegister.register(function(relic) {
    relic.setName("medicine_jar")
        .setNameZH("药罐")
        .setDescription(Text.gray("全部位满意度").append(Text.green("+3%")).append(Text.gray(" 脚心金钱")).append(Text.red("-2")))
        .setStory("永远亭的药罐，装满了疗愈的药水，但代价是金钱。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, -2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 15. 门环 - 金属 - 脚后跟+3💰，全部位-3%满意度；相邻有"金属"遗物时惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("door_ring")
        .setNameZH("门环")
        .setDescription(Text.gray("脚后跟金钱").append(Text.green("+3")).append(Text.gray(" 全部位满意度")).append(Text.red("-3%")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("金属")).append(Text.gray("遗物时，惩罚消失")))
        .setStory("红魔馆大门上的门环，旁边有金属物品时会安静下来。")
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

// 16. 戒尺 - 木制 - 脚趾+2%满意度，脚后跟+2%满意度；同行每有1遗物，脚趾+1💰
global.relicRegister.register(function(relic) {
    relic.setName("ruler_stick")
        .setNameZH("戒尺")
        .setDescription(Text.gray("脚趾/脚后跟满意度").append(Text.green("+2%")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚趾金钱").append(Text.green("+1")))
        .setStory("寺子屋的戒尺，同排的物品越多越能激发潜力。")
        .setTags([global.margueriteTags.wooden])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let sameRow = global.getSameRowSlots(i, curiosAll)
            let rowCount = global.countRelicsInSlots(sameRow, curiosAll)
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            if (rowCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, rowCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 17. 量尺 - 金属 - 脚心+2💰，脚背-1💰；九宫格每空位，脚背+1💰
global.relicRegister.register(function(relic) {
    relic.setName("measuring_ruler")
        .setNameZH("量尺")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+2")).append(Text.gray(" 脚背金钱")).append(Text.red("-1")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚背金钱").append(Text.green("+1")))
        .setStory("一把精密的金属量尺，空旷的环境反而让它发挥更好。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, -1.0 + emptyCount, 'addition')
        })
        .setPool(global.relicPool.common)
})

// ===== 高级 🔵 ×4 =====

// 18. 银刀叉 - 金属 - 脚背+2💰，脚掌+2💰；同行每有1"金属"遗物，脚背+1💰
global.relicRegister.register(function(relic) {
    relic.setName("silver_cutlery")
        .setNameZH("银刀叉")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同行每有1个").append(Text.yellow("金属")).append(Text.gray("遗物，脚背金钱")).append(Text.green("+1")))
        .setStory("红魔馆餐桌上的银质刀叉，与同类金属产生共鸣。")
        .setTags([global.margueriteTags.metal])
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
            let metalCount = global.countTagInSlots(sameRow, "marguerite:tag_metal", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 2.0 + metalCount, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 19. 长刀 - 金属 - 脚背+4💰，脚心-4%满意度；相邻有"金属"遗物时惩罚减半
global.relicRegister.register(function(relic) {
    relic.setName("long_blade")
        .setNameZH("长刀")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+4")).append(Text.gray(" 脚心满意度")).append(Text.red("-4%")))
        .setSpecialDescription(Text.gray("相邻有").append(Text.yellow("金属")).append(Text.gray("遗物时，惩罚减半")))
        .setStory("白玉楼的长刀，锋利无比，旁边有金属物品时杀气收敛。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, penalty, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 20. 弓弦 - 无标签 - 脚背+3💰；同列每有1遗物，脚背+1💰
global.relicRegister.register(function(relic) {
    relic.setName("bow_string")
        .setNameZH("弓弦")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同列每有1个遗物，脚背金钱").append(Text.green("+1")))
        .setStory("一根永不断裂的弓弦，纵向排列的物品会增强其张力。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 3.0 + colCount, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 21. 巫女签 - 魔法 - 脚心+5%满意度；九宫格每有2遗物，脚心+1💰
global.relicRegister.register(function(relic) {
    relic.setName("shrine_fortune")
        .setNameZH("巫女签")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+5%")))
        .setSpecialDescription(Text.gray("九宫格每有2个遗物，脚心金钱").append(Text.green("+1")))
        .setStory("博丽神社的签文，周围的物品成双成对时运势大增。")
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
                player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, bonus * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4 =====

// 22. 厚书 - 书 - 全部位+2%满意度；九宫格每空位，脚掌+1💰
global.relicRegister.register(function(relic) {
    relic.setName("thick_book")
        .setNameZH("厚书")
        .setDescription(Text.gray("全部位满意度").append(Text.green("+2%")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚掌金钱").append(Text.green("+1")))
        .setStory("帕秋莉的魔法书，厚重得能当枕头，周围空旷时知识涌出。")
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

// 23. 御币 - 魔法 - 脚背+2💰，脚掌+2💰；首行时全部位+3%满意度
global.relicRegister.register(function(relic) {
    relic.setName("gohei")
        .setNameZH("御币")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位满意度")).append(Text.green("+3%")))
        .setStory("博丽灵梦的御币，高居首位时神力全开。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllSat(player, relic.nameZH + '_top_' + i, 3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 24. 白樱花 - 无标签 - 脚后跟+2💰，脚掌+2💰；末行时全部位+2💰
global.relicRegister.register(function(relic) {
    relic.setName("white_sakura")
        .setNameZH("白樱花")
        .setDescription(Text.gray("脚后跟/脚掌金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，全部位金钱")).append(Text.green("+2")))
        .setStory("白玉楼的樱花永不凋零，沉在底部时绽放出全部力量。")
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

// 25. 蓬莱瓶 - 魔法/人工制品 - 脚掌+2💰，脚背+2💰；同行有"魔法"遗物时全部位+2💰
global.relicRegister.register(function(relic) {
    relic.setName("hourai_bottle")
        .setNameZH("蓬莱瓶")
        .setDescription(Text.gray("脚掌/脚背金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("魔法")).append(Text.gray("遗物时，全部位金钱")).append(Text.green("+2")))
        .setStory("蓬莱山辉夜的宝瓶，与同行的魔法之物产生共鸣。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 2.0, 'addition')
            if (hasMagic) {
                global.modifyAllMoney(player, relic.nameZH + '_magic_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})
