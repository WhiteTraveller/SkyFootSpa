// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("mushroom_crown")
        .setNameZH("蘑菇王冠")
        .setDescription(Text.gray("护甲值").append(Text.green("+2"))
            .append(Text.gray("伤害减免")).append(Text.green("+0.08")))
        .setSpecialDescription(Text.gray("每有一个").append(Text.blue("蘑菇")).append(Text.gray("遗物，")).append(Text.green("+0.5")).append(Text.gray("护甲值")))
        .setStory("")
        .setTags([global.margueriteTags.mushroom])
        .setOnLoad((player, i) => {
            let n = 0;
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            for (let i = 0; i < 54; i++) {
                let item = curiosAll.getStackInSlot(i);
                if (item.getId() === "marguerite:mushroom_crown") {
                    continue;
                }
                item.getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.mushroom.id) {
                        n += 1;
                    }
                });
            }
            player.modifyAttribute('generic.armor', relic.nameZH + i, 2 + 0.5 * n, 'addition');
            player.modifyAttribute('l2damagetracker:damage_reduction', relic.nameZH + i, -0.08, 'addition');
        },)
})