// priority: 9
// 无阶段特殊遗物：袜子
// 不属于任何阶段（currentStage 显式置 0，避免继承上一个 stage 文件的阶段号）
// 效果：以袜子所在格的九宫格（8 邻格）内，每有一个非背包镶板遗物，脚背金钱 +1
// UI：悬停时 AUI tooltip 引导网格中央 3×3（除中心）显示五角星（nineGridStar）
global.relicRegister.currentStage = 0

global.relicRegister.register(function(relic) {
    relic.setName("socks")
        .setNameZH("袜子")
        .setTexture("socks.png")
        .setDescription(Text.gray("以袜子为中心的九宫格内每有1个遗物（不含镶板），脚背金钱").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("悬停时，九宫格范围内的格子会亮起").append(Text.yellow("★")))
        .setStory("一只来路不明的袜子：把周围伙伴的人气悄悄攒成脚背的小费，凑得越满赚得越多。")
        .setTags([global.margueriteTags.fabric])
        .setRarity(global.raritys.rare)
        .setNineGridStar(true)
        .setOnLoad(function(player, i) {
            if (!player || !player.persistentData) return
            let curiosAll = global.getCuriosAll(player)
            let nine = global.getNineGrid(i, 6, 9)
            let count = global.countRelicsInSlots(nine, curiosAll)
            if (count > 0) {
                player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, count * 1.0, 'addition')
            }
        })
        .setPool(global.relicPool.common)
})
