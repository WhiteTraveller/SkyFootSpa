// priority: 9
// 足部按摩器 - 平衡型遗物，所有部位都有收益但都不突出
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("foot_massager")
        .setNameZH("足部按摩器")
        .setDescription(Text.gray("所有部位金钱").append(Text.green("+1")).append(Text.gray("满意度").append(Text.green("+2"))))
        .setSpecialDescription(Text.gray("放置于背包").append(Text.yellow("中心位置(12,13,22)")).append(Text.gray("时效果+50%")))
        .setStory("一个多功能的按摩工具，虽然不如专业工具高效，但胜在全面。")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            if (!player || !player.persistentData) return

            // 检查是否在中心位置
            let centerPositions = [12, 13, 22]
            let isCenter = centerPositions.includes(i)
            let multiplier = isCenter ? 1.5 : 1.0  // 中心位置时效果+50%

            let allParts = ["jiaobei", "jiaozhang", "jiaogen", "jiaozhi", "jiaoxin"]

            for (let j = 0; j < allParts.length; j++) {
                let part = allParts[j]

                // 金钱 +1（或+1.5）
                player.modifyAttribute('kubejs:serve.money_gain.' + part, relic.nameZH + i, 1.0 * multiplier, 'addition')

                // 满意度 +2（或+3）
                player.modifyAttribute('kubejs:serve.sat_gain.' + part, relic.nameZH + i, 2.0 * multiplier, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})
