// priority: 9
// 阶段三：地灵殿之暗（4×5，20格）— 14个遗物
global.relicRegister.currentStage = 3

// ===== 普通 ⚪ ×5 =====

// 26. 推车 - 金属/人工制品 - 脚趾+3💰；同行每有1"金属"遗物，脚趾+2💰
global.relicRegister.register(function(relic) {
    relic.setName("pushcart")
        .setNameZH("推车")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同行每有1个").append(Text.yellow("金属")).append(Text.gray("遗物，脚趾金钱")).append(Text.green("+2")))
        .setStory("地灵殿的矿车，与金属伙伴同行时满载而归。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.artifact])
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
            let metalCount = global.countTagInSlots(sameRow, "marguerite:tag_metal", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 3.0 + metalCount * 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 27. 经卷 - 书 - 脚心+4%满意度；同行每有1遗物，脚心+1💰
global.relicRegister.register(function(relic) {
    relic.setName("scripture")
        .setNameZH("经卷")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+4%")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚心金钱").append(Text.green("+1")))
        .setStory("命莲寺的经卷，同行者越多，念经声越洪亮。")
        .setTags([global.margueriteTags.book])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 4.0, 'addition')
            if (rowCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, rowCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 28. 羽笔 - 无标签 - 脚掌+3💰；同行每有1遗物，脚掌+1💰
global.relicRegister.register(function(relic) {
    relic.setName("quill_pen")
        .setNameZH("羽笔")
        .setDescription(Text.gray("脚掌金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚掌金钱").append(Text.green("+1")))
        .setStory("射命丸文的羽笔，同行取材对象越多灵感越强。")
        .setTags([])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0 + rowCount, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 29. 水晶球 - 魔法 - 脚心+3💰；同行遗物数为奇数时脚心额外+3💰
global.relicRegister.register(function(relic) {
    relic.setName("crystal_ball")
        .setNameZH("水晶球")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同行遗物数为奇数时，脚心金钱额外").append(Text.green("+3")))
        .setStory("古明地觉的水晶球，奇数的排列蕴含着神秘的力量。")
        .setTags([global.margueriteTags.magic])
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
            let bonus = (rowCount % 2 === 1) ? 6.0 : 3.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, bonus, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 30. 扳手 - 金属/导电 - 脚掌+3💰，脚后跟+2💰；九宫格每空位，脚掌+1💰
global.relicRegister.register(function(relic) {
    relic.setName("wrench")
        .setNameZH("扳手")
        .setDescription(Text.gray("脚掌金钱").append(Text.green("+3")).append(Text.gray(" 脚后跟金钱")).append(Text.green("+2")))
        .setSpecialDescription(Text.gray("九宫格每有1个空位，脚掌金钱").append(Text.green("+1")))
        .setStory("河城荷取的扳手，周围越空旷越能施展拳脚。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.conductive])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0 + emptyCount, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// ===== 高级 🔵 ×5 =====

// 31. 反应炉 - 导电/人工制品 - 脚后跟+5💰，全部位-5%满意度；底部行时惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("reactor")
        .setNameZH("反应炉")
        .setDescription(Text.gray("脚后跟金钱").append(Text.green("+5")).append(Text.gray(" 全部位满意度")).append(Text.red("-5%")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("底部行")).append(Text.gray("时，惩罚消失")))
        .setStory("地灵殿的核反应炉，只有沉在最底层才能稳定运行。")
        .setTags([global.margueriteTags.conductive, global.margueriteTags.artifact])
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
            let isBottom = global.isBottomRow(i, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 5.0, 'addition')
            if (!isBottom) {
                global.modifyAllSat(player, relic.nameZH + i, -5.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 32. 相机 - 人工制品 - 脚背+4💰；同行每有1遗物，脚背+1%满意度
global.relicRegister.register(function(relic) {
    relic.setName("camera")
        .setNameZH("相机")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+4")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，脚背满意度").append(Text.green("+1%")))
        .setStory("射命丸文的相机，拍摄对象越多，新闻价值越高。")
        .setTags([global.margueriteTags.artifact])
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 4.0, 'addition')
            if (rowCount > 0) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaobei', relic.nameZH + i, rowCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 33. 铁扇 - 金属 - 脚后跟+3💰，脚掌+3💰；九宫格每有1"金属"遗物，全部位+2💰
global.relicRegister.register(function(relic) {
    relic.setName("iron_fan")
        .setNameZH("铁扇")
        .setDescription(Text.gray("脚后跟/脚掌金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("九宫格每有1个").append(Text.yellow("金属")).append(Text.gray("遗物，全部位金钱")).append(Text.green("+2")))
        .setStory("天魔的铁扇，周围的金属越多，扇风越猛烈。")
        .setTags([global.margueriteTags.metal])
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
            let metalCount = global.countTagInSlots(nineGrid, "marguerite:tag_metal", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            if (metalCount > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_metal_' + i, metalCount * 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 34. 法轮 - 金属/魔法 - 全部位+2💰；九宫格每有1"魔法"遗物，全部位+1💰
global.relicRegister.register(function(relic) {
    relic.setName("dharma_wheel")
        .setNameZH("法轮")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("九宫格每有1个").append(Text.yellow("魔法")).append(Text.gray("遗物，全部位金钱")).append(Text.green("+1")))
        .setStory("命莲寺的法轮，周围魔法之物越多转得越快。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.magic])
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
            let magicCount = global.countTagInSlots(nineGrid, "marguerite:tag_magic", curiosAll)
            global.modifyAllMoney(player, relic.nameZH + i, 2.0)
            if (magicCount > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_magic_' + i, magicCount * 1.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 35. 竹笛 - 木制 - 脚趾+4💰，脚心+4💰；同行遗物数为偶数时全部位+2%满意度
global.relicRegister.register(function(relic) {
    relic.setName("bamboo_flute")
        .setNameZH("竹笛")
        .setDescription(Text.gray("脚趾/脚心金钱").append(Text.green("+4")))
        .setSpecialDescription(Text.gray("同行遗物数为偶数时，全部位满意度").append(Text.green("+2%")))
        .setStory("一根竹制长笛，偶数的和谐之美让它奏出天籁。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 4.0, 'addition')
            if (rowCount > 0 && rowCount % 2 === 0) {
                global.modifyAllSat(player, relic.nameZH + '_even_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4 =====

// 36. 勾玉 - 魔法 - 脚背+3💰，脚掌+3💰；同行有"魔法"或"书"遗物时全部位+2💰
global.relicRegister.register(function(relic) {
    relic.setName("magatama")
        .setNameZH("勾玉")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("魔法")).append(Text.gray("或")).append(Text.yellow("书")).append(Text.gray("遗物时，全部位金钱")).append(Text.green("+2")))
        .setStory("古老的勾玉，感应到同行的魔法或知识时力量觉醒。")
        .setTags([global.margueriteTags.magic])
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
            let hasBook = global.hasTagInSlots(sameRow, "marguerite:tag_book", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 3.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
            if (hasMagic || hasBook) {
                global.modifyAllMoney(player, relic.nameZH + '_link_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 37. 怨灵瓶 - 魔法/人工制品 - 全部位+4💰，全部位-8%满意度；九宫格有"魔法"遗物时惩罚-3%
global.relicRegister.register(function(relic) {
    relic.setName("grudge_bottle")
        .setNameZH("怨灵瓶")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+4")).append(Text.gray(" 全部位满意度")).append(Text.red("-8%")))
        .setSpecialDescription(Text.gray("九宫格有").append(Text.yellow("魔法")).append(Text.gray("遗物时，惩罚")).append(Text.green("-3%")))
        .setStory("封印怨灵的瓶子，周围有魔法镇压时怨气减弱。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.artifact])
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
            let hasMagic = global.hasTagInSlots(nineGrid, "marguerite:tag_magic", curiosAll)
            let penalty = hasMagic ? -5.0 : -8.0
            global.modifyAllMoney(player, relic.nameZH + i, 4.0)
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// 38. 保温杯 - 人工制品 - 脚趾+5💰，脚心-4%满意度；中心2×3时惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("thermos_cup")
        .setNameZH("保温杯")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+5")).append(Text.gray(" 脚心满意度")).append(Text.red("-4%")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("中心2×3")).append(Text.gray("区域时，惩罚消失")))
        .setStory("一个保温杯，放在背包正中央时温度恰到好处。")
        .setTags([global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let isCenter = global.isInCenter2x3(i)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 5.0, 'addition')
            if (!isCenter) {
                player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, -4.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 39. 龙珠 - 魔法 - 脚心+3💰，脚掌+3💰；对角线每有1遗物，脚心+1💰
global.relicRegister.register(function(relic) {
    relic.setName("dragon_pearl")
        .setNameZH("龙珠")
        .setDescription(Text.gray("脚心/脚掌金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("对角线方向每有1个遗物，脚心金钱").append(Text.green("+1")))
        .setStory("传说中的龙珠，对角线上的力量汇聚于此。")
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
            let diagonals = global.getDiagonalSlots(i)
            let diagCount = global.countRelicsInSlots(diagonals, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 3.0 + diagCount, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0, 'addition')
        })
        .setPool(global.relicPool.common)
})
