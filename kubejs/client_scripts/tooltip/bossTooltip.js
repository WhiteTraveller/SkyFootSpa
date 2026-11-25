ItemEvents.tooltip(event => {
    event.addAdvanced("marguerite:boss_seal_nitori", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤河城荷取")
    })

    event.addAdvanced("marguerite:boss_seal_reimu", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤博丽灵梦")
    })

    event.addAdvanced("marguerite:boss_seal_alice", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤爱丽丝")
    })

    event.addAdvanced("marguerite:boss_seal_sanae", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤东风谷早苗")
    })

    event.addAdvanced("marguerite:boss_seal_rin", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤火焰猫燐")
    })

    event.addAdvanced("marguerite:boss_seal_yuugi", (stack, advanced, text) => {
        text.add("§7右键寻路方块即可立刻召唤星熊永仪")
    })
})