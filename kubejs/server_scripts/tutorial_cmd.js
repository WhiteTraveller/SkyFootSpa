// /playgif <name>：服务端指令 → 客户端打开 GIF Overlay 叠在当前界面上播放。
// 触发端（FTB Quests 奖励 / custom_command）填 /playgif 1 即可播放 tutorials/1.gif。
ServerEvents.commandRegistry(event => {
    const Commands = event.commands
    const StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')

    event.register(
        Commands.literal('playgif')
            .then(Commands.argument('name', StringArgumentType.string())
                .executes(ctx => {
                    let player = ctx.source.player
                    if (!player) return 0
                    let name = StringArgumentType.getString(ctx, 'name')
                    player.sendData('pf_play_tutorial', { name: name })
                    return 1
                })
            )
            .executes(ctx => {
                // 无参数 → 默认播放 tutorials/default.gif
                let player = ctx.source.player
                if (!player) return 0
                player.sendData('pf_play_tutorial', { name: 'default' })
                return 1
            })
    )
})
