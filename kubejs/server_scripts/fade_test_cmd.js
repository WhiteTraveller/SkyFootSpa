// 渐隐测试页指令：/fadetest → 客户端打开黑底单图最小测试页（apricity/kubejs/fade_test.html）。
ServerEvents.commandRegistry(event => {
    const Commands = event.commands

    event.register(
        Commands.literal('fadetest')
            .executes(ctx => {
                let player = ctx.source.player
                if (!player) return 0
                player.sendData('pf_fade_test_open', {})
                return 1
            })
    )
})
