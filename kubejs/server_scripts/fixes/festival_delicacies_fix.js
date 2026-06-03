// ============================================================
// 修复 Festival Delicacies 模组的拼写错误配方
// ------------------------------------------------------------
// 原配方错误: bamboo_leavse → bamboo_leaves
// ============================================================

ServerEvents.recipes(event => {
    // 移除错误配方
    event.remove({ id: 'festival_delicacies:fd_cooking/meat_zongzi_fd_cooking' })
    
    // 重新添加正确配方
    event.custom({
        type: 'farmersdelight:cooking',
        ingredients: [
            { tag: 'forge:crops/rice' },
            { item: 'festival_delicacies:preserved_meat' },
            { item: 'festival_delicacies:bamboo_leaves' },  // 修正拼写
            { item: 'festival_delicacies:bamboo_leaves' }
        ],
        result: { 
            item: 'festival_delicacies:meat_zongzi', 
            count: 2 
        },
        cookingtime: 200,
        experience: 1.0,
        recipe_book_tab: 'misc'
    }).id('kubejs:fd_cooking/meat_zongzi_fixed')
    
    console.log('[FIX] ✅ 已修复肉粽子配方拼写错误')
})
