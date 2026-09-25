// priority: 10
// ============================================================
// 顾客等级系统模块
// ------------------------------------------------------------
// 等级默认 1-5 级，每次生成顾客时随机选取一个。
// 等级数值存储在实体手持同步物品（SYNC_ITEM_ID）的 NBT 字段
// pfLevel 中，当前只有数值，无任何功能效果。
// pfRefreshNameTag 负责在顾客头顶显示"种族 + 等级"，
// 需要在种族名（类别名 / Boss 名）确定后由调用方调用。
// ============================================================

let PF_LEVEL_MIN = 1
let PF_LEVEL_MAX = 5

/**
 * 随机 roll 一个等级（1-5）
 * @returns {number} 等级
 */
function pfRollLevel() {
    return PF_LEVEL_MIN + Math.floor(Math.random() * (PF_LEVEL_MAX - PF_LEVEL_MIN + 1))
}

/**
 * 将等级写入实体手持物品 NBT
 * @param {$LivingEntity_} entity 顾客实体
 * @param {number} level 等级
 */
function pfSetLevel(entity, level) {
    let item = entity.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        let nbt = item.nbt
        nbt.pfLevel = level
        entity.setMainHandItem(item.withNBT(nbt))
    }
}

/**
 * 从实体手持物品 NBT 读取等级
 * @param {$LivingEntity_} entity 顾客实体
 * @returns {number} 等级（无数据返回 0）
 */
function pfGetLevel(entity) {
    let item = entity.getMainHandItem()
    if (item && item.id === global.pfConstants.SYNC_ITEM_ID && item.nbt) {
        return item.nbt.getInt('pfLevel') || 0
    }
    return 0
}

/**
 * 刷新实体头顶名牌：显示种族 + 等级
 * @param {$LivingEntity_} entity 顾客实体
 * @param {string} raceName 种族/类别显示名（Boss 传 bossDef.name）
 */
function pfRefreshNameTag(entity, raceName) {
    let level = pfGetLevel(entity)
    entity.setCustomName(Text.of((raceName || '顾客') + ' §7Lv.' + level))
    entity.setCustomNameVisible(true)
}

// 导出到全局
global.pfCustomerLevel = {
    PF_LEVEL_MIN: PF_LEVEL_MIN,
    PF_LEVEL_MAX: PF_LEVEL_MAX,
    pfRollLevel: pfRollLevel,
    pfSetLevel: pfSetLevel,
    pfGetLevel: pfGetLevel,
    pfRefreshNameTag: pfRefreshNameTag
}

console.log("[PF-LEVEL] 顾客等级系统已加载，等级范围 " + PF_LEVEL_MIN + "-" + PF_LEVEL_MAX)
