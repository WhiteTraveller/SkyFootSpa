// priority: 5
// ============================================================
// 能量饮料注册
// ------------------------------------------------------------
// 3 档梯度恢复：1000 / 2000 / 3000 体力
// 副作用：喝完扣血 + 20 秒饥饿效果
// 右键饮用逻辑在 server_scripts/energy_drinks.js 中处理。
// ============================================================

global.ENERGY_DRINK_TIERS = [
    { tier: 1, stamina: 1000, damage: 3, hungerSec: 20, displayName: "§f能量饮料 · 微量", rarity: "common",   texture: "minecraft:item/honey_bottle" },
    { tier: 2, stamina: 2000, damage: 4, hungerSec: 20, displayName: "§e能量饮料 · 初级", rarity: "uncommon", texture: "minecraft:item/honey_bottle" },
    { tier: 3, stamina: 3000, damage: 5, hungerSec: 20, displayName: "§b能量饮料 · 高级", rarity: "rare",     texture: "minecraft:item/experience_bottle" }
]

StartupEvents.registry("item", event => {
    let tiers = global.ENERGY_DRINK_TIERS
    for (let i = 0; i < tiers.length; i++) {
        let t = tiers[i]
        try {
            let builder = event.create("marguerite:energy_drink_" + t.tier)
                .displayName(t.displayName)
                .maxStackSize(16)
                .tooltip("§7饮用恢复 §a" + t.stamina + " §7体力值")
                .tooltip("§c副作用: §c-" + t.damage + " §7生命 + §6" + t.hungerSec + "s §7饥饿")
            try { builder.rarity(t.rarity) } catch (e) { }
            if (t.texture) builder.texture(t.texture)
            console.log("[ENERGY_DRINK] 已注册: marguerite:energy_drink_" + t.tier + " (+" + t.stamina + " / -" + t.damage + "HP)")
        } catch (e) {
            console.log("[ENERGY_DRINK] 注册失败 tier=" + t.tier + ": " + e)
        }
    }
})
