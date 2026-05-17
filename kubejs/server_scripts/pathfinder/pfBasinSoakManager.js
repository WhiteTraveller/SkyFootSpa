// priority: 9
// ============================================================
// 床旁 Create 工作盆（Basin）自动泡脚管理
// ------------------------------------------------------------
// 触发：顾客在床上睡眠阶段，pfSleepManager.pfProcessSleeping 在
//        sleepDuration % 20 === 1 的每秒节拍回调 pfTickBasinSoak
//
// 与原有（玩家手动用洗脚水桶右键）流程 100% 兼容：
//   - 倒计时仍交由 pfSoakManager.pfProcessSoaking 递减手持物品中的
//     pfSoakTimeLeft，UI 读取同一套 NBT 字段，因此原倒计时 HUD 自动生效
//   - 新增 NBT 标记：pfBasinAuto = 1 表示当前泡脚由 Basin 自动触发
//
// Basin 模块仅做 3 件事：
//   (A) 启动：未泡脚且 Basin 合法 → 写入 pfIsSoaking=1, pfSoakTimeLeft=10,
//              pfSoakWaterType, pfBasinAuto=1
//   (B) 校验：自动模式下每秒重查；若 Basin 流体失效则重置 NBT
//   (C) 结算：soakDone=1 且 pfBasinAuto=1 时消耗 Basin 1000mb 泡脚水，
//              就地替换为 kubejs:foot_water；清除 pfBasinAuto 标记
// ============================================================

let BASIN_BLOCK_ID = 'create:basin'
let COUNTDOWN_SECONDS = 10
let REQUIRED_AMOUNT = 1000
let OUTPUT_FLUID_ID = 'kubejs:foot_water'

// ----------------- Forge / Create 反射类加载（用于直接操作 FluidHandler） -----------------
let PF_JC = {} // JavaClasses
try {
    PF_JC.BlockPos        = Java.loadClass('net.minecraft.core.BlockPos')
    PF_JC.ResourceLocation= Java.loadClass('net.minecraft.resources.ResourceLocation')
    PF_JC.ForgeRegistries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    PF_JC.ForgeCapabilities = Java.loadClass('net.minecraftforge.common.capabilities.ForgeCapabilities')
    PF_JC.FluidStack      = Java.loadClass('net.minecraftforge.fluids.FluidStack')
    PF_JC.FluidAction     = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction')
    console.log('[PF-BASIN] Forge 流体相关类加载成功')
} catch (e) {
    console.log('[PF-BASIN] Forge 类加载失败，将仅依赖命令写入: ' + e)
}

// ----------------- 坐标计算 -----------------
// bedPos = { blockX, blockY, blockZ, yaw }
// 参考 sleep.js 的 pfGetFootPosition 方向映射：
//   yaw=0   : 床尾在 -Z（Basin 再往 -Z 再 1 格）
//   yaw=180 : 床尾在 +Z
//   yaw=90  : 床尾在 +X
//   yaw=-90 : 床尾在 -X
function pfComputeBasinPos(bedPos) {
    if (!bedPos) return null
    let bx = bedPos.blockX
    let bz = bedPos.blockZ
    let by = bedPos.blockY - 1
    let yaw = bedPos.yaw | 0

    if (yaw === 0) {
        bz = bedPos.blockZ - 2
    } else if (yaw === 180 || yaw === -180) {
        bz = bedPos.blockZ + 2
    } else if (yaw === 90) {
        bx = bedPos.blockX + 2
    } else if (yaw === -90 || yaw === 270) {
        bx = bedPos.blockX - 2
    } else {
        return null
    }
    return { x: bx, y: by, z: bz }
}

