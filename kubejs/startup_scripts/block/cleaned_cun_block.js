// priority: 5
// ============================================================
// "洗净的皴块" 方块注册
// ------------------------------------------------------------
// 用途：皴块经水洗搅拌后得到的净化版本。
// 来源：皴块 + 水 → Create 动力搅拌（不加热） → 皴水 + 洗净的皴块
// 筛网产出：同皴块基础矿粒 + 额外煤炭产出（黄铜筛网30% / 进阶黄铜筛网45%）
// ============================================================

StartupEvents.registry("block", event => {
    try {
        let builder = event.create("marguerite:cleaned_cun_block")
            .displayName("§f洗净的皴块")
            .material("dirt")
            .soundType("gravel")
            .hardness(0.6)
            .resistance(0.6)
            .requiresTool(false)
            .tagBlock("minecraft:mineable/shovel")
            .tooltip("§7经过水洗净化的皴块")
            .tooltip("§8筛网可额外产出煤炭")
        // 贴图路径：assets/marguerite/textures/block/cleaned_cun_block.png
        console.log("[CUN] 已注册方块: marguerite:cleaned_cun_block")
    } catch (e) {
        console.log("[CUN] 洗净皴块注册失败: " + e)
    }
})
