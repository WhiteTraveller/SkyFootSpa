// ============================================================
// 注册消耗品：精油
// ============================================================

StartupEvents.registry('item', event => {
    event.create('marguerite:oil')
        .displayName('精油')
        .unstackable()
        .maxDamage(16)
})
