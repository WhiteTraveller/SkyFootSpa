// priority: 5
// ============================================================
// 顾客预约凭证注册
// ------------------------------------------------------------
// 分类：
//   voucher_random  - 随机种类（6 类均等抽选）
//   voucher_ningen  - 人类
//   voucher_yousei  - 妖精
//   voucher_youkai  - 妖怪
//   voucher_kami    - 神
//   voucher_rei     - 灵
//   voucher_oni     - 鬼
// 使用：手持凭证右键开店方块，消耗 1 个，立即生成一个对应种类的顾客。
// 特性：无视昼夜；不改变店铺开关状态。
// 生成逻辑在 server_scripts/pathfinder/pfVoucherManager.js
// ============================================================

global.VOUCHER_CATEGORIES = [
    { id: "random", name: "§d✦ 随机预约凭证",    rarity: "rare",     desc: "随机召唤一位任意种类的顾客" },
    { id: "ningen", name: "§f✦ 预约凭证 · 人类", rarity: "uncommon", desc: "召唤一位随机的人类顾客" },
    { id: "yousei", name: "§a✦ 预约凭证 · 妖精", rarity: "uncommon", desc: "召唤一位随机的妖精顾客" },
    { id: "youkai", name: "§5✦ 预约凭证 · 妖怪", rarity: "rare",     desc: "召唤一位随机的妖怪顾客" },
    { id: "kami",   name: "§6✦ 预约凭证 · 神",   rarity: "epic",     desc: "召唤一位随机的神类顾客" },
    { id: "rei",    name: "§b✦ 预约凭证 · 灵",   rarity: "rare",     desc: "召唤一位随机的灵类顾客" },
    { id: "oni",    name: "§4✦ 预约凭证 · 鬼",   rarity: "epic",     desc: "召唤一位随机的鬼类顾客" }
]

StartupEvents.registry("item", event => {
    let list = global.VOUCHER_CATEGORIES
    for (let i = 0; i < list.length; i++) {
        let v = list[i]
        try {
            let b = event.create("marguerite:voucher_" + v.id)
                .displayName(v.name)
                .maxStackSize(16)
                .tooltip("§7" + v.desc)
                .tooltip("§8右键开店方块使用 · 无视昼夜")
                .texture("minecraft:item/paper")
            try { b.rarity(v.rarity) } catch (e) {}
            console.log("[VOUCHER] 已注册: marguerite:voucher_" + v.id)
        } catch (e) {
            console.log("[VOUCHER] 注册失败 " + v.id + ": " + e)
        }
    }
})
