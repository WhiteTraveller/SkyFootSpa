// priority: 10
// ============================================================
// 寻路算法模块
// BFS广度优先搜索实现
// ============================================================

/**
 * 将世界坐标转换为网格数字索引
 * @param {$BlockPos_} base  触发方块坐标
 * @param {$BlockPos_} target 目标坐标
 * @returns {number}
 */
function pfPos2num(base, target) {
    let bx = base.getX() | 0
    let bz = base.getZ() | 0
    let tx = target.getX() | 0
    let tz = target.getZ() | 0
    return (tx - (bx - global.pfConstants.GRID_HALF)) + (tz - (bz - global.pfConstants.GRID_HALF)) * global.pfConstants.GRID_W
}

/**
 * 从数字坐标按 NSWE 方向移动一格
 * @param {number} pos
 * @param {string} dir
 * @returns {number} 边界外返回 -1
 */
function pfPosmv(pos, dir) {
    let maxIdx = global.pfConstants.GRID_W * global.pfConstants.GRID_W - 1
    switch (dir) {
        case 'N': return (pos - global.pfConstants.GRID_W >= 0) ? (pos - global.pfConstants.GRID_W) : -1
        case 'S': return (pos + global.pfConstants.GRID_W <= maxIdx) ? (pos + global.pfConstants.GRID_W) : -1
        case 'W': return (pos % global.pfConstants.GRID_W !== 0) ? (pos - 1) : -1
        case 'E': return (pos % global.pfConstants.GRID_W !== global.pfConstants.GRID_W - 1) ? (pos + 1) : -1
    }
    return -1
}

/**
 * 广度优先搜索
 * @param {number} start    起点数字索引
 * @param {Set}    finish   终点数字索引集合
 * @param {Array}  map      地图数组：0=可走, -1=不可走
 * @param {Array}  routes   已有路径列表（用于避让）
 * @returns {Array|number}  [路径字符串, 终点索引] 或 -1（无法到达）
 */
function pfBfs(start, finish, map, routes) {
    let visitmark = []
    let bfsqueue = []
    bfsqueue.push([start, 0])
    visitmark[start] = -1
    let now = []
    while (bfsqueue.length > 0) {
        now = bfsqueue.shift()
        if (finish.has(now[0])) break
        for (let i = 0; i < 4; i++) {
            let target = pfPosmv(now[0], global.pfConstants.PF_DIRLIST[i])
            if (target === -1) continue
            if (visitmark[target] !== undefined) continue
            if (map[target] === -1) continue
            // 避让逻辑
            let invalidflag = false
            for (let j = 0; j < routes.length; j++) {
                if (routes[j][now[1] + 1] === target ||
                    routes[j][now[1]] === target ||
                    routes[j][now[1] - 1] === target) {
                    invalidflag = true
                    break
                }
            }
            if (invalidflag) continue
            bfsqueue.push([target, now[1] + 1])
            visitmark[target] = i
        }
    }
    if (!finish.has(now[0])) return -1
    let end = now[0]
    let str = ""
    while (end !== start) {
        str = global.pfConstants.PF_DIRLIST[visitmark[end]] + str
        end = pfPosmv(end, global.pfConstants.PF_OPPODIRLIST[visitmark[end]])
    }
    return [str, now[0]]
}

// 导出到全局
global.pfPathfinding = {
    pfPos2num: pfPos2num,
    pfPosmv: pfPosmv,
    pfBfs: pfBfs
}
