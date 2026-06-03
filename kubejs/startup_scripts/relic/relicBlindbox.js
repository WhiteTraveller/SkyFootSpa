// priority: 8
// 芯片盲盒注册 - 每阶段一个盲盒物品

let BLINDBOX_STAGE_NAMES = {
    1: '§e芯片盲盒 · Ⅰ',
    2: '§6芯片盲盒 · Ⅱ',
    3: '§c芯片盲盒 · Ⅲ',
    4: '§d芯片盲盒 · Ⅳ',
    5: '§5芯片盲盒 · Ⅴ'
}

StartupEvents.registry('item', event => {
    for (let stage = 1; stage <= 5; stage++) {
        let box = event.create('marguerite:chip_blindbox_' + stage)
            .displayName(BLINDBOX_STAGE_NAMES[stage])
            .maxStackSize(16)
        // 盲盒外观（使用对应阶段芯片材质 pt3 作为代表）
        box.texture('kubejs:item/chip_lv' + stage + '_pt3')
    }
})
