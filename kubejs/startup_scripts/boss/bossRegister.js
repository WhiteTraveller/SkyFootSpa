// priority: 11
// ============================================================
// Boss 顾客注册框架
// ------------------------------------------------------------
// 使用示例（在 kubejs/startup_scripts/boss/ 下新增一个 js 文件即可）：
//   global.bossRegister.register(boss => {
//       boss
//           .setId("boss_flandre")
//           .setName("§c猩红恶魔 · 芙兰朵露")
//           .setModel("touhou_little_maid:flandre_scarlet")
//           .setTriggerItem("minecraft:wither_skeleton_skull")
//           .setDemandMultiplier(3)          // 需求倍率（普通顾客 × 3 次）
//           .setSatisfactionMultiplier(0.3)  // 满意度倍率（每次增加 × 0.3）
//           .setHint("§7她似乎已经等了很久...")
//   })
// ============================================================

function Boss() {
    this.id = ""
    this.name = "Boss"
    this.model = ""
    this.triggerItemId = ""
    this.demandMultiplier = 1           // 整数倍率
    this.satisfactionMultiplier = 1.0   // 浮点倍率
    this.hint = ""
    // ===== 召唤符物品自动注册（可选）=====
    this.autoCreateItem = false         // 为 true 时自动创建 marguerite:boss_seal_<shortId>
    this.itemTexture = ""               // 召唤符贴图路径（如 "minecraft:item/paper"，空则为默认 generated）
    this.itemStackSize = 16             // 召唤符堆叠上限
    this.itemRarity = "rare"            // common / uncommon / rare / epic

    this.setId = function (v) { this.id = '' + v; return this }
    this.setName = function (v) { this.name = '' + v; return this }
    this.setModel = function (v) { this.model = '' + v; return this }
    this.setTriggerItem = function (v) { this.triggerItemId = '' + v; return this }
    this.setDemandMultiplier = function (v) {
        let n = Math.floor(v)
        if (isNaN(n) || n < 1) n = 1
        this.demandMultiplier = n
        return this
    }
    this.setSatisfactionMultiplier = function (v) {
        let f = parseFloat(v)
        if (isNaN(f) || f < 0) f = 0
        this.satisfactionMultiplier = f
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
            ", demandMul=" + boss.demandMultiplier +
            ", satMul=" + boss.satisfactionMultiplier)
    }
}

global.bossRegister = new BossRegister()
console.log("[BOSS] 注册框架已加载")
// 注：召唤符物品的 StartupEvents.registry('item') 调用在同目录 boss.js 中统一处理，
// 以确保所有 boss_*.js 注册完成后再遍历。
