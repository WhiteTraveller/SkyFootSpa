// priority: 9
// ============================================================
// Oil 系统 - 油定义示例
// 说明：
// - 新增油时，复制本文件改参数即可
// - 物品本体由 oil/oil.js 统一批量注册
// ============================================================

global.oilRegister.register(oil => {
    oil.setName("example_oil")
        .setNameZH("示例精油")
        .setDescription(Text.gray("这是一个示例油"))
        .setDurability(16)
        .setTags([global.oilTags.oil])
})