// ----------------- 读 Basin 流体 -----------------
// 返回 { fluidId, amount } 或 null
// 优先走 Forge Capability API，失败回退 entityData 正则提取
function pfReadBasinFluid(level, pos) {
    try {
        let block = level.getBlock(pos.x, pos.y, pos.z)
        if (!block) return null
        let blockId = '' + block.id
        if (blockId !== BASIN_BLOCK_ID) return null

        // -------- 路径 1：Forge Capability --------
        if (PF_JC.BlockPos && PF_JC.ForgeCapabilities) {
            try {
                let be = level.getBlockEntity(new PF_JC.BlockPos(pos.x, pos.y, pos.z))
                if (be) {
                    let capLazy = be.getCapability(PF_JC.ForgeCapabilities.FLUID_HANDLER)
                    if (capLazy && capLazy.isPresent()) {
                        let handler = capLazy.orElse(null)
                        if (handler) {
                            let n = handler.getTanks()
                            for (let i = 0; i < n; i++) {
                                let fs = handler.getFluidInTank(i)
                                let isEmpty = (!fs) || fs.isEmpty()
                                if (isEmpty) continue
                                let fid = '' + fs.getFluid().builtInRegistryHolder().key().location()
                                let amt = fs.getAmount() | 0
                                // 找到第一个非空 tank 即返回（Basin 暴露 4 个 tank：2 input + 2 output）
                                // 废水拦截交给 pfBasinContainsUsedWater 处理
                                return { fluidId: fid, amount: amt, _viaCap: true, _tankIdx: i }
                            }
                            // Capability 可用但所有 tank 空
                            return null
                        }
                    }
                }
            } catch (e) {
                // Capability 读取异常，静默回退 entityData
            }
        }

        // -------- 路径 2：entityData 正则 --------
        let data = block.entityData
        if (!data) return null
        let s = '' + data
        if (!s || s.length === 0) return null

        // 优先在 InputTanks 段内查找（实测字段名）
        let startIdx = s.indexOf('InputTanks')
        if (startIdx < 0) startIdx = s.indexOf('InputFluids') // 兼容旧版
        if (startIdx < 0) startIdx = 0
        let endIdx = s.indexOf('OutputTanks', startIdx + 1)
        if (endIdx < 0) endIdx = s.indexOf('OutputFluids', startIdx + 1)
        if (endIdx < 0) endIdx = s.length
        let segment = s.substring(startIdx, endIdx)

        // 注意：Create 实测中顺序是 Amount 在前，FluidName 在后
        let m = segment.match(/Amount:\s*(\d+),\s*FluidName:\s*"([^"]+)"/)
        if (m && m[2] !== 'minecraft:empty') {
            return { fluidId: m[2], amount: parseInt(m[1]) }
        }
        m = segment.match(/FluidName:\s*"([^"]+)",\s*Amount:\s*(\d+)/)
        if (m && m[1] !== 'minecraft:empty') {
            return { fluidId: m[1], amount: parseInt(m[2]) }
        }
        return null
    } catch (e) {
        return null
    }
}

// ----------------- 判定 Basin 内是否包含已使用洗脚水 -----------------
// Basin 可能同时存在多个 tank（InputTanks x2 + OutputTanks x2），
// 只要任何一个 tank 含 kubejs:foot_water 就视为有废水，禁止泡脚。
function pfBasinContainsUsedWater(level, pos) {
    try {
        let block = level.getBlock(pos.x, pos.y, pos.z)
        if (!block) return false
        if (('' + block.id) !== BASIN_BLOCK_ID) return false

        // -------- 路径 1：Capability 遍历所有 tank --------
        if (PF_JC.BlockPos && PF_JC.ForgeCapabilities) {
            try {
                let be = level.getBlockEntity(new PF_JC.BlockPos(pos.x, pos.y, pos.z))
                if (be) {
                    let capLazy = be.getCapability(PF_JC.ForgeCapabilities.FLUID_HANDLER)
                    if (capLazy && capLazy.isPresent()) {
                        let handler = capLazy.orElse(null)
                        if (handler) {
                            let n = handler.getTanks()
                            for (let i = 0; i < n; i++) {
                                let fs = handler.getFluidInTank(i)
                                if (fs && !fs.isEmpty()) {
                                    let fid = '' + fs.getFluid().builtInRegistryHolder().key().location()
                                    if (fid === OUTPUT_FLUID_ID) return true
                                }
                            }
                            return false
                        }
                    }
                }
            } catch (e) {
                // 静默回退
            }
        }

        // -------- 路径 2：entityData 全文正则扫描 --------
        let data = block.entityData
        if (!data) return false
        let s = '' + data
        if (!s || s.length === 0) return false
        // 只要整段 NBT 中出现 FluidName:"kubejs:foot_water" 就视为有废水
        if (s.indexOf('FluidName:"' + OUTPUT_FLUID_ID + '"') >= 0) return true
        return false
    } catch (e) {
        return false
    }
}

