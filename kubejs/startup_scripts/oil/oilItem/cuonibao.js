// priority: 9
// ============================================================
// Oil 系统 - 搓泥宝
// ------------------------------------------------------------
// 玩家副手持有"搓泥宝"时，搓脚掉落的「皴」数量翻倍（×2），
// 每次有效点击消耗 1 耐久（创意模式不消耗）。
// 掉落加成逻辑在 server_scripts/pathfinder/pfCunDrop.js。
// ============================================================

global.oilRegister.register(oil => {
    oil.setName("cuonibao")
        .setNameZH("搓泥宝")
        .setDescription(Text.gray("副手持有时，搓脚「皴」掉落数量 ×2"))
        .setDurability(32)
        .setTags([global.oilTags.oil])
})
