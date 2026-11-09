// ============================================================
// 奉茶食物 Tooltip（CLIENT）
// 给 global.foodRegister 中登记的食物追加奉茶效果，数据与服务端 foot_serve_food 同源。
// ============================================================

let FOOD_TIP_PART_NAMES = { jiaozhang: '推', jiaogen: '揉', jiaozhi: '按', jiaoxin: '搓' }

ItemEvents.tooltip(tooltip => {
    if (!global.foodRegister) return
    let list = global.foodRegister.foods
    for (let i = 0; i < list.length; i++) {
        let f = list[i]
        tooltip.addAdvanced(f.item, (stack, advanced, text) => {
            text.add(Text.gold("§l◆ 茶水效果"))

            let parts = Object.keys(f.demands || {})
            for (let j = 0; j < parts.length; j++) {
                let n = f.demands[parts[j]] | 0
                if (n === 0) continue
                text.add(Text.gray(" " + (FOOD_TIP_PART_NAMES[parts[j]] || parts[j]) + "需求 ").append(Text.yellow((n > 0 ? "+" : "") + n)))
            }
            if (f.randomDemand > 0) {
                text.add(Text.gray(" 随机手法需求 ").append(Text.yellow("+" + f.randomDemand)))
            }
            if (f.satisfaction !== 0) {
                text.add(Text.gray(" 满意度 ").append(Text.of("§d" + (f.satisfaction > 0 ? "+" : "") + f.satisfaction + "❤")))
            }
            let guests = f.rareGuestNames || []
            if (guests.length > 0) {
                text.add(Text.gray(" 招来稀客 ").append(Text.of("§d" + guests.join("§7 / §d"))))
            }
            text.add(Text.of(" §7在需求清单下方点「茶水」按钮给予顾客"))
        })
    }
})
