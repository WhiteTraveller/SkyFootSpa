// priority: 9
// 黄金足浴盆 - 稀有遗物，泡脚阶段获得额外收益
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("golden_foot_spa")
        .setNameZH("黄金足浴盆")
        .setDescription(Text.gray("泡脚收益").append(Text.gold("×2")).append(Text.gray("所有部位金钱").append(Text.green("+2"))))
        .setSpecialDescription(Text.gray("放置于背包").append(Text.yellow("四角")).append(Text.gray("时泡脚收益").append(Text.gold("×3"))))
        .setStory("一个镀金的足浴盆，能让泡脚体验更加奢华。顾客在泡脚时会感到格外放松。")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setRarity(global.raritys.rare)
        .setGuideTexture([
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
        ])
        .setOnLoad((player, i) => {
            if (!player || !player.persistentData) return

            // 检查是否在四角位置（0, 4, 36, 40）
            let cornerPositions = [0, 4, 36, 40]
            let isCorner = cornerPositions.includes(i)

            // 给所有部位金钱+2作为基础效果
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, 2.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, 2.0, 'addition')

            // 存储泡脚倍数到玩家数据（供泡脚逻辑读取）
            let soakMultiplier = isCorner ? 3.0 : 2.0
            player.persistentData.putFloat("relic_golden_foot_spa_multiplier", soakMultiplier)
        })
        .setPool(global.relicPool.special)
})
