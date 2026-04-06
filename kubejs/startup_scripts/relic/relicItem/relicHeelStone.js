// priority: 9
//  heel_stone - 专注于脚后跟和脚心的满意度收益
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("heel_stone")
        .setNameZH(" heel_stone ")
        .setDescription(Text.gray("脚后跟/脚心满意度").append(Text.green("+8")).append(Text.gray("金钱").append(Text.red("-1"))))
        .setSpecialDescription(Text.gray("放置于背包").append(Text.yellow("底部行")).append(Text.gray("时满意度额外+5")))
        .setStory("一块光滑的石头，专门用于按摩脚后跟和脚心。")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.green("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")),
        ])
        .setOnLoad((player, i) => {
            if (!player || !player.persistentData) return

            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            // 检查是否到达背包底部（参考relicGoriaDoll.js逻辑）
            // 从当前位置向下检查，如果下面所有行都是backpack_space，说明在底部
            let isBottomRow = true;
            let n = i + 9;
            while (n <= 53) {
                if (curiosAll.getStackInSlot(n).getId() != "marguerite:backpack_space") {
                    isBottomRow = false;
                    break;
                }
                n = n + 9;
            }

            let satBonus = isBottomRow ? 13.0 : 8.0  // 底部行时+13，否则+8

            // 脚后跟和脚心满意度 +8（或+13）
            player.modifyAttribute('kubejs:serve.sat_gain.jiaogen', relic.nameZH + i, satBonus, 'addition')
            player.modifyAttribute('kubejs:serve.sat_gain.jiaoxin', relic.nameZH + i, satBonus, 'addition')

            // 所有部位金钱 -1
            player.modifyAttribute('kubejs:serve.money_gain.jiaobei', relic.nameZH + i, -1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhang', relic.nameZH + i, -1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaogen', relic.nameZH + i, -1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaozhi', relic.nameZH + i, -1.0, 'addition')
            player.modifyAttribute('kubejs:serve.money_gain.jiaoxin', relic.nameZH + i, -1.0, 'addition')
        })
        .setPool(global.relicPool.common)
})
