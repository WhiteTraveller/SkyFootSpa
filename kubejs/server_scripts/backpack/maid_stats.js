// ============================================================
// 女仆 Curios 饰品属性统计 - 服务端
// ------------------------------------------------------------
// 女仆的遗物效果写在 relic.onLoad 里（KubeJS modifyAttribute）。
// 女仆现在已经挂载 kubejs:serve.* 属性，真实属性由
// updateMaidBackpack() 重算；这里的“沙盘”只用于按饰品逐件列出来源，
// 不再把它当作实际结算值。位置判定辅助函数临时切换为 TLM 的 6×6 网格，
// 执行结束后立刻还原。
//
// 统计结果通过 pf_maid_stats_sync 回推给客户端，由 AUI overlay 展示。
// ============================================================

let MaidCuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')

// 女仆饰品页布局：6 × 6
const PF_MAID_GRID_COLS = 6
const PF_MAID_GRID_ROWS = 6
const PF_MAID_GRID_SLOTS = PF_MAID_GRID_COLS * PF_MAID_GRID_ROWS

const PF_MAID_PART_LABELS = {
    jiaozhi: '脚趾',
    jiaozhang: '脚掌',
    jiaoxin: '脚心',
    jiaogen: '脚后跟',
    jiaobei: '脚背'
}

const PF_MAID_SERVE_LABELS = {
    money_gain: '金钱',
    sat_gain: '满意度',
    stamina_cost: '体力消耗'
}

const PF_MAID_ATTR_LABELS = {
    'generic.max_health': '生命上限',
    'generic.follow_range': '跟随范围',
    'generic.knockback_resistance': '击退抗性',
    'generic.movement_speed': '移动速度',
    'generic.flying_speed': '飞行速度',
    'generic.attack_damage': '攻击伤害',
    'generic.attack_knockback': '攻击击退',
    'generic.attack_speed': '攻击速度',
    'generic.armor': '护甲',
    'generic.armor_toughness': '护甲韧性',
    'generic.luck': '幸运',
    'l2damagetracker:crit_rate': '暴击率'
}

function pfMaidAttrLabel(id) {
    let s = '' + id
    if (PF_MAID_ATTR_LABELS[s]) return PF_MAID_ATTR_LABELS[s]
    let prefix = 'kubejs:serve.'
    if (s.indexOf(prefix) === 0) {
        let rest = s.substring(prefix.length)
        let dot = rest.indexOf('.')
        let type = dot < 0 ? rest : rest.substring(0, dot)
        let part = dot < 0 ? '' : rest.substring(dot + 1)
        let label = PF_MAID_SERVE_LABELS[type] || type
        if (part.length > 0) label += '·' + (PF_MAID_PART_LABELS[part] || part)
        return label
    }
    return s
}

function pfMaidFindRelic(itemId) {
    let relics = global.relicRegister.relics
    for (let i = 0; i < relics.length; i++) {
        if (global.getRelicId(relics[i].name) === itemId) return relics[i]
    }
    return null
}

const PF_MAID_STATS_ATTRS = []
for (let p in PF_MAID_PART_LABELS) {
    PF_MAID_STATS_ATTRS.push('kubejs:serve.sat_gain.' + p)
    PF_MAID_STATS_ATTRS.push('kubejs:serve.money_gain.' + p)
    PF_MAID_STATS_ATTRS.push('kubejs:serve.stamina_cost.' + p)
}

// ========== 6×6 位置判定（临时替换 global 辅助函数） ==========

function pfMaidRowAllSpace(row, curiosAll) {
    for (let c = 0; c < PF_MAID_GRID_COLS; c++) {
        let stack = curiosAll.getStackInSlot(row * PF_MAID_GRID_COLS + c)
        if (!global.isSpacePanelId('' + stack.getId())) return false
    }
    return true
}

function pfMaidSameRowSlots(i, curiosAll) {
    let row = Math.floor(i / PF_MAID_GRID_COLS)
    let slots = []
    for (let c = 0; c < PF_MAID_GRID_COLS; c++) {
        let idx = row * PF_MAID_GRID_COLS + c
        if (idx === i) continue
        if (curiosAll && global.isSpacePanelId('' + curiosAll.getStackInSlot(idx).getId())) continue
        slots.push(idx)
    }
    return slots
}

