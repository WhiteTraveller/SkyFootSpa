// priority: 10
// ============================================================
// 第一章茶水（妖怪们的归家 youkaishomecoming）
// 基础茶：四种各给一个固定部位 +1 需求、+5 满意度；黑茶给随机部位 +2 需求、不加满意度。
// 召唤茶：+5 满意度，并召唤对应的主世界稀客（稀客已在路径上则不重复召唤，茶照常消耗）。
// 茶都是瓶装饮品，奉茶后返还玻璃瓶。
// ============================================================

let TEA_BOTTLE = "minecraft:glass_bottle"

let TEA_BASIC = [
    { item: "youkaishomecoming:green_tea", name: "绿茶", part: "jiaozhang" },
    { item: "youkaishomecoming:white_tea", name: "白茶", part: "jiaoxin" },
    { item: "youkaishomecoming:black_tea", name: "红茶", part: "jiaogen" },
    { item: "youkaishomecoming:oolong_tea", name: "乌龙茶", part: "jiaozhi" }
]

TEA_BASIC.forEach(t => {
    global.foodRegister.register(food => {
        let demands = {}
        demands[t.part] = 1
        food.setItem(t.item).setName(t.name).setDemands(demands).setSatisfaction(5).setContainer(TEA_BOTTLE)
    })
})

global.foodRegister.register(food => {
    food.setItem("youkaishomecoming:dark_tea").setName("黑茶").setRandomDemand(2).setSatisfaction(0).setContainer(TEA_BOTTLE)
})

let TEA_SUMMON = [
    { item: "youkaishomecoming:scarlet_tea", name: "红魔馆红茶", rare: "rare_remilia", guest: "蕾米莉亚·斯卡蕾特" }, // 红魔馆主人的下午茶
    { item: "youkaishomecoming:sakura_honey_tea", name: "樱花蜜茶", rare: "rare_yuyuko", guest: "西行寺幽幽子" },  // 白玉楼的西行妖樱 + 贪吃的甜口
    { item: "youkaishomecoming:genmai_tea", name: "玄米茶", rare: "rare_youmu", guest: "魂魄妖梦" },              // 白玉楼庭师的朴素和风茶
    { item: "youkaishomecoming:cornflower_tea", name: "矢车菊茶", rare: "rare_yuka", guest: "风见幽香" },         // 花妖只认花茶
    { item: "youkaishomecoming:yellow_tea", name: "黄茶", rare: "rare_ran", guest: "八云蓝" },                    // 金色九尾配名贵黄茶
    { item: "youkaishomecoming:saidi_tea", name: "埃及糖茶", rare: "rare_yukari", guest: "八云紫" },              // 隙间妖怪偏爱外界异国茶
    { item: "youkaishomecoming:tea_mocha", name: "摩卡茶", rare: "rare_aya", guest: "射命丸文" },                 // 熬夜赶稿的天狗记者要咖啡因
    { item: "youkaishomecoming:green_water", name: "青汁", rare: "rare_nitori", guest: "河城荷取" }               // 河童的绿色黄瓜系饮品
]

TEA_SUMMON.forEach(t => {
    global.foodRegister.register(food => {
        food.setItem(t.item).setName(t.name).setSatisfaction(5).setRareGuests([t.rare]).setRareGuestNames([t.guest]).setContainer(TEA_BOTTLE)
    })
})

console.log("[FOOD] 第一章茶水已登记: " + (TEA_BASIC.length + 1 + TEA_SUMMON.length) + " 种")
