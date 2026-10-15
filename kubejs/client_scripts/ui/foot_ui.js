// ============================================================
// 睡眠实体UI显示模块 - 客户端脚本
// foot_ui.js - 在世界中显示睡眠实体的脚部UI
// ============================================================

// 常量定义
let SYNC_ITEM_ID = 'minecraft:paper'  // 用于同步数据的手持物品ID

let OIL_ID_TO_NAME = {
    'marguerite:oil': '精油'
}

let WorldWindow = Java.loadClass("com.sighs.apricityui.world.WorldWindow")
let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")
let Minecraft = Java.loadClass("net.minecraft.client.Minecraft")
let Vec3 = Java.loadClass("net.minecraft.world.phys.Vec3")

console.log("[FOOT-UI] client script loaded: soak single-window button-hit v5")

// WorldWindow.clear()

// 全局状态管理：放在 global 上，避免 KubeJS 热重载后多个 tick 处理器各自持有一套 Map。
global.pfFootUiClientState = global.pfFootUiClientState || {
    sleepWindows: new Map(),
    soakWindows: new Map(),
    trackedEntities: new Map(),
    entityCountdowns: new Map(),
    entitySoakState: new Map(),
    windowRemovalQueue: [],
    pendingWindowTransitions: new Map()
}
global.pfFootUiClientState.pendingWindowTransitions =
    global.pfFootUiClientState.pendingWindowTransitions || new Map()
let sleepWindows = global.pfFootUiClientState.sleepWindows
let soakWindows = global.pfFootUiClientState.soakWindows
let trackedEntities = global.pfFootUiClientState.trackedEntities
let entityCountdowns = global.pfFootUiClientState.entityCountdowns
let entitySoakState = global.pfFootUiClientState.entitySoakState
let pendingWindowTransitions = global.pfFootUiClientState.pendingWindowTransitions

// 安全移除队列：延迟移除 WorldWindow，避免框架 mousePosition NPE
let windowRemovalQueue = global.pfFootUiClientState.windowRemovalQueue

/**
 * 安全移除 WorldWindow：延迟 2 tick 后实际移除
 * 避免在鼠标悬停时立即移除窗口导致框架内部 NPE
 */
function safeRemoveWorldWindow(window, onRemoved) {
    windowRemovalQueue.push({ window: window, ticksLeft: 2, onRemoved: onRemoved || null })
}

function clearAuiDebugDocuments() {
    try {
        ApricityUI.removeDocument("devtools/devtools.html")
    } catch (e) {}
    try {
        ApricityUI.removeDocument("devtools/resource.html")
    } catch (e) {}
}

// 拖动状态：每个 window 独立
// （dragState 已弃用，交互状态存储在各 window 闭包的 tracking 对象中）

// 手物品ID → 动画素材文件名
let HAND_TO_FLOAT_IMG = {
    'marguerite:hand_jiaozhang': 'hand_jiaozhang.png',
    'marguerite:hand_jiaoxin':   'hand_jiaoxin.png',
    'marguerite:hand_jiaogen':   'hand_jiaogen.png',
    'marguerite:hand_jiaozhi':   'hand_jiaozhi.png',
    'marguerite:fascia_gun_jiaozhang': 'hand_jiaozhang.png',
    'marguerite:fascia_gun_jiaoxin':   'hand_jiaoxin.png',
    'marguerite:fascia_gun_jiaogen':   'hand_jiaogen.png',
    'marguerite:fascia_gun_jiaozhi':   'hand_jiaozhi.png',
    'marguerite:fascia_gun_jiaozhang_advanced': 'hand_jiaozhang.png',
    'marguerite:fascia_gun_jiaoxin_advanced':   'hand_jiaoxin.png',
    'marguerite:fascia_gun_jiaogen_advanced':   'hand_jiaogen.png',
    'marguerite:fascia_gun_jiaozhi_advanced':   'hand_jiaozhi.png',
    'marguerite:fascia_gun_universal': 'fascia_gun.png'
}

// 拖动距离阈值（像素）：累计路程 >= 此值视为一次有效搓脚
let DRAG_THRESHOLD = 200