function pfMaidSameColSlots(i, curiosAll) {
    let col = i % PF_MAID_GRID_COLS
    let slots = []
    for (let r = 0; r < PF_MAID_GRID_ROWS; r++) {
        let idx = r * PF_MAID_GRID_COLS + col
        if (idx === i) continue
        if (curiosAll && global.isSpacePanelId('' + curiosAll.getStackInSlot(idx).getId())) continue
        slots.push(idx)
    }
    return slots
}

function pfMaidIsFirstRow(i, curiosAll) {
    let myRow = Math.floor(i / PF_MAID_GRID_COLS)
    if (myRow === 0) return true
    if (!curiosAll) return false
    for (let r = 0; r < myRow; r++) {
        if (!pfMaidRowAllSpace(r, curiosAll)) return false
    }
    return true
}

function pfMaidIsBottomRow(i, curiosAll) {
    let myRow = Math.floor(i / PF_MAID_GRID_COLS)
    for (let r = myRow + 1; r < PF_MAID_GRID_ROWS; r++) {
        if (!pfMaidRowAllSpace(r, curiosAll)) return false
    }
    return true
}

function pfMaidIsBottomTwoRows(i, curiosAll) {
    let bottomRow = -1
    for (let r = PF_MAID_GRID_ROWS - 1; r >= 0; r--) {
        if (!pfMaidRowAllSpace(r, curiosAll)) {
            bottomRow = r
            break
        }
    }
    if (bottomRow < 0) return false
    return Math.floor(i / PF_MAID_GRID_COLS) >= bottomRow - 1
}

function pfMaidBottomTwoRowSlots(curiosAll) {
    let bottomRow = -1
    for (let r = PF_MAID_GRID_ROWS - 1; r >= 0; r--) {
        if (!pfMaidRowAllSpace(r, curiosAll)) {
            bottomRow = r
            break
        }
    }
    if (bottomRow < 0) return []
    let slots = []
    let startRow = Math.max(0, bottomRow - 1)
    for (let r = startRow; r <= bottomRow; r++) {
        for (let c = 0; c < PF_MAID_GRID_COLS; c++) {
            let idx = r * PF_MAID_GRID_COLS + c
            if (!global.isSpacePanelId('' + curiosAll.getStackInSlot(idx).getId())) slots.push(idx)
        }
    }
    return slots
}

function pfMaidIsInCenter2x3(i) {
    let row = Math.floor(i / PF_MAID_GRID_COLS)
    let col = i % PF_MAID_GRID_COLS
    let centerRowStart = Math.floor((PF_MAID_GRID_ROWS - 2) / 2)
    let centerColStart = Math.floor((PF_MAID_GRID_COLS - 3) / 2)
    return row >= centerRowStart && row < centerRowStart + 2 &&
           col >= centerColStart && col < centerColStart + 3
}

function pfMaidCenter2x3Slots() {
    let slots = []
    let centerRowStart = Math.floor((PF_MAID_GRID_ROWS - 2) / 2)
    let centerColStart = Math.floor((PF_MAID_GRID_COLS - 3) / 2)
    for (let r = centerRowStart; r < centerRowStart + 2; r++) {
        for (let c = centerColStart; c < centerColStart + 3; c++) {
            slots.push(r * PF_MAID_GRID_COLS + c)
        }
    }
    return slots
}

function pfMaidDiagonalSlots(i) {
    let row = Math.floor(i / PF_MAID_GRID_COLS)
    let col = i % PF_MAID_GRID_COLS
    let slots = []
    let dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (let d = 0; d < dirs.length; d++) {
        let dr = dirs[d][0]
        let dc = dirs[d][1]
        let r = row + dr
        let c = col + dc
        while (r >= 0 && r < PF_MAID_GRID_ROWS && c >= 0 && c < PF_MAID_GRID_COLS) {
            slots.push(r * PF_MAID_GRID_COLS + c)
            r += dr
            c += dc
        }
    }
    return slots
}

const PF_MAID_GRID_HELPER_NAMES = [
    'isRowAllSpace',
    'getSameRowSlots',
    'getSameColSlots',
    'isFirstRow',
    'isBottomRow',
    'isBottomTwoRows',
    'getBottomTwoRowSlots',
    'isInCenter2x3',
    'getCenter2x3Slots',
    'getDiagonalSlots',
    'getNineGrid',
    'getTenGrid',
    'countUniqueTagsInBackpack',
    'getCuriosAll'
]

