// 占位：防止 server_scripts 还未加载时报错
global.pathfinderTick = function (entity) {}

// ============================================================
// 注册寻路触发方块
// ============================================================

StartupEvents.registry("block", (event) => {
    event.create("pathfinder_block")
        .textureAll("kubejs:block/pathfinder_block")
        .displayName("寻路触发器")
        .unbreakable()
        .blockEntity((entityInfo) => {
            entityInfo.serverTick(1, 0, (entity) => {
                global.pathfinderTick(entity)
            })
        })
})
