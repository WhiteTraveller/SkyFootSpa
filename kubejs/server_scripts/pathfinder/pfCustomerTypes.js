// priority: 10
// ============================================================
// 顾客类别与权重表
// 将东方Project角色按种族分类
// 每个类别有独立的生成权重（百分比）
// PF_ACTIVE_CATEGORIES 控制当前允许生成的类别（不在列表中的类别保留数据但不生成）
// PF_DIMENSION_CATEGORIES 控制各维度开店时允许生成的类别（正常开店按店铺所在维度过滤）
// 每个类别只有一种皮肤：加载时从 models 池随机挑选一个固定为该种族的唯一皮肤（cat.model）
// 例外：类别设置 perSpawnRandom: true 时，每次生成顾客都从 models 池随机挑一个（见 pfPickModel）
// ============================================================

// 当前允许生成顾客的类别（修改此数组即可控制哪些类别参与生成）
// 注：实际生成范围 = 此白名单 ∩ 当前维度允许类别（PF_DIMENSION_CATEGORIES）
// youkai/kami 不在任何维度的映射中，正常开店不会生成（预约凭证仍可召唤）
let PF_ACTIVE_CATEGORIES = ['ningen', 'yousei', 'oni', 'tsukikou']

// 维度 → 可生成顾客类别映射（正常开店时按店铺所在维度过滤）
// 主世界：妖精 + 人类；旧地狱：妖精 + 鬼；月球：月球人
// 未列入的维度不会生成顾客
let PF_DIMENSION_CATEGORIES = {
    'minecraft:overworld':  ['yousei', 'ningen'],   // 主世界
    'marguerite:old_hell':  ['yousei', 'oni'],      // 旧地狱（自定义维度 marguerite:old_hell）
    'ad_astra:moon':        ['tsukikou']            // 月球
}

