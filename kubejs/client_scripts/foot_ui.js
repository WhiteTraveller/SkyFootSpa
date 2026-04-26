// ============================================================
// 睡眠实体UI显示模块 - 客户端脚本
// foot_ui.js - 在世界中显示睡眠实体的脚部UI
// ============================================================

// 常量定义
let SYNC_ITEM_ID = 'minecraft:redstone'  // 用于同步数据的手持物品ID

let OIL_ID_TO_NAME = {
    'marguerite:oil': '精油'
}

let WorldWindow = Java.loadClass("com.sighs.apricityui.instance.WorldWindow")
let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")
let Minecraft = Java.loadClass("net.minecraft.client.Minecraft")

// WorldWindow.clear()

// 全局状态管理
let sleepWindows = new Map()
let soakWindows = new Map()       // 泡脚UI窗口
let trackedEntities = new Map()
let entityCountdowns = new Map()  // 存储每个实体的上次倒计时值
let entitySoakState = new Map()   // 存储每个实体的泡脚状态 { isSoaking: boolean, soakTimeLeft: number }

// UI配置
let BAR_WIDTH = 100.0
let BAR_HEIGHT = 150.0
let SCALE = 0.01
let MAX_DISTANCE = 16
let PI = 3.1415926

/**
 * 根据床的 yaw 计算脚的位置（顾客中心位置）
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    let footX = bedX
    let footZ = bedZ

    // 计算顾客中心位置，而不是床尾位置
    // 床的长度为2格，顾客中心在床的中间
    if (yaw === 0) {
        // 床朝向北方，顾客中心在z-0.5
        footZ = bedZ - 0.5
    } else if (yaw === 180 || yaw === -180) {
        // 床朝向南方，顾客中心在z+0.5
        footZ = bedZ + 0.5
    } else if (yaw === 90) {
        // 床朝向东方，顾客中心在x+0.5
        footX = bedX + 0.5
    } else if (yaw === -90) {
        // 床朝向西方，顾客中心在x-0.5
        footX = bedX - 0.5
    }

    return { x: footX, y: bedY + 1, z: footZ }
}

/**
 * 创建睡眠实体的UI窗口
 */
function createSleepWindow(entity) {
    // 确保实体存在且存活
    if (!entity || !entity.isAlive()) {
        console.log("[FOOT-UI] 实体不存在或死亡，无法创建UI窗口")
        return null
    }

    let uuid = "" + entity.getUuid()

    // 从手持物品NBT读取床位信息（物品NBT自动同步）
    let mainHand = entity.getMainHandItem()
    let bedX = 0, bedY = 0, bedZ = 0, bedYaw = 0
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        bedX = mainHand.nbt.getInt('pfBedX')
        bedY = mainHand.nbt.getInt('pfBedY')
        bedZ = mainHand.nbt.getInt('pfBedZ')
        bedYaw = mainHand.nbt.getInt('pfBedYaw')
        console.log("[FOOT-UI-DATA] 读取pfBedNBT: " + bedX + ", " + bedY + ", " + bedZ + ", " + bedYaw)
    }

    // 计算脚的位置
    let footPos = pfGetFootPosition(bedX, bedY, bedZ, bedYaw)
    let footBlockPos = new BlockPos(footPos.x, footPos.y, footPos.z)

    // 读取当前倒计时、需求清单、满意度和步骤
    let countdown = getCountdown(entity)
    entityCountdowns.set(uuid, countdown)
    console.log("[FOOT-UI-DATA] 创建窗口 - entity uuid=" + uuid)
    let demandList = getDemandList(entity)
    let satisfaction = getSatisfaction(entity)
    let steps = getSteps(entity)
    console.log("[FOOT-UI-DATA] 最终需求清单: " + JSON.stringify(demandList) + ", 满意度=" + satisfaction + "%, 步骤=" + steps)

    // 注意：路径是相对于 apricity/ 目录的 footui
    let window = new WorldWindow("kubejs/footui.html", footBlockPos, BAR_WIDTH, BAR_HEIGHT, MAX_DISTANCE)
    if (bedYaw == -90) bedYaw = 270
    window.setRotation(360 - bedYaw, 0)
    console.log("[FOOT-UI-DATA] 设置窗口旋转角度: " + bedYaw + " -> " + (360 - bedYaw))
    window.setScale(SCALE)

    WorldWindow.addWindow(window)

    sleepWindows.set(uuid, window)
    trackedEntities.set(uuid, entity)

    // 给各个部位按钮添加点击事件
    // 部位按钮ID与需求键的映射
    let partButtonMap = {
        'jiaobei': 'pfDemandJiaobei',    // 脚背
        'jiaozhang': 'pfDemandJiaozhang', // 脚掌
        'jiaogen': 'pfDemandJiaogen',    // 脚后跟
        'jiaozhi': 'pfDemandJiaozhi',    // 脚趾
        'jiaoxin': 'pfDemandJiaoxin'     // 脚心
    }
    
    // 为每个部位按钮绑定点击事件
    for (let btnId in partButtonMap) {
        let btn = window.document.getElementById(btnId)
        if (btn != null) {
            btn.addEventListener("mousedown", (function(partKey) {
                return function(event) {
                    // 确保实体仍然存在且存活
                    if (!entity || !entity.isAlive()) {
                        console.log("[FOOT-UI] 实体不存在或死亡，无法执行操作")
                        return
                    }
                    
                    console.log("[FOOT-UI] 点击" + partKey + "按钮，发送请求到服务端 uuid=" + uuid)
                    // 发送网络包到服务端，包含部位信息
                    let player = Minecraft.getInstance().player
                    if (player != null) {
                        player.sendData('foot_click_demand', { 
                            entityUuid: uuid,
                            partKey: partKey
                        })
                    }
                }
            })(partButtonMap[btnId]))
        }
    }

    // 设置初始倒计时、需求清单、满意度和步骤显示
    updateCountdownDisplay(window, countdown)
    updateDemandListDisplay(window, demandList)
    updateSatisfactionDisplay(window, satisfaction)
    updateStepsDisplay(window, steps)
    updateOilDisplay(window, getOilInfo(entity))

    console.log("[FOOT-UI] 创建UI窗口 uuid=" + uuid + " countdown=" + countdown)
    return window
}