// UI配置
let BAR_WIDTH = 100.0
let BAR_HEIGHT = 150.0
let SCALE = 0.01
let MAX_DISTANCE = 16
let MAX_DISTANCE_SQR = MAX_DISTANCE * MAX_DISTANCE
// 边界卡顿防回归：WorldWindow 在 16 格外不可见；已有窗口到 18 格才回收，
// 留出 2 格滞回，避免玩家在可视边界附近移动时反复创建/延迟销毁窗口。
let WINDOW_REMOVE_DISTANCE = MAX_DISTANCE + 2
let WINDOW_REMOVE_DISTANCE_SQR = WINDOW_REMOVE_DISTANCE * WINDOW_REMOVE_DISTANCE
let WINDOW_LIFT = 1.35
let PI = 3.1415926

/**
 * 根据床的 yaw 计算脚的位置（顾客中心位置）
 */
function pfGetFootPosition(bedX, bedY, bedZ, yaw) {
    let footX = bedX
    let footZ = bedZ
    if (yaw === 0) {
        footZ = bedZ - 1
    } else if (yaw === 180 || yaw === -180) {
        footZ = bedZ + 1
    } else if (yaw === 90) {
        footX = bedX + 1
    } else if (yaw === -90) {
        footX = bedX - 1
    }

    return { x: footX + 0.5, y: bedY - 0.1, z: footZ + 0.68 }
}

