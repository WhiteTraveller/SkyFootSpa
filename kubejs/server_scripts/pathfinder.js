// ============================================================
// 寻路系统主入口 - 模块化版本
// ============================================================
// 
// 所有子模块通过 priority: 10 确保在此文件之前加载
// 子模块列表（按依赖顺序）：
// 1. pfConstants.js     - 常量定义
// 2. pfNbtSync.js       - NBT同步工具
// 3. pfPathfinding.js   - BFS寻路算法
// 4. pfBedManager.js    - 床位管理
// 5. pfEntityData.js    - 实体数据控制
// 6. pfSleepManager.js  - 睡眠管理
// 7. pfSoakManager.js   - 泡脚管理
// 8. pfMovement.js      - 实体移动与排队
// 9. pfEntitySpawner.js - 实体生成
// 10. pfNetworkHandler.js - 网络事件处理
// 11. pfBlockHandler.js - 方块事件处理
// 12. pfMain.js         - 主循环
//
// 此文件保留作为兼容层，实际的 global.pathfinderTick 定义在 pfMain.js 中
// ============================================================

console.log("[PF] pathfinder.js 主入口已加载（模块化版本）")

// 设置网络事件处理器（由 pfNetworkHandler.js 提供）
if (global.pfNetworkHandler && typeof global.pfNetworkHandler.setupNetworkHandlers === "function") {
    global.pfNetworkHandler.setupNetworkHandlers()
    console.log("[PF] 网络事件处理器已设置")
}
