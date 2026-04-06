// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("magic_thread")
        .setNameZH("魔法丝线")
        .setSpecialDescription(Text.gray("取消除歌莉娅人偶以外的人偶速度负面效果"))
        .setOnLoad((player, index) => {
            // 获取Curios物品
            let curiosHelper = curiosApi.getCuriosHelper();
            let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
            let n = 0;

            for (let i = 0; i < 54; i++) {
                let item = curiosAll.getStackInSlot(i);
                item.getTags().toArray().forEach(tag => {
                    let name = tag.location().getNamespace() + ":" + tag.location().getPath();
                    if (name == global.margueriteTags.doll.id) {
                        n++;
                    }
                });
            }
            player.modifyAttribute('generic.movement_speed', relic.nameZH + index, 0.01 * n, 'addition');
        },)
})