// priority: 10
// ============================================================
// 顾客类别与权重表
// 将东方Project角色按种族分类
// 每个类别有独立的生成权重（百分比）
// PF_ACTIVE_CATEGORIES 控制当前允许生成的类别（不在列表中的类别保留数据但不生成）
// PF_DIMENSION_CATEGORIES 控制各维度开店时允许生成的类别（正常开店按店铺所在维度过滤）
// 每个类别只有一种皮肤：加载时从 models 池随机挑选一个固定为该种族的唯一皮肤（cat.model）
// 例外：类别设置 perSpawnRandom: true 时，每次生成顾客都从 models 池随机挑一个（见 pfPickModel）
//
// 稀客系统（文件末尾）：每个维度在 PF_RARE_BY_DIMENSION 中维护独立稀客池，
// 自然生成顾客时（pfShopTick）先按 PF_RARE_SPAWN_CHANCE 概率判定是否改为生成稀客，
// 稀客需求数量为普通顾客的 PF_RARE_DEMAND_MULTIPLIER 倍（在 pfSpawnWalker 内应用）
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
        weight: 8,  // 1% 概率
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
        weight: 8,
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
        weight: 8,
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
        weight: 8,
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
        weight: 8,
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
        weight: 8,
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

// ============================================================
// 种族需求数量范围配置
// ------------------------------------------------------------
// PF_DEMAND_DEFAULT_RANGES：未单独配置的种族使用此默认值
// PF_RACE_DEMAND_RANGES：按种族覆盖各部位需求范围 [min, max]（含端点）
// 部位键名与 PF_DEMAND_TYPES 一致：脚掌 / 脚后跟 / 脚趾 / 脚心
// ============================================================
let PF_DEMAND_DEFAULT_RANGES = {
    '脚掌':   [0, 2],
    '脚后跟': [0, 2],
    '脚趾':   [0, 2],
    '脚心':   [0, 2]
}

