// priority: 10
// ============================================================
// 第二章咖啡（妖怪们的归家 youkaishomecoming）
// 基础咖啡：意式浓缩/美式/拿铁/芮斯崔朵/玛琪雅朵/康宝蓝，需求 +2~3，满意度 0~8 高低分布。
// 招客咖啡：卡布奇诺/摩卡/阿芙佳朵，满意度 6~10，召唤旧地狱「地灵殿咖啡时间」稀客
// （古明地觉/火焰猫燐/灵乌路空，仅 marguerite:old_hell 维度池，主世界奉茶不会召唤）。
// 再来一个：每次奉茶后按 repeatChance 概率不写 pfFoodServed，茶水按钮保留、可继续奉茶。
// 平衡：效果越强/造价越高，续杯率越低（0%~20%）；仅最贵的阿芙佳朵给 40%。
// 满意度 0~10 分散：特浓（芮斯崔朵/康宝蓝）需求 +3、无续杯，满意度压低；阿芙佳朵顶级例外拉满 10。
// 咖啡都是瓶装饮品，奉茶后返还玻璃瓶。
// ============================================================

let COFFEE_BOTTLE = "minecraft:glass_bottle"

let COFFEE_BASIC = [
    { item: "youkaishomecoming:espresso", name: "意式浓缩", part: "jiaozhang", repeat: 0.1, sat: 5 },
    { item: "youkaishomecoming:americano", name: "美式", part: "jiaoxin", repeat: 0.2, sat: 3 },
    { item: "youkaishomecoming:latte", name: "拿铁", part: "jiaogen", repeat: 0.2, sat: 6 },
    { item: "youkaishomecoming:ristretto", name: "芮斯崔朵", part: "jiaozhi", repeat: 0, demand: 3, sat: 0 },
    { item: "youkaishomecoming:macchiato", name: "玛琪雅朵", part: "jiaoxin", repeat: 0.1, sat: 7 },
    { item: "youkaishomecoming:con_panna", name: "康宝蓝", part: "jiaozhang", repeat: 0, demand: 3, sat: 4 }
]

COFFEE_BASIC.forEach(t => {
    global.foodRegister.register(food => {
        let demands = {}
        demands[t.part] = t.demand || 2
        food.setItem(t.item).setName(t.name).setDemands(demands).setSatisfaction(t.sat).setRepeatChance(t.repeat).setContainer(COFFEE_BOTTLE)
    })
})

let COFFEE_SUMMON = [
    { item: "youkaishomecoming:cappuccino", name: "卡布奇诺", rare: "rare_satori", guest: "古明地觉", repeat: 0.1, sat: 8 },  // 地灵殿主人的下午茶
    { item: "youkaishomecoming:mocha", name: "摩卡", rare: "rare_rin", guest: "火焰猫燐", repeat: 0.1, sat: 6 },           // 巧克力配猫车
    { item: "youkaishomecoming:affogato", name: "阿芙佳朵", rare: "rare_utsuho", guest: "灵乌路空", repeat: 0.4, sat: 10 }  // 冰与奶油浇浓缩，最贵所以续杯率与满意度都最高
]

COFFEE_SUMMON.forEach(t => {
    global.foodRegister.register(food => {
        food.setItem(t.item).setName(t.name).setSatisfaction(t.sat).setRareGuests([t.rare]).setRareGuestNames([t.guest]).setRepeatChance(t.repeat).setContainer(COFFEE_BOTTLE)
    })
})

console.log("[FOOD] 第二章咖啡已登记: " + (COFFEE_BASIC.length + COFFEE_SUMMON.length) + " 种")
