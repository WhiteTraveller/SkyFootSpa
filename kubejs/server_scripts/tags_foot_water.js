// priority: 5
// ============================================================
// 洗脚水 Tag 注册
// ------------------------------------------------------------
// 为普通洗脚水和富魔洗脚水注册共同的 fluid tag 和 item tag，
// 使两种废水桶可以共享同一配方（如 FD 厨锅煮盐）。
// ============================================================

ServerEvents.tags('fluid', event => {
    // 流体 tag: kubejs:foot_water_type
    // 包含：普通洗脚水 + 富魔洗脚水
    event.add('kubejs:foot_water_type', 'kubejs:foot_water')
    event.add('kubejs:foot_water_type', 'kubejs:fuma_foot_water')
    console.log('[FOOT-WATER-TAG] fluid tag kubejs:foot_water_type 已注册（2种流体）')

    // 流体 tag: kubejs:fuma_plantoil (IE Mixer 输入必须使用 tag)
    event.add('kubejs:fuma_plantoil', 'kubejs:fuma_plantoil')
    console.log('[FOOT-WATER-TAG] fluid tag kubejs:fuma_plantoil 已注册（IE Mixer用）')

    // 流体 tag: kubejs:cun_water (备用，IE Mixer 等需要 tag 输入时使用)
    event.add('kubejs:cun_water', 'kubejs:cun_water')
    console.log('[FOOT-WATER-TAG] fluid tag kubejs:cun_water 已注册')
})

ServerEvents.tags('item', event => {
    // 物品 tag: kubejs:foot_water_bucket
    // 包含：普通洗脚水桶 + 富魔洗脚水桶
    event.add('kubejs:foot_water_bucket', 'kubejs:foot_water_bucket')
    event.add('kubejs:foot_water_bucket', 'kubejs:fuma_foot_water_bucket')
    console.log('[FOOT-WATER-TAG] item tag kubejs:foot_water_bucket 已注册（2种桶）')
})
