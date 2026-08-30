// priority: 8
// ============================================================
// Oil 系统 - 物品批量注册
// 说明：
// - 所有油的“定义”在 oilRegister.oils 中收集
// - 本文件负责把定义批量转成真正的物品注册（StartupEvents.registry）
// ============================================================

StartupEvents.registry('item', event => {
    let oils = global.oilRegister.oils
    for (let i = 0; i < oils.length; i++) {
        let oil = oils[i]
        let e = event.create(oil.getOilId())
            .displayName(oil.nameZH && oil.nameZH.length > 0 ? oil.nameZH : oil.name)
            .unstackable()
            .maxDamage(oil.durability)

        for (let j = 0; j < oil.tags.length; j++) {
            let tag = oil.tags[j]
            if (tag) {
                e.tag(tag.id)
            } else {
                console.warn("Oil tag is null: " + oil)
            }
        }
    }
})
