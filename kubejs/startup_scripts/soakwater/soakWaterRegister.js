// priority: 11
// ============================================================
// 洗脚水（SoakWater）注册器
// ------------------------------------------------------------
// 设计目标：
//   - 洗脚水使用真实流体形式（对应桶物品）
//   - 采用与 relicRegister / oilRegister 一致的插件式扩展接口
//   - 允许后续通过 setXxx 链式 API 为泡脚附加属性
//
// 使用范式：
//   global.soakWaterRegister.register(function(w){
//       w.setName('ginger_water')
//        .setNameZH('生姜水')
//        .setColor(0xC97F3C)
//        .setIngredients(['minecraft:carrot'])
//        .setStaminaBonus(50)
//        .setPlayerEffects([{ id: 'minecraft:regeneration', duration: 100, amp: 0 }])
//        .setSatisfactionBonus(5)
//        .setOnFinish(function(player, entity){ /* 自定义逻辑 */ })
//   })
//
// 字段说明（效果方向：不改体力；提高需求/满意度/钱/皴加成）：
//   name                 —— 内部 id（不含命名空间），对应 "kubejs:<name>" 流体
//   nameZH               —— 中文显示名（同时用于桶物品 displayName）
//   color                —— bucket / 流体颜色（int，0xRRGGBB）
//   description          —— 桶 tooltip 描述
//   ingredients          —— shapeless 合成除水桶外的原料（string 数组）
//   satisfactionBonus    —— 泡脚完成时给"顾客实体"追加的满意度（pfSatisfaction）
//   demandBonus          —— 每部位需求随机增量上限：每部位独立 roll [0, demandBonus]（含端点）
//   demandBonusPerPart   —— 精细控制每部位上限 {jiaozhang,jiaogen,jiaozhi,jiaoxin}
//                           每部位独立 roll [0, upper]；若设置则覆盖 demandBonus
//   moneyDrop            —— 泡脚完成时即时掉落的 copper 数量（按 coinsje 贪心拆分硬币）
//   cunBonusPerClick     —— 写入顾客 NBT：pfCunBonusPerClick，搓脚时每次点击额外掉落 N 个皴
//                           （独立计算：不受搓泥宝 ×2 倍率影响，直接累加到 rollBase 之外）
//   playerEffects        —— 泡脚完成时给玩家施加的药水效果，[{id,duration,amp}]
//   entityEffects        —— 泡脚完成时给顾客施加的药水效果（通常用于视觉）
//   onFinish             —— 自定义回调 function(player, entity, water)，在默认效果之后执行
// ============================================================

function SoakWaterRegister() {
    this.waters = []

    /**
     * 注册一个洗脚水定义
     * @param {function(SoakWater):void} waterFactory
     */
    this.register = function (waterFactory) {
        let w = new SoakWater()
        waterFactory(w)
        this.waters.push(w)
    }

    this.getByBucketId = function (bucketId) {
        let id = "" + bucketId
        for (let i = 0; i < this.waters.length; i++) {
            if (this.waters[i].getBucketId() === id) return this.waters[i]
        }
        return null
    }

    this.getByFluidId = function (fluidId) {
        let id = "" + fluidId
        for (let i = 0; i < this.waters.length; i++) {
            if (this.waters[i].getFluidId() === id) return this.waters[i]
        }
        return null
    }

    this.getByName = function (name) {
        for (let i = 0; i < this.waters.length; i++) {
            if (this.waters[i].name === name) return this.waters[i]
        }
        return null
    }

    this.getAllBucketIds = function () {
        let ids = []
        for (let i = 0; i < this.waters.length; i++) {
            ids.push(this.waters[i].getBucketId())
        }
        return ids
    }
}

function SoakWater() {
    this.name = ""
    this.nameZH = ""
    this.color = 0x3F76E4
    this.description = ""
    this.ingredients = []
    this.extraFluids = []   // 额外流体输入，格式：[{ id: 'create:milk', amount: 1000 }, ...]
    this.satisfactionBonus = 0
    this.demandBonus = 0
    this.demandBonusPerPart = null
    this.moneyDrop = 0
    this.cunBonusPerClick = 0
    this.playerEffects = []
    this.entityEffects = []
    this.onFinish = null

    this.getFluidId = function () { return "kubejs:" + this.name }
    this.getBucketId = function () { return "kubejs:" + this.name + "_bucket" }

    this.setName = function (v) { this.name = v; return this }
    this.setNameZH = function (v) { this.nameZH = v; return this }
    this.setColor = function (v) { this.color = v; return this }
    this.setDescription = function (v) { this.description = v; return this }
    this.setIngredients = function (v) { this.ingredients = v; return this }
    this.setExtraFluids = function (v) { this.extraFluids = v; return this }
    this.setSatisfactionBonus = function (v) { this.satisfactionBonus = v; return this }
    this.setDemandBonus = function (v) { this.demandBonus = v; return this }
    this.setDemandBonusPerPart = function (v) { this.demandBonusPerPart = v; return this }
    this.setMoneyDrop = function (v) { this.moneyDrop = v; return this }
    this.setCunBonusPerClick = function (v) { this.cunBonusPerClick = v; return this }
    this.setPlayerEffects = function (v) { this.playerEffects = v; return this }
    this.setEntityEffects = function (v) { this.entityEffects = v; return this }
    this.setOnFinish = function (v) { this.onFinish = v; return this }
}

global.soakWaterRegister = new SoakWaterRegister()
