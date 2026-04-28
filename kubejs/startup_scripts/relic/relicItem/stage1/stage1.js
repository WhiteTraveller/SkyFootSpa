// priority: 9
// 阶段一：初入幻想乡（2×3，6格）— 12个遗物
global.relicRegister.currentStage = 1

// ===== 普通 ⚪ ×5 =====

// 1. 铜铃 - 金属 - 脚后跟+1💰，脚心+1💰
global.relicRegister.register(function(relic) {
    relic.setName("copper_bell")
        .setNameZH("铜铃")
        .setDescription(Text.gray("脚后跟/脚心金钱").append(Text.green("+1")))
        .setStory("一枚铜制小铃铛，叮当作响时仿佛能带来好运。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 1.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 2. 冰镇毛巾 - 无标签 - 脚后跟+1💰，脚趾-1%满意度
global.relicRegister.register(function(relic) {
    relic.setName("iced_towel")
        .setNameZH("冰镇毛巾")
        .setDescription(Text.gray("脚后跟金钱").append(Text.green("+1")).append(Text.gray(" 脚趾满意度")).append(Text.red("-1%")))
        .setStory("冰凉的毛巾敷在脚上，舒适但脚趾略感不适。")
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, -1.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 3. 棉手套 - 无标签 - 脚掌+2%满意度，脚后跟+2%满意度
global.relicRegister.register(function(relic) {
    relic.setName("cotton_gloves")
        .setNameZH("棉手套")
        .setDescription(Text.gray("脚掌/脚后跟满意度").append(Text.green("+2%")))
        .setStory("柔软的棉质手套，穿戴后搓脚手感倍增。")
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 4. 冰块 - 无标签 - 脚趾+2💰，脚后跟-2%满意度；同行有其他遗物时脚趾+1💰
global.relicRegister.register(function(relic) {
    relic.setName("ice_cube")
        .setNameZH("冰块")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+2")).append(Text.gray(" 脚后跟满意度")).append(Text.red("-2%")))
        .setSpecialDescription(Text.gray("同行有其他遗物时，脚趾金钱").append(Text.green("+1")))
        .setStory("一块不会融化的冰，冰凉刺骨却能激发脚趾的潜力。")
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
            let bonus = rowCount > 0 ? 3.0 : 2.0
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, bonus, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, -2.0, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 5. 旧怀表 - 金属/人工制品 - 全部位+1💰，全部位-3%满意度
global.relicRegister.register(function(relic) {
    relic.setName("old_watch")
        .setNameZH("旧怀表")
        .setDescription(Text.gray("全部位金钱").append(Text.green("+1")).append(Text.gray(" 全部位满意度")).append(Text.red("-3%")))
        .setStory("一块停摆的怀表，指针永远指向幻想乡的方向。")
        .setTags([global.margueriteTags.metal, global.margueriteTags.artifact])
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
            global.modifyAllSat(player, relic.nameZH + i, -3.0)
        })
        .setPool(global.relicPool.common)
})

// ===== 高级 🔵 ×4 =====

// 6. 银托盘 - 金属 - 脚掌+3%满意度；末行时脚掌+2💰
global.relicRegister.register(function(relic) {
    relic.setName("silver_tray")
        .setNameZH("银托盘")
        .setDescription(Text.gray("脚掌满意度").append(Text.green("+3%")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，脚掌金钱")).append(Text.green("+2")))
        .setStory("银质的精致托盘，放在底层时格外耀眼。")
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

// 7. 念珠 - 木制 - 脚心+3%满意度；相邻每有1遗物+1%满意度
global.relicRegister.register(function(relic) {
    relic.setName("prayer_beads")
        .setNameZH("念珠")
        .setDescription(Text.gray("脚心满意度").append(Text.green("+3%")))
        .setSpecialDescription(Text.gray("相邻每有1个遗物，脚心满意度").append(Text.green("+1%")))
        .setStory("一串木质念珠，周围的物品越多，它散发的力量越强。")
        .setTags([global.margueriteTags.wooden])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, 3.0 + adjCount, 'addition')
        })
        .setPool(global.relicPool.common)
})

// 8. 折扇 - 木制 - 脚后跟+3%满意度；相邻每有1遗物+1💰脚后跟
global.relicRegister.register(function(relic) {
    relic.setName("folding_fan")
        .setNameZH("折扇")
        .setDescription(Text.gray("脚后跟满意度").append(Text.green("+3%")))
        .setSpecialDescription(Text.gray("相邻每有1个遗物，脚后跟金钱").append(Text.green("+1")))
        .setStory("一把精巧的折扇，展开时能感受到周围的气息。")
        .setTags([global.margueriteTags.wooden])
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
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, 3.0, 'addition')
            if (adjCount > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, adjCount * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})

// 9. 假币 - 金属 - 脚心+3💰，全部位-5%满意度；同行每有1遗物惩罚-1%
global.relicRegister.register(function(relic) {
    relic.setName("fake_coin")
        .setNameZH("假币")
        .setDescription(Text.gray("脚心金钱").append(Text.green("+3")).append(Text.gray(" 全部位满意度")).append(Text.red("-5%")))
        .setSpecialDescription(Text.gray("同行每有1个遗物，满意度惩罚").append(Text.green("-1%")))
        .setStory("一枚做工拙劣的假币，但在幻想乡居然能花出去。")
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
            let rowCount = global.countRelicsInSlots(sameRow, curiosAll)
            let penalty = Math.min(-5.0 + rowCount, 0)
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 3.0, 'addition')
            global.modifyAllSat(player, relic.nameZH + i, penalty)
        })
        .setPool(global.relicPool.common)
})

// ===== 稀有 🟣 ×3 =====

// 10. 灯笼 - 金属/人工制品 - 脚背+1💰，脚掌+1💰；末行时全部位+1💰
global.relicRegister.register(function(relic) {
    relic.setName("lantern")
        .setNameZH("灯笼")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("末行")).append(Text.gray("时，全部位金钱")).append(Text.green("+1")))
        .setStory("一盏永不熄灭的灯笼，照亮幻想乡最深处的道路。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 1.0, 'addition')
            if (global.isBottomRow(i, curiosAll)) {
                global.modifyAllMoney(player, relic.nameZH + '_bottom_' + i, 1.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 11. 护身符 - 魔法 - 脚背+1💰，脚掌+1💰；首行时全部位+2%满意度
global.relicRegister.register(function(relic) {
    relic.setName("charm")
        .setNameZH("护身符")
        .setDescription(Text.gray("脚背/脚掌金钱").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("位于").append(Text.yellow("首行")).append(Text.gray("时，全部位满意度")).append(Text.green("+2%")))
        .setStory("神社巫女亲手制作的护身符，放在最高处时能庇护一切。")
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
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 1.0, 'addition')
            if (global.isFirstRow(i, curiosAll)) {
                global.modifyAllSat(player, relic.nameZH + '_top_' + i, 2.0)
            }
        })
        .setPool(global.relicPool.common)
})

// 12. 红绳 - 无标签 - 脚背+1💰；同行有护身符+2💰脚背；同行有念珠+2💰脚心
global.relicRegister.register(function(relic) {
    relic.setName("red_cord")
        .setNameZH("红绳")
        .setDescription(Text.gray("脚背金钱").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("同行有").append(Text.yellow("护身符")).append(Text.gray("时脚背金钱")).append(Text.green("+2")).append(Text.gray("；同行有")).append(Text.yellow("念珠")).append(Text.gray("时脚心金钱")).append(Text.green("+2")))
        .setStory("一根红色的编织绳，能将周围的力量串联起来。")
        .setTags([])
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
            let hasCharm = false
            let hasBeads = false
            for (let s = 0; s < sameRow.length; s++) {
                let id = curiosAll.getStackInSlot(sameRow[s]).getId()
                if (id == "marguerite:charm") hasCharm = true
                if (id == "marguerite:prayer_beads") hasBeads = true
            }
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 1.0, 'addition')
            if (hasCharm) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + '_charm_' + i, 2.0, 'addition')
            }
            if (hasBeads) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + '_beads_' + i, 2.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})
