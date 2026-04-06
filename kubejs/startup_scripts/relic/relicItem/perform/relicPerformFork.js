// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("fork")
        .setNameZH("音叉")
        .setSpecialDescription(Text.gray("攻击拥有溅射伤害，倍率为20%，附带击退效果"))
        .setStory("")
        .setTags([global.margueriteTags.perform])
        .setOnDoDamage((event, player, index) => {
            // 获取周围半径2.5范围内的生物实体
            let targets = global.getInSphereEntities(player.level, event.entity.x, event.entity.y, event.entity.z, 2);

            // 创建伤害源
            let splashDamage = global.createDamageSource(player, event.entity);
            // 检查伤害来源类型，避免处理我们自己造成的伤害
            if (event.source.getType() === "cactus") {
                return;
            }

            // 对每个目标造成20%的溅射伤害并添加击退
            targets.forEach(target => {
                if (target !== event.entity && target !== player && target.isLiving()) { // 排除原始目标和玩家自己，确保是生物实体
                    Utils.server.scheduleInTicks(1, () => {
                        // 造成伤害
                        target.attack(splashDamage, event.damage * 0.2);
                        // 播放粒子效果
                        event.level.spawnParticles('minecraft:witch', true, target.x, target.y + 1, target.z, 0.2, 0.5, 0.2, 10, 0.05);
                    });
                }
            });
        });
});