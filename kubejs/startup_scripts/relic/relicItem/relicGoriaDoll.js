// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("goria_doll")
        .setNameZH("歌莉娅人偶")
        .setDescription(Text.gray("伤害").append(Text.green("+30%"))
            .append(Text.gray("伤害")).append(Text.green("+4"))
            .append(Text.gray("护甲")).append(Text.green("+20%"))
            .append(Text.gray("护甲")).append(Text.green("+5"))
            .append(Text.gray("暴击率")).append(Text.green("+40%"))
            .append(Text.gray("速度")).append(Text.red("-40%")))
        .setSpecialDescription(Text.gray("只有放置于已解锁背包的底部才会生效"))
        .setStory("")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            let n = i + 9;
            let d = 0.5;
            while (n <= 53) {
                if (curiosAll.getStackInSlot(n).getId() != "marguerite:backpack_space")
                    return;
                n = n + 9;
            }
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 4, 'addition');
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 0.3, 'multiply_base');
            player.modifyAttribute('generic.armor', relic.nameZH + i, 5, 'addition');
            player.modifyAttribute('generic.armor', relic.nameZH + i, 0.2, 'multiply_base');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + i, -0.4, 'multiply_base');
            player.modifyAttribute('l2damagetracker:crit_rate', relic.nameZH + i, 0.4, 'addition');
        },)
})