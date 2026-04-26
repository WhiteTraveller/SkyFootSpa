// priority: 10
// ============================================================
// 常量定义模块
// 所有pathfinder相关的常量集中定义在此
// ============================================================

// 用于同步数据的手持物品ID
let SYNC_ITEM_ID = 'minecraft:redstone'

// 网格参数：以方块为中心，向四周延伸 GRID_HALF 格
let GRID_HALF = 20
let GRID_W = GRID_HALF * 2 + 1  // 49

// 可生成的实体类型
let PF_ENTITY_TYPE = "touhou_little_maid:maid"

// 需求清单类型定义
const PF_DEMAND_TYPES = ['脚背', '脚掌', '脚后跟', '脚趾', '脚心']

// 方向列表
let PF_DIRLIST = ['N', 'S', 'W', 'E']
let PF_OPPODIRLIST = ['S', 'N', 'E', 'W']

// 羊毛颜色与部位对应关系
let WOOL_TO_DEMAND = {
    'minecraft:red_wool': 'pfDemandJiaobei',    // 红色羊毛 → 脚背
    'minecraft:white_wool': 'pfDemandJiaozhang', // 白色羊毛 → 脚掌
    'minecraft:green_wool': 'pfDemandJiaogen',   // 绿色羊毛 → 脚后跟
    'minecraft:black_wool': 'pfDemandJiaozhi',   // 黑色羊毛 → 脚趾
    'minecraft:yellow_wool': 'pfDemandJiaoxin'   // 黄色羊毛 → 脚心
}

// 需求键值与后缀映射
let DEMAND_KEY_TO_SUFFIX = {
    'pfDemandJiaobei': 'Jiaobei',
    'pfDemandJiaozhang': 'Jiaozhang',
    'pfDemandJiaogen': 'Jiaogen',
    'pfDemandJiaozhi': 'Jiaozhi',
    'pfDemandJiaoxin': 'Jiaoxin'
}

// 需求键值与整数代码映射（用于NBT整数数组存储）
let DEMAND_KEY_TO_CODE = {
    'pfDemandJiaobei': 1,    // 脚背
    'pfDemandJiaozhang': 2,  // 脚掌
    'pfDemandJiaogen': 3,    // 脚后跟
    'pfDemandJiaozhi': 4,    // 脚趾
    'pfDemandJiaoxin': 5     // 脚心
}

// 导出到全局
global.pfConstants = {
    SYNC_ITEM_ID: SYNC_ITEM_ID,
    GRID_HALF: GRID_HALF,
    GRID_W: GRID_W,
    PF_ENTITY_TYPE: PF_ENTITY_TYPE,
    PF_DEMAND_TYPES: PF_DEMAND_TYPES,
    PF_DIRLIST: PF_DIRLIST,
    PF_OPPODIRLIST: PF_OPPODIRLIST,
    WOOL_TO_DEMAND: WOOL_TO_DEMAND,
    DEMAND_KEY_TO_SUFFIX: DEMAND_KEY_TO_SUFFIX,
    DEMAND_KEY_TO_CODE: DEMAND_KEY_TO_CODE
}
