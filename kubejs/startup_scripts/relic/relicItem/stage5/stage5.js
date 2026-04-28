// priority: 9
// 阶段五：深秘录终章（6×9，54格）— 10个遗物
global.relicRegister.currentStage = 5

// ===== 普通 ⚪ ×2 =====

// 51. 月面仪 - 人工制品/导电 - 脚背+8💰；同列每有1遗物，脚背+1💰（最多+8💰）
global.relicRegister.register(function(relic) {
    relic.setName("lunar_device")
        .setNameZH("月面仪")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+8")))
        .setSpecialDescription(Text.gray("同列每有1个遗物，脚背金钱").append(Text.green("+1")).append(Text.gray("（最多+8）")))
        .setStory("绵月丰姬的月面观测仪，纵向排列的同伴增强其信号。")
        .setTags([global.margueriteTags.artifact, global.margueriteTags.conductive])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let sameCol = global.getSameColSlots(i, curiosAll)
            let colCount = global.countRelicsInSlots(sameCol, curiosAll)
            let bonus = Math.min(colCount, 8)
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 8.0 + bonus, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 52. 红雾瓶 - 魔法/人工制品 - 全部位+5💰，全部位-8%满意度；底部2行每有1"魔法"遗物，惩罚-2%
global.relicRegister.register(function(relic) {
    relic.setName("red_mist_bottle")
        .setNameZH("红雾瓶")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+5")).append(Text.gray(" 全部位满意度")).append(Text.red("-8%")))
        .setSpecialDescription(Text.gray("底部2行每有1个").append(Text.yellow("魔法")).append(Text.gray("遗物，惩罚")).append(Text.green("-2%")))
        .setStory("封印红雾的瓶子，底部的魔法之力能压制雾气。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let bottomSlots = global.getBottomTwoRowSlots(curiosAll)
            let magicCount = global.countTagInSlots(bottomSlots, "marguerite:tag_magic", curiosAll)
            let penalty = Math.min(-8.0 + magicCount * 2.0, 0)
            global.modifyAllMoney(player, relic.nameZH + i, 5.0)
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// ===== 高级 🔵 ×4 =====

// 53. 五色灯 - 导电/人工制品 - 全部位+5💰，全部位-6%满意度；同行有5种不同标签时惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("five_color_lamp")
        .setNameZH("五色灯")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+5")).append(Text.gray(" 全部位满意度")).append(Text.red("-6%")))
        .setSpecialDescription(Text.gray("同行有5种不同标签时，惩罚消失"))
        .setStory("五色的魔法灯，同行的多样性点亮全部颜色时光芒万丈。")
        .setTags([global.margueriteTags.conductive, global.margueriteTags.artifact])
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
            let uniqueTags = global.countUniqueTagsInSlots(sameRow, curiosAll)
            global.modifyAllMoney(player, relic.nameZH + i, 5.0)
            if (uniqueTags < 5) {
                global.modifyAllSat(player, relic.nameZH + i, -6.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 54. 反魂蝶 - 魔法 - 脚心+8💰，脚后跟+8💰；同列遗物"空满交替"时全部位+5💰
global.relicRegister.register(function(relic) {
    relic.setName("resurrection_butterfly")
        .setNameZH("反魂蝶")
        .setDescription(Text.gray("脚心/脚后跟金钱").append(Text.green("+8")))
        .setSpecialDescription(Text.gray("同列遗物\"空满交替\"排列时，全部位金钱").append(Text.green("+5")))
        .setStory("西行寺幽幽子的反魂蝶，同列空与满交替时亡灵之舞最美。")
        .setTags([global.margueriteTags.magic])
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
            let col = i % 9
            // 检查同列是否空满交替
            let isAlternating = true
            let prevHasRelic = global.isValidRelic(curiosAll.getStackInSlot(col))
            for (let r = 1; r < 6; r++) {
                let slot = r * 9 + col
                let stack = curiosAll.getStackInSlot(slot)
                // 跳过backpack_space以外的区域
                if (stack.getId() == "marguerite:backpack_space") break
                let hasRelic = global.isValidRelic(stack)
                if (hasRelic == prevHasRelic) {
                    isAlternating = false
                    break
                }
                prevHasRelic = hasRelic
            }
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 8.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 8.0, 'addition')
            if (isAlternating) {
                global.modifyAllMoney(player, relic.nameZH + '_alt_' + i, 5.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 55. 梦槌 - 木制/魔法 - 全部位-5💰，全部位+10%满意度；同行有"木制"遗物时全部位+8💰
global.relicRegister.register(function(relic) {
    relic.setName("dream_mallet")
        .setNameZH("梦槌")
        .setDescription(Text.gray("全部位金钱").append(Text.red("-5")).append(Text.gray(" 全部位满意度")).append(Text.green("+10%")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("木制")).append(Text.gray("遗物时，全部位金钱")).append(Text.green("+8")))
        .setStory("梦境中的木槌，同行的木制伙伴让美梦成真。")
        .setTags([global.margueriteTags.wooden, global.margueriteTags.magic])
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
            let hasWooden = global.hasTagInSlots(sameRow, "marguerite:tag_wooden", curiosAll)
            global.modifyAllSat(player, relic.nameZH + i, 10.0)
            if (hasWooden) {
                global.modifyAllMoney(player, relic.nameZH + i, 3.0) // -5+8=+3净值
            } else {
                global.modifyAllMoney(player, relic.nameZH + i, -5.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 56. 三界仪 - 魔法/人工制品 - 脚心+8💰；背包分上中下三区，每区至少有1"魔法"遗物时全部位+6💰
global.relicRegister.register(function(relic) {
    relic.setName("three_realm_device")
        .setNameZH("三界仪")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+8")))
        .setSpecialDescription(Text.gray("背包上/中/下三区各至少有1个").append(Text.yellow("魔法")).append(Text.gray("遗物时，全部位金钱")).append(Text.green("+6")))
        .setStory("连接三界的仪器，上中下均有魔法存在时通道开启。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.artifact])
        .setGuideTexture([
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            // 6行分3区：上(0-1行), 中(2-3行), 下(4-5行)
            let zones = [
                [], // 上区
                [], // 中区
                []  // 下区
            ]
            for (let s = 0; s < 54; s++) {
                let row = Math.floor(s / 9)
                if (row <= 1) zones[0].push(s)
                else if (row <= 3) zones[1].push(s)
                else zones[2].push(s)
            }
            let allZonesHaveMagic = true
            for (let z = 0; z < 3; z++) {
                if (!global.hasTagInSlots(zones[z], "marguerite:tag_magic", curiosAll)) {
                    allZonesHaveMagic = false
                    break
                }
            }
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 8.0, 'addition')
            if (allZonesHaveMagic) {
                global.modifyAllMoney(player, relic.nameZH + '_3realm_' + i, 6.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4 =====

// 57. 不死焰 - 魔法 - 脚心+12💰，全部位-10%满意度；九宫格有3+遗物时惩罚-5%
global.relicRegister.register(function(relic) {
    relic.setName("undying_flame")
        .setNameZH("不死焰")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+12")).append(Text.gray(" 全部位满意度")).append(Text.red("-10%")))
        .setSpecialDescription(Text.gray("九宫格有3个以上遗物时，惩罚").append(Text.green("-5%")))
        .setStory("藤原妹红的不死之焰，周围有足够的同伴时火焰变得温和。")
        .setTags([global.margueriteTags.magic])
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
            let count = global.countRelicsInSlots(nineGrid, curiosAll)
            let penalty = count >= 3 ? -5.0 : -10.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 12.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// 58. 碎裂镜 - 魔法/人工制品 - 脚背+15💰，全部位-15%满意度；同行有"人工制品"遗物时惩罚-5%
global.relicRegister.register(function(relic) {
    relic.setName("shattered_mirror")
        .setNameZH("碎裂镜")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+15")).append(Text.gray(" 全部位满意度")).append(Text.red("-15%")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("人工制品")).append(Text.gray("遗物时，惩罚")).append(Text.green("-5%")))
        .setStory("碎裂的古镜，同行的人工制品能修补裂痕。")
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
            let hasArtifact = global.hasTagInSlots(sameRow, "marguerite:tag_artifact", curiosAll)
            let penalty = hasArtifact ? -10.0 : -15.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 15.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// 59. 现世刃 - 金属 - 脚背+10💰，脚掌-6💰；同行遗物金钱效果从左到右递增时脚掌惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("reality_blade")
        .setNameZH("现世刃")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+10")).append(Text.gray(" 脚掌金钱")).append(Text.red("-6")))
        .setSpecialDescription(Text.gray("同行遗物从左到右无空隙排列时，脚掌惩罚消失"))
        .setStory("斩断现世与幽世的刀刃，同行物品紧密排列时刀鞘稳固。")
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
            let row = Math.floor(i / 9)
            // 检查同行是否从左到右连续排列（中间无空隙）
            let firstRelic = -1
            let lastRelic = -1
            let relicCount = 0
            for (let c = 0; c < 9; c++) {
                let slot = row * 9 + c
                let stack = curiosAll.getStackInSlot(slot)
                if (global.isValidRelic(stack)) {
                    if (firstRelic < 0) firstRelic = c
                    lastRelic = c
                    relicCount++
                }
            }
            // 连续排列：最后位置 - 最初位置 + 1 == 遗物数量
            let isContiguous = relicCount > 0 && (lastRelic - firstRelic + 1 === relicCount)
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 10.0, 'addition')
            if (!isContiguous) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, -6.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 60. 后户之钥 - 金属/魔法 - 全部位+3💰；标签种类每+1种，全部位+1💰（最多+10💰）
global.relicRegister.register(function(relic) {
    relic.setName("key_of_back_door")
        .setNameZH("后户之钥")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("背包标签种类每+1种，全部位金钱").append(Text.green("+1")).append(Text.gray("（最多+10）")))
        .setStory("通往后户之国的钥匙，背包中的多样性就是打开大门的密码。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.magic])
        .setGuideTexture([
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.rare)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let uniqueTags = global.countUniqueTagsInBackpack(curiosAll)
            let bonus = Math.min(uniqueTags, 10)
            global.modifyAllMoney(player, relic.nameZH + i, 3.0)
            if (bonus > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_tags_' + i, bonus * 1.0)
            }
        })
        .setPool(global.relicPool.common)
})
