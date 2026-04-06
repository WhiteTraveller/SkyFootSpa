// priority: 9
// 脚趾钳 - 专注于脚趾的高金钱收益，但有满意度惩罚
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("toe_clipper")
        .setNameZH("脚趾钳")
        .setDescription(Text.gray("脚趾金钱").append(Text.green("+5")).append(Text.gray("脚趾满意度").append(Text.red("-3"))))
        .setSpecialDescription(Text.gray("放置于背包").append(Text.yellow("最右列")).append(Text.gray("时金钱额外+3")))
        .setStory("一把精致的钳子，用于修剪脚趾甲。操作需要技巧，容易让顾客不适。")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.green(" █")),
        ])
        .setOnLoad((player, i) => {
            if (!player || !player.persistentData) return

            // 检查是否在最右列（4, 13, 22, 31, 40）
            let rightmostCols = [4, 13, 22, 31, 40]
            let isRightmost = rightmostCols.includes(i)
            let moneyBonus = isRightmost ? 8.0 : 5.0  // 最右列时+8，否则+5

            // 脚趾金钱 +5（或+8）
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, moneyBonus, 'addition')

            // 脚趾满意度 -3
            player.modifyAttribute('kubejs:serve.sat_gain.jiaozhi', relic.nameZH + i, -3.0, 'addition')
        })
})
