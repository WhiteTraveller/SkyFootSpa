// priority: 10
// ============================================================
// 筋膜枪 - 右键拆卸与合成FE转移
// ------------------------------------------------------------
// Shift+右键有头筋膜枪 → 无头筋膜枪 + 对应头 (保留电力)
// 主手无头筋膜枪 + 副手头 右键空气 → 合成有头筋膜枪 (保留电力)
// ============================================================

// ============================================================
// 1) Shift+右键拆卸有头筋膜枪
// ============================================================
ItemEvents.rightClicked(function(event) {
    var player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    var item = event.getItem()
    if (!item || item.isEmpty()) return
    var itemId = "" + item.getId()

    // 检查是否为有头筋膜枪
    var headItemId = global.FASCIA_GUN_HEAD_MAP ? global.FASCIA_GUN_HEAD_MAP[itemId] : null
    if (!headItemId) return

    // 必须潜行 (Shift)
    if (!player.isCrouching()) return

    // 获取当前FE
    var nbt = item.nbt || {}
    var currentFE = nbt.pfFE || 0

    // 消耗手持物品
    if (!player.isCreative()) {
        item.shrink(1)
    }

    // 给玩家无头筋膜枪 (保留FE) + 对应的头
    var headlessGun = Item.of('marguerite:fascia_gun')
    if (currentFE > 0) {
        var newNbt = {}
        newNbt.pfFE = currentFE
        headlessGun = headlessGun.withNBT(newNbt)
    }
    player.give(headlessGun)
    player.give(Item.of(headItemId))

    player.setStatusMessage("§a🔧 已拆卸筋膜枪，电力已保留 (" + currentFE + " FE)")
    try { player.addItemCooldown(item.getItem(), 10) } catch (e) {}

    console.log('[FASCIA-GUN] 拆卸: ' + itemId + ' → 无头枪(' + currentFE + 'FE) + ' + headItemId)
})

// ============================================================
// 2) 主手无头筋膜枪 + 副手头 右键空气 → 合成有头筋膜枪
// ============================================================
ItemEvents.rightClicked(function(event) {
    var player = event.getPlayer()
    if (!player) return
    if (player.getLevel().isClientSide()) return

    // 只处理右键空气/方块（不潜行状态）
    if (player.isCrouching()) return

    var mainHand = player.getMainHandItem()
    var offHand = player.getOffHandItem()
    if (!mainHand || mainHand.isEmpty() || !offHand || offHand.isEmpty()) return

    var mainId = "" + mainHand.getId()
    var offId = "" + offHand.getId()

    // 主手必须是无头筋膜枪
    if (mainId !== 'marguerite:fascia_gun') return

    // 副手必须是筋膜枪头
    var resultId = global.FASCIA_GUN_HEAD_REVERSE_MAP ? global.FASCIA_GUN_HEAD_REVERSE_MAP[offId] : null
    if (!resultId) return

    // 获取无头筋膜枪的FE
    var mainNbt = mainHand.nbt || {}
    var currentFE = mainNbt.pfFE || 0

    // 消耗副手的头
    if (!player.isCreative()) {
        offHand.shrink(1)
    }

    // 消耗主手的无头筋膜枪
    if (!player.isCreative()) {
        mainHand.shrink(1)
    }

    // 给玩家有头筋膜枪 (保留FE)
    var headedGun = Item.of(resultId)
    if (currentFE > 0) {
        var newNbt = {}
        newNbt.pfFE = currentFE
        headedGun = headedGun.withNBT(newNbt)
    }
    player.give(headedGun)

    player.setStatusMessage("§a🔧 已合成筋膜枪，电力已保留 (" + currentFE + " FE)")
    console.log('[FASCIA-GUN] 合成: 无头枪(' + currentFE + 'FE) + ' + offId + ' → ' + resultId)
})

// ============================================================
// 3) 筋膜枪消耗接口 (供搓脚逻辑调用，后续可扩展)
// ============================================================
global.pfFasciaGunInterface = {
    // FE消耗量 (每次搓脚)
    feCostPerClick: 250,

    /**
     * 检查玩家是否持有匹配当前部位的筋膜枪（主手或副手）
     * @param {Internal.Player} player
     * @param {string} demandKey - 需求键 (如 pfDemandJiaozhi)
     * @returns {{item: Internal.ItemStack, hand: string}|null} 匹配的筋膜枪和所在手，或null
     */
    getMatchingGun: function(player, demandKey) {
        try {
            var expectedId = global.FASCIA_GUN_DEMAND_KEY_TO_ITEM[demandKey]

            // 优先检查主手（有头筋膜枪作为搓脚工具时在主手）
            var mainhand = player.getMainHandItem()
            if (mainhand && !mainhand.isEmpty()) {
                var mainId = "" + mainhand.getId()
                if (expectedId && mainId === expectedId) {
                    return { item: mainhand, hand: 'mainhand' }
                }
                if (mainId === 'marguerite:fascia_gun') {
                    return { item: mainhand, hand: 'mainhand' }
                }
            }

            // 再检查副手（筋膜枪也可能在副手配合手物品使用）
            var offhand = player.getOffHandItem()
            if (offhand && !offhand.isEmpty()) {
                var offId = "" + offhand.getId()
                if (expectedId && offId === expectedId) {
                    return { item: offhand, hand: 'offhand' }
                }
                if (offId === 'marguerite:fascia_gun') {
                    return { item: offhand, hand: 'offhand' }
                }
            }

            return null
        } catch (e) {
            return null
        }
    },

    /**
     * 尝试消耗筋膜枪FE (优先于体力)
     * @param {Internal.Player} player
     * @param {object} gunInfo - getMatchingGun 返回的 {item, hand} 对象
     * @param {number} feCost - 消耗的FE量（等于该部位体力消耗值）
     * @returns {boolean} 是否成功消耗FE
     */
    tryConsumeFE: function(player, gunInfo, feCost) {
        try {
            if (!global.pfConsumeFE) return false
            var cost = feCost || global.pfFasciaGunInterface.feCostPerClick
            return global.pfConsumeFE(player, cost, gunInfo.hand)
        } catch (e) {
            console.log('[FASCIA-GUN] FE消耗失败: ' + e)
            return false
        }
    },

    /**
     * 获取筋膜枪当前FE
     * @param {Internal.ItemStack} gunItem
     * @returns {number}
     */
    getCurrentFE: function(gunItem) {
        try {
            if (!global.pfGetItemFE) return 0
            return global.pfGetItemFE(gunItem)
        } catch (e) {
            return 0
        }
    }
}

console.log('[FASCIA-GUN] ✅ 筋膜枪拆卸/合成/接口已加载')