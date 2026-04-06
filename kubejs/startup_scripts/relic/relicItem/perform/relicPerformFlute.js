// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("flute")
        .setNameZH("笛子")
        .setSpecialDescription(Text.gray("每有一个演奏遗物(除笛子外)，").append(Text.green("+0.1")).append(Text.gray("攻击伤害")))
        .setStory("")
        .setTags([global.margueriteTags.perform])
        .setOnLoad((player, i) => {
            let n = 0;
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            for (let i = 0; i < 54; i++) {
                let item = curiosAll.getStackInSlot(i);
                if (item.getId() === "marguerite:flute") {
                    continue;
                }
                item.getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.perform.id) {
                        n += 0.1;
                    }
                });
            }
            let pickModify = 1;
            if (curiosAll.getStackInSlot(i + 9).getId() == "marguerite:pick") {
                pickModify = 1.2;
            }
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, n * pickModify, 'addition');
        },)
})
