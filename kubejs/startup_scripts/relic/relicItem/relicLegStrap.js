// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("leg_strap")
        .setNameZH("腿带")
        .setDescription(Text.gray("护甲").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("可以多生效1个小刀"))
        .setOnLoad((player, index) => {
            player.modifyAttribute('generic.armor', relic.nameZH + index, 1, 'addition');
        },)
})