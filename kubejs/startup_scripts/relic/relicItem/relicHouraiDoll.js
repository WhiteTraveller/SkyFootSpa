// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("hourai_doll")
        .setNameZH("蓬莱人偶")
        .setDescription(Text.gray("护甲").append(Text.green("+2")).append(Text.gray("速度")).append(Text.red("-0.01")))
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, index) => {
            player.modifyAttribute('generic.armor', relic.nameZH + index, 2, 'addition');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + index, -0.01, 'addition');
        },)
})