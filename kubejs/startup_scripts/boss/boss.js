// ============================================================
// Boss 召唤符物品统一注册
// ------------------------------------------------------------
// 加载顺序：bossRegister.js(priority:11) → boss_*.js(priority:5) → boss.js(默认)
// 本文件无 priority 注释，最后加载，此时 global.bossRegister.bosses 已填充完成。
// 遍历所有 autoCreateItem=true 的 Boss，创建 marguerite:boss_seal_<shortId> 召唤符。
// ============================================================

StartupEvents.registry('item', event => {
    let register = global.bossRegister
    if (!register || !register.bosses) {
        console.log("[BOSS] bossRegister 未初始化，跳过召唤符物品注册")
        return
    }
    let created = 0
    for (let i = 0; i < register.bosses.length; i++) {
        let boss = register.bosses[i]
        if (!boss.autoCreateItem) continue
        try {
            let sealName = "§9" + (boss.itemName ? boss.itemName : boss.name + " ✷ 召唤符").replace(/§[0-9a-fk-or]/gi, "")
            let builder = event.create(boss.triggerItemId)
                .displayName(sealName)
                .maxStackSize(boss.itemStackSize)
            if (boss.itemRarity) {
                try { builder.rarity(boss.itemRarity) } catch (e) { }
            }
            if (boss.itemTexture && boss.itemTexture.length > 0) {
                builder.texture(boss.itemTexture)
            }
            console.log("[BOSS] 自动创建召唤符: " + boss.triggerItemId + " (boss=" + boss.id + ")")
            created++
        } catch (e) {
            console.log("[BOSS] 创建召唤符失败 boss=" + boss.id + ": " + e)
        }
    }
    if (created > 0) console.log("[BOSS] 共自动注册 " + created + " 个召唤符物品")
})
