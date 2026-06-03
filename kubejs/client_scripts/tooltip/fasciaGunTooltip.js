// ============================================================
// 筋膜枪 Tooltip - 显示实时电量
// ============================================================

ItemEvents.tooltip(event => {
    event.addAdvanced('marguerite:fascia_gun', (item, advanced, text) => {
            let nbt = item.nbt || {}
            let energy = nbt.pfFE || 0
            let maxEnergy = 10000
            let percent = Math.floor((energy / maxEnergy) * 100)

            text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))
            text.add(Text.gold('⚡ 当前电量: ').append(Text.yellow(energy.toLocaleString() + ' / ' + maxEnergy.toLocaleString() + ' FE')))
            text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))

            if (percent < 20) {
                text.add(Text.red('⚠️ 电量不足!'))
            } else if (percent < 50) {
                text.add(Text.yellow('⚡ 电量中等'))
            } else {
                text.add(Text.green('✅ 电量充足'))
            }
    })
})
