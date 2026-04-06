// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("battry")
        .setNameZH("电池")
        .setDescription(Text.gray("护甲").append(Text.green("+1")))
        .setSpecialDescription(Text.gray("为九宫格范围内所有").append(Text.white("金属")).append(Text.gray("物品")).append(Text.green("+0.5")).append(Text.gray("伤害")))
        .setTags([global.margueriteTags.metal])
        .setGuideTexture([
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.blue(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.green(" █")).append(Text.green(" █")).append(Text.green(" █")).append(Text.red(" █")),
            Text.red("█").append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")).append(Text.red(" █")),
        ])
        .setOnLoad((player, i) => {
            // 获取九宫格范围内的物品槽
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            let n = 0;

            let effectSlots = global.getNineGrid(i, 6, 9);
            for (let slotIndex of effectSlots) {
                curiosAll.getStackInSlot(slotIndex).getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.metal.id) {
                        n = n + 1;
                    }
                });
            }

            player.modifyAttribute('generic.armor', relic.nameZH + i, 1, 'addition');
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 0.5 * n, 'addition');
        },)
})

global.addAttribute = (attributes, player) => {
    attributes = {
        "generic.armor" : { value: 1 + 1, operation: "addition", uuid: relic.nameZH + i },
    }
    
    for (let attribute of attributes) {
        player.modifyAttribute(attribute.name, attribute.uuid, attribute.value, attribute.operation);
    }
}