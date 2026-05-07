let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.getRelicId = function(name) {
    return "marguerite:" + name
}

StartupEvents.registry('item', event => {
    let relics = global.relicRegister.relics
    for (let i = 0; i < relics.length; i ++) {
        let relic = relics[i]
        let e = event.create(global.getRelicId(relic.name))
        .displayName(relic.nameZH && relic.nameZH.length > 0 ? relic.nameZH : relic.name)
        .attachCuriosCapability(
            CuriosJSCapabilityBuilder.create()
                .onEquip((slotContext, oldStack, newStack) => {
                    // 保护：任一步骤抛错都不能中断 Curios 事件总线
                    try {
                        let ent = slotContext.entity()
                        if (ent) global.updatePlayerBackpack(ent)
                    } catch (e) {
                        console.error("[RELIC-EQUIP] " + relic.name + " updatePlayerBackpack 异常: " + e)
                    }
                    try {
                        relic.onEquip(slotContext, oldStack, newStack)
                    } catch (e) {
                        console.error("[RELIC-EQUIP] " + relic.name + " onEquip 异常: " + e)
                    }
                })
                .onUnequip((slotContext, oldStack, newStack) => {
                    try {
                        let ent = slotContext.entity()
                        if (ent) global.updatePlayerBackpack(ent)
                    } catch (e) {
                        console.error("[RELIC-UNEQUIP] " + relic.name + " updatePlayerBackpack 异常: " + e)
                    }
                    try {
                        relic.onUnEquip(slotContext, oldStack, newStack)
                    } catch (e) {
                        console.error("[RELIC-UNEQUIP] " + relic.name + " onUnEquip 异常: " + e)
                    }
                })
                .canEquip((slotContext, stack) => {
                    try {
                        return relic.canEquip ? relic.canEquip(slotContext, stack) : true
                    } catch (e) {
                        console.error("[RELIC-CAN-EQUIP] " + relic.name + " 异常: " + e)
                        return true
                    }
                })
                .canUnequip((slotContext, stack) => {
                    try {
                        return relic.canUnEquip ? relic.canUnEquip(slotContext, stack) : true
                    } catch (e) {
                        console.error("[RELIC-CAN-UNEQUIP] " + relic.name + " 异常: " + e)
                        return true
                    }
                })
        )
        .maxStackSize(1)
        .tag("curios:package")
        // 按阶段统一芯片外观（贴图使用 Mekanism 控制电路）
        if (relic.stage === 1) {
            e.texture("mekanism:item/basic_control_circuit")
        } else if (relic.stage === 2) {
            e.texture("mekanism:item/advanced_control_circuit")
        }
        for (let j = 0; j < relic.tags.length; j ++) {
            let tag = relic.tags[j]
            if (tag) {
                e.tag(tag.id)
            } else {
                console.warn("Relic tag is null: " + relic)
            }
        }
    }
})

