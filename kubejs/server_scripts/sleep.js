// ============================================================
// 睡眠控制模块 - pathfinder.js 的睡眠回调扩展
// sleep.js L1-L120
// UI显示由 client_scripts/foot_ui.js 管理
// ============================================================

// 常量定义
let SYNC_ITEM_ID = 'minecraft:redstone'  // 用于同步数据的手持物品ID

// 全局 Window 管理器（保留用于客户端脚本访问）
global.pfSleepWindows = global.pfSleepWindows || new Map()

/**
 * 根据床的 yaw 计算脚的位置（床尾位置）
 * yaw 是实体面向的方向（头朝向），脚在相反方向
 * 
 * @param {number} bedX    床头X坐标
 * @param {number} bedY    床Y坐标
 * @param {number} bedZ    床头Z坐标
 * @param {number} yaw     实体朝向（头朝向）
 * @returns {Object} 脚位置 {x, y, z}
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    // yaw=0: 头朝南(+Z), 脚朝北(-Z)
    // yaw=180: 头朝北(-Z), 脚朝南(+Z)
    // yaw=90: 头朝西(-X), 脚朝东(+X)
    // yaw=-90: 头朝东(+X), 脚朝西(-X)
    let footX = bedX
    let footZ = bedZ

    if (yaw === 0) {
        // 头朝南，脚在北
        footZ = bedZ - 1
    } else if (yaw === 180 || yaw === -180) {
        // 头朝北，脚在南
        footZ = bedZ + 1
    } else if (yaw === 90) {
        // 头朝西，脚在东
        footX = bedX + 1
    } else if (yaw === -90) {
        // 头朝东，脚在西
        footX = bedX - 1
    }

    return { x: footX + 0.5, y: bedY, z: footZ + 0.5 }
}

/**
 * 开始睡觉时触发的回调函数
 * UI创建由客户端脚本（foot_ui.js）处理，此处仅记录日志
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} currentTick     当前游戏tick
 */
global.pfOnStartSleep = function (entity, level, bedPos, currentTick) {
    let uuid = "" + entity.getUuid()
    console.log("[SLEEP-JS] 开始睡觉 uuid=" + uuid + " bedPos=(" + bedPos.blockX + "," + bedPos.blockY + "," + bedPos.blockZ + ") yaw=" + bedPos.yaw)

    // 计算脚的位置（用于日志）
    let footPos = pfGetFootPosition(bedPos.blockX, bedPos.blockY, bedPos.blockZ, bedPos.yaw)
    console.log("[SLEEP-JS] 脚位置: (" + footPos.x.toFixed(1) + "," + footPos.y + "," + footPos.z.toFixed(1) + ")")
    
    // UI由客户端脚本管理，无需在此创建
}

/**
 * 检测是否应该起床
 * 返回 true 时实体会起床，返回 false 则继续睡觉
 * UI移除由客户端脚本（foot_ui.js）处理
 * 
 * @param {$LivingEntity_} entity  正在睡觉的实体
 * @param {$Level_} level          世界对象
 * @param {Object} bedPos          床位坐标 {blockX, blockY, blockZ, yaw}
 * @param {number} sleepDuration   已睡眠时长（tick）
 * @returns {boolean} true=应该起床, false=继续睡觉
 */
global.pfShouldWakeUp = function (entity, level, bedPos, sleepDuration) {
    let uuid = "" + entity.getUuid()

    // // 10秒（200 tick）超时起床
    // if (sleepDuration > 200) {
    //     console.log("[SLEEP-JS] 睡眠超时 200 tick，起床 uuid=" + uuid)
    //     return true
    // }

    // // 检测 serve_finish 字段，存在则起床
    // let serveFinish = entity.persistentData.getInt("serve_finish")
    // if (serveFinish === 1) {
    //     console.log("[SLEEP-JS] 检测到 serve_finish 标记，起床")
    //     // 清除标记
    //     entity.persistentData.putInt("serve_finish", 0)
    //     return true
    // }

    // 检查需求清单是否全部为0
    let item = entity.getMainHandItem()
    if (item && item.id === SYNC_ITEM_ID && item.nbt) {
        let nbt = item.nbt
        let jiaobei = nbt.getInt('pfDemandJiaobei') || 0
        let jiaozhang = nbt.getInt('pfDemandJiaozhang') || 0
        let jiaogen = nbt.getInt('pfDemandJiaogen') || 0
        let jiaozhi = nbt.getInt('pfDemandJiaozhi') || 0
        let jiaoxin = nbt.getInt('pfDemandJiaoxin') || 0
        console.log("[SLEEP-JS] 需求: 脚背=" + jiaobei + ", 脚掌=" + jiaozhang + ", 脚根=" + jiaogen + ", 脚趾=" + jiaozhi + ", 脚心=" + jiaoxin)
        
        // 所有需求都为0时才能起床
        if (jiaobei === 0 && jiaozhang === 0 && jiaogen === 0 && jiaozhi === 0 && jiaoxin === 0) {
            console.log("[SLEEP-JS] 所有需求已清零，起床 uuid=" + uuid)
            
            // 结算规则：
            // - 本单最终掉落金锭数量 = 本单累计金钱（pfMoney）
            // - pfMoney 在每次"有效点击"时会增加：money_gain.<部位>
            //   所以这条规则等价于"每个部位点击收益 * 点击次数 的总和"
            let money = nbt.getInt('pfMoney') || 0
            let goldCount = Math.max(0, Math.floor(money))
            console.log("[SLEEP-JS] 需求完成！掉落金锭: " + goldCount + "个 (累计金钱=" + money + ")")
            if (goldCount > 0) {
                // 使用原版指令生成金锭物品
                let x = entity.x
                let y = (entity.y + 1)
                let z = entity.z
                let remaining = goldCount
                while (remaining > 0) {
                    // 原版物品堆叠上限通常是 64，因此这里按 64 分批召唤掉落物，
                    // 避免一次性 Count 太大导致指令无效或显示异常。
                    let count = Math.min(64, remaining)
                    let cmd = 'summon item ' + x + ' ' + y + ' ' + z + ' {Item:{id:"minecraft:gold_ingot",Count:' + count + 'b}}'
                    level.getServer().runCommandSilent(cmd)
                    remaining -= count
                }
            }
            
            return true
        }
    }

    return false
}