let PF_CUSTOMER_TYPES = {
    'ningen': {
        name: '普通',
        weight: 4,  // 1% 概率
        // 人类顾客固定使用自定义人类女性模型系列，不再从东方角色池随机
        // perSpawnRandom: 每次生成顾客时从 models 池（5 种材质变体）随机挑一个
        perSpawnRandom: true,
        models: [
            "skyfootspa:human_femal",           // 人类女性（原版材质）
            "skyfootspa:human_femal_v1",        // 人类女性·材质变体1
            "skyfootspa:human_femal_v2",        // 人类女性·材质变体2
            "skyfootspa:human_femal_v3",        // 人类女性·材质变体3
            "skyfootspa:human_femal_v4",        // 人类女性·材质变体4
        ]
    },
    'yousei': {
        name: '妖精',
        weight: 4,
        // 妖精顾客固定使用自定义妖精模型系列，不再从东方角色池随机
        // perSpawnRandom: 每次生成顾客时从 models 池（5 种材质变体）随机挑一个
        perSpawnRandom: true,
        models: [
            "skyfootspa:fairy",                 // 妖精（原版材质）
            "skyfootspa:fairy_v1",              // 妖精·材质变体1
            "skyfootspa:fairy_v2",              // 妖精·材质变体2
            "skyfootspa:fairy_v3",              // 妖精·材质变体3
            "skyfootspa:fairy_v4",              // 妖精·材质变体4
        ]
    },
    'youkai': {
        name: '妖',
        weight: 4,
        models: [
            "touhou_little_maid:rumia",                  // 露米娅
            "touhou_little_maid:hong_meiling",           // 红美铃
            "touhou_little_maid:koakuma",                // 小恶魔
            "touhou_little_maid:patchouli_knowledge",    // 帕秋莉·诺蕾姬
            "touhou_little_maid:patchouli_knowledge_2",  // 帕秋莉·诺蕾姬
            "touhou_little_maid:remilia_scarlet",        // 蕾米莉亚·斯卡蕾特
            "touhou_little_maid:remilia_scarlet_2",      // 蕾米莉亚·斯卡蕾特
            "touhou_little_maid:flandre_scarlet",        // 芙兰朵露·斯卡蕾特
            "touhou_little_maid:letty_whiterock",        // 蕾蒂·霍瓦特洛克
            "touhou_little_maid:chen",                   // 橙
            "touhou_little_maid:lunasa_prismriver",      // 露娜萨·普莉兹姆利巴
            "touhou_little_maid:merlin_prismriver",      // 梅露兰·普莉兹姆利巴
            "touhou_little_maid:lyrica_prismriver",      // 莉莉卡·普莉兹姆利巴
            "touhou_little_maid:saigyouji_yuyuko",       // 西行寺幽幽子
            "touhou_little_maid:konpaku_youmu",          // 魂魄妖梦
            "touhou_little_maid:murasa_minamitsu",       // 村纱水蜜
            "touhou_little_maid:miyako_yoshika",         // 宫古芳香
            "touhou_little_maid:soga_no_toziko",         // 苏我屠自古
            "touhou_little_maid:tsukumo_yatsuhashi",     // 九十九八桥
            "touhou_little_maid:tsukumo_benben",         // 九十九弁弁
            "touhou_little_maid:horikawa_raiko",         // 堀川雷鼓
            "touhou_little_maid:yatadera_narumi",        // 矢田寺成美
            "touhou_little_maid:joutougu_mayumi",        // 杖刀偶磨弓
            "touhou_little_maid:ebisu_eika",             // 戎璎花
            "touhou_little_maid:hata_no_kokoro",         // 秦心
            "touhou_little_maid:miyoi_okunoda",          // 奥野田美宵
            "touhou_little_maid:wriggle_nightbug",       // 莉格露·奈特巴格
            "touhou_little_maid:mystia_lorelei",         // 米斯蒂娅·萝蕾拉
            "touhou_little_maid:tewi_inaba",             // 因幡帝
            "touhou_little_maid:syameimaru_aya",         // 射命丸文
            "touhou_little_maid:himekaidou_hatate",      // 姬海棠果
            "touhou_little_maid:medicine_melancholy",    // 梅蒂欣·梅兰可莉
            "touhou_little_maid:kazami_yuka",            // 风见幽香
            "touhou_little_maid:lunasa_prismriver",      // 露娜萨·普莉兹姆利巴
            "touhou_little_maid:merlin_prismriver",      // 梅露兰·普莉兹姆利巴
            "touhou_little_maid:lyrica_prismriver",      // 莉莉卡·普莉兹姆利巴
            "touhou_little_maid:saigyouji_yuyuko",       // 西行寺幽幽子
            "touhou_little_maid:konpaku_youmu",          // 魂魄妖梦
            "touhou_little_maid:murasa_minamitsu",       // 村纱水蜜
            "touhou_little_maid:miyako_yoshika",         // 宫古芳香
            "touhou_little_maid:soga_no_toziko",         // 苏我屠自古
            "touhou_little_maid:tsukumo_yatsuhashi",     // 九十九八桥
            "touhou_little_maid:tsukumo_benben",         // 九十九弁弁
            "touhou_little_maid:horikawa_raiko",         // 堀川雷鼓
            "touhou_little_maid:yatadera_narumi",        // 矢田寺成美
            "touhou_little_maid:joutougu_mayumi",        // 杖刀偶磨弓
            "touhou_little_maid:ebisu_eika",             // 戎璎花
            "touhou_little_maid:hata_no_kokoro",         // 秦心
            "touhou_little_maid:miyoi_okunoda",          // 奥野田美宵
            "touhou_little_maid:kawasiro_nitori",        // 河城荷取
            "touhou_little_maid:inubashiri_momizi",      // 犬走椛
            "touhou_little_maid:kurodani_yamame",        // 黑谷山女
            "touhou_little_maid:mizuhashi_parsee",       // 水桥帕露西
            "touhou_little_maid:kaenbyou_rin",           // 火焰猫燐
            "touhou_little_maid:reiuji_utsuho",          // 灵乌路空
            "touhou_little_maid:nazrin",                 // 娜兹琳
            "touhou_little_maid:tatara_kogasa",          // 多多良小伞
            "touhou_little_maid:kumoi_ichirin",          // 云居一轮
            "touhou_little_maid:toramaru_shou",          // 寅丸星
            "touhou_little_maid:kasodani_kyouko",        // 幽谷响子
            "touhou_little_maid:hutatsuiwa_mamizou",     // 二岩猯藏
            "touhou_little_maid:wakasagihime",           // 若�的姬
            "touhou_little_maid:sekibanki",              // 赤蛮奇
            "touhou_little_maid:imaizumi_kagerou",       // 今泉影狼
            "touhou_little_maid:kijin_seija",            // 鬼人正邪
            "touhou_little_maid:sukuna_shinmyoumaru",    // 少名针妙丸
            "touhou_little_maid:sakata_nemuno",          // 坂田合欢乃
            "touhou_little_maid:komano_aunn",            // 高丽野阿吽
            "touhou_little_maid:ushizaki_urumi",         // 牛崎润美
            "touhou_little_maid:kitcho_yachie",          // 吉弔八千慧
            "touhou_little_maid:kurokoma_saki",          // 骊驹早鬼
            "touhou_little_maid:goutokuzi_mike",         // 豪德寺三花
            "touhou_little_maid:yamashiro_takane",       // 山城高岭
            "touhou_little_maid:reisen_udongein_inaba",  // 铃仙·优昙华院·因幡
            "touhou_little_maid:komakusa_sannyo",        // 驹草山如
            "touhou_little_maid:kudamaki_tsukasa",       // 菅牧典
            "touhou_little_maid:iizunamaru_megumu",      // 饭纲丸龙
            "touhou_little_maid:himemushi_momoyo",       // 姬虫百百世
            "touhou_little_maid:son_biten",              // 孙美天
            "touhou_little_maid:mitsugashira_enoko",     // 三头慧之子
            "touhou_little_maid:nippaku_zanmu",          // 日白残无
            "touhou_little_maid:ubame_chirizuka",        // 尘冢姥芽
            "touhou_little_maid:chimi_houjuu",           // 封兽魑魅
            "touhou_little_maid:nareko_michigami",       // 道神驯子
            "touhou_little_maid:ariya_iwanaga",          // 磐永阿梨夜
            "touhou_little_maid:morichika_rinnosuke",    // 森近霖之助
            "touhou_little_maid:tokiko",                 // 朱鹭子
            "touhou_little_maid:miyadeguchi_mizuchi",    // 宫出口瑞灵
            "touhou_little_maid:moesumika",              // 萌澄果
            "touhou_little_maid:yakumo_ran",             // 八云蓝
            "touhou_little_maid:yukari_yakumo"           // 八云紫
        ]
    },
    'kami': {
        name: '神',
        weight: 4,
        models: [
            "touhou_little_maid:yagokoro_eirin",         // 八意永琳
            "touhou_little_maid:yasaka_kanako",          // 八坂神奈子
            "touhou_little_maid:moriya_suwako",          // 洩矢诹访子
            "touhou_little_maid:shikieiki_yamaxanadu",   // 四季映姬
            "touhou_little_maid:kagiyama_hina",          // 键山雏
            "touhou_little_maid:hinanawi_tenshi",        // 比那名居天子
            "touhou_little_maid:nagae_iku",              // 永江衣玖
            "touhou_little_maid:aki_sizuha",             // 秋静叶
            "touhou_little_maid:yorigami_jyoon",         // 依神女苑
            "touhou_little_maid:yorigami_shion",         // 依神紫苑
            "touhou_little_maid:minoriko_aki",           // 秋穰子
            "touhou_little_maid:haniyasushin_keiki",     // 埴安神袿姬
            "touhou_little_maid:matara_okina",           // 摩多罗隐岐奈
            "touhou_little_maid:tamatsukuri_misumaru",   // 玉造魅须丸
            "touhou_little_maid:doremy_sweet",           // 哆来咪苏伊特
            "touhou_little_maid:tenkyu_chimata",         // 天弓千亦
            "touhou_little_maid:niwatari_kutaka",        // 庭渡久侘歌
            "touhou_little_maid:junko",                  // 纯狐
            "touhou_little_maid:hecatia_lapislazuli"     // 赫卡提亚
        ]
    },
    'oni': {
        name: '鬼族',
        weight: 4,
        models: [
            "touhou_little_maid:ibuki_suika",            // 伊吹萃香
            "touhou_little_maid:hoshiguma_yugi",         // 星熊勇仪
            "touhou_little_maid:komeiji_satori",         // 古明地觉
            "touhou_little_maid:komeiji_koishi",         // 古明地恋
            "touhou_little_maid:komeiji_koishi_2",       // 古明地恋
            "touhou_little_maid:onozuka_komachi",        // 小野塚小町
            "touhou_little_maid:houjuu_nue",             // 封兽鵺
            "touhou_little_maid:kaku_seiga",             // 霍青娥
            "touhou_little_maid:kisume",                 // 琪斯美
            "touhou_little_maid:ibaraki_kasen",          // 茨木华扇
            "touhou_little_maid:ibaraki_kasen_2",        // 茨木华扇
            "touhou_little_maid:nishida_satono",         // 尔子田里乃
            "touhou_little_maid:teireid_mai",            // 丁礼田舞
            "touhou_little_maid:toutetsu_yuma",          // 饕餮尤魔
            "touhou_little_maid:tenkajin_chiyari",       // 天火人血枪
            "touhou_little_maid:yomotsu_hisami"          // 豫母都日狭美
        ]
    },
    'tsukikou': {
        name: '月球',
        weight: 4,
        models: [
            "touhou_little_maid:watatsuki_no_toyohime",  // 绵月丰姬
            "touhou_little_maid:watatsuki_no_yorihime",  // 绵月依姬
            "touhou_little_maid:kisin_sagume",           // 稀神探女
            "touhou_little_maid:reisen",                 // 铃仙
            "touhou_little_maid:seiran",                 // 清兰
            "touhou_little_maid:ringo"                   // 铃瑚
        ]
    }
}

