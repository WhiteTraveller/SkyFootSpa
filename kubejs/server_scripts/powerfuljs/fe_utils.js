// ============================================================
// FE 电力消耗工具函数
// ------------------------------------------------------------
// 从物品的 FE Capability 中提取电力,替代耐久度消耗
// ============================================================

// 加载 Forge 能力类 (参考 pfBasinSoakManager.js 的用法)
let ForgeCapabilities = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities')

/**
 * 从玩家手持物品中消耗 FE 电力
 * @param {Internal.Player} player - 玩家对象
 * @param {number} feCost - 需要消耗的 FE 量
 * @param {string} hand - 'mainhand' 或 'offhand'
 * @returns {boolean} - 是否成功消耗
 */
let pfConsumeFE = function(player, feCost, hand) {
    hand = hand || 'offhand'  // Rhino 不支持默认参数
    
    try {
        let item = hand === 'offhand' ? player.getOffHandItem() : player.getMainHandItem()
        if (!item || item.isEmpty()) return false

        // 获取物品的 FE 存储 Capability (使用 ForgeCapabilities.ENERGY)
        let capLazy = item.getCapability(ForgeCapabilities.ENERGY)
        if (!capLazy || !capLazy.isPresent()) {
            console.log('[PF-FE] 物品没有 FE Capability: ' + item.getId())
            return false
        }
        let energyStorage = capLazy.resolve().get()

        // 检查当前电量
        let currentEnergy = energyStorage.getEnergyStored()
        console.log('[PF-FE] 当前电量: ' + currentEnergy + ', 需要: ' + feCost)
        
        if (currentEnergy < feCost) {
            console.log('[PF-FE] 电量不足: ' + currentEnergy + ' < ' + feCost)
            return false
        }

        // 提取电力
        let extracted = energyStorage.extractEnergy(feCost, false)
        console.log('[PF-FE] 提取: ' + extracted + ' FE, 剩余: ' + (energyStorage.getEnergyStored()))
        return extracted >= feCost

    } catch (e) {
        console.log('[PF-FE] 电力消耗失败: ' + e)
        return false
    }
}

/**
 * 获取物品的当前 FE 存储量
 * @param {Internal.ItemStack} item - 物品堆
 * @returns {number} - 当前 FE 值
 */
let pfGetItemFE = function(item) {
    try {
        if (!item || item.isEmpty()) return 0
        
        let capLazy = item.getCapability(ForgeCapabilities.ENERGY)
        if (!capLazy || !capLazy.isPresent()) return 0
        return capLazy.resolve().get().getEnergyStored()
    } catch (e) {
        return 0
    }
}

/**
 * 获取物品的最大 FE 容量
 * @param {Internal.ItemStack} item - 物品堆
 * @returns {number} - 最大 FE 容量
 */
let pfGetItemMaxFE = function(item) {
    try {
        if (!item || item.isEmpty()) return 0
        
        let capLazy = item.getCapability(ForgeCapabilities.ENERGY)
        if (!capLazy || !capLazy.isPresent()) return 0
        return capLazy.resolve().get().getMaxEnergyStored()
    } catch (e) {
        return 0
    }
}

// 导出到全局
global.pfConsumeFE = pfConsumeFE
global.pfGetItemFE = pfGetItemFE
global.pfGetItemMaxFE = pfGetItemMaxFE

console.log('[PF-FE] ✅ FE 电力工具函数已加载')
