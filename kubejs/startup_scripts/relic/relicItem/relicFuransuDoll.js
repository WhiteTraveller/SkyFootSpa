// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("furansu_doll")
        .setNameZH("法兰西人偶")
        .setDescription(Text.gray("护甲").append(Text.green("+1")).append(Text.gray("速度")).append(Text.red("-0.01")))
        .setSpecialDescription(Text.gray("上下左右每有一个人偶，再").append(Text.green("+1")).append(Text.gray("护甲")))
        .setStory("")
        .setTags([global.margueriteTags.fabric, global.margueriteTags.doll, global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.green(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            let n = 1;
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            global.getTenGrid(i, 6, 9).forEach(slotIndex => {
                curiosAll.getStackInSlot(slotIndex).getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.doll.id) {
                        n = n + 1;
                    }
                });
            });
            player.modifyAttribute('generic.armor', relic.nameZH + i, n, 'addition');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + i, -0.01, 'addition');
        },)
})