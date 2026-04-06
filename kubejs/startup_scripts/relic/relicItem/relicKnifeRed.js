// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("red_knife")
        .setNameZH("红色小刀")
        .setDescription(Text.gray("伤害").append(Text.green("+1")).append(Text.gray("暴击率")).append(Text.green("+0.05")))
        .setSpecialDescription(Text.gray("你只能生效前").append(Text.white("2")).append(Text.gray("个小刀，因为你只有两只手")))
        .setTags([global.margueriteTags.metal, global.margueriteTags.knife])
        .setOnLoad((player, index) => {
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            if (index % 9 != 0 && curiosAll.getStackInSlot(index - 1).getId() == "marguerite:shanghai_doll") {
                player.modifyAttribute('generic.attack_damage', relic.nameZH + index, 1, 'addition');
                player.modifyAttribute('l2damagetracker:crit_rate', relic.nameZH + index, 0.05, 'addition');
                return;
            }

            let n = 0;
            let effectCount = 2;

            for (let i = 0; i < 54; i++) {
                let item = curiosAll.getStackInSlot(i);
                if (item.getId() == "marguerite:leg_strap") effectCount++;
            }

            for (let j = 0; j <= index; j++) {
                let item = curiosAll.getStackInSlot(j);
                item.getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.knife.id) {
                        if (j % 9 == 0 || curiosAll.getStackInSlot(j - 1).getId() != "marguerite:shanghai_doll") {
                            n = n + 1;
                        }
                    }
                });
                console.log("j:" + j + " n:" + n + "effectCount:" + effectCount + "index:" + index);
                if (n > effectCount) {
                    return;
                }
            }
            player.modifyAttribute('generic.attack_damage', relic.nameZH + index, 1, 'addition');
            player.modifyAttribute('l2damagetracker:crit_rate', relic.nameZH + index, 0.05, 'addition');
        })
        .setOnDoDamage((event, player, index) => {
            // 触发效果：90% 概率造成 2 秒凋零（流血效果）
            if (Math.random() < 0.9) {
                event.entity.potionEffects.add('minecraft:wither', 40, 1);
                // 播放红色粉尘粒子效果
                event.level.spawnParticles('minecraft:dust 1 0 0 1', true, event.entity.x, event.entity.y + 1, event.entity.z, 0.2, 0.5, 0.2, 10, 0.05);
                // 输出提示语
                player.tell(Text.red(`${relic.nameZH}发挥了作用`));
            }
        })
})