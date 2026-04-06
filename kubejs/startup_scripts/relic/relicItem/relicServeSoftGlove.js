// priority: 9
let $AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
let $Operation = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier$Operation')
let $UUID = Java.loadClass('java.util.UUID')

global.relicRegister.register(relic => {
    relic.setName("serve_soft_glove")
        .setNameZH("轻柔手套")
        .setDescription(Text.gray("每次有效点击额外+5满意度"))
        .setStory("手法更轻柔，让对方更容易满意。")
        .setOnLoad((player, i) => {
            // 这个遗物让“每次有效点击的满意度增量 +5”。
            // 新规则下：每次点击的满意度增量来自玩家 Attribute：
            //   kubejs:serve.sat_gain.<部位>
            // 因此我们对 5 个部位的 sat_gain 全部加一个 +5 的 AttributeModifier。
            //
            // 注意：
            // - 这个 onLoad 会在背包重算时反复执行，但背包重算会先 removeModifiers() 清空旧修饰符，
            //   所以不会无限叠加。
            if (!player || !player.persistentData) return
            let parts = ["jiaobei", "jiaozhang", "jiaogen", "jiaozhi", "jiaoxin"]
            for (let j = 0; j < parts.length; j++) {
                let attr = player.getAttribute("kubejs:serve.sat_gain." + parts[j])
                if (attr != null) {
                    // Operation.ADDITION 表示“直接相加”：
                    // 例如默认 sat_gain=10，加上 +5 后就变成 15
                    let mod = new $AttributeModifier(
                        $UUID.randomUUID(),
                        "marguerite:serve_soft_glove",
                        5.0,
                        $Operation.ADDITION
                    )
                    attr.addPermanentModifier(mod)
                }
            }
        }).setPool(global.relicPool.common)
})
