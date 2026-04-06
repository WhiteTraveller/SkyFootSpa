// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("example")
        .setNameZH("示例遗物")
        .setDescription(Text.gray("攻击伤害").append(Text.green("+1")))
        .setStory("这是一个示例的遗物")
        .setOnLoad((player, i) => {
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 1, 'addition');
        },)
})