// priority: 10
// ============================================================
// 旧地狱维度传送命令
// ------------------------------------------------------------
// /oldhell —— 把执行命令的玩家传送到 marguerite:old_hell 维度：
//   · x、z 沿用玩家当前所在坐标
//   · y 固定写死为 80
// 维度定义见：
//   kubejs/data/marguerite/dimension/old_hell.json
//   kubejs/data/marguerite/dimension_type/old_hell.json
//   kubejs/data/marguerite/worldgen/biome/old_hell.json
// 注意：old_hell 为 y=0~255 全实心石头维度，y=80 位于石头内部，
//   传送后玩家会被石头包裹，需创造模式或立即挖掘，否则会窒息。
// ============================================================

ServerEvents.commandRegistry(event => {
    const Commands = event.commands

    event.register(
        Commands.literal('oldhell')
            .executes(ctx => {
                let player = ctx.source.player
                if (!player) return 0

                // x、z 取玩家当前坐标，y 写死为 80
                let x = Math.floor(player.x)
                let y = 80
                let z = Math.floor(player.z)

                let cmd = 'execute in marguerite:old_hell run tp '
                    + player.username + ' ' + x + ' ' + y + ' ' + z
                let result = player.server.runCommandSilent(cmd)

                if (result <= 0) {
                    player.tell('§c传送失败：维度 marguerite:old_hell 可能未加载，请先执行 /reload 或重进世界')
                    return 0
                }
                player.tell('§6已传送到旧地狱 §7(x=' + x + ', y=' + y + ', z=' + z + ')')
                return 1
            })
    )
})

console.log('[OLD-HELL] 已注册传送命令 /oldhell → marguerite:old_hell (y=80)')
