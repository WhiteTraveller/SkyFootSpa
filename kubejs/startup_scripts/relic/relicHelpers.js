// priority: 10
// 遗物位置判定与计数辅助函数
// 背包固定6行9列(54格)，未解锁区域填充backpack_space

let COLS = 9
let ROWS = 6
let TOTAL_SLOTS = 54

let RELIC_PARTS = ['jiaobei', 'jiaozhang', 'jiaogen', 'jiaozhi', 'jiaoxin']
let MONEY_ATTR = 'kubejs:serve.money_gain.'
let SAT_ATTR = 'kubejs:serve.sat_gain.'

// ========== 属性修改快捷函数 ==========

// 全部位金钱修改
global.modifyAllMoney = function(player, modName, value) {
    for (let p = 0; p < RELIC_PARTS.length; p++) {
        player.modifyAttribute(MONEY_ATTR + RELIC_PARTS[p], modName, value, 'addition')
    }
}

// 全部位满意度修改
global.modifyAllSat = function(player, modName, value) {
    for (let p = 0; p < RELIC_PARTS.length; p++) {
        player.modifyAttribute(SAT_ATTR + RELIC_PARTS[p], modName, value, 'addition')
    }
}

// ========== 位置查询函数 ==========

// 判断某一行是否整行都是backpack_space（即该行不存在）
global.isRowAllSpace = function(row, curiosAll) {
    for (let c = 0; c < COLS; c++) {
        if (curiosAll.getStackInSlot(row * COLS + c).getId() != "marguerite:backpack_space") {
            return false
        }
    }
    return true
}

// 获取同行所有槽位（不含自身，排除backpack_space槽位）
global.getSameRowSlots = function(i, curiosAll) {
    let row = Math.floor(i / COLS)
    let slots = []
    for (let c = 0; c < COLS; c++) {
        let idx = row * COLS + c
        if (idx == i) continue
        if (curiosAll && curiosAll.getStackInSlot(idx).getId() == "marguerite:backpack_space") continue
        slots.push(idx)
    }
    return slots
}

// 获取同列所有槽位（不含自身，排除backpack_space槽位）
global.getSameColSlots = function(i, curiosAll) {
    let col = i % COLS
    let slots = []
    for (let r = 0; r < ROWS; r++) {
        let idx = r * COLS + col
        if (idx == i) continue
        if (curiosAll && curiosAll.getStackInSlot(idx).getId() == "marguerite:backpack_space") continue
        slots.push(idx)
    }
    return slots
}

// 检查是否在首行（物理首行，或上方所有行全是backpack_space）
global.isFirstRow = function(i, curiosAll) {
    let myRow = Math.floor(i / COLS)
    if (myRow === 0) return true
    if (!curiosAll) return false
    for (let r = 0; r < myRow; r++) {
        if (!global.isRowAllSpace(r, curiosAll)) return false
    }
    return true
}

// 检查是否在底部行（下方所有行全是backpack_space）
global.isBottomRow = function(i, curiosAll) {
    let myRow = Math.floor(i / COLS)
    for (let r = myRow + 1; r < ROWS; r++) {
        if (!global.isRowAllSpace(r, curiosAll)) return false
    }
    return true
}

// 检查是否在底部2行
global.isBottomTwoRows = function(i, curiosAll) {
    // 找到最后一个存在的行（非全backpack_space）
    let bottomRow = -1
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!global.isRowAllSpace(r, curiosAll)) {
            bottomRow = r
            break
        }
    }
    if (bottomRow < 0) return false
    let myRow = Math.floor(i / COLS)
    return myRow >= bottomRow - 1
}

// 获取底部2行所有槽位（排除backpack_space槽位）
global.getBottomTwoRowSlots = function(curiosAll) {
    let bottomRow = -1
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!global.isRowAllSpace(r, curiosAll)) {
            bottomRow = r
            break
        }
    }
    if (bottomRow < 0) return []
    let slots = []
    let startRow = Math.max(0, bottomRow - 1)
    for (let r = startRow; r <= bottomRow; r++) {
        for (let c = 0; c < COLS; c++) {
            let idx = r * COLS + c
            if (curiosAll.getStackInSlot(idx).getId() != "marguerite:backpack_space") {
                slots.push(idx)
            }
        }
    }
    return slots
}

// 检查是否在中心2×3区域
global.isInCenter2x3 = function(i) {
    let row = Math.floor(i / COLS)
    let col = i % COLS
    let centerRowStart = Math.floor((ROWS - 2) / 2)
    let centerColStart = Math.floor((COLS - 3) / 2)
    return row >= centerRowStart && row < centerRowStart + 2 &&
           col >= centerColStart && col < centerColStart + 3
}

