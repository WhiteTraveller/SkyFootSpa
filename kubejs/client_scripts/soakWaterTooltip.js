// ============================================================
// 洗脚水桶 Tooltip 增强（CLIENT）
// ------------------------------------------------------------
// 给自动生成的 bucket 物品追加泡脚效果描述。
// ItemEvents.tooltip 必须在 client_scripts 下注册，
// 放在 startup_scripts 会报 "invalid script type STARTUP" 错误。
// ============================================================

ItemEvents.tooltip(tooltip => {
    if (!global.soakWaterRegister) return
    let list = global.soakWaterRegister.waters
    for (let i = 0; i < list.length; i++) {
        let w = list[i]
        let bucketId = w.getBucketId()
        tooltip.addAdvanced(bucketId, (stack, advanced, text) => {
            text.add(Text.gray(w.description))
            text.add(Text.gold("§l◆ 泡脚效果"))

            // 需求（每部位独立随机 0~N）
            if (w.demandBonusPerPart) {
                let p = w.demandBonusPerPart
                text.add(Text.gray(" 需求 §8(随机0~N)§7: 掌").append(Text.yellow(" 0~" + (p.jiaozhang || 0)))
                    .append(Text.gray(" 跟")).append(Text.yellow(" 0~" + (p.jiaogen || 0)))
                    .append(Text.gray(" 趾")).append(Text.yellow(" 0~" + (p.jiaozhi || 0)))
                    .append(Text.gray(" 心")).append(Text.yellow(" 0~" + (p.jiaoxin || 0))))
            } else if (w.demandBonus > 0) {
                text.add(Text.gray(" 各部位需求 ").append(Text.yellow("+0~" + w.demandBonus))
                    .append(Text.of(" §8(每部位独立随机)")))
            }

            // 满意度
            if (w.satisfactionBonus > 0) {
                text.add(Text.gray(" 满意度 ").append(Text.of("§d+" + w.satisfactionBonus + "❤")))
            }

            // 钱
            if (w.moneyDrop > 0) {
                text.add(Text.gray(" 即时掉钱 ").append(Text.of("§6+" + w.moneyDrop + "💰")))
            }

            // 皴加成（独立）
            if (w.cunBonusPerClick > 0) {
                text.add(Text.gray(" 搓脚掉皴 ").append(Text.of("§f+" + w.cunBonusPerClick))
                    .append(Text.gray(" /次 §8(独立加成)")))
            }

            // 附加药水（目前数据未填，保留兼容）
            if (w.playerEffects && w.playerEffects.length > 0) {
                for (let j = 0; j < w.playerEffects.length; j++) {
                    let ef = w.playerEffects[j]
                    text.add(Text.gray(" 附加 ").append(Text.aqua(ef.id + " " + Math.floor(ef.duration / 20) + "s")))
                }
            }
        })
    }
})
