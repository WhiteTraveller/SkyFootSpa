// priority: 5
// ============================================================
// 体力药剂注册
// ------------------------------------------------------------
// 右键饮用逻辑在 server_scripts/stamina_potions.js 中处理。
// ============================================================

global.STAMINA_POTION_TIERS = [
    { tier: 1, amount: 1000, displayName: "§f微量 · 体力药剂", rarity: "common",   texture: "minecraft:item/honey_bottle" },
    { tier: 2, amount: 2000, displayName: "§e初级 · 体力药剂", rarity: "common",   texture: "minecraft:item/honey_bottle" },
    { tier: 3, amount: 4000, displayName: "§a中级 · 体力药剂", rarity: "uncommon", texture: "minecraft:item/honey_bottle" },
    { tier: 4, amount: 6000, displayName: "§b高级 · 体力药剂", rarity: "rare",     texture: "minecraft:item/experience_bottle" },
    { tier: 5, amount: 8000, displayName: "§d极品 · 体力药剂", rarity: "epic",     texture: "minecraft:item/experience_bottle" }
]

StartupEvents.registry("item", event => {
    let tiers = global.STAMINA_POTION_TIERS
    for (let i = 0; i < tiers.length; i++) {
        let t = tiers[i]
        try {
            let builder = event.create("marguerite:stamina_potion_" + t.tier)
                .displayName(t.displayName)
                .maxStackSize(16)
                .tooltip("§7饮用恢复 §a" + t.amount + " §7体力值")
            try { builder.rarity(t.rarity) } catch (e) {}
            if (t.texture) builder.texture(t.texture)
            console.log("[STAMINA_POTION] 已注册: marguerite:stamina_potion_" + t.tier + " (+" + t.amount + ")")
        } catch (e) {
            console.log("[STAMINA_POTION] 注册失败 tier=" + t.tier + ": " + e)
        }
    }
})
