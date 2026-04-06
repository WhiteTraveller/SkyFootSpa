// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("kyoto_doll")
        .setNameZH("京都人偶")
        .setDescription(Text.gray("伤害").append(Text.green("+0.5")).append(Text.gray("速度")).append(Text.red("-0.01")))
        .setGuideTexture([
            Text.darkRed("█").append(Text.darkRed(" █")).append(Text.darkGreen(" █")).append(Text.darkRed(" █")).append(Text.darkRed(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█ █ █ █ █")
        ])
        .setStory("爱丽丝驾驭的众多人偶中比较少见的一个，能够提供可观的战力。")
        .setOnLoad((player, index) => {
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            let n = index - 9;
            let d = 0.5;
            while (n >= 0) {
                if (curiosAll.getStackInSlot(n).getId() == "minecraft:air")
                    d = 0.5 + d;
                n = n - 9;
            }
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, d, 'addition');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + i, -0.01, 'addition');
        },)
})