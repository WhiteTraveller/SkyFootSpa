// ============================================================
// 筋膜枪 Tooltip - 显示实时电量 (所有枪 + 头)
// ============================================================

ItemEvents.tooltip(function(event) {

    // ==================== 所有筋膜枪 (无头 + 四个有头) ====================
    var gunIds = [
        'marguerite:fascia_gun',
        'marguerite:fascia_gun_jiaozhi',
        'marguerite:fascia_gun_jiaozhang',
        'marguerite:fascia_gun_jiaoxin',
        'marguerite:fascia_gun_jiaogen'
    ]

    for (var i = 0; i < gunIds.length; i++) {
        var gunId = gunIds[i]
        event.addAdvanced(gunId, function(item, advanced, text) {
            var nbt = item.nbt || {}
            var energy = nbt.pfFE || 0
            var maxEnergy = 10000
            var percent = Math.floor((energy / maxEnergy) * 100)

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
    }

    // ==================== 四个筋膜枪头 ====================
    var partNames = { jiaozhi: '脚趾', jiaozhang: '脚掌', jiaoxin: '脚心', jiaogen: '脚跟' }
    var parts = ['jiaozhi', 'jiaozhang', 'jiaoxin', 'jiaogen']

    for (var j = 0; j < parts.length; j++) {
        (function(part, partName) {
            event.addAdvanced('marguerite:fascia_gun_head_' + part, function(item, advanced, text) {
                text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))
                text.add(Text.gray('与无头筋膜枪合成，制作').append(Text.aqua(partName + '筋膜枪')))
                text.add(Text.gray('合成时保留无头筋膜枪的电力'))
                text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))
            })
        })(parts[j], partNames[parts[j]])
    }
})
