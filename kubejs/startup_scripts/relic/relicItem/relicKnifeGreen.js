// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("green_knife")
        .setNameZH("绿色小刀")
        .setDescription(Text.gray("伤害").append(Text.green("+1")).append(Text.gray("最大生命值")).append(Text.green("+2")))
        .setSpecialDescription(Text.gray("你只能生效前").append(Text.white("2")).append(Text.gray("个小刀，因为你只有两只手")))
        .setTags([global.margueriteTags.metal, global.margueriteTags.knife])
        .setOnLoad((player, index) => {
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

            if (index % 9 != 0 && curiosAll.getStackInSlot(index - 1).getId() == "marguerite:shanghai_doll") {
                console.log("load" + this.nameZH + " extra effect");
                player.modifyAttribute('generic.max_health', this.nameZH + index, 2, 'addition');
                player.modifyAttribute('generic.attack_damage', this.nameZH + index, 3, 'addition');
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
            player.modifyAttribute('generic.max_health', relic.nameZH + index, 2, 'addition');
            player.modifyAttribute('generic.attack_damage', relic.nameZH + index, 3, 'addition');
        },)
})