// 每个类别只保留一种皮肤：脚本加载时从原模型池随机挑选一个，
// 之后该种族只生成这一个皮肤的顾客（models 数组仅作参考保留）
for (let key in PF_CUSTOMER_TYPES) {
    let cat = PF_CUSTOMER_TYPES[key]
    let pool = cat.models
    cat.model = (pool && pool.length > 0) ? pool[Math.floor(Math.random() * pool.length)] : null
}

/**
 * 为一次顾客生成挑选模型
 * perSpawnRandom: true 的类别每次生成都从 models 池随机挑一个（如人类材质变体）；
 * 其余类别使用加载时固定的唯一皮肤 cat.model
 * @param {Object} cat 类别对象（PF_CUSTOMER_TYPES[key]）
 * @returns {string|null} 模型ID
 */
function pfPickModel(cat) {
    if (!cat) return null
    if (cat.perSpawnRandom && cat.models && cat.models.length > 0) {
        return cat.models[Math.floor(Math.random() * cat.models.length)]
    }
    return cat.model
}

// ============================================================
// 顾客评价系统
// 使用玩家 persistentData 持久化存储每种顾客的评价值
// 评价影响生成权重：总池 10000，基础权重 100，每点评价 +5 权重
// ============================================================

let PF_RATING_TOTAL_POOL = 10000   // 总权重池
let PF_RATING_BASE_WEIGHT = 400    // 每类基础权重
let PF_RATING_PER_POINT = 5        // 每点评价增加的权重
let PF_RATING_MAX = 100            // 评价值上限
let PF_RATING_SAT_THRESHOLD = 60   // 满意度达到此值时评价+1

