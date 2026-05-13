// priority: 5
// ============================================================
// "皴块" 方块注册
// ------------------------------------------------------------
// 用途：9 个皴压缩而成的方块，可投入 Create: Sifter 筛出金属颗粒。
// 合成：9 皴 → 1 皴块（见 server_scripts/recipes_cun.js）。
// 筛网产出：铁粒 / 铜粒 / 锌粒 / 金粒（见 server_scripts/recipes_cun.js）。
// ============================================================

StartupEvents.registry("block", event => {
    try {
        let builder = event.create("marguerite:cun_block")
            .displayName("§f皴块")
            .material("dirt")
            .soundType("gravel")
            .hardness(0.6)
            .resistance(0.6)
            .requiresTool(false)
            .tagBlock("minecraft:mineable/shovel")
            .tooltip("§7九个皴压缩而成")
            .tooltip("§8可放入筛网筛出金属颗粒")
        // 贴图路径：assets/marguerite/textures/block/cun_block.png（KubeJS 默认识别）
        console.log("[CUN] 已注册方块: marguerite:cun_block")
    } catch (e) {
        console.log("[CUN] 方块注册失败: " + e)
    }
})