// ----------------- 定位 Basin InputTanks 中“可被替换”的槽位（NBT 索引 0 或 1） -----------------
// 背景：Create Basin 的 Forge combined FluidHandler 暴露顺序为
//   [OutputTanks[0], OutputTanks[1], InputTanks[0], InputTanks[1]]
// 所以 Capability 返回的 tankIdx 不能直接用作 /data modify 里 InputTanks[i] 的 i。
// 这里直接扫 entityData 的 InputTanks 段，返回首个“非空且不是废水”的槽位。
// 找不到返回 -1。
function pfFindInputSlotForReplace(level, pos) {
    try {
        let block = level.getBlock(pos.x, pos.y, pos.z)
        if (!block) return -1
        if (('' + block.id) !== BASIN_BLOCK_ID) return -1
        let data = block.entityData
        if (!data) return -1
        let s = '' + data
        if (!s) return -1

        let startIdx = s.indexOf('InputTanks:[')
        if (startIdx < 0) return -1
        let endIdx = s.indexOf(']', startIdx)
        if (endIdx < 0) return -1
        let segment = s.substring(startIdx, endIdx + 1)

        // 依次匹配 0/1 两个 TankContent
        let re = /TankContent:\{Amount:\s*(\d+),\s*FluidName:\s*"([^"]+)"\}/g
        let i = 0
        let m
        let foundEmptyOrUsedSlot = -1
        while ((m = re.exec(segment)) !== null) {
            let amt = parseInt(m[1])
            let fid = m[2]
            if (fid !== 'minecraft:empty' && amt > 0 && fid !== OUTPUT_FLUID_ID) {
                return i
            }
            // 备选：空槽或被脱状态的槽位（避免遇到两个都是废水的诡异情况）
            if (foundEmptyOrUsedSlot < 0) foundEmptyOrUsedSlot = i
            i++
            if (i >= 2) break
        }
        return foundEmptyOrUsedSlot
    } catch (e) {
        return -1
    }
}

// ----------------- 判定是否为已注册泡脚水 -----------------
// 原版 minecraft:water 视为"清水"兜底，返回伪 def，对应桶 id = minecraft:water_bucket
// （pfSoakManager / pfSoakWaterEffects 已支持 minecraft:water_bucket 作为无附加效果的清水类型）
let PF_BASIN_PLAIN_WATER_DEF = {
    name: 'plain_water',
    nameZH: '清水',
    getBucketId: function () { return 'minecraft:water_bucket' },
    getFluidId: function () { return 'minecraft:water' }
}

function pfGetSoakWaterByFluid(fluidId) {
    if (!fluidId) return null
    // 原版水兜底
    if (('' + fluidId) === 'minecraft:water') return PF_BASIN_PLAIN_WATER_DEF
    if (!global.soakWaterRegister) return null
    try {
        let def = global.soakWaterRegister.getByFluidId(fluidId)
        return def || null
    } catch (e) {
        return null
    }
}

