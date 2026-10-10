// 占位：防止 server_scripts 还未加载时报错
global.pathfinderTick = function (entity) {}

// ============================================================
// 注册寻路触发方块
// ============================================================

const PF_CONFIG_INVENTORY_COLUMNS = 9
const PF_CONFIG_INVENTORY_ROWS = 3

StartupEvents.registry("block", (event) => {
    event.create("pathfinder_block")
        .textureAll("kubejs:block/pathfinder_block")
        .displayName("寻路触发器")
        .unbreakable()
        .blockEntity((entityInfo) => {
            // 配置界面直接绑定此方块实体的 9x3 持久库存。
            // AUI 1.2.5.3 的 saveddata 槽位在取出物品时会触发
            // FilteredItemHandler -> IItemHandlerModifiable 强制转换异常；
            // KubeJS 方块库存会走 AUI 官方支持的 Container 数据源路径。
            entityInfo.inventory(PF_CONFIG_INVENTORY_COLUMNS, PF_CONFIG_INVENTORY_ROWS)
            entityInfo.serverTick(1, 0, (entity) => {
                global.pathfinderTick(entity)
            })
        })
})
