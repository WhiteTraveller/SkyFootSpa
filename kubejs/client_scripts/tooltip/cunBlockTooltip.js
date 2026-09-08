ItemEvents.tooltip(event => {
    event.addAdvanced("marguerite:cun_block", (stack, advanced, text) => {
        text.add("§7九个皴压缩而成")
        text.add("§8可放入筛网筛出金属颗粒")
    })

    event.addAdvanced("marguerite:cleaned_cun_block", (stack, advanced, text) => {
        text.add("§7经过水洗净化的皴块")
        text.add("§8筛网可额外产出煤炭")
    })
})