// 获取中心2×3区域所有槽位
global.getCenter2x3Slots = function() {
    let slots = []
    let centerRowStart = Math.floor((ROWS - 2) / 2)
    let centerColStart = Math.floor((COLS - 3) / 2)
    for (let r = centerRowStart; r < centerRowStart + 2; r++) {
        for (let c = centerColStart; c < centerColStart + 3; c++) {
            slots.push(r * COLS + c)
        }
    }
    return slots
}

// 获取对角线方向所有槽位（不含自身）
global.getDiagonalSlots = function(i) {
    let row = Math.floor(i / COLS)
    let col = i % COLS
    let slots = []
    let dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (let d = 0; d < dirs.length; d++) {
        let dr = dirs[d][0]
        let dc = dirs[d][1]
        let r = row + dr
        let c = col + dc
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            slots.push(r * COLS + c)
            r += dr
            c += dc
        }
    }
    return slots
}

// ========== 计数函数 ==========

// 判断槽位是否有有效遗物（非空且非backpack_space）
global.isValidRelic = function(stack) {
    return !stack.isEmpty() && stack.getId() != "marguerite:backpack_space"
}

// 计算指定槽位中有效遗物数量
global.countRelicsInSlots = function(slots, curiosAll) {
    let count = 0
    for (let s = 0; s < slots.length; s++) {
        if (global.isValidRelic(curiosAll.getStackInSlot(slots[s]))) {
            count++
        }
    }
    return count
}

// 计算指定槽位中的空位数量（存在但无遗物的格子，backpack_space不算空位因为它不存在）
global.countEmptyInSlots = function(slots, curiosAll) {
    let count = 0
    for (let s = 0; s < slots.length; s++) {
        let stack = curiosAll.getStackInSlot(slots[s])
        // backpack_space视为不存在，不计入空位
        if (stack.getId() == "marguerite:backpack_space") continue
        // 空的有效格子才算空位
        if (stack.isEmpty() || !global.isValidRelic(stack)) {
            count++
        }
    }
    return count
}

// ========== 标签查询函数 ==========

// 懒加载遗物标签映射表
global.relicTagMap = null

global.ensureRelicTagMap = function() {
    if (global.relicTagMap) return
    global.relicTagMap = {}
    for (let r = 0; r < global.relicRegister.relics.length; r++) {
        let relic = global.relicRegister.relics[r]
        let id = "marguerite:" + relic.name
        global.relicTagMap[id] = relic.tags || []
    }
}

// 检查物品是否有指定标签
global.itemHasRelicTag = function(stack, tagId) {
    if (!global.isValidRelic(stack)) return false
    global.ensureRelicTagMap()
    let id = stack.getId()
    let tags = global.relicTagMap[id]
    if (!tags) return false
    for (let t = 0; t < tags.length; t++) {
        if (tags[t] && tags[t].id == tagId) return true
    }
    return false
}

// 计算指定槽位中含特定标签的遗物数量
global.countTagInSlots = function(slots, tagId, curiosAll) {
    let count = 0
    for (let s = 0; s < slots.length; s++) {
        if (global.itemHasRelicTag(curiosAll.getStackInSlot(slots[s]), tagId)) {
            count++
        }
    }
    return count
}

// 检查指定槽位中是否有特定标签的遗物
global.hasTagInSlots = function(slots, tagId, curiosAll) {
    for (let s = 0; s < slots.length; s++) {
        if (global.itemHasRelicTag(curiosAll.getStackInSlot(slots[s]), tagId)) {
            return true
        }
    }
    return false
}

// 统计背包中所有遗物的不同标签种类数
global.countUniqueTagsInBackpack = function(curiosAll) {
    global.ensureRelicTagMap()
    let tagSet = {}
    for (let s = 0; s < TOTAL_SLOTS; s++) {
        let stack = curiosAll.getStackInSlot(s)
        if (!global.isValidRelic(stack)) continue
        let id = stack.getId()
        let tags = global.relicTagMap[id]
        if (!tags) continue
        for (let t = 0; t < tags.length; t++) {
            if (tags[t]) tagSet[tags[t].id] = true
        }
    }
    let count = 0
    for (let k in tagSet) { count++ }
    return count
}

// 统计指定槽位中不同标签种类数
global.countUniqueTagsInSlots = function(slots, curiosAll) {
    global.ensureRelicTagMap()
    let tagSet = {}
    for (let s = 0; s < slots.length; s++) {
        let stack = curiosAll.getStackInSlot(slots[s])
        if (!global.isValidRelic(stack)) continue
        let id = stack.getId()
        let tags = global.relicTagMap[id]
        if (!tags) continue
        for (let t = 0; t < tags.length; t++) {
            if (tags[t]) tagSet[tags[t].id] = true
        }
    }
    let count = 0
    for (let k in tagSet) { count++ }
    return count
}

// 获取CuriosAPI和装备
global.getCuriosAll = function(player) {
    let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')
    let curiosHelper = curiosApi.getCuriosHelper()
    return curiosHelper.getEquippedCurios(player).resolve().get()
}
