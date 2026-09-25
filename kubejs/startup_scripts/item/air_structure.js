// priority: 5
// ============================================================
// 旧地狱建筑物品注册（marguerite:air_structure）
// ------------------------------------------------------------
// 右键以玩家当前位置为中心放置 old_hell 建筑结构（100×67×100，含地形与建筑）。
// 右键逻辑：server_scripts/item/air_structure.js
// 结构文件：kubejs/data/marguerite/structures/old_hell.nbt（结构ID marguerite:old_hell）
// 注：物品 id 仍沿用 marguerite:air_structure（避免破坏已有引用/give 命令）
// ============================================================

global.AIR_STRUCTURE_ITEM = {
    id: "marguerite:air_structure",
    structureId: "marguerite:old_hell",
    sizeX: 100, sizeY: 67, sizeZ: 100,   // old_hell.nbt 实际尺寸（宽×高×深），有建筑非纯空气
    allowedDimension: "marguerite:old_hell"   // 仅此维度（旧地狱）可用
}

StartupEvents.registry("item", event => {
    try {
        event.create("marguerite:air_structure")
            .displayName("§b旧地狱建筑")
            .maxStackSize(16)
            .tooltip("§7右键：以自身为中心放置 §b100×67×100 §7旧地狱建筑结构")
            .tooltip("§c仅限在旧地狱维度使用")
            .texture("minecraft:item/glass_bottle")
        console.log("[AIR-STRUCTURE] 已注册物品: marguerite:air_structure (放置 old_hell 建筑)")
    } catch (e) {
        console.log("[AIR-STRUCTURE] 物品注册失败: " + e)
    }
})
