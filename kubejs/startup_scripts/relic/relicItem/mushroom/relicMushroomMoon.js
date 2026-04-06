// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("moon_mushroom")
        .setNameZH("月光蘑菇")
        .setDescription(Text.gray("攻击伤害").append(Text.green("+0.15"))
            .append(Text.gray("暴击伤害")).append(Text.green("+15%"))
            .append(Text.gray("攻击速度")).append(Text.green("+0.5")))
        .setSpecialDescription(Text.gray("同时拥有红绿蓝三种蘑菇时，").append(Text.green("+1")).append(Text.gray("攻击速度")))
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
            player.modifyAttribute('generic.attack_damage', relic.nameZH + i, 0.15 * farmModify, 'addition');
            player.modifyAttribute('l2damagetracker:crit_damage', relic.nameZH + i, 0.15, 'addition');
            player.modifyAttribute('generic.attack_speed', relic.nameZH + i, 0.5 * farmModify, 'addition');

            if (global.confirmRelic("marguerite:red_mushroom", player) == true
                && global.confirmRelic("marguerite:green_mushroom", player) == true
                && global.confirmRelic("marguerite:blue_mushroom", player) == true) {
                player.modifyAttribute('generic.attack_speed', relic.nameZH + i + " 2", 1, 'addition');
            }
        },)
})