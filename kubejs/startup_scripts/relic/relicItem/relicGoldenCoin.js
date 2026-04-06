// priority: 9
let $AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
let $Operation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
let $UUID = Java.loadClass('java.util.UUID')

global.relicRegister.register(relic => {
    relic.setName("goldencoin")
        .setNameZH("闪闪金币")
        .setDescription(Text.gray("最终获得钻石数量*1.2"))
        .setStory("谁会拒绝如此多的财宝呢？")
        .setOnLoad((player, i) => {
            // onLoad 会在“背包重算”时被调用（见 server_scripts/backpack/backpackUpdate.js）：
            // 1) 先 removeModifiers() 清空玩家身上相关属性的修饰符
            // 2) 再对当前装备的每个遗物执行 onLoad，重新把效果加回去
            //
            // 因此遗物效果必须写成“每次重算都能重复加一次”，并且不需要 onUnEquip 手动撤回。
            if (!player) return
            let parts = ["jiaobei", "jiaozhang", "jiaogen", "jiaozhi", "jiaoxin"]
            for (let j = 0; j < parts.length; j++) {
                let attr = player.getAttribute("kubejs:serve.money_gain." + parts[j])
                if (attr != null) {
                    // 这个遗物的设计目标是“最终钻石数量 * 1.2”。
                    // 新规则下：最终钻石数量 = pfMoney，而 pfMoney 是每次点击的 money_gain.<部位> 累加。
                    // 所以把 money_gain.<部位> 乘以 1.2，就等价于把最终钻石乘以 1.2。
                    //
                    // Operation.MULTIPLY_TOTAL 的含义：
                    // - value=0.2 表示在最终结果上 * (1 + 0.2) = *1.2
                    let mod = new $AttributeModifier(
                        $UUID.randomUUID(),
                        "marguerite:goldencoin",
                        0.2,
                        $Operation.MULTIPLY_TOTAL
                    )
                    attr.addPermanentModifier(mod)
                }
            }
        }).setPool(global.relicPool.common)
})
