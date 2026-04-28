ItemEvents.tooltip(event => {
    let oils = global.oilRegister.oils
    for (let i = 0; i < oils.length; i++) {
        let oil = oils[i]
        event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
            if (oil.description != null) {
                text.add(oil.description)
            }
        })
        event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
            text.add(Text.darkGray("-----------------------"))
        })
        for (let j = 0; j < oil.tags.length; j++) {
            let tag = oil.tags[j]
            if (!tag) continue
            switch (tag.color) {
                case 'gray':
                    event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
                        text.add(Text.gray(tag.nameZH))
                    })
                    break;
                case 'yellow':
                    event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
                        text.add(Text.yellow(tag.nameZH))
                    })
                    break;
                case 'blue':
                    event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
                        text.add(Text.blue(tag.nameZH))
                    })
                    break;
                case 'green':
                    event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
                        text.add(Text.green(tag.nameZH))
                    })
                    break;
                case 'white':
                    event.addAdvanced(oil.getOilId(), (item, advanced, text) => {
                        text.add(Text.white(tag.nameZH))
                    })
                    break;
            }
        }
    }
})
