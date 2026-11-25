// priority: 11
// ============================================================
// Boss 顾客注册框架
// ------------------------------------------------------------
// 使用示例（在 kubejs/startup_scripts/boss/ 下新增一个 js 文件即可）：
//   global.bossRegister.register(boss => {
//       boss
//           .setId("boss_flandre")
//           .setName("芙兰朵露")
//           .setModel("touhou_little_maid:flandre_scarlet")
//           .setTriggerItem("minecraft:wither_skeleton_skull")
//           .setDemandRange(6, 12)           // 四部位统一需求范围 [min,max]（默认 6-12）
//           .setDemandRangePart('脚趾', 2, 6) // 单独覆盖某部位范围（可选）
//           .setSatisfactionMultiplier(0.3)  // 满意度倍率（每次增加 × 0.3）
//           .setSatisfactionTarget(60)       // 满意度要求（需求清零时满意度需 ≥ 此值，否则挑战失败）
//           .setTime(90)                     // 挑战倒计时秒数（躺床后开始倒数，归零自动下床判失败，默认 60）
//           .setHint("§7她似乎已经等了很久...")
//   })
// 挑战失败（超时 / 需求清零但满意度未达标）：boss 自动下床、不结算，并返还其召唤券。
// ============================================================

function Boss() {
    this.id = ""
    this.name = "Boss"
    this.model = ""
    this.triggerItemId = ""
    this.demandRanges = { '脚掌': [6, 12], '脚后跟': [6, 12], '脚趾': [6, 12], '脚心': [6, 12] }  // 每部位需求次数范围 [min,max]
    this.satisfactionMultiplier = 1.0   // 浮点倍率
    this.satisfactionTarget = 60        // 满意度要求（0-100）：需求清零时满意度需 ≥ 此值才算挑战成功
    this.time = 60                      // 挑战倒计时秒数：躺床后开始倒数，归零自动下床判失败
    this.hint = ""
    // ===== 召唤符物品自动注册（可选）=====
    this.autoCreateItem = false         // 为 true 时自动创建 marguerite:boss_seal_<shortId>
    this.itemTexture = ""               // 召唤符贴图路径（如 "minecraft:item/paper"，空则为默认 generated）
    this.itemStackSize = 16             // 召唤符堆叠上限
    this.itemRarity = "rare"            // common / uncommon / rare / epic
    this.itemName = ""                  // 召唤符自定义显示名（空则用 boss.name + " ✷ 召唤符"）

    this.setId = function (v) { this.id = '' + v; return this }
    this.setName = function (v) { this.name = '' + v; return this }
    this.setModel = function (v) { this.model = '' + v; return this }
    this.setTriggerItem = function (v) { this.triggerItemId = '' + v; return this }
    this.setDemandRange = function (min, max) {
        let lo = Math.floor(min), hi = Math.floor(max)
        if (isNaN(lo) || lo < 0) lo = 0
        if (isNaN(hi) || hi < lo) hi = lo
        for (let k in this.demandRanges) this.demandRanges[k] = [lo, hi]
        return this
    }
    this.setDemandRangePart = function (part, min, max) {
        let lo = Math.floor(min), hi = Math.floor(max)
        if (isNaN(lo) || lo < 0) lo = 0
        if (isNaN(hi) || hi < lo) hi = lo
        this.demandRanges[part] = [lo, hi]
        return this
    }
    this.setSatisfactionMultiplier = function (v) {
        let f = parseFloat(v)
        if (isNaN(f) || f < 0) f = 0
        this.satisfactionMultiplier = f
        return this
    }
    this.setSatisfactionTarget = function (v) {
        let n = Math.floor(v)
        if (isNaN(n) || n < 0) n = 0
        if (n > 100) n = 100
        this.satisfactionTarget = n
        return this
    }
    this.setTime = function (v) {
        let n = Math.floor(v)
        if (isNaN(n) || n < 1) n = 1
        this.time = n
        return this
    }
    this.setHint = function (v) { this.hint = '' + v; return this }
    this.setAutoCreateItem = function (v) { this.autoCreateItem = !!v; return this }
    this.setItemTexture = function (v) { this.itemTexture = '' + v; return this }
    this.setItemStackSize = function (v) {
        let n = Math.floor(v)
        if (isNaN(n) || n < 1) n = 1
        this.itemStackSize = n
        return this
    }
    this.setItemRarity = function (v) { this.itemRarity = '' + v; return this }
    this.setItemName = function (v) { this.itemName = '' + v; return this }
}

function BossRegister() {
    this.bosses = []
    this.byId = {}
    this.byTriggerItem = {}

    this.register = function (cb) {
        let boss = new Boss()
        try {
            cb(boss)
        } catch (e) {
            console.log("[BOSS] 注册回调抛错: " + e)
            return
        }
        if (!boss.id) { console.log("[BOSS] 注册失败：缺少 id"); return }
        if (!boss.model) { console.log("[BOSS] 注册失败：id=" + boss.id + " 缺少 model"); return }
        // autoCreateItem 启用后自动生成 triggerItemId（用户手动 setTriggerItem 可覆盖）
        if (boss.autoCreateItem && !boss.triggerItemId) {
            let shortId = boss.id
            if (shortId.indexOf("boss_") === 0) shortId = shortId.substring(5)
            boss.triggerItemId = "marguerite:boss_seal_" + shortId
        }
        if (!boss.triggerItemId) { console.log("[BOSS] 注册失败：id=" + boss.id + " 缺少 triggerItem"); return }
        if (this.byId[boss.id]) { console.log("[BOSS] 注册失败：id 冲突 " + boss.id); return }
        if (this.byTriggerItem[boss.triggerItemId]) {
            console.log("[BOSS] 注册失败：triggerItem 冲突 " + boss.triggerItemId + " (与 " + this.byTriggerItem[boss.triggerItemId].id + ")")
            return
        }
        this.bosses.push(boss)
        this.byId[boss.id] = boss
        this.byTriggerItem[boss.triggerItemId] = boss
        console.log("[BOSS] 已注册 boss: id=" + boss.id +
            ", model=" + boss.model +
            ", trigger=" + boss.triggerItemId +
            (boss.autoCreateItem ? " (自动创建物品)" : "") +
            ", demandRanges=" + JSON.stringify(boss.demandRanges) +
            ", satMul=" + boss.satisfactionMultiplier +
            ", satTarget=" + boss.satisfactionTarget +
            ", time=" + boss.time + "s")
    }
}

global.bossRegister = new BossRegister()
console.log("[BOSS] 注册框架已加载")
// 注：召唤符物品的 StartupEvents.registry('item') 调用在同目录 boss.js 中统一处理，
// 以确保所有 boss_*.js 注册完成后再遍历。
