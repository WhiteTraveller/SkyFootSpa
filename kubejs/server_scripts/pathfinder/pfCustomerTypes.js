// priority: 10
// ============================================================
// 顾客类别与权重表
// 将东方Project角色按种族分为6大类
// 每个类别有独立的生成权重（百分比）
// ============================================================

let PF_CUSTOMER_TYPES = {
    'ningen': {
        name: '人类',
        weight: 1,  // 1% 概率
        models: [
            "touhou_little_maid:hakurei_reimu",
            "touhou_little_maid:hakurei_reimu_2",
            "touhou_little_maid:hakurei_reimu_type_b",
            "touhou_little_maid:kirisame_marisa",
            "touhou_little_maid:kirisame_marisa_2",
            "touhou_little_maid:izayoi_sakuya",
            "touhou_little_maid:keine_kamishirasawa",
            "touhou_little_maid:keine_kamishirasawa_2",
            "touhou_little_maid:fujiwara_no_mokou",
            "touhou_little_maid:houraisan_kaguya",
            "touhou_little_maid:kochiya_sanae",
            "touhou_little_maid:usami_sumireko",
            "touhou_little_maid:hieda_no_akyuu",
            "touhou_little_maid:motoori_kosuzu",
            "touhou_little_maid:usami_renko",
            "touhou_little_maid:maribel_hearn",
            "touhou_little_maid:mononobe_no_futo",
            "touhou_little_maid:toyosatomimi_no_miko"
        ]
    },
    'yousei': {
        name: '妖精',
        weight: 1,
        models: [
            "touhou_little_maid:daiyousei",
            "touhou_little_maid:cirno",
            "touhou_little_maid:cirno_maid",
            "touhou_little_maid:cirno_tan",
            "touhou_little_maid:cirno_slim",
            "touhou_little_maid:lily_white",
            "touhou_little_maid:lily_black",
            "touhou_little_maid:eternity_larva",
            "touhou_little_maid:sunny_milk",
            "touhou_little_maid:luna_child",
            "touhou_little_maid:star_sapphire",
            "touhou_little_maid:clownpiece"
        ]
    },
    'youkai': {
        name: '妖怪',
        weight: 1,
        models: [
            "touhou_little_maid:rumia",
            "touhou_little_maid:hong_meiling",
            "touhou_little_maid:koakuma",
            "touhou_little_maid:patchouli_knowledge",
            "touhou_little_maid:patchouli_knowledge_2",
            "touhou_little_maid:remilia_scarlet",
            "touhou_little_maid:remilia_scarlet_2",
            "touhou_little_maid:flandre_scarlet",
            "touhou_little_maid:letty_whiterock",
            "touhou_little_maid:chen",
            "touhou_little_maid:alice_margatroid",
            "touhou_little_maid:wriggle_nightbug",
            "touhou_little_maid:mystia_lorelei",
            "touhou_little_maid:tewi_inaba",
            "touhou_little_maid:reisen_udongein_inaba",
            "touhou_little_maid:reisen",
            "touhou_little_maid:syameimaru_aya",
            "touhou_little_maid:himekaidou_hatate",
            "touhou_little_maid:medicine_melancholy",
            "touhou_little_maid:kazami_yuka",
            "touhou_little_maid:kawasiro_nitori",
            "touhou_little_maid:inubashiri_momizi",
            "touhou_little_maid:kurodani_yamame",
            "touhou_little_maid:mizuhashi_parsee",
            "touhou_little_maid:kaenbyou_rin",
            "touhou_little_maid:reiuji_utsuho",
            "touhou_little_maid:nazrin",
            "touhou_little_maid:tatara_kogasa",
            "touhou_little_maid:kumoi_ichirin",
            "touhou_little_maid:toramaru_shou",
            "touhou_little_maid:kasodani_kyouko",
            "touhou_little_maid:hutatsuiwa_mamizou",
            "touhou_little_maid:wakasagihime",
            "touhou_little_maid:sekibanki",
            "touhou_little_maid:imaizumi_kagerou",
            "touhou_little_maid:kijin_seija",
            "touhou_little_maid:sukuna_shinmyoumaru",
            "touhou_little_maid:seiran",
            "touhou_little_maid:ringo",
            "touhou_little_maid:sakata_nemuno",
            "touhou_little_maid:komano_aunn",
            "touhou_little_maid:ushizaki_urumi",
            "touhou_little_maid:kitcho_yachie",
            "touhou_little_maid:kurokoma_saki",
            "touhou_little_maid:goutokuzi_mike",
            "touhou_little_maid:yamashiro_takane",
            "touhou_little_maid:komakusa_sannyo",
            "touhou_little_maid:kudamaki_tsukasa",
            "touhou_little_maid:iizunamaru_megumu",
            "touhou_little_maid:himemushi_momoyo",
            "touhou_little_maid:son_biten",
            "touhou_little_maid:mitsugashira_enoko",
            "touhou_little_maid:nippaku_zanmu",
            "touhou_little_maid:ubame_chirizuka",
            "touhou_little_maid:chimi_houjuu",
            "touhou_little_maid:nareko_michigami",
            "touhou_little_maid:ariya_iwanaga",
            "touhou_little_maid:morichika_rinnosuke",
            "touhou_little_maid:tokiko",
            "touhou_little_maid:miyadeguchi_mizuchi",
            "touhou_little_maid:satsuki_rin",
            "touhou_little_maid:moesumika",
            "touhou_little_maid:yakumo_ran",
            "touhou_little_maid:yukari_yakumo"
        ]
    },
    'kami': {
        name: '神',
        weight: 1,
        models: [
            "touhou_little_maid:yasaka_kanako",
            "touhou_little_maid:moriya_suwako",
            "touhou_little_maid:yagokoro_eirin",
            "touhou_little_maid:shikieiki_yamaxanadu",
            "touhou_little_maid:kagiyama_hina",
            "touhou_little_maid:hinanawi_tenshi",
            "touhou_little_maid:nagae_iku",
            "touhou_little_maid:aki_sizuha",
            "touhou_little_maid:minoriko_aki",
            "touhou_little_maid:haniyasushin_keiki",
            "touhou_little_maid:matara_okina",
            "touhou_little_maid:tamatsukuri_misumaru",
            "touhou_little_maid:tenkyu_chimata",
            "touhou_little_maid:niwatari_kutaka",
            "touhou_little_maid:watatsuki_no_toyohime",
            "touhou_little_maid:watatsuki_no_yorihime",
            "touhou_little_maid:junko",
            "touhou_little_maid:kisin_sagume",
            "touhou_little_maid:hecatia_lapislazuli"
        ]
    },
    'rei': {
        name: '灵',
        weight: 1,
        models: [
            "touhou_little_maid:lunasa_prismriver",
            "touhou_little_maid:merlin_prismriver",
            "touhou_little_maid:lyrica_prismriver",
            "touhou_little_maid:saigyouji_yuyuko",
            "touhou_little_maid:konpaku_youmu",
            "touhou_little_maid:murasa_minamitsu",
            "touhou_little_maid:miyako_yoshika",
            "touhou_little_maid:soga_no_toziko",
            "touhou_little_maid:shanghai_doll",
            "touhou_little_maid:hourai_doll",
            "touhou_little_maid:goliath_doll",
            "touhou_little_maid:tsukumo_yatsuhashi",
            "touhou_little_maid:tsukumo_benben",
            "touhou_little_maid:horikawa_raiko",
            "touhou_little_maid:yatadera_narumi",
            "touhou_little_maid:joutougu_mayumi",
            "touhou_little_maid:ebisu_eika",
            "touhou_little_maid:hata_no_kokoro",
            "touhou_little_maid:miyoi_okunoda"
        ]
    },
    'oni': {
        name: '鬼',
        weight: 1,
        models: [
            "touhou_little_maid:ibuki_suika",
            "touhou_little_maid:hoshiguma_yugi",
            "touhou_little_maid:komeiji_satori",
            "touhou_little_maid:komeiji_koishi",
            "touhou_little_maid:komeiji_koishi_2",
            "touhou_little_maid:onozuka_komachi",
            "touhou_little_maid:hijiri_byakuren",
            "touhou_little_maid:houjuu_nue",
            "touhou_little_maid:kaku_seiga",
            "touhou_little_maid:kisume",
            "touhou_little_maid:doremy_sweet",
            "touhou_little_maid:ibaraki_kasen",
            "touhou_little_maid:ibaraki_kasen_2",
            "touhou_little_maid:yorigami_jyoon",
            "touhou_little_maid:yorigami_shion",
            "touhou_little_maid:nishida_satono",
            "touhou_little_maid:teireid_mai",
            "touhou_little_maid:toutetsu_yuma",
            "touhou_little_maid:tenkajin_chiyari",
            "touhou_little_maid:yomotsu_hisami"
        ]
    }
}