// 在 6×6 语义下执行 fn，结束后还原所有被替换的全局辅助函数
function pfMaidWithGrid(curiosAll, fn) {
    let saved = {}
    for (let i = 0; i < PF_MAID_GRID_HELPER_NAMES.length; i++) {
        let name = PF_MAID_GRID_HELPER_NAMES[i]
        saved[name] = global[name]
    }
    let nineGrid = saved.getNineGrid
    let tenGrid = saved.getTenGrid

    global.isRowAllSpace = pfMaidRowAllSpace
    global.getSameRowSlots = pfMaidSameRowSlots
    global.getSameColSlots = pfMaidSameColSlots
    global.isFirstRow = pfMaidIsFirstRow
    global.isBottomRow = pfMaidIsBottomRow
    global.isBottomTwoRows = pfMaidIsBottomTwoRows
    global.getBottomTwoRowSlots = pfMaidBottomTwoRowSlots
    global.isInCenter2x3 = pfMaidIsInCenter2x3
    global.getCenter2x3Slots = pfMaidCenter2x3Slots
    global.getDiagonalSlots = pfMaidDiagonalSlots
    global.getNineGrid = function(center) {
        return nineGrid(center, PF_MAID_GRID_ROWS, PF_MAID_GRID_COLS)
    }
    global.getTenGrid = function(center) {
        return tenGrid(center, PF_MAID_GRID_ROWS, PF_MAID_GRID_COLS)
    }
    global.countUniqueTagsInBackpack = function() {
        global.ensureRelicTagMap()
        let tagSet = {}
        for (let s = 0; s < PF_MAID_GRID_SLOTS; s++) {
            let stack = curiosAll.getStackInSlot(s)
            if (!global.isValidRelic(stack)) continue
            let tags = global.relicTagMap['' + stack.getId()]
            if (!tags) continue
            for (let t = 0; t < tags.length; t++) {
                if (tags[t]) tagSet[tags[t].id] = true
            }
        }
        let count = 0
        for (let k in tagSet) count++
        return count
    }
    global.getCuriosAll = function() {
        return curiosAll
    }

    try {
        return fn()
    } finally {
        for (let i = 0; i < PF_MAID_GRID_HELPER_NAMES.length; i++) {
            let name = PF_MAID_GRID_HELPER_NAMES[i]
            global[name] = saved[name]
        }
    }
}

// ========== onLoad 沙盘 ==========

function pfMaidStubPersistentData() {
    let stub = {
        getBoolean: function() { return false },
        putBoolean: function() {},
        getInt: function() { return 0 },
        putInt: function() {},
        getLong: function() { return 0 },
        putLong: function() {},
        getFloat: function() { return 0 },
        putFloat: function() {},
        getDouble: function() { return 0 },
        putDouble: function() {},
        getString: function() { return '' },
        putString: function() {},
        getCompound: function() { return stub },
        get: function() { return null },
        put: function() {},
        contains: function() { return false },
        merge: function() {}
    }
    return stub
}

function pfMaidCaptureRelicModifiers(relic, index) {
    let captured = []
    let proxy = {
        persistentData: pfMaidStubPersistentData(),
        modifyAttribute: function(attr, name, value, operation) {
            captured.push({
                id: '' + attr,
                label: pfMaidAttrLabel('' + attr),
                amount: Number(value),
                operation: '' + operation
            })
            return proxy
        }
    }
    try {
        relic.onLoad(proxy, index)
    } catch (e) {
        console.warn('[MAID-STATS] 遗物 ' + relic.name + ' 属性解析异常: ' + e)
    }
    return captured
}

// ========== 统计 ==========