// ----------------- 写入 Basin 流体（消耗泡脚水→注入洗脚水） -----------------
// 实测日志提示：Create Basin 真实 NBT 结构为
//   InputTanks: [
//     { Level:{Speed,Target,Value}, TankContent:{Amount,FluidName} },
//     { Level:{...},                TankContent:{Amount:0,FluidName:"minecraft:empty"} }
//   ]
//   OutputTanks: [ 同上 ]
// 注意：TankContent 是单 Compound，不是 List。
// Forge combined FluidHandler 受 .forbidExtraction() 限制无法 drain input，
// 改用 /data modify 直接改 BE NBT——原生命令会自动调用
// BlockEntity.load() + setChanged() + sendBlockUpdated()。
function pfWriteBasinFluid(level, pos, fluidId, amount, tankIdx) {
    let server = level.getServer()
    let x = pos.x, y = pos.y, z = pos.z
    let idx = (tankIdx | 0)
    if (idx < 0) idx = 0

    // ====== 写入前日志 ======
    try {
        let block = level.getBlock(x, y, z)
        console.log('[PF-BASIN] [BEFORE] pos=(' + x + ',' + y + ',' + z + ') tankIdx=' + idx
            + ' blockId=' + (block ? block.id : 'null')
            + ' entityData=' + (block ? block.entityData : 'null'))
    } catch (e) { }

    // ====== 命令写入（已验证的正确路径） ======
    let tankPath = 'InputTanks[' + idx + ']'
    let cmds = [
        // InputTanks[idx].TankContent 是单 Compound，直接改 FluidName / Amount
        'data modify block ' + x + ' ' + y + ' ' + z
            + ' ' + tankPath + '.TankContent.FluidName set value "' + fluidId + '"',
        'data modify block ' + x + ' ' + y + ' ' + z
            + ' ' + tankPath + '.TankContent.Amount set value ' + amount,
        // 保证视觉层面滿水（Target/Value -> 1.0）
        'data modify block ' + x + ' ' + y + ' ' + z
            + ' ' + tankPath + '.Level.Target set value 1.0f',
        'data modify block ' + x + ' ' + y + ' ' + z
            + ' ' + tankPath + '.Level.Value set value 1.0f'
    ]
    for (let i = 0; i < cmds.length; i++) {
        try { server.runCommandSilent(cmds[i]) } catch (e) { }
    }

    // ====== 写入后日志 ======
    try {
        let block = level.getBlock(x, y, z)
        console.log('[PF-BASIN] [AFTER ] entityData=' + (block ? block.entityData : 'null'))
    } catch (e) { }
}

// ----------------- 获取/写入顾客手持同步 NBT -----------------
function pfReadSoakNbt(ent) {
    let item = ent.getMainHandItem()
    if (!item || !global.pfConstants || item.id !== global.pfConstants.SYNC_ITEM_ID || !item.nbt) {
        return null
    }
    let nbt = item.nbt
    return {
        item: item,
        nbt: nbt,
        isSoaking: nbt.getInt('pfIsSoaking') || 0,
        soakDone: nbt.getInt('pfSoakDone') || 0,
        basinAuto: nbt.getInt('pfBasinAuto') || 0,
        soakTimeLeft: nbt.getInt('pfSoakTimeLeft') || 0
    }
}

function pfWriteSoakNbt(ent, snap, patch) {
    let nbt = snap.nbt
    for (let k in patch) {
        nbt[k] = patch[k]
    }
    ent.setMainHandItem(snap.item.withNBT(nbt))
}

