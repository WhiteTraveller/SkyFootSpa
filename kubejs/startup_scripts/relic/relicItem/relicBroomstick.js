// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("broomstick")
        .setNameZH("扫帚")
        .setDescription(Text.gray("速度").append(Text.green("+0.02")))
        .setOnLoad((player, i) => {
            player.modifyAttribute('generic.movement_speed', relic.nameZH + i, 0.02, 'addition');
        },)
})