function pfMaidBuildStats(maid) {
    let maidName = '' + maid.getDisplayName().getString()
    let equipped = MaidCuriosApi.getCuriosHelper().getEquippedCurios(maid)
    if (!equipped.isPresent()) {
        return { maidName: maidName, relicCount: 0, curios: [], totals: [] }
    }
    let curiosAll = equipped.resolve().get()
    let entries = []
    let totals = {}
    let order = []

    // 正常女仆是 36 格（6×6）；若历史存档还没收缩到 36，则沿用玩家 9×6 的位置语义，
    // 避免位置判定越界。
    let collect = function() {
        for (let i = 0; i < curiosAll.getSlots(); i++) {
            let stack = curiosAll.getStackInSlot(i)
            if (stack.isEmpty()) continue
            let itemId = '' + stack.getId()
            if (global.isSpacePanelId(itemId)) continue

            let relic = pfMaidFindRelic(itemId)
            let mods = relic ? pfMaidCaptureRelicModifiers(relic, i) : []
            entries.push({
                name: relic ? (relic.nameZH || relic.name) : ('' + stack.getHoverName().getString()),
                rarity: relic && relic.rarity ? ('' + relic.rarity.name) : '',
                mods: mods
            })

            for (let m = 0; m < mods.length; m++) {
                let key = mods[m].id
                if (!totals[key]) {
                    totals[key] = { label: mods[m].label, amount: 0, sources: [] }
                    order.push(key)
                }
                totals[key].amount += mods[m].amount
                totals[key].sources.push({
                    name: entries[entries.length - 1].name,
                    amount: mods[m].amount,
                    operation: mods[m].operation
                })
            }
        }
    }

    if (curiosAll.getSlots() === PF_MAID_GRID_SLOTS) {
        pfMaidWithGrid(curiosAll, collect)
    } else {
        collect()
    }

    // 展示女仆当前最终值（基础值 + 遗物 modifier），而不是只展示 modifier 增量。
    let totalList = []
    for (let i = 0; i < PF_MAID_STATS_ATTRS.length; i++) {
        let id = PF_MAID_STATS_ATTRS[i]
        try {
            let attr = maid.getAttribute(id)
            if (attr != null) {
                let source = totals[id]
                let base = 0
                try { base = Number(attr.getBaseValue()) } catch (e) {}
                totalList.push({
                    id: id,
                    label: pfMaidAttrLabel(id),
                    amount: Number(attr.getValue()),
                    base: base,
                    sources: source ? source.sources : []
                })
            }
        } catch (e) {}
    }
    if (totalList.length === 0) {
        for (let i = 0; i < order.length; i++) {
            let t = totals[order[i]]
            totalList.push({
                id: order[i],
                label: t.label,
                amount: t.amount,
                base: 0,
                sources: t.sources || []
            })
        }
    }

    return {
        maidName: maidName,
        relicCount: entries.length,
        curios: entries,
        totals: totalList
    }
}

// ========== 网络入口 ==========

NetworkEvents.dataReceived('pf_maid_stats_request', event => {
    let player = event.player
    if (!player) return

    // 只允许统计当前正在交互的女仆容器。
    // Java.loadClass 的类对象在 Rhino 里没有 isInstance，用 getMaid() 探测。
    // 取不到菜单时退回“距离 + 实体存在”校验，不阻断统计。
    let entityId = 0
    try { entityId = event.data.getInt('entityId') } catch (e) {}
    console.log('[MAID-STATS] 收到请求 entityId=' + entityId + ' 玩家=' + player.getName().getString())
    let menuMaid = null
    try {
        menuMaid = player.openInventory.getMaid()
    } catch (e) {}

    // TLM 菜单对象是服务端最可靠的目标来源；客户端传来的 entityId 只作备用。
    let maid = menuMaid
    if (maid == null && entityId > 0) {
        try { maid = player.getLevel().getEntity(entityId) } catch (e) {}
    }
    if (maid == null) {
        console.warn('[MAID-STATS] 请求未找到女仆 entityId=' + entityId)
        return
    }
    if (menuMaid == null && player.distanceToSqr(maid) > 144) {
        console.warn('[MAID-STATS] 请求距离过远 entityId=' + entityId)
        return
    }

    // 旧存档中的女仆可能没有经过本次脚本加载后的 spawned 回调。
    // 请求统计前先重算一次，确保面板读取的是实际属性。
    try {
        if (global.updateMaidBackpack) global.updateMaidBackpack(maid)
    } catch (e) {
        console.warn('[MAID-STATS] 女仆属性重算失败: ' + e)
    }

    let payload = pfMaidBuildStats(maid)
    player.sendData('pf_maid_stats_sync', { json: JSON.stringify(payload) })
    console.log('[MAID-STATS] 统计完成 女仆=' + payload.maidName + ' id=' + maid.getId() + ' 饰品=' + payload.relicCount + ' 属性=' + payload.totals.length)
})