/**
 * 获取玩家对某类顾客的评价值
 * @param {$Player_} player 玩家
 * @param {string} category 顾客类别key
 * @returns {number} 评价值 0-100
 */
function pfGetRating(player, category) {
    let key = 'pfRating_' + category
    return player.persistentData.getInt(key) || 0
}

/**
 * 设置玩家对某类顾客的评价值
 * @param {$Player_} player 玩家
 * @param {string} category 顾客类别key
 * @param {number} value 评价值（自动clamp到0-100）
 */
function pfSetRating(player, category, value) {
    let key = 'pfRating_' + category
    let clamped = Math.max(0, Math.min(PF_RATING_MAX, Math.floor(value)))
    player.persistentData.putInt(key, clamped)
}

/**
 * 增加玩家对某类顾客的评价值（+1）
 * @param {$Player_} player 玩家
 * @param {string} category 顾客类别key
 * @returns {number} 增加后的评价值
 */
function pfAddRating(player, category) {
    let current = pfGetRating(player, category)
    if (current >= PF_RATING_MAX) return current
    let newVal = current + 1
    pfSetRating(player, category, newVal)
    return newVal
}

/**
 * 获取所有类别的评价概览
 * @param {$Player_} player 玩家
 * @returns {Object} { category: { name, rating, weight } }
 */
