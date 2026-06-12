// ============================================================
// 筋膜枪系列 - 可充电电动工具 (PowerfulJS FE Capability)
// ------------------------------------------------------------
// marguerite:fascia_gun              - 无头筋膜枪 (基础)
// marguerite:fascia_gun_head_jiaozhi   - 筋膜枪头(脚趾)
// marguerite:fascia_gun_head_jiaozhang - 筋膜枪头(脚掌)
// marguerite:fascia_gun_head_jiaoxin   - 筋膜枪头(脚心)
// marguerite:fascia_gun_head_jiaogen   - 筋膜枪头(脚跟)
// marguerite:fascia_gun_jiaozhi        - 有头筋膜枪(脚趾)
// marguerite:fascia_gun_jiaozhang      - 有头筋膜枪(脚掌)
// marguerite:fascia_gun_jiaoxin        - 有头筋膜枪(脚心)
// marguerite:fascia_gun_jiaogen        - 有头筋膜枪(脚跟)
// 电力容量: 10000 FE
// ============================================================

// FE Capability 构建函数 (复用于有头/无头筋膜枪)
function buildFasciaGunCapability() {
    return CapabilityBuilder.ENERGY.customItemStack()
        .canExtract(function(i) { return true })
        .canReceive(function(i) { return true })
        .getEnergyStored(function(i) {
            var nbt = i.nbt || {}
            return nbt.pfFE || 0
        })
        .getMaxEnergyStored(function(i) {
            return 10000
        })
        .extractEnergy(function(be, amount, simulate) {
            var nbt = be.nbt || {}
            var energy = nbt.pfFE || 0
            var extracted = Math.min(energy, amount)
            if (!simulate) {
                nbt.pfFE = energy - extracted
                be.nbt = nbt
            }
            return extracted
        })
        .receiveEnergy(function(be, amount, simulate) {
            var nbt = be.nbt || {}
            var energy = nbt.pfFE || 0
            var received = Math.min(10000 - energy, amount)
            if (!simulate) {
                nbt.pfFE = energy + received
                be.nbt = nbt
            }
            return received
        })
}

// 部位中文名映射
var PART_DISPLAY_NAMES = {
    jiaozhi: '脚趾',
    jiaozhang: '脚掌',
    jiaoxin: '脚心',
    jiaogen: '脚跟'
}

// 四个部位列表
var FASCIA_PARTS = ['jiaozhi', 'jiaozhang', 'jiaoxin', 'jiaogen']
var FASCIA_GUN_MAX_FE = 10000

// 耐久条宽度回调: 根据pfFE计算0-13 (13=满/隐藏, 0=空)
function fasciaGunBarWidth(i) {
    var nbt = i.nbt || {}
    var fe = nbt.pfFE || 0
    if (fe >= FASCIA_GUN_MAX_FE) return 13  // 满电 → 隐藏耐久条
    return Math.round(fe / FASCIA_GUN_MAX_FE * 13)
}

// 耐久条颜色回调: 绿>50%, 黄>20%, 红<=20%
function fasciaGunBarColor(i) {
    var nbt = i.nbt || {}
    var fe = nbt.pfFE || 0
    var ratio = fe / FASCIA_GUN_MAX_FE
    if (ratio > 0.5) return Color.GREEN
    if (ratio > 0.2) return Color.YELLOW
    return Color.RED
}

StartupEvents.registry("item", function(event) {

    // ==================== 无头筋膜枪 ====================
    event.create('marguerite:fascia_gun')
        .displayName('§b§l筋膜枪')
        .maxStackSize(1)
        .attachCapability(buildFasciaGunCapability())
        .barWidth(fasciaGunBarWidth)
        .barColor(fasciaGunBarColor)

    // ==================== 四个筋膜枪头 ====================
    for (var i = 0; i < FASCIA_PARTS.length; i++) {
        var part = FASCIA_PARTS[i]
        var partName = PART_DISPLAY_NAMES[part]
        event.create('marguerite:fascia_gun_head_' + part)
            .displayName('§7筋膜枪头 - ' + partName)
            .maxStackSize(64)
    }

    // ==================== 四个有头筋膜枪 ====================
    for (var i = 0; i < FASCIA_PARTS.length; i++) {
        var part = FASCIA_PARTS[i]
        var partName = PART_DISPLAY_NAMES[part]
        event.create('marguerite:fascia_gun_' + part)
            .displayName('§b§l筋膜枪(' + partName + ')')
            .maxStackSize(1)
            .attachCapability(buildFasciaGunCapability())
            .barWidth(fasciaGunBarWidth)
            .barColor(fasciaGunBarColor)
    }
})

// ============================================================
// 导出全局映射 (供 server 端使用)
// ============================================================

// 部位列表
global.FASCIA_GUN_PARTS = FASCIA_PARTS

// 需求键 → 有头筋膜枪物品ID (搓脚时匹配副手)
global.FASCIA_GUN_DEMAND_KEY_TO_ITEM = {
    'pfDemandJiaozhi': 'marguerite:fascia_gun_jiaozhi',
    'pfDemandJiaozhang': 'marguerite:fascia_gun_jiaozhang',
    'pfDemandJiaoxin': 'marguerite:fascia_gun_jiaoxin',
    'pfDemandJiaogen': 'marguerite:fascia_gun_jiaogen'
}

// 有头筋膜枪 → 对应头物品ID (拆卸用)
global.FASCIA_GUN_HEAD_MAP = {
    'marguerite:fascia_gun_jiaozhi': 'marguerite:fascia_gun_head_jiaozhi',
    'marguerite:fascia_gun_jiaozhang': 'marguerite:fascia_gun_head_jiaozhang',
    'marguerite:fascia_gun_jiaoxin': 'marguerite:fascia_gun_head_jiaoxin',
    'marguerite:fascia_gun_jiaogen': 'marguerite:fascia_gun_head_jiaogen'
}

// 头 → 有头筋膜枪反向映射 (合成用)
global.FASCIA_GUN_HEAD_REVERSE_MAP = {
    'marguerite:fascia_gun_head_jiaozhi': 'marguerite:fascia_gun_jiaozhi',
    'marguerite:fascia_gun_head_jiaozhang': 'marguerite:fascia_gun_jiaozhang',
    'marguerite:fascia_gun_head_jiaoxin': 'marguerite:fascia_gun_jiaoxin',
    'marguerite:fascia_gun_head_jiaogen': 'marguerite:fascia_gun_jiaogen'
}

console.log('[FASCIA-GUN] ✅ 9个筋膜枪物品已注册')
