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
        'marguerite:fascia_gun_jiaogen',
        'marguerite:fascia_gun_universal',
        'marguerite:fascia_gun_jiaozhi_advanced',
        'marguerite:fascia_gun_jiaozhang_advanced',
        'marguerite:fascia_gun_jiaoxin_advanced',
        'marguerite:fascia_gun_jiaogen_advanced'
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

    var advancedPartNames = { jiaozhi: '脚趾', jiaozhang: '脚掌', jiaoxin: '脚心', jiaogen: '脚跟' }
    var advancedParts = ['jiaozhi', 'jiaozhang', 'jiaoxin', 'jiaogen']
    for (var k = 0; k < advancedParts.length; k++) {
        var advancedPart = advancedParts[k]
        ;(function(partName, itemId) {
            event.addAdvanced(itemId, function(item, advanced, text) {
                text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))
                text.add(Text.aqua('强化专用枪（' + partName + '）：每次搓动最多结算 2 次需求'))
                text.add(Text.gray('每次搓动只消耗一次对应部位 FE'))
                text.add(Text.darkGray('━━━━━━━━━━━━━━━━'))
            })
        })(advancedPartNames[advancedPart], 'marguerite:fascia_gun_' + advancedPart + '_advanced')
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