/**
 * 移除睡眠实体的UI窗口
 */
function removeSleepWindow(uuid) {
    let window = sleepWindows.get(uuid)
    if (window != null) {
        WorldWindow.removeWindow(window)
        sleepWindows.delete(uuid)
        console.log("[FOOT-UI] 移除UI窗口 uuid=" + uuid)
    }
    trackedEntities.delete(uuid)
    entityCountdowns.delete(uuid)
    entitySoakState.delete(uuid)
}

/**
 * 移除泡脚UI窗口
 */
function removeSoakWindow(uuid) {
    let window = soakWindows.get(uuid)
    if (window != null) {
        WorldWindow.removeWindow(window)
        soakWindows.delete(uuid)
        console.log("[FOOT-UI] 移除泡脚UI窗口 uuid=" + uuid)
    }
}

/**
 * 创建泡脚UI窗口
 */
function createSoakWindow(entity) {
    // 确保实体存在且存活
    if (!entity || !entity.isAlive()) {
        console.log("[FOOT-UI] 实体不存在或死亡，无法创建泡脚UI窗口")
        return null
    }

    let uuid = "" + entity.getUuid()

    // 从手持物品NBT读取床位信息
    let mainHand = entity.getMainHandItem()
    let bedX = 0, bedY = 0, bedZ = 0, bedYaw = 0
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        bedX = mainHand.nbt.getInt('pfBedX')
        bedY = mainHand.nbt.getInt('pfBedY')
        bedZ = mainHand.nbt.getInt('pfBedZ')
        bedYaw = mainHand.nbt.getInt('pfBedYaw')
    }

    // 计算脚的位置
    let footPos = pfGetFootPosition(bedX, bedY, bedZ, bedYaw)
    let footBlockPos = new BlockPos(footPos.x, footPos.y, footPos.z)

    // 创建泡脚UI窗口
    let window = new WorldWindow("kubejs/footsoak.html", footBlockPos, 120.0, 80.0, MAX_DISTANCE)
    if (bedYaw == -90) bedYaw = 270
    window.setRotation(360 - bedYaw, 0)
    window.setScale(SCALE)

    WorldWindow.addWindow(window)
    soakWindows.set(uuid, window)
    trackedEntities.set(uuid, entity)

    // 初始化泡脚状态
    let soakState = entitySoakState.get(uuid) || { isSoaking: false, soakTimeLeft: 10 }
    entitySoakState.set(uuid, soakState)

    // 给泡脚按钮添加点击事件
    let soakBtn = window.document.getElementById("soakBtn")
    if (soakBtn != null) {
        soakBtn.addEventListener("mousedown", event => {
            console.log("[FOOT-UI] 点击泡脚按钮 uuid=" + uuid)
            // 发送网络包到服务端请求开始泡脚
            let player = Minecraft.getInstance().player
            if (player != null) {
                player.sendData('foot_click_soak', { entityUuid: uuid })
            }
        })
    }

    // 更新倒计时显示
    updateSoakCountdownDisplay(window, soakState.soakTimeLeft, soakState.isSoaking)

    console.log("[FOOT-UI] 创建泡脚UI窗口 uuid=" + uuid)
    return window
}