// ============================================================
// 顾客评价系统
// 使用玩家 persistentData 持久化存储每种顾客的评价值
// 评价影响生成权重：总池 10000，基础权重 100，每点评价 +5 权重
// ============================================================

let PF_RATING_TOTAL_POOL = 10000   // 总权重池
let PF_RATING_BASE_WEIGHT = 100    // 每类基础权重
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
 * 总权重池 = 10000，各类别权重 = 100 + 评价值 × 5
 * 未命中任何类别时返回 null（本轮无顾客）
 * @param {$Player_} player 玩家（用于读取评价值）
 * @returns {Object|null} { category, name, model } 或 null（未生成）
 */
function pfRollCustomer(player) {
    // 计算各类别实际权重
    let entries = []
    let totalWeight = 0
    for (let key in PF_CUSTOMER_TYPES) {
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
            let model = cat.models[Math.floor(Math.random() * cat.models.length)]
            return { category: entries[i].key, name: cat.name, model: model }
        }
    }
    return null  // 未命中任何类别（剩余空池）
}

// 导出到全局
global.pfCustomerTypes = {
    PF_CUSTOMER_TYPES: PF_CUSTOMER_TYPES,
    pfRollCustomer: pfRollCustomer,
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

console.log("[PF-CUSTOMER] 顾客类别表已加载，共6类（含评价加权系统）")
