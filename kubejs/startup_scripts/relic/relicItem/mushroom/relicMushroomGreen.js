// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("green_mushroom")
        .setNameZH("绿蘑菇")
        .setDescription(Text.gray("最大生命值").append(Text.green("+2"))
            .append(Text.gray("生命恢复")).append(Text.green("+0.2")))
        .setStory("")
        .setTags([global.margueriteTags.mushroom])
        .setOnLoad((player, i) => {
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            let farmModify = 1;
            let effectSlots = global.getNineGrid(i, 6, 9);
            // 遍历影响范围内的槽位，检查是否存在蘑菇农场饰品以提升效果
            for (let slotIndex of effectSlots) {
                let stack = curiosAll.getStackInSlot(slotIndex);
                if (stack.isEmpty())
                    continue;
                if (stack.getId() === "marguerite:mushroom_farm") {
                    farmModify = 1.2;
                    break;
                }
            }
            player.modifyAttribute('generic.max_health', relic.nameZH + i, 2 * farmModify, 'addition');
        },)
})