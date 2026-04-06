// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("gray_bird")
        .setNameZH("菇菇顾")
        .setDescription(Text.gray("攻击速度").append(Text.red("-2")).append(Text.gray("(唯一生效)")))
        .setSpecialDescription(Text.gray("每击杀一个怪物，").append(Text.green("+0.05")).append(Text.gray("攻击速度，上限为12.5")))
        .setStory("")
        .setTags([global.margueriteTags.perform])
        .setOnLoad((player, i) => {
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            //确保菇菇顾的攻击速度减益唯一生效
            for (let slot = 0; slot < 54; slot++) {
                let item = curiosAll.getStackInSlot(slot);
                if (item.getId() === "marguerite:gray_bird") {
                    player.modifyAttribute('generic.attack_speed', relic.nameZH + slot, -2, 'addition');
                    break;
                }
            }
            //空值检查
            let targetItem = curiosAll.getStackInSlot(i);
            let kills = 0;
            if (targetItem) {
                if (!targetItem.nbt) {
                    targetItem.nbt = { kills: 0 };
                }
                kills = targetItem.nbt.kills || 0;
            }
            player.modifyAttribute('generic.attack_speed', relic.nameZH + i + " 2", Math.min(kills * 0.05, 12.5), 'addition');
        },)
        .setOnKill((player, i) => {
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            let target = curiosAll.getStackInSlot(i);
            if (!target.nbt) {
                target.nbt = { kills: 0 };
            }
            let kills = target.nbt.kills;
            kills++;
            target.nbt.kills = kills;
            player.modifyAttribute('generic.attack_speed', relic.nameZH + i + " 2", Math.min(kills * 0.05, 12.5), 'addition');
        },)
});