function liftWorldWindow(window, footPos) {
    if (window == null || footPos == null) {
        return
    }
    try {
        window.setPosition(new Vec3(footPos.x, footPos.y + WINDOW_LIFT, footPos.z))
    } catch (e) {
        console.log("[FOOT-UI] 调整WorldWindow位置失败: " + e)
    }
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
    // 读取当前倒计时、需求清单、满意度和步骤
    let countdown = getCountdown(entity)
    entityCountdowns.set(uuid, countdown)
    console.log("[FOOT-UI-DATA] 创建窗口 - entity uuid=" + uuid)
    let demandList = getDemandList(entity)
    let satisfaction = getSatisfaction(entity)
    let steps = getSteps(entity)
    console.log("[FOOT-UI-DATA] 最终需求清单: " + JSON.stringify(demandList) + ", 满意度=" + satisfaction + "%, 步骤=" + steps)

    // 注意：路径是相对于 apricity/ 目录的 footui
    let window = ApricityUI.createWorldWindow(
        "kubejs/footui.html",
        new Vec3(footPos.x, footPos.y, footPos.z),
        MAX_DISTANCE
    )
    if (window == null) {
        console.log("[FOOT-UI] 创建睡眠UI失败: window=null")
        return null
    }
    if (bedYaw == -90) bedYaw = 270
    window.setRotation(360 - bedYaw, 0)
    liftWorldWindow(window, footPos)
    console.log("[FOOT-UI-DATA] 设置窗口旋转角度: " + bedYaw + " -> " + (360 - bedYaw))
    window.setScale(SCALE)

    sleepWindows.set(uuid, window)
    trackedEntities.set(uuid, entity)

    // 脚图片交互：鼠标移入即显示物品图标跟随，累计距离达标自动触发搓脚
    let footImage = window.document.getElementById("footImage")
    let floatAnimEl = window.document.getElementById("floatAnim")
    if (footImage != null && floatAnimEl != null) {
        // 拖动状态存储在闭包内
        let tracking = { active: false, lastX: 0, lastY: 0, totalDist: 0, moveEvents: 0, requestSeq: 0 }

        footImage.addEventListener("mousemove", function(event) {
            if (!entity || !entity.isAlive()) return
            let player = Minecraft.getInstance().player
            if (!player) return
            let handId = "" + player.getMainHandItem().id
            let imgFile = HAND_TO_FLOAT_IMG[handId]
            if (!imgFile) {
                // 手中没有搓脚工具，隐藏图标
                if (tracking.active) {
                    tracking.active = false
                    floatAnimEl.setAttribute("style", "opacity:0; left:-9999px;")
                    let imgEl = window.document.getElementById("floatImg")
                    if (imgEl) imgEl.setAttribute("src", "")
                }
                return
            }

            // 以监听容器为坐标原点，避免事件命中子图片时 offsetX/offsetY 跳变
            if (event.clientX === undefined || event.clientX === null ||
                event.clientY === undefined || event.clientY === null) return
            let bounds = footImage.getBoundingClientRect()
            let mouseX = event.clientX - bounds.left
            let mouseY = event.clientY - bounds.top

            if (!tracking.active) {
                tracking.active = true
                tracking.lastX = mouseX
                tracking.lastY = mouseY
                tracking.totalDist = 0
                tracking.moveEvents = 0
                console.log("[FOOT-DRAG] start uuid=" + uuid + " item=" + handId +
                    " pos=" + Math.round(mouseX) + "," + Math.round(mouseY))
            } else {
                let dx = mouseX - tracking.lastX
                let dy = mouseY - tracking.lastY
                let moved = Math.sqrt(dx * dx + dy * dy)
                tracking.totalDist += moved
                tracking.lastX = mouseX
                tracking.lastY = mouseY
                tracking.moveEvents++

                if (tracking.moveEvents % 10 === 0) {
                    console.log("[FOOT-DRAG] move uuid=" + uuid + " item=" + handId +
                        " n=" + tracking.moveEvents + " delta=" + Math.round(dx) + "," + Math.round(dy) +
                        " step=" + Math.round(moved) + " total=" + Math.round(tracking.totalDist))
                }

                // 每累计 200 像素触发一次；保留余量，并处理单帧跨过多个阈值的情况
                while (tracking.totalDist >= DRAG_THRESHOLD) {
                    tracking.totalDist -= DRAG_THRESHOLD
                    tracking.requestSeq++
                    let clientRequestId = tracking.requestSeq
                    console.log("[FOOT-DRAG] send uuid=" + uuid + " requestId=" + clientRequestId +
                        " item=" + handId + " moveN=" + tracking.moveEvents +
                        " remainder=" + Math.round(tracking.totalDist))
                    player.sendData('foot_click_demand', {
                        entityUuid: uuid,
                        clientRequestId: clientRequestId
                    })
                }
            }

            // 每帧更新图标（切换手持物品时实时变化）
            let imgEl = window.document.getElementById("floatImg")
            if (imgEl) imgEl.setAttribute("src", imgFile)

            // 图标跟随鼠标位置（元素中心对齐光标，直接用 footImage 内坐标）
            let elemLeft = mouseX - 50
            let elemTop = mouseY - 50
            floatAnimEl.setAttribute("style", "opacity:1; left:" + elemLeft + "px; top:" + elemTop + "px; z-index:-10; width:100px; height:100px; display:flex; justify-content:center; align-items:center; transform:translateZ(1px); pointer-events:none;")
        })

        footImage.addEventListener("mouseleave", function(event) {
            if (tracking.active) {
                console.log("[FOOT-DRAG] leave uuid=" + uuid + " item=" +
                    (Minecraft.getInstance().player ? "" + Minecraft.getInstance().player.getMainHandItem().id : "none") +
                    " moveN=" + tracking.moveEvents + " remainder=" + Math.round(tracking.totalDist))
                tracking.active = false
                tracking.totalDist = 0
                floatAnimEl.setAttribute("style", "opacity:0; left:-9999px;")
                let imgEl = window.document.getElementById("floatImg")
                if (imgEl) imgEl.setAttribute("src", "")
            }
        })
    }

    // 送客按钮：点击后顾客直接起床（服务端跳过结算分支）
    let dismissBtn = window.document.getElementById("dismissBtn")
    if (dismissBtn != null) {
        dismissBtn.addEventListener("mousedown", function(event) {
            if (!entity || !entity.isAlive()) {
                console.log("[FOOT-UI] 送客：实体不存在或死亡")
                return
            }
            console.log("[FOOT-UI] 点击送客按钮 uuid=" + uuid)
            let player = Minecraft.getInstance().player
            if (player != null) {
                player.sendData('foot_dismiss_customer', { entityUuid: uuid })
            }
        })
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
function removeSleepWindow(uuid, onRemoved) {
    let window = sleepWindows.get(uuid)
    if (window != null) {
        safeRemoveWorldWindow(window, onRemoved)
        sleepWindows.delete(uuid)
        console.log("[FOOT-UI] 移除UI窗口 uuid=" + uuid)
    } else if (onRemoved) {
        onRemoved()
    }
    trackedEntities.delete(uuid)
    entityCountdowns.delete(uuid)
    entitySoakState.delete(uuid)
}

/**
 * 移除泡脚UI窗口
 */
function removeSoakWindow(uuid, onRemoved) {
    let window = soakWindows.get(uuid)
    if (window != null) {
        safeRemoveWorldWindow(window, onRemoved)
        soakWindows.delete(uuid)
        console.log("[FOOT-UI] 移除泡脚UI窗口 uuid=" + uuid)
    } else if (onRemoved) {
        onRemoved()
    }
}

/**
 * 等旧 WorldWindow 真正移除后，再创建目标窗口。
 * AUI 需要延迟移除以避免 mousePosition NPE，但不能在等待期间创建第二个窗口。
 */
function scheduleWindowTransition(uuid, fromType, toType, entity) {
    if (pendingWindowTransitions.has(uuid)) return
    pendingWindowTransitions.set(uuid, toType)

    let afterRemoved = function() {
        pendingWindowTransitions.delete(uuid)
        if (!entity || !entity.isAlive()) return

        if (toType === "soak" && isSleeping(entity) && !isSoakDone(entity)) {
            createSoakWindow(entity)
        } else if (toType === "sleep" && isSleeping(entity) && isSoakDone(entity)) {
            createSleepWindow(entity)
        }
    }

    if (fromType === "soak") {
        removeSoakWindow(uuid, afterRemoved)
    } else {
        removeSleepWindow(uuid, afterRemoved)
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
    // 创建泡脚UI窗口
    let window = ApricityUI.createWorldWindow(
        "kubejs/footsoak.html",
        new Vec3(footPos.x, footPos.y, footPos.z),
        MAX_DISTANCE
    )
    if (window == null) {
        console.log("[FOOT-UI] 创建泡脚UI失败: window=null")
        return null
    }
    if (bedYaw == -90) bedYaw = 270
    window.setRotation(360 - bedYaw, 0)
    liftWorldWindow(window, footPos)
    window.setScale(SCALE)

    soakWindows.set(uuid, window)
    trackedEntities.set(uuid, entity)

    // 初始化泡脚状态
    let soakState = entitySoakState.get(uuid) || { isSoaking: false, soakTimeLeft: 10 }
    entitySoakState.set(uuid, soakState)

    // 给空桶按钮添加点击事件：只接受右键，避免整张 HTML 都触发泡脚。
    let soakBtn = window.document.getElementById("soakBtn")
    if (soakBtn != null) {
        soakBtn.addEventListener("mousedown", event => {
            let button = event.button
            if (button !== undefined && button !== null && button !== 1 && button !== 2) {
                return
            }
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
        let titleEl = window.document.getElementById("mainTitle")
        let tipsEl = window.document.getElementById("tipsText")
        let wrapperEl = window.document.getElementById("progressWrapper")
        let fillEl = window.document.getElementById("progressFill")
        let textEl = window.document.getElementById("progressText")

        if (isSoaking) {
            // 泡脚中：标题切换、tips清空、进度条显示
            setTextIfChanged(titleEl, "innerText", "开始泡脚")
            setTextIfChanged(tipsEl, "innerText", "")
            setAttributeIfChanged(wrapperEl, "style", "opacity: 1")

            // 进度条填充百分比（基于 10 秒总时长），颜色固定白色
            let percent = Math.max(0, Math.min(100, (timeLeft / 10) * 100))
            if (fillEl != null) {
                setAttributeIfChanged(fillEl, "style", "width: " + percent + "%")
            }
            if (textEl != null) {
                setTextIfChanged(textEl, "innerText", Math.max(0, Math.ceil(timeLeft)) + "s")
            }

            console.log("[FOOT-UI] 泡脚UI更新 title=" + (titleEl != null) + " tips=" + (tipsEl != null) + " wrapper=" + (wrapperEl != null) + " fill=" + (fillEl != null) + " text=" + (textEl != null) + " percent=" + percent)
        } else {
            // 未泡脚：只显示水桶贴图，右键水桶区域后再显示进度。
            setTextIfChanged(titleEl, "innerText", "")
            setTextIfChanged(tipsEl, "innerText", "")
            setAttributeIfChanged(wrapperEl, "style", "opacity: 0")
            setTextIfChanged(textEl, "innerText", "")
            setAttributeIfChanged(fillEl, "style", "width: 0%")
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新泡脚倒计时失败: " + e)
    }
}

// Avoid repeated writes through the ApricityUI DOM bridge when the rendered value is unchanged.
function setTextIfChanged(element, property, value) {
    if (element == null) return
    let next = "" + value
    if ("" + element[property] !== next) element[property] = next
}

function setAttributeIfChanged(element, attribute, value) {
    if (element == null) return
    let next = "" + value
    let current = element.getAttribute(attribute)
    if (current == null || ("" + current) !== next) {
        element.setAttribute(attribute, next)
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
            setTextIfChanged(countdownNumber, "innerText", String(countdown))
        }
        // 更新紧迫状态样式
        let countdownContainer = window.document.getElementById("countdownContainer")
        if (countdownContainer != null) {
            if (countdown <= 3) {
                setAttributeIfChanged(countdownContainer, "class", "countdown-container countdown-urgent")
            } else {
                setAttributeIfChanged(countdownContainer, "class", "countdown-container")
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
function isSleeping(entity, mainHand) {
    if (entity == null) {
        return false
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let phase = mainHand.nbt.getInt('pfPhase')
        return phase === 3
    }
    return false
}

/**
 * 检查实体是否已完成泡脚（从NBT读取pfSoakDone）
 */
function isSoakDone(entity, mainHand) {
    if (entity == null) {
        return false
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let soakDone = mainHand.nbt.getInt('pfSoakDone')
        return soakDone === 1
    }
    return false
}

/**
 * 获取泡脚剩余时间（从NBT读取pfSoakTimeLeft）
 */
function getSoakTimeLeft(entity, mainHand) {
    if (entity == null) {
        return 10
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let timeLeft = mainHand.nbt.getInt('pfSoakTimeLeft')
        return timeLeft >= 0 ? timeLeft : 0
    }
    return 0
}

/**
 * 检查实体是否正在泡脚中（从NBT读取pfIsSoaking）
 */
function isSoaking(entity, mainHand) {
    if (entity == null) {
        return false
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let isSoaking = mainHand.nbt.getInt('pfIsSoaking')
        return isSoaking === 1
    }
    return false
}

/**
 * 从手持物品读取需求清单ﾈ4部位）
 * 返回对象: {脚掌, 脚后跟, 脚趾, 脚心}
 */
function getDemandList(entity, mainHand) {
    if (entity == null) {
        console.log("[FOOT-UI-DATA] getDemandList: entity为null")
        return { '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let result = {
            '脚掌': mainHand.nbt.getInt('pfDemandJiaozhang') || 0,
            '脚后跟': mainHand.nbt.getInt('pfDemandJiaogen') || 0,
            '脚趾': mainHand.nbt.getInt('pfDemandJiaozhi') || 0,
            '脚心': mainHand.nbt.getInt('pfDemandJiaoxin') || 0
        }
        return result
    }
    console.log("[FOOT-UI-DATA] 手持物品不是红石，无法读取需求清单")
    return { '脚掌': 0, '脚后跟': 0, '脚趾': 0, '脚心': 0 }
}

/**
 * 从手持物品读取倒计时
 * 返回剩余秒数（1-10），如果没有则返回10
 */
function getCountdown(entity, mainHand) {
    if (entity == null) {
        return 10
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
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
function getSatisfaction(entity, mainHand) {
    if (entity == null) {
        return 0
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
    if (mainHand && mainHand.id === SYNC_ITEM_ID) {
        let satisfaction = mainHand.nbt.getInt('pfSatisfaction')
        if (satisfaction >= 0 && satisfaction <= 100) {
            return satisfaction
        }
    }
    return 0
}

// 整数代码到中文名称映射ﾈ4部位）
let STEP_CODE_TO_NAME = {
    1: '脚掌',
    2: '脚后跟',
    3: '脚趾',
    4: '脚心'
}

/**
 * 从手持物品读取步骤记录（字符串格式：逗号分隔的整数）
 * 返回解码后的步骤字符串，如果没有则返回空字符串
 */
function getSteps(entity, mainHand) {
    if (entity == null) {
        return ""
    }
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
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
        // 更新需求清单各项目ﾈ4部位）

        // 脚掌
        let countJiaozhang = window.document.getElementById("countJiaozhang")
        if (countJiaozhang != null) {
            let count = demandList['脚掌'] || 0
            if (count === 0) {
                setTextIfChanged(countJiaozhang, "textContent", "✓")
                setAttributeIfChanged(countJiaozhang, "class", "count done")
            } else {
                setTextIfChanged(countJiaozhang, "textContent", count + "次")
                setAttributeIfChanged(countJiaozhang, "class", "count")
            }
        }

        // 脚后跟
        let countJiaogen = window.document.getElementById("countJiaogen")
        if (countJiaogen != null) {
            let count = demandList['脚后跟'] || 0
            if (count === 0) {
                setTextIfChanged(countJiaogen, "textContent", "✓")
                setAttributeIfChanged(countJiaogen, "class", "count done")
            } else {
                setTextIfChanged(countJiaogen, "textContent", count + "次")
                setAttributeIfChanged(countJiaogen, "class", "count")
            }
        }

        // 脚趾
        let countJiaozhi = window.document.getElementById("countJiaozhi")
        if (countJiaozhi != null) {
            let count = demandList['脚趾'] || 0
            if (count === 0) {
                setTextIfChanged(countJiaozhi, "textContent", "✓")
                setAttributeIfChanged(countJiaozhi, "class", "count done")
            } else {
                setTextIfChanged(countJiaozhi, "textContent", count + "次")
                setAttributeIfChanged(countJiaozhi, "class", "count")
            }
        }

        // 脚心
        let countJiaoxin = window.document.getElementById("countJiaoxin")
        if (countJiaoxin != null) {
            let count = demandList['脚心'] || 0
            if (count === 0) {
                setTextIfChanged(countJiaoxin, "textContent", "✓")
                setAttributeIfChanged(countJiaoxin, "class", "count done")
            } else {
                setTextIfChanged(countJiaoxin, "textContent", count + "次")
                setAttributeIfChanged(countJiaoxin, "class", "count")
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新需求清单失败: " + e)
    }
}

/**
 * 更新满意度显示 - 横向进度条（颜色固定 #844c24）
 * 格式：满意度：[███      ] 80%
 */
function updateSatisfactionDisplay(window, satisfaction) {
    if (window == null || window.document == null) {
        return
    }
    try {
        let fillElement = window.document.getElementById("satisfactionFill")
        let percentElement = window.document.getElementById("satisfactionPercent")

        let percent = Math.max(0, Math.min(100, satisfaction))

        if (fillElement != null) {
            setAttributeIfChanged(fillElement, "style", "width: " + percent + "%")
        }
        if (percentElement != null) {
            setTextIfChanged(percentElement, "textContent", satisfaction + "%")
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
                setTextIfChanged(stepsElement, "innerText", steps)
            } else {
                setTextIfChanged(stepsElement, "innerText", "")
            }
        }
    } catch (e) {
        console.log("[FOOT-UI] 更新步骤显示失败: " + e)
    }
}

function getOilInfo(entity, mainHand) {
    if (mainHand === undefined) mainHand = entity.getMainHandItem()
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
            setTextIfChanged(oilElement, "innerText", name + "(" + oilInfo.left + ")")
        } else {
            setTextIfChanged(oilElement, "innerText", "✕")
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

    // 处理延迟移除队列
    for (let i = windowRemovalQueue.length - 1; i >= 0; i--) {
        windowRemovalQueue[i].ticksLeft--
        if (windowRemovalQueue[i].ticksLeft <= 0) {
            let removal = windowRemovalQueue[i]
            try { WorldWindow.removeWindow(removal.window) } catch (e) {}
            windowRemovalQueue.splice(i, 1)
            if (removal.onRemoved) {
                try { removal.onRemoved() } catch (e) {
                    console.log("[FOOT-UI] 窗口切换回调失败: " + e)
                }
            }
        }
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

        // 范围边界卡顿原因：inflate(MAX_DISTANCE) 按立方体搜索，会命中球面范围外的角落实体。
        // 若不先按直线距离过滤，这些实体会每 tick 创建窗口，再被下方范围清理延迟销毁。
        let entityDistanceSqr = entity.position().distanceToSqr(playerPos)
        if (entityDistanceSqr > MAX_DISTANCE_SQR) continue

        // 本轮轮询共用手持物品引用，避免每个状态 getter 都跨 Java 边界重新取物品。
        let mainHand = entity.getMainHandItem()

        if (isSleeping(entity, mainHand)) {
            // 实体正在睡眠
            // 检查是否已完成泡脚
            let soakDone = isSoakDone(entity, mainHand)

            if (!soakDone) {
                // 未泡脚或泡脚中，显示泡脚UI
                if (!soakWindows.has(uuid)) {
                    if (sleepWindows.has(uuid)) {
                        scheduleWindowTransition(uuid, "sleep", "soak", entity)
                    } else if (!pendingWindowTransitions.has(uuid)) {
                        createSoakWindow(entity)
                    }
                } else {
                    // 更新泡脚UI倒计时
                    let window = soakWindows.get(uuid)
                    let timeLeft = getSoakTimeLeft(entity, mainHand)
                    let soaking = isSoaking(entity, mainHand)
                    let soakState = entitySoakState.get(uuid) || { isSoaking: false, soakTimeLeft: 10 }

                    // 状态切换时打印一次
                    if (soakState.isSoaking !== soaking) {
                        console.log("[FOOT-UI] 泡脚状态切换 uuid=" + uuid + " " + soakState.isSoaking + " -> " + soaking + " timeLeft=" + timeLeft)
                    }

                    // 更新状态
                    soakState.isSoaking = soaking
                    soakState.soakTimeLeft = timeLeft
                    entitySoakState.set(uuid, soakState)

                    updateSoakCountdownDisplay(window, timeLeft, soaking)
                }
            } else {
                // 已完成泡脚，显示主UI
                if (!sleepWindows.has(uuid)) {
                    if (soakWindows.has(uuid)) {
                        scheduleWindowTransition(uuid, "soak", "sleep", entity)
                    } else if (!pendingWindowTransitions.has(uuid)) {
                        createSleepWindow(entity)
                    }
                } else {
                    // 检查倒计时是否变化
                    let window = sleepWindows.get(uuid)
                    let currentCountdown = getCountdown(entity, mainHand)
                    let lastCountdown = entityCountdowns.get(uuid) || 10
                    if (currentCountdown !== lastCountdown) {
                        entityCountdowns.set(uuid, currentCountdown)
                        updateCountdownDisplay(window, currentCountdown)
                        console.log("[FOOT-UI] 倒计时更新: " + lastCountdown + " -> " + currentCountdown)
                    }
                    let demandList = getDemandList(entity, mainHand)
                    updateDemandListDisplay(window, demandList)

                    // 更新满意度显示
                    let satisfaction = getSatisfaction(entity, mainHand)
                    updateSatisfactionDisplay(window, satisfaction)

                    // 更新步骤显示
                    let steps = getSteps(entity, mainHand)
                    updateStepsDisplay(window, steps)

                    updateOilDisplay(window, getOilInfo(entity, mainHand))
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
            if (dist > WINDOW_REMOVE_DISTANCE_SQR) {
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
            if (dist > WINDOW_REMOVE_DISTANCE_SQR) {
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
        clearAuiDebugDocuments()
    } catch (e) {}
    sleepWindows.clear()
    soakWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
    entitySoakState.clear()
    pendingWindowTransitions.clear()
})

/**
 * 玩家离开世界时清理所有窗口
 */
ClientEvents.loggedOut(event => {
    sleepWindows.forEach(function (window, uuid) {
        try { WorldWindow.removeWindow(window) } catch (e) {}
    })
    soakWindows.forEach(function (window, uuid) {
        try { WorldWindow.removeWindow(window) } catch (e) {}
    })
    // 清空待移除队列（登出时直接清理不再延迟）
    for (let i = 0; i < windowRemovalQueue.length; i++) {
        try { WorldWindow.removeWindow(windowRemovalQueue[i].window) } catch (e) {}
    }
    windowRemovalQueue.length = 0
    sleepWindows.clear()
    soakWindows.clear()
    trackedEntities.clear()
    entityCountdowns.clear()
    entitySoakState.clear()
    pendingWindowTransitions.clear()

    try {
        ApricityUI.removeDocument("kubejs/footui.html")
        ApricityUI.removeDocument("kubejs/footsoak.html")
        clearAuiDebugDocuments()
    } catch (e) {}
})


// 服务端搓脚成功回调（动画已在 mouseup 时乐观触发，此处仅作日志确认）
NetworkEvents.dataReceived('pf_serve_success', event => {
    try {
        let data = event.data
        if (data == null) return
        let entityUuid = "" + data.getString('entityUuid')
        let part = "" + data.getString('part')
        let window = sleepWindows.get(entityUuid)
        if (window != null) {
            updateDemandListDisplay(window, {
                '脚掌': data.getInt('demandJiaozhang'),
                '脚后跟': data.getInt('demandJiaogen'),
                '脚趾': data.getInt('demandJiaozhi'),
                '脚心': data.getInt('demandJiaoxin')
            })
            updateSatisfactionDisplay(window, data.getInt('satisfaction'))
        }
        console.log("[FOOT-UI] pf_serve_success uuid=" + entityUuid + " part=" + part)
    } catch (e) { console.log("[FOOT-UI] pf_serve_success 处理失败: " + e) }
})