// ----------------- 每秒驱动一次 -----------------
function pfTickBasinSoak(ent, level, sleepDuration) {
    let bedPos = global.pfEntityData.pfGetBedInfo(ent)
    let basinPos = pfComputeBasinPos(bedPos)
    if (!basinPos) {
        return false
    }

    let snap = pfReadSoakNbt(ent)
    if (!snap) return false

    let fluid = pfReadBasinFluid(level, basinPos)
    let def = null
    if (fluid && fluid.amount >= REQUIRED_AMOUNT) {
        def = pfGetSoakWaterByFluid(fluid.fluidId)
    }
    // Basin 内只要任何 tank 含“已使用洗脚水”（kubejs:foot_water）就视为废水
    let isUsedWater = pfBasinContainsUsedWater(level, basinPos)

    // ===== (C) 结算：自动泡脚已完成倒计时 → 替换流体 =====
    if (snap.soakDone === 1 && snap.basinAuto === 1) {
        // 结算前再读一次验证流体还在
        let curFluid = pfReadBasinFluid(level, basinPos)
        // 直接扫 entityData 拿到真实的 InputTanks NBT 槽位（不依赖 Capability 顺序）
        let nbtSlot = pfFindInputSlotForReplace(level, basinPos)
        if (curFluid && curFluid.amount >= REQUIRED_AMOUNT
                && pfGetSoakWaterByFluid(curFluid.fluidId)
                && nbtSlot >= 0) {
            pfWriteBasinFluid(level, basinPos, OUTPUT_FLUID_ID, REQUIRED_AMOUNT, nbtSlot)
            pfWriteSoakNbt(ent, snap, { pfBasinAuto: 0 })
            console.log('[PF-BASIN] 泡脚完成，Basin ' + basinPos.x + ',' + basinPos.y + ',' + basinPos.z
                + ' InputTanks[' + nbtSlot + '] 消耗 ' + REQUIRED_AMOUNT + 'mb 泡脚水 → ' + OUTPUT_FLUID_ID)
        } else {
            // 流体被取走或未找到可写槽位：仅清状态防止脏数据
            pfWriteSoakNbt(ent, snap, { pfBasinAuto: 0 })
            console.log('[PF-BASIN] 泡脚完成但跳过流体写入'
                + '（fluid=' + (curFluid ? curFluid.fluidId + '/' + curFluid.amount + 'mb' : 'null')
                + ', nbtSlot=' + nbtSlot + '）')
        }
        return true
    }

    // ===== (B) 校验：自动模式下每秒重查流体合法性 =====
    //        或 Basin 被替换为已使用洗脚水 → 立即终止
    if (snap.isSoaking === 1 && snap.basinAuto === 1) {
        if (!def || isUsedWater) {
            pfWriteSoakNbt(ent, snap, {
                pfIsSoaking: 0,
                pfSoakTimeLeft: 0,
                pfBasinAuto: 0
            })
            console.log('[PF-BASIN] Basin 流体中断（'
                + (isUsedWater ? '已是废水 ' + OUTPUT_FLUID_ID : '被抽走或不足 1000mb')
                + '），倒计时重置')
        }
        return false
    }

    // 已进入手动泡脚流程，或泡脚已完成 → Basin 不介入
    if (snap.isSoaking === 1) return false
    if (snap.soakDone === 1) return false

    // Basin 已是废水 → 不启动自动泡脚
    if (isUsedWater) return false

    // ===== (A) 启动：未泡脚且 Basin 合法 → 开启自动倒计时 =====
    if (def) {
        pfWriteSoakNbt(ent, snap, {
            pfIsSoaking: 1,
            pfSoakDone: 0,
            pfSoakTimeLeft: COUNTDOWN_SECONDS,
            pfSoakWaterType: def.getBucketId(),
            pfBasinAuto: 1
        })
        console.log('[PF-BASIN] 自动泡脚启动，water=' + fluid.fluidId
            + ' 倒计时 ' + COUNTDOWN_SECONDS + 's，UI 将由 pfProcessSoaking 驱动')
        return true
    }

    return false
}

global.pfBasinSoakManager = {
    pfComputeBasinPos: pfComputeBasinPos,
    pfReadBasinFluid: pfReadBasinFluid,
    pfWriteBasinFluid: pfWriteBasinFluid,
    pfBasinContainsUsedWater: pfBasinContainsUsedWater,
    pfGetSoakWaterByFluid: pfGetSoakWaterByFluid,
    pfTickBasinSoak: pfTickBasinSoak
}
