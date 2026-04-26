// 阶段颜色映射
let _stageColors = { 1: '§e', 2: '§6', 3: '§c', 4: '§d', 5: '§5' }

ItemEvents.tooltip(event => {
    let relics = global.relicRegister.relics
    event.addAdvanced('marguerite:dungeon_reward', (item, advanced, text) => {
        text.add(Text.red(`右键获取奖励`))
    })
    for (let i = 0; i < relics.length; i ++) {
        let relic = relics[i]
        let relicId = global.getRelicId(relic.name)

        // 阶段标识
        if (relic.stage > 0) {
            event.addAdvanced(relicId, (item, advanced, text) => {
                text.add(Text.of(_stageColors[relic.stage] + 'STAGE \u00b7 ' + relic.stage))
            })
        }

        event.addAdvanced(relicId, (item, advanced, text) => {
            if (relic.description != null) {
                text.add(relic.description)
            }
        })
        event.addAdvanced(relicId, (item, advanced, text) => {
            if (relic.specialDescription != null) {
                text.add(relic.specialDescription)
            }
        })
        for (let k = 0; k < relic.guideTexture.length; k ++) {
            let texture = relic.guideTexture[k]
            event.addAdvanced(relicId, (item, advanced, text) => {
                text.add(texture)
            })
        }
        event.addAdvanced(relicId, (item, advanced, text) => {
            text.add(Text.darkGray("-----------------------"))
        })
        console.log(relic.tags.length)
        console.log("relic.tags.length")
        for (let j = 0; j < relic.tags.length; j ++) {
            console.log(tag)
            let tag = relic.tags[j]
            switch (tag.color) {
                case 'gray':
                    event.addAdvanced(relicId, (item, advanced, text) => {
                        text.add(Text.gray(tag.nameZH))
                    })
                    break;
                case 'yellow':
                    event.addAdvanced(relicId, (item, advanced, text) => {
                        text.add(Text.yellow(tag.nameZH))
                    })
                    break;
                case 'blue':
                    event.addAdvanced(relicId, (item, advanced, text) => {
                        text.add(Text.blue(tag.nameZH))
                    })
                    break;
                case 'green':
                    event.addAdvanced(relicId, (item, advanced, text) => {
                        text.add(Text.green(tag.nameZH))
                    })
                    break;
                case 'white':
                    event.addAdvanced(relicId, (item, advanced, text) => {
                        text.add(Text.white(tag.nameZH))
                    })
                    break;
            }
        }
        event.addAdvanced(relicId, (item, advanced, text) => {
            text.add(Text.darkGray("-----------------------"))
        })
        event.addAdvanced(relicId, (item, advanced, text) => {
            text.add(Text.darkGray(relic.story))
        })
    }
})