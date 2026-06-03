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
        // 按阶段+部位自动分配芯片材质
        // 命名规则: chip_lv{stage}_pt{part}  part映射: toe→1, sole→2, center→3, heel→4, all→5
        let partMap = { '_toe': 1, '_sole': 2, '_center': 3, '_heel': 4, '_all': 5 }
        let chipPart = 0
        for (let suffix in partMap) {
            if (relic.name.endsWith(suffix)) {
                chipPart = partMap[suffix]
                break
            }
        }
        if (relic.texture) {
            e.texture(relic.texture)
        } else if (relic.stage >= 1 && relic.stage <= 5 && chipPart > 0) {
            e.texture("kubejs:item/chip_lv" + relic.stage + "_pt" + chipPart)
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

