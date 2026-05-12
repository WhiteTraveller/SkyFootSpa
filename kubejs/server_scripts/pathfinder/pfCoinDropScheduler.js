// priority: 500
// ============================================================
// 硬币掉落调度器（Coin Drop Scheduler）
// ------------------------------------------------------------
// 功能：
//   将结算时的硬币奖励从"一次性 summon 多枚"改为
//   "每 2 tick 以随机微小速度弹出一枚"，直到队列清空。
//
// 入队接口：
//   global.pfCoinQueue.enqueueCoins(level, x, y, z, totalCopper)
//     - totalCopper：总金额（以铜币为基准单位），会按面额贪心拆分
//     - 返回：实际入队的硬币枚数
//
// 与之前的区别：
//   旧：level.server.runCommandSilent('summon item ... Count:N') 一次到位
//   新：拆成 N 枚单枚 item，每 2 tick 取 1 枚，带 Motion NBT 弹出
// ============================================================

// --- 硬币面额表（与 sleep.js / pfSoakWaterEffects.js 保持一致） ---
const PF_COIN_TIERS = [
    { id: 'coinsje:netherite_coin', value: 6561 },
    { id: 'coinsje:diamond_coin',   value: 729  },
    { id: 'coinsje:gold_coin',      value: 81   },
    { id: 'coinsje:iron_coin',      value: 9    },
    { id: 'coinsje:copper_coin',    value: 1    }
]

// --- 调度参数 ---
const PF_COIN_DROP_INTERVAL = 2      // 每 N tick 弹出 1 枚（用户要求：2 tick）

// --- 全局掉落队列（元素: { server, x, y, z, id }） ---
const PF_COIN_QUEUE = []

/**
 * 将累计铜币贪心拆分并入队，按 "高面额优先" 顺序压入队列
 * @return 实际入队枚数
 */
function pfEnqueueCoins(level, x, y, z, totalCopper) {
    if (!level || totalCopper == null) return 0
    let n = Math.max(0, Math.floor(totalCopper))
    if (n <= 0) return 0

    let server = level.getServer()
    let remaining = n
    let pushed = 0

    for (let t = 0; t < PF_COIN_TIERS.length; t++) {
        let tier = PF_COIN_TIERS[t]
        let cnt = Math.floor(remaining / tier.value)
        if (cnt <= 0) continue
        remaining -= cnt * tier.value
        for (let i = 0; i < cnt; i++) {
            PF_COIN_QUEUE.push({
                server: server,
                x: x, y: y, z: z,
                id: tier.id
            })
            pushed++
        }
    }
    if (pushed > 0) {
        console.log('[PF-COIN-QUEUE] 入队 ' + pushed + ' 枚硬币 (totalCopper=' + n + ', queue.size=' + PF_COIN_QUEUE.length + ')')
    }
    return pushed
}

// --- 对外暴露 ---
global.pfCoinQueue = {
    enqueueCoins: pfEnqueueCoins,
    size: function () { return PF_COIN_QUEUE.length },
    clear: function () { PF_COIN_QUEUE.length = 0 }
}

// --- tick 调度：每 2 tick 消费 1 枚 ---
let pfCoinTickCounter = 0
ServerEvents.tick(event => {
    pfCoinTickCounter++
    if (pfCoinTickCounter % PF_COIN_DROP_INTERVAL !== 0) return
    if (PF_COIN_QUEUE.length === 0) return

    let job = PF_COIN_QUEUE.shift()
    try {
        // 随机微小速度：
        //   水平 x/z 方向 ±0.15 块/tick
        //   垂直 y 方向 0.25 ~ 0.45 块/tick（略带向上喷射感）
        let vx = (Math.random() - 0.5) * 0.3
        let vy = 0.25 + Math.random() * 0.2
        let vz = (Math.random() - 0.5) * 0.3

        let motion = 'Motion:[' + vx.toFixed(4) + 'd,' + vy.toFixed(4) + 'd,' + vz.toFixed(4) + 'd]'
        let nbt = '{Item:{id:"' + job.id + '",Count:1b},' + motion + ',PickupDelay:10s}'
        let cmd = 'summon item ' + job.x + ' ' + job.y + ' ' + job.z + ' ' + nbt
        job.server.runCommandSilent(cmd)
    } catch (e) {
        console.log('[PF-COIN-QUEUE] 弹出硬币失败: ' + e)
    }
})

console.log('[PF-COIN-QUEUE] 硬币掉落调度器已注册 (间隔=' + PF_COIN_DROP_INTERVAL + ' tick/枚)')
