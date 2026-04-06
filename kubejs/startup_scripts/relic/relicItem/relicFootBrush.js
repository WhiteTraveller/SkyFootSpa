// priority: 9
// 脚刷 - 专注于脚掌和脚背的金钱收益
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("foot_brush")
        .setNameZH("脚刷")
        .setDescription(Text.gray("脚掌/脚背金钱").append(Text.green("+3")).append(Text.gray("其他部位金钱").append(Text.red("-1"))))
        .setSpecialDescription(Text.gray("放置于背包").append(Text.yellow("顶部行")).append(Text.gray("时效果翻倍")))
        .setStory("一把柔软的刷子，适合刷洗脚掌和脚背。")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            if (!player || !player.persistentData) return

            // 检查是否在顶部行（0-8）
            let isTopRow = (i >= 0 && i <= 8)
            let multiplier = isTopRow ? 2 : 1

            // 脚掌和脚背金钱 +3（或+6）
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, 3.0 * multiplier, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, 3.0 * multiplier, 'addition')

            // 其他部位金钱 -1（或-2）
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, -1.0 * multiplier, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, -1.0 * multiplier, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, -1.0 * multiplier, 'addition')
        })
        .setPool(global.relicPool.common)
})
