// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("blue_mushroom")
        .setNameZH("蓝蘑菇")
        .setDescription(Text.gray("攻击伤害").append(Text.green("+0.1"))
            .append(Text.gray("速度")).append(Text.green("+0.02")))
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
            // 根据计算出的效果倍数应用属性加成
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 0.1 * farmModify, 'addition');
            player.modifyAttribute('generic.movement_speed', relic.nameZH + i, 0.02 * farmModify, 'addition');
        },)
})