let PF_RACE_DEMAND_RANGES = {
    'ningen': {
        // 人类：前两个部位 1-3，其余 0-2
        '脚掌':   [1, 3],
        '脚后跟': [1, 3],
        '脚趾':   [0, 2],
        '脚心':   [0, 2]
    },
    'yousei': {
        // 妖精：后两个部位 1-5，其余 0-1
        '脚掌':   [0, 1],
        '脚后跟': [0, 1],
        '脚趾':   [1, 5],
        '脚心':   [1, 5]
    }
    // 其他种族未配置时使用 PF_DEMAND_DEFAULT_RANGES
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
// 评价影响生成权重：总池 10000，基础权重 800，每点评价 +10 权重
// ============================================================

let PF_RATING_TOTAL_POOL = 10000   // 总权重池
let PF_RATING_BASE_WEIGHT = 800    // 每类基础权重
let PF_RATING_PER_POINT = 10       // 每点评价增加的权重
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
 * 总权重池 = 10000，各类别权重 = 800 + 评价值 × 10
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

// ============================================================
// 稀客系统
// ------------------------------------------------------------
// 每个维度拥有独立的稀客池（PF_RARE_BY_DIMENSION），
// 自然生成顾客时（pfShopTick）先按 PF_RARE_SPAWN_CHANCE 概率
// 判定是否改为生成一位稀客，未命中则走普通顾客抽取。
//
// 稀客特性：
//   - 需求数量为普通顾客的 PF_RARE_DEMAND_MULTIPLIER 倍（默认 1.5，四舍五入，在 pfSpawnWalker 内应用）
//   - 实体 persistentData 写入 pfRareId 标记
//   - 不参与种族评价系统（pfCustomerCategory 置空，与 Boss 一致）
//   - 头顶名牌显示 "★稀客 <名字> Lv.x"
//
// 选取原则：模型全部来自本文件已登记的 TLM 模型池，
// 且不与所在维度的普通顾客类别池重叠（普通类别加载时随机固定皮肤，
// 重叠会导致稀客与普通顾客外观撞车）。
// 新增维度稀客：在 PF_RARE_BY_DIMENSION 中加一个维度键即可；
// 未配置的维度不会生成稀客（只走普通顾客逻辑）。
// ============================================================

// ===== 稀客可配置项 =====
let PF_RARE_SPAWN_CHANCE = 0.10       // 自然生成时替换为稀客的概率（0-1，默认 10%）
let PF_RARE_DEMAND_MULTIPLIER = 1.5   // 稀客需求倍率（相对普通顾客）

// ===== 稀客好感度可配置项 =====
// 爱心阈值：好感度达到该值点亮对应序号的爱心（第1颗=50，第2颗=150，第3颗=300），最多 3 颗
let PF_RARE_HEART_THRESHOLDS = [50, 150, 300]
// 结算时好感度增量 = 本单满意度 - PF_RARE_AFFECTION_SAT_OFFSET（允许为负即扣除），结果 clamp 到最小 0，无上限
let PF_RARE_AFFECTION_SAT_OFFSET = 50

// ===== 稀客掉落配置 =====
// 每个稀客按“当前爱心数”（0/1/2/3）掉落不同物品。
// 掉落项格式：{ item: '命名空间:物品id', min: 最小数量, max: 最大数量 }（数量在 [min,max] 内随机）。
// 优先用稀客自身的 drops（每个稀客可独立配置）；未配置时回退到下面的全局默认表。
// 全局默认为一二阶段材料阶梯（皴→铁粒/煤→精密构件→魔力粉）；当前 20 位稀客均已配置专属 drops，此表仅作未来新增稀客未配 drops 时的兜底。
let PF_RARE_DEFAULT_DROPS = {
    0: [ { item: 'marguerite:cun', min: 2, max: 4 } ],
    1: [ { item: 'minecraft:iron_nugget', min: 3, max: 6 }, { item: 'minecraft:coal', min: 1, max: 2 } ],
    2: [ { item: 'create:precision_mechanism', min: 1, max: 1 }, { item: 'minecraft:gold_ingot', min: 1, max: 2 } ],
    3: [ { item: 'marguerite:magic_dust', min: 1, max: 2 }, { item: 'create:precision_mechanism', min: 1, max: 2 } ]
}
// 每个稀客可在 PF_RARE_BY_DIMENSION 的定义里加 drops 字段独立覆盖，例如：
//   { id: 'rare_yukari', name: '八云紫', model: '...', weight: 1,
//     drops: { 0: [{item:'minecraft:ender_pearl',min:1,max:2}], 1: [...], 2: [...], 3: [...] } }

// ===== 维度 → 稀客池映射（每个维度独立管理）=====
// weight: 池内抽取权重（等权填相同数值即可）
let PF_RARE_BY_DIMENSION = {
    // 主世界：普通池为 人类+妖精，稀客从妖怪/神明角色中挑选
    // drops 每位稀客 2-3 种主题物品；分两种设计：
    //   (A) 种类固定：所有档位同样 2 种，只递增数量
    //   (B) 种类递进解锁：0心=基础1种，1心解锁中级，3心解锁最高级
    'minecraft:overworld': [
        {
            id: 'rare_yukari', name: '八云紫', model: 'touhou_little_maid:yukari_yakumo', weight: 1,
            // (B) 境界·紫：紫水晶 → 末影珍珠(1心解锁) → 赛特斯石英(3心最高级)
            drops: {
                0: [{ item: 'minecraft:amethyst_shard', min: 2, max: 4 }],
                1: [{ item: 'minecraft:amethyst_shard', min: 4, max: 8 }, { item: 'minecraft:ender_pearl', min: 1, max: 2 }],
                2: [{ item: 'minecraft:amethyst_shard', min: 6, max: 10 }, { item: 'minecraft:ender_pearl', min: 2, max: 4 }],
                3: [{ item: 'minecraft:amethyst_shard', min: 8, max: 12 }, { item: 'minecraft:ender_pearl', min: 3, max: 5 }, { item: 'ae2:certus_quartz_crystal', min: 2, max: 3 }]
            }
        },
        {
            id: 'rare_ran', name: '八云蓝', model: 'touhou_little_maid:yakumo_ran', weight: 1,
            // (B) 式神狐·金：金粒 → 萤石粉(1心解锁) → 金锭(3心最高级)
            drops: {
                0: [{ item: 'minecraft:gold_nugget', min: 2, max: 4 }],
                1: [{ item: 'minecraft:gold_nugget', min: 4, max: 8 }, { item: 'minecraft:glowstone_dust', min: 2, max: 3 }],
                2: [{ item: 'minecraft:gold_nugget', min: 6, max: 10 }, { item: 'minecraft:glowstone_dust', min: 3, max: 5 }],
                3: [{ item: 'minecraft:gold_nugget', min: 8, max: 12 }, { item: 'minecraft:glowstone_dust', min: 4, max: 6 }, { item: 'minecraft:gold_ingot', min: 2, max: 4 }]
            }
        },
        {
            id: 'rare_yuyuko', name: '西行寺幽幽子', model: 'touhou_little_maid:saigyouji_yuyuko', weight: 1,
            // (A) 亡灵·白：石英 + 骨（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:quartz', min: 2, max: 3 }, { item: 'minecraft:bone', min: 1, max: 2 }],
                1: [{ item: 'minecraft:quartz', min: 3, max: 5 }, { item: 'minecraft:bone', min: 2, max: 3 }],
                2: [{ item: 'minecraft:quartz', min: 5, max: 8 }, { item: 'minecraft:bone', min: 3, max: 5 }],
                3: [{ item: 'minecraft:quartz', min: 8, max: 12 }, { item: 'minecraft:bone', min: 4, max: 6 }]
            }
        },
        {
            id: 'rare_youmu', name: '魂魄妖梦', model: 'touhou_little_maid:konpaku_youmu', weight: 1,
            // (B) 剑士·铁钢：铁粒 → 铁板(1心解锁) → 精密构件(3心最高级)
            drops: {
                0: [{ item: 'minecraft:iron_nugget', min: 2, max: 4 }],
                1: [{ item: 'minecraft:iron_nugget', min: 4, max: 8 }, { item: 'immersiveengineering:plate_iron', min: 1, max: 2 }],
                2: [{ item: 'minecraft:iron_nugget', min: 6, max: 10 }, { item: 'immersiveengineering:plate_iron', min: 2, max: 4 }],
                3: [{ item: 'minecraft:iron_nugget', min: 8, max: 12 }, { item: 'immersiveengineering:plate_iron', min: 3, max: 5 }, { item: 'create:precision_mechanism', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_remilia', name: '蕾米莉亚·斯卡蕾特', model: 'touhou_little_maid:remilia_scarlet', weight: 1,
            // (A) 吸血鬼·绯红：红石 + 铜粒（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:redstone', min: 2, max: 3 }, { item: 'create:copper_nugget', min: 1, max: 2 }],
                1: [{ item: 'minecraft:redstone', min: 3, max: 5 }, { item: 'create:copper_nugget', min: 2, max: 4 }],
                2: [{ item: 'minecraft:redstone', min: 5, max: 8 }, { item: 'create:copper_nugget', min: 4, max: 6 }],
                3: [{ item: 'minecraft:redstone', min: 8, max: 12 }, { item: 'create:copper_nugget', min: 6, max: 10 }]
            }
        },
        {
            id: 'rare_flandre', name: '芙兰朵露·斯卡蕾特', model: 'touhou_little_maid:flandre_scarlet', weight: 1,
            // (B) 破坏·水晶：紫水晶 → 赛特斯石英(1心解锁) → 魔力粉(3心最高级)
            drops: {
                0: [{ item: 'minecraft:amethyst_shard', min: 2, max: 4 }],
                1: [{ item: 'minecraft:amethyst_shard', min: 4, max: 8 }, { item: 'ae2:certus_quartz_crystal', min: 1, max: 2 }],
                2: [{ item: 'minecraft:amethyst_shard', min: 6, max: 10 }, { item: 'ae2:certus_quartz_crystal', min: 2, max: 3 }],
                3: [{ item: 'minecraft:amethyst_shard', min: 8, max: 12 }, { item: 'ae2:certus_quartz_crystal', min: 3, max: 4 }, { item: 'marguerite:magic_dust', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_yuka', name: '风见幽香', model: 'touhou_little_maid:kazami_yuka', weight: 1,
            // (B) 花妖·自然：草灰 → 骨(1心解锁) → 绿宝石(3心最高级)
            drops: {
                0: [{ item: 'marguerite:grass_ash', min: 2, max: 4 }],
                1: [{ item: 'marguerite:grass_ash', min: 4, max: 8 }, { item: 'minecraft:bone', min: 1, max: 2 }],
                2: [{ item: 'marguerite:grass_ash', min: 6, max: 12 }, { item: 'minecraft:bone', min: 2, max: 4 }],
                3: [{ item: 'marguerite:grass_ash', min: 8, max: 16 }, { item: 'minecraft:bone', min: 3, max: 5 }, { item: 'minecraft:emerald', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_aya', name: '射命丸文', model: 'touhou_little_maid:syameimaru_aya', weight: 1,
            // (A) 天狗记者：纸 + 羽毛（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:paper', min: 2, max: 3 }, { item: 'minecraft:feather', min: 1, max: 2 }],
                1: [{ item: 'minecraft:paper', min: 3, max: 5 }, { item: 'minecraft:feather', min: 2, max: 3 }],
                2: [{ item: 'minecraft:paper', min: 5, max: 8 }, { item: 'minecraft:feather', min: 3, max: 5 }],
                3: [{ item: 'minecraft:paper', min: 8, max: 12 }, { item: 'minecraft:feather', min: 4, max: 6 }]
            }
        },
        {
            id: 'rare_eirin', name: '八意永琳', model: 'touhou_little_maid:yagokoro_eirin', weight: 1,
            // (B) 月之药师：萤石粉 → 电解质水瓶(1心解锁) → 魔力粉仙丹(3心最高级)
            drops: {
                0: [{ item: 'minecraft:glowstone_dust', min: 2, max: 3 }],
                1: [{ item: 'minecraft:glowstone_dust', min: 3, max: 5 }, { item: 'marguerite:electrolyte_bottle', min: 1, max: 1 }],
                2: [{ item: 'minecraft:glowstone_dust', min: 4, max: 6 }, { item: 'marguerite:electrolyte_bottle', min: 1, max: 2 }],
                3: [{ item: 'minecraft:glowstone_dust', min: 5, max: 8 }, { item: 'marguerite:electrolyte_bottle', min: 2, max: 2 }, { item: 'marguerite:magic_dust', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_kanako', name: '八坂神奈子', model: 'touhou_little_maid:yasaka_kanako', weight: 1,
            // (B) 神明·信仰：石英 → 金锭(1心解锁) → 精密构件(3心最高级)
            drops: {
                0: [{ item: 'minecraft:quartz', min: 2, max: 4 }],
                1: [{ item: 'minecraft:quartz', min: 3, max: 6 }, { item: 'minecraft:gold_ingot', min: 1, max: 2 }],
                2: [{ item: 'minecraft:quartz', min: 5, max: 8 }, { item: 'minecraft:gold_ingot', min: 2, max: 3 }],
                3: [{ item: 'minecraft:quartz', min: 6, max: 10 }, { item: 'minecraft:gold_ingot', min: 3, max: 4 }, { item: 'create:precision_mechanism', min: 1, max: 2 }]
            }
        }
    ],
    // 旧地狱：普通池为 妖精+鬼族，稀客从地狱/冥界主题角色中挑选（避开 oni 普通池）
    // drops 同样分 (A) 种类固定递增数量 / (B) 种类递进解锁(1心中级、3心最高级) 两种设计
    'marguerite:old_hell': [
        {
            id: 'rare_yuyuko_hell', name: '西行寺幽幽子', model: 'touhou_little_maid:saigyouji_yuyuko', weight: 1,
            // (A) 冥界亡灵·白：石英 + 骨（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:quartz', min: 2, max: 3 }, { item: 'minecraft:bone', min: 1, max: 2 }],
                1: [{ item: 'minecraft:quartz', min: 3, max: 5 }, { item: 'minecraft:bone', min: 2, max: 3 }],
                2: [{ item: 'minecraft:quartz', min: 5, max: 8 }, { item: 'minecraft:bone', min: 3, max: 5 }],
                3: [{ item: 'minecraft:quartz', min: 8, max: 12 }, { item: 'minecraft:bone', min: 4, max: 6 }]
            }
        },
        {
            id: 'rare_youmu_hell', name: '魂魄妖梦', model: 'touhou_little_maid:konpaku_youmu', weight: 1,
            // (B) 冥界剑士·铁钢：铁粒 → 铁板(1心解锁) → 精密构件(3心最高级)
            drops: {
                0: [{ item: 'minecraft:iron_nugget', min: 2, max: 4 }],
                1: [{ item: 'minecraft:iron_nugget', min: 4, max: 8 }, { item: 'immersiveengineering:plate_iron', min: 1, max: 2 }],
                2: [{ item: 'minecraft:iron_nugget', min: 6, max: 10 }, { item: 'immersiveengineering:plate_iron', min: 2, max: 4 }],
                3: [{ item: 'minecraft:iron_nugget', min: 8, max: 12 }, { item: 'immersiveengineering:plate_iron', min: 3, max: 5 }, { item: 'create:precision_mechanism', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_komachi', name: '小野塚小町', model: 'touhou_little_maid:onozuka_komachi', weight: 1,
            // (B) 死神摆渡：骨 → 金粒(1心解锁·渡河钱) → 金锭(3心最高级)
            drops: {
                0: [{ item: 'minecraft:bone', min: 2, max: 4 }],
                1: [{ item: 'minecraft:bone', min: 3, max: 6 }, { item: 'minecraft:gold_nugget', min: 2, max: 4 }],
                2: [{ item: 'minecraft:bone', min: 4, max: 8 }, { item: 'minecraft:gold_nugget', min: 4, max: 6 }],
                3: [{ item: 'minecraft:bone', min: 6, max: 10 }, { item: 'minecraft:gold_nugget', min: 6, max: 8 }, { item: 'minecraft:gold_ingot', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_shikieiki', name: '四季映姬', model: 'touhou_little_maid:shikieiki_yamaxanadu', weight: 1,
            // (B) 阎魔审判：石英 → 金锭(1心解锁) → 精密构件(3心最高级·公正)
            drops: {
                0: [{ item: 'minecraft:quartz', min: 2, max: 4 }],
                1: [{ item: 'minecraft:quartz', min: 3, max: 6 }, { item: 'minecraft:gold_ingot', min: 1, max: 2 }],
                2: [{ item: 'minecraft:quartz', min: 5, max: 8 }, { item: 'minecraft:gold_ingot', min: 2, max: 3 }],
                3: [{ item: 'minecraft:quartz', min: 6, max: 10 }, { item: 'minecraft:gold_ingot', min: 3, max: 4 }, { item: 'create:precision_mechanism', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_rin', name: '火焰猫燐', model: 'touhou_little_maid:kaenbyou_rin', weight: 1,
            // (A) 火猫·地狱火：煤炭 + 红石（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:coal', min: 2, max: 3 }, { item: 'minecraft:redstone', min: 1, max: 2 }],
                1: [{ item: 'minecraft:coal', min: 3, max: 5 }, { item: 'minecraft:redstone', min: 2, max: 4 }],
                2: [{ item: 'minecraft:coal', min: 5, max: 8 }, { item: 'minecraft:redstone', min: 4, max: 6 }],
                3: [{ item: 'minecraft:coal', min: 8, max: 12 }, { item: 'minecraft:redstone', min: 6, max: 10 }]
            }
        },
        {
            id: 'rare_utsuho', name: '灵乌路空', model: 'touhou_little_maid:reiuji_utsuho', weight: 1,
            // (B) 核能乌鸦：红石 → 赛特斯石英(1心解锁) → 电子元件(3心最高级·核电)
            drops: {
                0: [{ item: 'minecraft:redstone', min: 2, max: 4 }],
                1: [{ item: 'minecraft:redstone', min: 4, max: 8 }, { item: 'ae2:certus_quartz_crystal', min: 1, max: 2 }],
                2: [{ item: 'minecraft:redstone', min: 6, max: 10 }, { item: 'ae2:certus_quartz_crystal', min: 2, max: 3 }],
                3: [{ item: 'minecraft:redstone', min: 8, max: 12 }, { item: 'ae2:certus_quartz_crystal', min: 3, max: 4 }, { item: 'immersiveengineering:component_electronic', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_parsee', name: '水桥帕露西', model: 'touhou_little_maid:mizuhashi_parsee', weight: 1,
            // (B) 嫉妒桥姬·绿：铜粒 → 锌粒(1心解锁) → 绿宝石(3心最高级·嫉妒)
            drops: {
                0: [{ item: 'create:copper_nugget', min: 2, max: 4 }],
                1: [{ item: 'create:copper_nugget', min: 4, max: 8 }, { item: 'create:zinc_nugget', min: 2, max: 4 }],
                2: [{ item: 'create:copper_nugget', min: 6, max: 10 }, { item: 'create:zinc_nugget', min: 4, max: 6 }],
                3: [{ item: 'create:copper_nugget', min: 8, max: 12 }, { item: 'create:zinc_nugget', min: 5, max: 8 }, { item: 'minecraft:emerald', min: 1, max: 2 }]
            }
        },
        {
            id: 'rare_yamame', name: '黑谷山女', model: 'touhou_little_maid:kurodani_yamame', weight: 1,
            // (A) 蜘蛛·病灶：线 + 铁粒（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:string', min: 2, max: 3 }, { item: 'minecraft:iron_nugget', min: 1, max: 2 }],
                1: [{ item: 'minecraft:string', min: 3, max: 5 }, { item: 'minecraft:iron_nugget', min: 2, max: 4 }],
                2: [{ item: 'minecraft:string', min: 5, max: 8 }, { item: 'minecraft:iron_nugget', min: 4, max: 6 }],
                3: [{ item: 'minecraft:string', min: 8, max: 12 }, { item: 'minecraft:iron_nugget', min: 6, max: 10 }]
            }
        },
        {
            id: 'rare_kisume', name: '琪斯美', model: 'touhou_little_maid:kisume', weight: 1,
            // (A) 木桶井妖：铁粒 + 煤炭（种类固定，数量随好感递增）
            drops: {
                0: [{ item: 'minecraft:iron_nugget', min: 2, max: 3 }, { item: 'minecraft:coal', min: 1, max: 2 }],
                1: [{ item: 'minecraft:iron_nugget', min: 3, max: 5 }, { item: 'minecraft:coal', min: 2, max: 3 }],
                2: [{ item: 'minecraft:iron_nugget', min: 5, max: 8 }, { item: 'minecraft:coal', min: 3, max: 5 }],
                3: [{ item: 'minecraft:iron_nugget', min: 8, max: 12 }, { item: 'minecraft:coal', min: 4, max: 6 }]
            }
        },
        {
            id: 'rare_seiga', name: '霍青娥', model: 'touhou_little_maid:kaku_seiga', weight: 1,
            // (B) 仙人·道法：石英 → 赛特斯石英(1心解锁) → 魔力粉(3心最高级)
            drops: {
                0: [{ item: 'minecraft:quartz', min: 2, max: 4 }],
                1: [{ item: 'minecraft:quartz', min: 3, max: 6 }, { item: 'ae2:certus_quartz_crystal', min: 1, max: 2 }],
                2: [{ item: 'minecraft:quartz', min: 5, max: 8 }, { item: 'ae2:certus_quartz_crystal', min: 2, max: 3 }],
                3: [{ item: 'minecraft:quartz', min: 6, max: 10 }, { item: 'ae2:certus_quartz_crystal', min: 3, max: 4 }, { item: 'marguerite:magic_dust', min: 1, max: 2 }]
            }
        }
    ]
}

/**
 * 尝试 roll 一位稀客（自然生成顾客时调用）
 * 先按 PF_RARE_SPAWN_CHANCE 判定是否触发，再在当前维度稀客池内按权重抽取
 * 维度 ID 解析复用 pfRollCustomer 的写法（兼容 ResourceKey[...] 格式）
 * @param {$Level_} level 店铺所在维度
 * @returns {Object|null} 稀客定义 { id, name, model, weight } 或 null（未触发/维度无稀客池）
 */
function pfTryRollRare(level) {
    if (!level) return null
    if (Math.random() >= PF_RARE_SPAWN_CHANCE) return null
    let dimId = '' + level.getDimension()
    let s = dimId.indexOf(' / ')
    if (s >= 0) {
        dimId = dimId.substring(s + 3)
        if (dimId.charAt(dimId.length - 1) === ']') dimId = dimId.substring(0, dimId.length - 1)
    }
    let pool = PF_RARE_BY_DIMENSION[dimId]
    if (!pool || pool.length === 0) return null
    let total = 0
    for (let i = 0; i < pool.length; i++) total += (pool[i].weight || 1)
    let roll = Math.random() * total
    let cumulative = 0
    for (let i = 0; i < pool.length; i++) {
        cumulative += (pool[i].weight || 1)
        if (roll < cumulative) return pool[i]
    }
    return pool[pool.length - 1]
}

// ============================================================
// 稀客好感度 / 掉落 纯配置 helper（无副作用，供服务端各模块调用）
// ============================================================

/**
 * 根据好感度计算爱心数（0-3）
 * @param {number} affection 好感度数值
 * @returns {number} 点亮的爱心数
 */
function pfRareHeartCount(affection) {
    let v = affection | 0
    let hearts = 0
    for (let i = 0; i < PF_RARE_HEART_THRESHOLDS.length; i++) {
        if (v >= PF_RARE_HEART_THRESHOLDS[i]) hearts++
    }
    return hearts
}

/**
 * 生成爱心显示文本（固定 3 颗，已点亮红色❤，未点亮灰色❤）
 * @param {number} affection 好感度数值
 * @returns {string} 带颜色码的爱心字符串
 */
function pfRareHeartsText(affection) {
    let hearts = pfRareHeartCount(affection)
    let total = PF_RARE_HEART_THRESHOLDS.length
    let s = ''
    for (let i = 0; i < total; i++) {
        s += (i < hearts) ? '§c❤' : '§8❤'
    }
    return s
}

/**
 * 从完整模型 id 取不带命名空间的后缀（用作手办 garage_kit 的 EntityInfo.ModelId）
 * 例：'touhou_little_maid:yukari_yakumo' → 'yukari_yakumo'
 * @param {string} model 完整模型 id
 * @returns {string} 模型后缀
 */
function pfRareModelSuffix(model) {
    let m = '' + (model || '')
    let idx = m.indexOf(':')
    return idx >= 0 ? m.substring(idx + 1) : m
}

/**
 * 生成手办物品的 <item> 表达式（AUI ItemStackExpressionCompiler 支持 物品id{SNBT} 格式）
 * @param {string} model 稀客完整模型 id
 * @returns {string} 如 touhou_little_maid:garage_kit{EntityInfo:{ModelId:"yukari_yakumo"}}
 */
function pfRareFigureItemExpr(model) {
    return 'touhou_little_maid:garage_kit{EntityInfo:{ModelId:"' + pfRareModelSuffix(model) + '"}}'
}

/**
 * 取某稀客在指定爱心档位的掉落配置（优先稀客自身 drops，否则全局默认）
 * @param {Object} rareDef 稀客定义
 * @param {number} heartCount 爱心数 0-3
 * @returns {Array} 掉落项数组 [{item,min,max}]
 */
function pfRareDropsFor(rareDef, heartCount) {
    let hc = heartCount | 0
    if (rareDef && rareDef.drops && rareDef.drops[hc]) return rareDef.drops[hc]
    return PF_RARE_DEFAULT_DROPS[hc] || []
}

/**
 * 取某维度的稀客池
 * @param {string} dimId 维度干净 id
 * @returns {Array} 稀客定义数组（无则空数组）
 */
function pfRareGetPool(dimId) {
    return PF_RARE_BY_DIMENSION[dimId] || []
}

/**
 * 在某维度稀客池中按 id 查找定义
 * @param {string} dimId 维度干净 id
 * @param {string} rareId 稀客 id
 * @returns {Object|null}
 */
function pfRareFind(dimId, rareId) {
    let pool = pfRareGetPool(dimId)
    for (let i = 0; i < pool.length; i++) {
        if (pool[i].id === rareId) return pool[i]
    }
    return null
}

// ===== 稀客角色设定（供界面右侧悬停展示：种族 / 出现作品 / 简介）=====
let PF_RARE_LORE = {
    'rare_yukari':      { race: '妖怪（境界）',     work: '东方妖妖梦', desc: '操纵境界的隙间妖怪，幻想乡贤者之一，神出鬼没。' },
    'rare_ran':         { race: '妖怪（九尾狐）',   work: '东方妖妖梦', desc: '八云紫的式神、九尾之狐，亦是橙的主人，精于术算。' },
    'rare_yuyuko':      { race: '幽灵',             work: '东方妖妖梦', desc: '白玉楼之主、亡灵的公主，能操纵死亡。' },
    'rare_youmu':       { race: '半人半灵',         work: '东方妖妖梦', desc: '白玉楼庭师兼剑士，二刀流斩断烦恼。' },
    'rare_remilia':     { race: '吸血鬼',           work: '东方红魔乡', desc: '红魔馆之主，操纵命运的幼女吸血鬼。' },
    'rare_flandre':     { race: '吸血鬼',           work: '东方红魔乡', desc: '蕾米莉亚之妹，被囚地下室多年，握有破坏一切之能。' },
    'rare_yuka':        { race: '妖怪（花）',       work: '东方花映塚', desc: '喜爱鲜花的花妖，操纵花程度的能力，实力深不可测。' },
    'rare_aya':         { race: '天狗',             work: '东方风神录', desc: '发行《文文。新闻》的天狗记者，操纵风、速度极快。' },
    'rare_eirin':       { race: '月人',             work: '东方永夜抄', desc: '月之都的贤者与药师，蓬莱之药的制作者。' },
    'rare_kanako':      { race: '神明',             work: '东方风神录', desc: '守矢神社的祭神、八坂之神，收集信仰、操纵乾坤。' },
    'rare_yuyuko_hell': { race: '幽灵',             work: '东方妖妖梦', desc: '冥界的亡灵公主、白玉楼之主（旧地狱访客）。' },
    'rare_youmu_hell':  { race: '半人半灵',         work: '东方妖妖梦', desc: '半人半灵的剑士庭师（旧地狱访客）。' },
    'rare_komachi':     { race: '死神',             work: '东方花映塚', desc: '三途河的摆渡死神，引导亡魂，懒散却称职。' },
    'rare_shikieiki':   { race: '阎魔',             work: '东方花映塚', desc: '是非曲直厅的阎魔，审判亡魂、黑白分明。' },
    'rare_rin':         { race: '妖怪猫（火车）',   work: '东方地灵殿', desc: '旧地狱的妖怪猫，搬运尸体，阿空的挚友。' },
    'rare_utsuho':      { race: '地狱鸦（八咫乌）', work: '东方地灵殿', desc: '被八咫乌附身的地狱鸦，掌管核融合之火。' },
    'rare_parsee':      { race: '桥姬',             work: '东方地灵殿', desc: '守护竖井桥梁的桥姬，操纵嫉妒心。' },
    'rare_yamame':      { race: '土蜘蛛',           work: '东方地灵殿', desc: '盘踞洞窟的土蜘蛛，操纵疾病，开朗好战。' },
    'rare_kisume':      { race: '付丧神',           work: '东方地灵殿', desc: '躲在桶中的胆小付丧神，垂井巷的落穴之主。' },
    'rare_seiga':       { race: '仙人（邪仙）',     work: '东方神灵庙', desc: '穿墙而行的邪仙，追求仙道、行事神秘。' }
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
    PF_RATING_SAT_THRESHOLD: PF_RATING_SAT_THRESHOLD,
    PF_DEMAND_DEFAULT_RANGES: PF_DEMAND_DEFAULT_RANGES,
    PF_RACE_DEMAND_RANGES: PF_RACE_DEMAND_RANGES,
    // 稀客系统
    PF_RARE_SPAWN_CHANCE: PF_RARE_SPAWN_CHANCE,
    PF_RARE_DEMAND_MULTIPLIER: PF_RARE_DEMAND_MULTIPLIER,
    PF_RARE_BY_DIMENSION: PF_RARE_BY_DIMENSION,
    PF_RARE_LORE: PF_RARE_LORE,
    pfTryRollRare: pfTryRollRare,
    // 稀客好感度 / 掉落
    PF_RARE_HEART_THRESHOLDS: PF_RARE_HEART_THRESHOLDS,
    PF_RARE_AFFECTION_SAT_OFFSET: PF_RARE_AFFECTION_SAT_OFFSET,
    PF_RARE_DEFAULT_DROPS: PF_RARE_DEFAULT_DROPS,
    pfRareHeartCount: pfRareHeartCount,
    pfRareHeartsText: pfRareHeartsText,
    pfRareModelSuffix: pfRareModelSuffix,
    pfRareFigureItemExpr: pfRareFigureItemExpr,
    pfRareDropsFor: pfRareDropsFor,
    pfRareGetPool: pfRareGetPool,
    pfRareFind: pfRareFind
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
// 输出种族需求范围配置
for (let raceKey in PF_RACE_DEMAND_RANGES) {
    let parts = []
    for (let p in PF_RACE_DEMAND_RANGES[raceKey]) {
        let r = PF_RACE_DEMAND_RANGES[raceKey][p]
        parts.push(p + ':' + r[0] + '-' + r[1])
    }
    console.log("[PF-CUSTOMER] 种族需求范围 " + raceKey + " → " + parts.join(', '))
}
console.log("[PF-CUSTOMER] 默认需求范围: 脚掌/脚后跟/脚趾/脚心 均为 0-2")
// 输出稀客池配置
for (let rareDimId in PF_RARE_BY_DIMENSION) {
    let rareNames = []
    for (let i = 0; i < PF_RARE_BY_DIMENSION[rareDimId].length; i++) {
        rareNames.push(PF_RARE_BY_DIMENSION[rareDimId][i].name)
    }
    console.log("[PF-RARE] 维度稀客池 " + rareDimId + "（" + rareNames.length + "位）: " + rareNames.join(', '))
}
console.log("[PF-RARE] 稀客系统已加载，生成概率=" + (PF_RARE_SPAWN_CHANCE * 100) + "%, 需求倍率=x" + PF_RARE_DEMAND_MULTIPLIER)
