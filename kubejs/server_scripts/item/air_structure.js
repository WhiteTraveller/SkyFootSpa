// ============================================================
// 旧地狱建筑物品 · 右键放置逻辑
// ------------------------------------------------------------
// 依赖：global.AIR_STRUCTURE_ITEM (startup_scripts/item/air_structure.js)
//       结构 marguerite:old_hell (kubejs/data/marguerite/structures/old_hell.nbt)
// 效果：以玩家当前位置为中心放置 old_hell 建筑结构（100×67×100，含地形与建筑）。
//   · 仅限旧地狱维度（cfg.allowedDimension）使用，其它维度右键提示且不消耗物品
//   · 结构尺寸 sizeX×sizeY×sizeZ，各轴中心偏移 = 对应尺寸/2
//   · /place template 以“原点=最小角”向 +XYZ 延伸，故原点 = 玩家坐标 - 半尺寸
//   · 用 execute in <玩家维度> run place template 确保在玩家所在维度放置
//     （place template 放 .nbt 结构模板；place structure 是世界生成结构，用错会找不到）
//   · 每次消耗 1 个（创造模式免）
//   · 放置大量方块有性能成本，附加短冷却防连点卡服
// ============================================================

// 取玩家所在维度的干净 ID（兼容 ResourceKey[minecraft:dimension / ns:path] 格式）
function airCurrentDimId(player) {
    let dimId = '' + player.getLevel().getDimension()
    let slash = dimId.indexOf(' / ')
    if (slash >= 0) {
        dimId = dimId.substring(slash + 3)
        if (dimId.charAt(dimId.length - 1) === ']') dimId = dimId.substring(0, dimId.length - 1)
    }
    return dimId
}

ItemEvents.rightClicked(event => {
    let player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    let item = event.getItem()
    if (!item) return

    let cfg = global.AIR_STRUCTURE_ITEM
    if (!cfg) return
    if (('' + item.getId()) !== cfg.id) return

    // 维度检测：仅限旧地狱维度可用（不在则提示且不消耗物品）
    let dimId = airCurrentDimId(player)
    if (cfg.allowedDimension && dimId !== cfg.allowedDimension) {
        player.tell(Text.red('[旧地狱建筑] 只能在旧地狱维度使用（当前维度：' + dimId + '）'))
        return
    }

    // 以玩家为中心：放置原点(最小角) = 玩家坐标 - 各轴半尺寸（old_hell 为 100×67×100）
    let cx = Math.floor(player.x)
    let cy = Math.floor(player.y)
    let cz = Math.floor(player.z)
    let ox = cx - 65
    let oy = cy - 10
    let oz = cz - 50

    // 消耗物品（创造模式免）
    if (!player.isCreative()) {
        item.shrink(1)
    }

    // 放置建筑结构模板（place template 从 data/<ns>/structures/ 加载 .nbt）
    //   · execute in <dim>：runCommandSilent 默认在主世界执行，必须显式切到玩家所在维度
    let cmd = 'execute in ' + dimId + ' run place template ' + cfg.structureId + ' ' + ox + ' ' + oy + ' ' + oz
    console.log('[AIR-STRUCTURE] 放置命令: ' + cmd)
    let result = player.server.runCommandSilent(cmd)

    if (result <= 0) {
        player.tell(Text.red('[旧地狱建筑] 放置失败：结构模板 ' + cfg.structureId + ' 可能未加载，请先 /reload 或重进世界'))
        return
    }

    player.tell(Text.aqua('[旧地狱建筑] 已放置 ' + cfg.sizeX + '×' + cfg.sizeY + '×' + cfg.sizeZ + ' 结构（中心 ' + cx + ',' + cy + ',' + cz + '）'))

    // 短冷却防连点：放置大量方块有性能成本（40 tick = 2 秒）
    player.addItemCooldown(item.getItem(), 40)
})

console.log('[AIR-STRUCTURE] 右键放置逻辑已加载 (marguerite:old_hell, 仅旧地狱, 中心对齐, 消耗1个)')
