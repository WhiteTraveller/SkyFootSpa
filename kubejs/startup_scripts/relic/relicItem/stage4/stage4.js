// priority: 9
// 阶段四：星莲船之航（5×6，30格）— 11个遗物
global.relicRegister.currentStage = 4

// ===== 普通 ⚪ ×3 =====

// 40. 罗盘 - 金属/人工制品 - 脚后跟+4💰，脚趾+4💰；中心2×3内有遗物时全部位+2💰
global.relicRegister.register(function(relic) {
    relic.setName("compass")
        .setNameZH("罗盘")
        .setDescription(Text.gray("脚后跟/脚趾金钱").append(Text.green("+4")))
        .setSpecialDescription(Text.gray("中心2×3内有遗物时，全部位金钱").append(Text.green("+2")))
        .setStory("一枚指向幻想乡中心的罗盘，中央有力量时指针疯转。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.artifact])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.common)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let centerSlots = global.getCenter2x3Slots()
            let centerCount = global.countRelicsInSlots(centerSlots, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 4.0, 'addition')
            if (centerCount > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_center_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 41. 死蝶标本 - 人工制品 - 脚心+7💰，全部位-5%满意度；底部2行每有1遗物，惩罚-1%
global.relicRegister.register(function(relic) {
    relic.setName("dead_butterfly")
        .setNameZH("死蝶标本")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+7")).append(Text.gray(" 全部位满意度")).append(Text.red("-5%")))
        .setSpecialDescription(Text.gray("底部2行每有1个遗物，满意度惩罚").append(Text.green("-1%")))
        .setStory("冥界飞来的蝴蝶标本，底部的同伴越多越能安抚亡灵。")
        .setTags([global.margueriteTags.artifact])
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
            let bottomCount = global.countRelicsInSlots(bottomSlots, curiosAll)
            let penalty = Math.min(-5.0 + bottomCount, 0)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 7.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// 42. 宝塔 - 金属/魔法 - 脚心+5💰，脚趾+5💰，全部位-6%满意度；九宫格有"魔法"遗物时惩罚-3%
global.relicRegister.register(function(relic) {
    relic.setName("pagoda")
        .setNameZH("宝塔")
        .setDescription(Text.gray("脚心/脚趾金钱").append(Text.green("+5")).append(Text.gray(" 全部位满意度")).append(Text.red("-6%")))
        .setSpecialDescription(Text.gray("九宫格有").append(Text.yellow("魔法")).append(Text.gray("遗物时，惩罚")).append(Text.green("-3%")))
        .setStory("毗沙门天的宝塔，周围有魔法之物时佛光普照。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.magic])
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
            let hasMagic = global.hasTagInSlots(nineGrid, "marguerite:tag_magic", curiosAll)
            let penalty = hasMagic ? -3.0 : -6.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 5.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 5.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// ===== 高级 🔵 ×4 =====

// 43. 锡杖 - 金属/魔法 - 全部位+3💰；中心2×3每有1"魔法"遗物，全部位+1💰
global.relicRegister.register(function(relic) {
    relic.setName("tin_staff")
        .setNameZH("锡杖")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("中心2×3每有1个").append(Text.yellow("魔法")).append(Text.gray("遗物，全部位金钱")).append(Text.green("+1")))
        .setStory("圣白莲的锡杖，中央的魔法之力越浓越能共鸣。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.magic])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let centerSlots = global.getCenter2x3Slots()
            let magicCount = global.countTagInSlots(centerSlots, "marguerite:tag_magic", curiosAll)
            global.modifyAllMoney(player, relic.nameZH + i, 3.0)
            if (magicCount > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_magic_' + i, magicCount * 1.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 44. 写真集 - 书 - 脚趾+5💰；对角线每有1遗物，脚趾+2💰
global.relicRegister.register(function(relic) {
    relic.setName("photo_album")
        .setNameZH("写真集")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+5")))
        .setSpecialDescription(Text.gray("对角线方向每有1个遗物，脚趾金钱").append(Text.green("+2")))
        .setStory("射命丸文的写真集，对角线上的素材越多越精彩。")
        .setTags([global.margueriteTags.book])
        .setGuideTexture([
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let diagonals = global.getDiagonalSlots(i)
            let diagCount = global.countRelicsInSlots(diagonals, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 5.0 + diagCount * 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 45. 境界线 - 魔法 - 脚心+4💰，脚背-4💰；对角线每有1遗物，脚背+2💰
global.relicRegister.register(function(relic) {
    relic.setName("boundary_line")
        .setNameZH("境界线")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+4")).append(Text.gray(" 脚背金钱")).append(Text.red("-4")))
        .setSpecialDescription(Text.gray("对角线方向每有1个遗物，脚背金钱").append(Text.green("+2")))
        .setStory("八云紫的境界线，对角线上的存在越多，裂缝越大。")
        .setTags([global.margueriteTags.magic])
        .setGuideTexture([
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
        ])
        .setRarity(global.raritys.uncommon)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let diagonals = global.getDiagonalSlots(i)
            let diagCount = global.countRelicsInSlots(diagonals, curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, -4.0 + diagCount * 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 46. 式神札 - 魔法/书 - 脚背+4💰，脚掌+4💰；同行遗物标签全不相同时全部位+3💰
global.relicRegister.register(function(relic) {
    relic.setName("shikigami_tag")
        .setNameZH("式神札")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+4")))
        .setSpecialDescription(Text.gray("同行遗物标签全不相同时，全部位金钱").append(Text.green("+3")))
        .setStory("八云蓝的式神札，同行的多样性越强它越活跃。")
        .setTags([global.margueriteTags.magic, global.margueriteTags.book])
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
            // 检查同行遗物标签是否全不相同
            global.ensureRelicTagMap()
            let allTagsUnique = true
            let seenTags = {}
            for (let s = 0; s < sameRow.length; s++) {
                let stack = curiosAll.getStackInSlot(sameRow[s])
                if (!global.isValidRelic(stack)) continue
                let id = stack.getId()
                let tags = global.relicTagMap[id]
                if (!tags) continue
                for (let t = 0; t < tags.length; t++) {
                    if (tags[t]) {
                        if (seenTags[tags[t].id]) {
                            allTagsUnique = false
                            break
                        }
                        seenTags[tags[t].id] = true
                    }
                }
                if (!allTagsUnique) break
            }
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 4.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 4.0, 'addition')
            if (allTagsUnique && global.countRelicsInSlots(sameRow, curiosAll) > 0) {
                global.modifyAllMoney(player, relic.nameZH + '_unique_' + i, 3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×4 =====

// 47. 逆十字 - 金属 - 全部位满意度效果反转（正变负、负变正）
global.relicRegister.register(function(relic) {
    relic.setName("inverted_cross")
        .setNameZH("逆十字")
        .setDescription(Text.gray("全部位满意度效果").append(Text.lightPurple("反转")))
        .setSpecialDescription(Text.gray("满意度正效果变负，负效果变正"))
        .setStory("一个倒置的十字架，颠覆了满意度的一切规则。")
        .setTags([global.margueriteTags.metal])
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
            // 设置满意度反转标记，由满意度计算系统读取
            player.persistentData.putBoolean("relic_sat_invert", true)
        })
        .setPool(global.relicPool.common)
})

// 48. 万宝槌 - 木制/魔法 - 脚背+6💰，脚心+6💰，脚掌-5💰；同行有"木制"遗物时脚掌惩罚消失
global.relicRegister.register(function(relic) {
    relic.setName("miracle_mallet")
        .setNameZH("万宝槌")
        .setDescription(Text.gray("脚背/脚心金钱").append(Text.green("+6")).append(Text.gray(" 脚掌金钱")).append(Text.red("-5")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("木制")).append(Text.gray("遗物时，脚掌惩罚消失")))
        .setStory("少名针妙丸的万宝槌，同行的木制伙伴能稳住它的力量。")
        .setTags([global.margueriteTags.wooden, global.margueriteTags.magic])
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
            let hasWooden = global.hasTagInSlots(sameRow, "marguerite:tag_wooden", curiosAll)
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 6.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 6.0, 'addition')
            if (!hasWooden) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, -5.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 49. 秘术书 - 书/魔法 - 全部位+2💰；背包遗物标签种类≥4时全部位+3💰
global.relicRegister.register(function(relic) {
    relic.setName("arcane_book")
        .setNameZH("秘术书")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+2")))
        .setSpecialDescription(Text.gray("背包遗物标签种类≥4时，全部位金钱").append(Text.green("+3")))
        .setStory("记载着秘术的古书，背包中的多样性激活了它的知识。")
        .setTags([global.margueriteTags.book, global.margueriteTags.magic])
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
            global.modifyAllMoney(player, relic.nameZH + i, 2.0)
            if (uniqueTags >= 4) {
                global.modifyAllMoney(player, relic.nameZH + '_diverse_' + i, 3.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 50. 望远镜 - 人工制品 - 全部位+3💰；中心2×3内遗物数≤2时全部位+4💰
global.relicRegister.register(function(relic) {
    relic.setName("telescope")
        .setNameZH("望远镜")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+3")))
        .setSpecialDescription(Text.gray("中心2×3内遗物数≤2时，全部位金钱").append(Text.green("+4")))
        .setStory("一架精密的望远镜，中央空旷时视野最为清晰。")
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
            let curiosAll = global.getCuriosAll(player)
            let centerSlots = global.getCenter2x3Slots()
            let centerCount = global.countRelicsInSlots(centerSlots, curiosAll)
            global.modifyAllMoney(player, relic.nameZH + i, 3.0)
            if (centerCount <= 2) {
                global.modifyAllMoney(player, relic.nameZH + '_clear_' + i, 4.0)
            }
        })
        .setPool(global.relicPool.common)
})
