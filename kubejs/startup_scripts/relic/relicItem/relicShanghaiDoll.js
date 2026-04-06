// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("shanghai_doll")
        .setNameZH("上海人偶")
        .setDescription(Text.gray("伤害").append(Text.green("+2")).append(Text.gray("速度")).append(Text.red("-0.01")))
        .setSpecialDescription(Text.gray("正右方的").append(Text.blue("小刀")).append(Text.gray("不受生效数量限制")))
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, index) => {
            player.modifyAttribute('generic.attack_damage', relic.nameZH + index, 2, 'addition');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + index, -0.01, 'addition');
        },)
})