function pfGetAllRatings(player) {
    let result = {}
    for (let key in PF_CUSTOMER_TYPES) {
        let rating = pfGetRating(player, key)
        result[key] = {
            name: PF_CUSTOMER_TYPES[key].name,
            rating: rating,
            weight: PF_RATING_BASE_WEIGHT + rating * PF_RATING_PER_POINT
        }
    }
    return result
}

/**
 * 根据评价加权表抽取顾客
 * 先按店铺所在维度取 PF_DIMENSION_CATEGORIES 允许的类别，再与 PF_ACTIVE_CATEGORIES 白名单取交集
 * 总权重池 = 10000，各类别权重 = 400 + 评价值 × 5
 * 未命中任何类别 / 维度未配置时返回 null（本轮无顾客）
 * @param {$Player_} player 玩家（用于读取评价值）
 * @param {$Level_} level 店铺所在维度（用于判断可生成类别）
 * @returns {Object|null} { category, name, model } 或 null（未生成）
 * 注：model 由 pfPickModel 决定（perSpawnRandom 类别每次随机，其余为 cat.model）
 */
function pfRollCustomer(player, level) {
    // 取当前维度 ID，查询该维度允许生成的类别
    let dimId = level ? "" + level.getDimension() : ""
    let dimCategories = PF_DIMENSION_CATEGORIES[dimId]
    if (!dimCategories || dimCategories.length === 0) {
        console.log("[PF-CUSTOMER] 维度 " + (dimId || "未知") + " 未配置可生成顾客类别，本轮跳过")
        return null
    }
    // 仅计算维度允许且在活跃白名单中的类别权重
    let entries = []
    let totalWeight = 0
    for (let i = 0; i < dimCategories.length; i++) {
        let key = dimCategories[i]
        if (!PF_CUSTOMER_TYPES[key]) continue
        if (PF_ACTIVE_CATEGORIES.indexOf(key) < 0) continue
        let rating = player ? pfGetRating(player, key) : 0
        let w = PF_RATING_BASE_WEIGHT + rating * PF_RATING_PER_POINT
        entries.push({ key: key, weight: w })
        totalWeight += w
    }
    
    // 在总池中roll
    let roll = Math.random() * PF_RATING_TOTAL_POOL
    let cumulative = 0
    for (let i = 0; i < entries.length; i++) {
        cumulative += entries[i].weight
        if (roll < cumulative) {
            let cat = PF_CUSTOMER_TYPES[entries[i].key]
            if (!cat.model) continue
            return { category: entries[i].key, name: cat.name, model: pfPickModel(cat) }
        }
    }
    return null  // 未命中任何类别（剩余空池）
}

// 导出到全局
global.pfCustomerTypes = {
    PF_CUSTOMER_TYPES: PF_CUSTOMER_TYPES,
    PF_ACTIVE_CATEGORIES: PF_ACTIVE_CATEGORIES,
    PF_DIMENSION_CATEGORIES: PF_DIMENSION_CATEGORIES,
    pfRollCustomer: pfRollCustomer,
    pfPickModel: pfPickModel,
    pfGetRating: pfGetRating,
    pfSetRating: pfSetRating,
    pfAddRating: pfAddRating,
    pfGetAllRatings: pfGetAllRatings,
    PF_RATING_TOTAL_POOL: PF_RATING_TOTAL_POOL,
    PF_RATING_BASE_WEIGHT: PF_RATING_BASE_WEIGHT,
    PF_RATING_PER_POINT: PF_RATING_PER_POINT,
    PF_RATING_MAX: PF_RATING_MAX,
    PF_RATING_SAT_THRESHOLD: PF_RATING_SAT_THRESHOLD
}

let skinInfo = []
for (let key in PF_CUSTOMER_TYPES) {
    let cat = PF_CUSTOMER_TYPES[key]
    skinInfo.push(key + '=' + (cat.perSpawnRandom
        ? '每次生成随机(' + cat.models.join('/') + ')'
        : cat.model))
}
console.log("[PF-CUSTOMER] 顾客类别表已加载，活跃类别: " + PF_ACTIVE_CATEGORIES.join(', ') + "（含评价加权系统）")
console.log("[PF-CUSTOMER] 各类别唯一皮肤: " + skinInfo.join(', '))
for (let dimId in PF_DIMENSION_CATEGORIES) {
    console.log("[PF-CUSTOMER] 维度映射 " + dimId + " → " + PF_DIMENSION_CATEGORIES[dimId].join(', '))
}