/**
 * 更新泡脚倒计时显示
 */
function updateSoakCountdownDisplay(window, timeLeft, isSoaking) {
    if (window == null || window.document == null) {
        return
    }
    try {
        let filledElement = window.document.getElementById("progressFilled")
        let emptyElement = window.document.getElementById("progressEmpty")
        let timeElement = window.document.getElementById("countdownTime")
        let btnElement = window.document.getElementById("soakBtn")

        if (filledElement != null && emptyElement != null && timeElement != null) {
            // 生成进度条（共15个字符宽度）
            let totalBars = 15
            let filledBars = 0
            if (isSoaking) {
                filledBars = Math.round((timeLeft / 10) * totalBars)
            } else {
                filledBars = totalBars  // 未开始时全满
            }

            filledElement.innerText = "|".repeat(filledBars)
            emptyElement.innerText = "|".repeat(totalBars - filledBars)
            timeElement.innerText = timeLeft + "s"
        }

        // 更新按钮状态
        if (btnElement != null) {
            if (isSoaking) {
                btnElement.disabled = true
                btnElement.innerText = "泡脚中..."
            } else {
                btnElement.disabled = false
                btnElement.innerText = "开始泡脚"
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新泡脚倒计时失败: " + e)
    }
}

/**
 * 更新窗口中的倒计时显示
 */
function updateCountdownDisplay(window, countdown) {
    if (window == null || window.document == null) {
        return
    }
    try {
        // 更新倒计时数字
        let countdownNumber = window.document.getElementById("countdownNumber")
        if (countdownNumber != null) {
            countdownNumber.innerText = String(countdown)
        }
        // 更新紧迫状态样式
        let countdownContainer = window.document.getElementById("countdownContainer")
        if (countdownContainer != null) {
            if (countdown <= 3) {
                countdownContainer.setAttribute("class", "countdown-container countdown-urgent")
            } else {
                countdownContainer.setAttribute("class", "countdown-container")
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新倒计时失败: " + e)
    }
}

/**
 * 检查实体是否处于睡眠状态（pfPhase=3）
 * 从手持物品NBT读取（物品NBT自动同步）
 */
function isSleeping(entity) {
    if (entity == null) {
        return false
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let phase = mainHand.nbt.getInt('pfPhase')
        return phase === 3
    }
    return false
}

/**
 * 检查实体是否已完成泡脚（从NBT读取pfSoakDone）
 */
function isSoakDone(entity) {
    if (entity == null) {
        return false
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let soakDone = mainHand.nbt.getInt('pfSoakDone')
        return soakDone === 1
    }
    return false
}

/**
 * 获取泡脚剩余时间（从NBT读取pfSoakTimeLeft）
 */
function getSoakTimeLeft(entity) {
    if (entity == null) {
        return 10
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let timeLeft = mainHand.nbt.getInt('pfSoakTimeLeft')
        return timeLeft >= 0 ? timeLeft : 0
    }
    return 0
}

/**
 * 检查实体是否正在泡脚中（从NBT读取pfIsSoaking）
 */
function isSoaking(entity) {
    if (entity == null) {
        return false
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let isSoaking = mainHand.nbt.getInt('pfIsSoaking')
        return isSoaking === 1
    }
    return false
}

/**
 * 从手持物品读取需求清单
 * 返回对象: {脚背, 脚掌, 脚后跟, 脚趾, 脚心}
 */
function getDemandList(entity) {
    if (entity == null) {
        console.log("[FOOT-UI-DATA] getDemandList: entity为null")
        return { '脚背': 0, '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let result = {
            '脚背': mainHand.nbt.getInt('pfDemandJiaobei') || 0,
            '脚掌': mainHand.nbt.getInt('pfDemandJiaozhang') || 0,
            '脚后跟': mainHand.nbt.getInt('pfDemandJiaogen') || 0,
            '脚趾': mainHand.nbt.getInt('pfDemandJiaozhi') || 0,
            '脚心': mainHand.nbt.getInt('pfDemandJiaoxin') || 0
        }
        return result
    }
    console.log("[FOOT-UI-DATA] 手持物品不是红石，无法读取需求清单")
    return { '脚背': 0, '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
}

/**
 * 从手持物品读取倒计时
 * 返回剩余秒数（1-10），如果没有则返回10
 */
function getCountdown(entity) {
    if (entity == null) {
        return 10
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let countdown = mainHand.nbt.getInt('pfCountdown')
        if (countdown > 0 && countdown <= 10) {
            return countdown
        }
    }
    return 10
}

/**
 * 从手持物品读取满意度
 * 返回0-100的数值，如果没有则返回0
 */
function getSatisfaction(entity) {
    if (entity == null) {
        return 0
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let satisfaction = mainHand.nbt.getInt('pfSatisfaction')
        if (satisfaction >= 0 && satisfaction <= 100) {
            return satisfaction
        }
    }
    return 0
}

// 整数代码到中文名称映射（用于解码）
let STEP_CODE_TO_NAME = {
    1: '脚背',
    2: '脚掌',
    3: '脚后跟',
    4: '脚趾',
    5: '脚心'
}

/**
 * 从手持物品读取步骤记录（字符串格式：逗号分隔的整数）
 * 返回解码后的步骤字符串，如果没有则返回空字符串
 */
function getSteps(entity) {
    if (entity == null) {
        return ""
    }
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let stepsStr = mainHand.nbt.pfSteps
        if (stepsStr && stepsStr.length > 0) {
            // 解码字符串为中文
            return decodeStepsString(stepsStr)
        }
    }
    return ""
}

/**
 * 解码步骤字符串为中文显示
 * 输入："1,2,5"
 * 输出："脚背 → 脚掌 → 脚心"
 */
function decodeStepsString(stepsStr) {
    if (!stepsStr || stepsStr.length === 0) {
        return ""
    }

    let codes = stepsStr.split(",")
    let names = []

    for (let i = 0; i < codes.length; i++) {
        let code = parseInt(codes[i].trim(), 10)
        let name = STEP_CODE_TO_NAME[code]
        if (name) {
            names.push(name)
        }
    }

    return names.join(" → ")
}

/**
 * 更新窗口中的需求清单显示
 */
function updateDemandListDisplay(window, demandList) {
    if (window == null || window.document == null) {
        return
    }
    try {
        // 更新需求清单各项目
        // 脚背
        let countJiaobei = window.document.getElementById("countJiaobei")
        if (countJiaobei != null) {
            let count = demandList['脚背'] || 0
            if (count === 0) {
                countJiaobei.innerText = "✓"
                countJiaobei.setAttribute("class", "count done")
            } else {
                countJiaobei.innerText = count + "次"
                countJiaobei.setAttribute("class", "count")
            }
        }

        // 脚掌
        let countJiaozhang = window.document.getElementById("countJiaozhang")
        if (countJiaozhang != null) {
            let count = demandList['脚掌'] || 0
            if (count === 0) {
                countJiaozhang.innerText = "✓"
                countJiaozhang.setAttribute("class", "count done")
            } else {
                countJiaozhang.innerText = count + "次"
                countJiaozhang.setAttribute("class", "count")
            }
        }

        // 脚后跟
        let countJiaogen = window.document.getElementById("countJiaogen")
        if (countJiaogen != null) {
            let count = demandList['脚后跟'] || 0
            if (count === 0) {
                countJiaogen.innerText = "✓"
                countJiaogen.setAttribute("class", "count done")
            } else {
                countJiaogen.innerText = count + "次"
                countJiaogen.setAttribute("class", "count")
            }
        }

        // 脚趾
        let countJiaozhi = window.document.getElementById("countJiaozhi")
        if (countJiaozhi != null) {
            let count = demandList['脚趾'] || 0
            if (count === 0) {
                countJiaozhi.innerText = "✓"
                countJiaozhi.setAttribute("class", "count done")
            } else {
                countJiaozhi.innerText = count + "次"
                countJiaozhi.setAttribute("class", "count")
            }
        }

        // 脚心
        let countJiaoxin = window.document.getElementById("countJiaoxin")
        if (countJiaoxin != null) {
            let count = demandList['脚心'] || 0
            if (count === 0) {
                countJiaoxin.innerText = "✓"
                countJiaoxin.setAttribute("class", "count done")
            } else {
                countJiaoxin.innerText = count + "次"
                countJiaoxin.setAttribute("class", "count")
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新需求清单失败: " + e)
    }
}

/**
 * 更新满意度显示 - 纯文本进度条形式
 * 格式：满意度：[||||||||] 80%
 * 小于等于30%红色，大于等于70%绿色，其余黄色
 * 只显示填充部分，空白部分留空
 */
function updateSatisfactionDisplay(window, satisfaction) {
    if (window == null || window.document == null) {
        return
    }
    try {
        let filledElement = window.document.getElementById("progressFilled")
        let emptyElement = window.document.getElementById("progressEmpty")
        let percentElement = window.document.getElementById("satisfactionPercent")
        
        if (filledElement != null && emptyElement != null && percentElement != null) {
            // 根据满意度确定颜色
            let colorClass = ""
            if (satisfaction <= 30) {
                colorClass = "red"      // 红色
            } else if (satisfaction >= 70) {
                colorClass = "green"    // 绿色
            } else {
                colorClass = "yellow"   // 黄色
            }
            
            // 生成进度条（共20个字符宽度）
            let totalBars = 20
            let filledBars = Math.round((satisfaction / 100) * totalBars)
            
            // 只显示填充部分，空白部分留空
            filledElement.innerText = "|".repeat(filledBars)
            filledElement.setAttribute("class", "progress-filled " + colorClass)
            
            // 空白部分不显示任何内容
            emptyElement.innerText = ""
            
            percentElement.innerText = satisfaction + "%"
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新满意度失败: " + e)
    }
}

/**
 * 更新步骤显示
 */
function updateStepsDisplay(window, steps) {
    if (window == null || window.document == null) {
        return
    }
    try {
        console.log("[FOOT-UI] 更新步骤 +" + steps)
        let stepsElement = window.document.getElementById("stepsText")
        if (stepsElement != null) {
            if (steps && steps.length > 0) {
                stepsElement.innerText = steps
            } else {
                stepsElement.innerText = ""
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新步骤显示失败: " + e)
    }
}

function getOilInfo(entity) {
    let mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID && mainHand.nbt) {
        let id = mainHand.nbt.getString('pfOilId')
        let left = mainHand.nbt.getInt('pfOilLeft') || 0
        if (id && id.length > 0 && left > 0) {
            return { id: id, left: left }
        }
    }
    return null
}

function updateOilDisplay(window, oilInfo) {
    if (window == null || window.document == null) {
        return
    }
    try {
        let oilElement = window.document.getElementById("oilStatus")
        if (oilElement == null) return

        if (oilInfo && oilInfo.left > 0) {
            let name = OIL_ID_TO_NAME[oilInfo.id] || oilInfo.id
            oilElement.innerText = name + "(" + oilInfo.left + ")"
        } else {
            oilElement.innerText = "✕"
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新抹油状态失败: " + e)
    }
}


/**
 * 客户端Tick事件 - 检测并管理睡眠实体的UI
 */
let clientTickCount = 0

ClientEvents.tick(event => {
    let player = event.player
    if (player == null) {
        return
    }

    clientTickCount++
    let level = event.level
    let playerPos = player.position()

    // 获取玩家附近的实体
    let nearbyEntities = level.getEntitiesOfClass(
        Java.loadClass("net.minecraft.world.entity.LivingEntity"),
        player.getBoundingBox().inflate(MAX_DISTANCE)
    )

    // 检测睡眠中的实体
    for (let i = 0; i < nearbyEntities.length; i++) {
        let entity = nearbyEntities[i]
        if (entity == player) continue

        let uuid = "" + entity.getUuid()

        // 确保实体存在且存活
        if (!entity || !entity.isAlive()) {
            // 实体不存在或死亡，移除所有窗口
            if (sleepWindows.has(uuid)) {
                removeSleepWindow(uuid)
            }
            if (soakWindows.has(uuid)) {
                removeSoakWindow(uuid)
            }
            continue
        }

        if (isSleeping(entity)) {
            // 实体正在睡眠
            // 检查是否已完成泡脚
            let soakDone = isSoakDone(entity)

            if (!soakDone) {
                // 未泡脚或泡脚中，显示泡脚UI
                if (!soakWindows.has(uuid)) {
                    // 移除主UI（如果存在）
                    if (sleepWindows.has(uuid)) {
                        removeSleepWindow(uuid)
                    }
                    createSoakWindow(entity)
                } else {
                    // 更新泡脚UI倒计时
                    let window = soakWindows.get(uuid)
                    let timeLeft = getSoakTimeLeft(entity)
                    let soaking = isSoaking(entity)
                    let soakState = entitySoakState.get(uuid) || { isSoaking: false, soakTimeLeft: 10 }

                    // 更新状态
                    soakState.isSoaking = soaking
                    soakState.soakTimeLeft = timeLeft
                    entitySoakState.set(uuid, soakState)

                    updateSoakCountdownDisplay(window, timeLeft, soaking)
                }
            } else {
                // 已完成泡脚，显示主UI
                if (!sleepWindows.has(uuid)) {
                    // 移除泡脚UI（如果存在）
                    if (soakWindows.has(uuid)) {
                        removeSoakWindow(uuid)
                    }
                    createSleepWindow(entity)
                } else {
                    // 检查倒计时是否变化
                    let window = sleepWindows.get(uuid)
                    let currentCountdown = getCountdown(entity)
                    let lastCountdown = entityCountdowns.get(uuid) || 10
                    if (currentCountdown !== lastCountdown) {
                        entityCountdowns.set(uuid, currentCountdown)
                        updateCountdownDisplay(window, currentCountdown)
                        console.log("[FOOT-UI] 倒计时更新: " + lastCountdown + " -> " + currentCountdown)
                    }
                    let demandList = getDemandList(entity)
                    updateDemandListDisplay(window, demandList)

                    // 更新满意度显示
                    let satisfaction = getSatisfaction(entity)
                    updateSatisfactionDisplay(window, satisfaction)

                    // 更新步骤显示
                    let steps = getSteps(entity)
                    updateStepsDisplay(window, steps)

                    updateOilDisplay(window, getOilInfo(entity))
                }
            }
        } else {
            // 实体不在睡眠状态，移除所有窗口
            if (sleepWindows.has(uuid)) {
                removeSleepWindow(uuid)
            }
            if (soakWindows.has(uuid)) {
                removeSoakWindow(uuid)
            }
        }
    }

    // 清理超出范围的窗口
    let toRemove = []
    sleepWindows.forEach(function (window, uuid) {
        let entity = trackedEntities.get(uuid)
        if (entity == null || !entity.isAlive()) {
            toRemove.push(uuid)
        } else {
            let dist = entity.position().distanceToSqr(playerPos)
            if (dist > MAX_DISTANCE * MAX_DISTANCE) {
                toRemove.push(uuid)
            }
        }
    })
    for (let i = 0; i < toRemove.length; i++) {
        removeSleepWindow(toRemove[i])
    }

    // 清理超出范围的泡脚窗口
    let toRemoveSoak = []
    soakWindows.forEach(function (window, uuid) {
        let entity = trackedEntities.get(uuid)
        if (entity == null || !entity.isAlive()) {
            toRemoveSoak.push(uuid)
        } else {
            let dist = entity.position().distanceToSqr(playerPos)
            if (dist > MAX_DISTANCE * MAX_DISTANCE) {
                toRemoveSoak.push(uuid)
            }
        }
    })
    for (let i = 0; i < toRemoveSoak.length; i++) {
        removeSoakWindow(toRemoveSoak[i])
    }
})

/**
 * 玩家离开世界时清理所有窗口
 */
ClientEvents.loggedIn(event => {
    try {
        ApricityUI.removeDocument("kubejs/footui.html")
        ApricityUI.removeDocument("kubejs/footsoak.html")
    } catch (e) {}
    sleepWindows.clear()
    soakWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
    entitySoakState.clear()
})

ClientEvents.loggedOut(event => {
    sleepWindows.forEach(function (window, uuid) {
        WorldWindow.removeWindow(window)
    })
    soakWindows.forEach(function (window, uuid) {
        WorldWindow.removeWindow(window)
    })
    sleepWindows.clear()
    soakWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
    entitySoakState.clear()

    try {
        ApricityUI.removeDocument("kubejs/footui.html")
        ApricityUI.removeDocument("kubejs/footsoak.html")
    } catch (e) {}
})
