// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("mushroom_farm")
        .setNameZH("蘑菇农场")
        .setDescription(Text.gray("攻击伤害").append(Text.green("+0.3"))
            .append(Text.gray("护甲值")).append(Text.green("+1"))
            .append(Text.gray("生命恢复")).append(Text.green("+0.3")))
        .setSpecialDescription(Text.gray("周围的").append(Text.blue("蘑菇")).append(Text.gray("效果")).append(Text.green("+20%")))
        .setStory("")
        .setTags([global.margueriteTags.mushroom])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 0.3, 'addition');
            player.modifyAttribute('generic.armor', relic.nameZH + i, 1, 'addition');
        },)
})