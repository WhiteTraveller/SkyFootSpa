// priority: 5
// ============================================================
// 农夫乐事（farmersdelight）厨锅烹饪配方：泡脚废水桶 -> 盐
// ------------------------------------------------------------
// 参考：https://kubejs.com/wiki/addons/farmers-delight
//   event.recipes.farmersdelight.cooking(
//       ingredients[], output, exp, cookTime, container
//   )
// 第 5 个参数 container 为"返还容器物"——配方完成后会归还给玩家。
// 这里设为 minecraft:bucket，效果：消耗泡脚废水桶 -> 产出盐 + 归还空桶。
// ------------------------------------------------------------
// 输入：仅 kubejs:foot_water_bucket（已使用的洗脚废水桶）
// 产出：mekanism:salt × 1
// 经验：0.2  烹饪时间：200 tick (10s)
// ============================================================

ServerEvents.recipes(event => {
    let bucketId  = 'kubejs:foot_water_bucket'
    let salt      = 'mekanism:salt'
    let exp       = 0.2
    let cookTime  = 200
    let container = 'minecraft:bucket'

    try {
        event.recipes.farmersdelight.cooking(
            [bucketId],   // ingredients
            salt,         // output
            exp,
            cookTime,
            container
        ).id('kubejs:fd_cooking_salt_from_foot_water')
        console.log('[SOAK-FD-SALT] 厨锅配方已注册: ' + bucketId + ' -> ' + salt + ' (保留 ' + container + ')')
    } catch (e) {
        console.log('[SOAK-FD-SALT] 厨锅配方注册失败 ' + bucketId + ': ' + e)
    }
})
