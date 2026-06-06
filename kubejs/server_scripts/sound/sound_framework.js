// priority: 20
// ============================================================
// 全局声音 / 音乐框架
// ------------------------------------------------------------
// 这是一个服务端脚本，用来把资源包里的 sound event 播放给玩家。
// 框架内部使用原版 /playsound 命令，因此声音会由服务器广播，
// 不依赖 client_scripts，也不会只在单个客户端本地播放。
//
// 基础用法，可以在任意 server_scripts 里调用：
//   global.music.playAll(event.server, 'kubejs:l1.07')
//   global.music.playAt(event.server, 'kubejs:l1.07', event.player, { volume: 1, pitch: 1 })
//   global.music.playForPlayer(event.player, 'kubejs:l1.07', { volume: 1, pitch: 1 })
//   global.music.playNearPlayer(event.player, 'kubejs:l1.07', { radius: 32 })
//   global.music.bind('shop_open', 'kubejs:l1.07', { volume: 1 })
//   global.music.emit('shop_open', event.server)
//
// 声音文件仍然必须在资源包里注册：
//   kubejs/assets/<namespace>/sounds.json
// 声音文件实际存放位置：
//   kubejs/assets/<namespace>/sounds/*.ogg
// ============================================================

global.music = global.music || {}
global.music.events = global.music.events || {}

// 把输入转成数字，并限制最小/最大值。
// 主要用于 volume、pitch、minVolume、radius 等参数。
function musicNum(value, fallback, min, max) {
    let n = Number(value)
    if (isNaN(n)) n = fallback
    if (min !== undefined && n < min) n = min
    if (max !== undefined && n > max) n = max
    return n
}

// 把玩家名等普通字符串包装成命令安全的引号字符串。
// 如果传入的是 @a、@p 这类选择器，不会走到这里。
function musicQuote(value) {
    return '"' + ('' + value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function musicPlayerTarget(player) {
    if (!player) return null
    if (typeof player === 'string') return player

    try {
        if (typeof player.getUsername === 'function') return '' + player.getUsername()
    } catch (e) { }

    try {
        if (player.username !== undefined) return '' + player.username
    } catch (e) { }

    try {
        if (typeof player.getGameProfile === 'function' && player.getGameProfile()) {
            return '' + player.getGameProfile().getName()
        }
    } catch (e) { }

    try {
        if (typeof player.getName === 'function' && player.getName()) {
            return '' + player.getName().getString()
        }
    } catch (e) { }

    return null
}

// 从玩家、实体、方块实体、坐标对象中解析出播放坐标。
// 支持：
//   player/entity: getX(), getY(), getZ()
//   blockEntity: getBlockPos()
//   object: { x: 0, y: 64, z: 0 }
function musicPosFrom(source) {
    if (!source) return null

    if (source.x !== undefined && source.y !== undefined && source.z !== undefined) {
        return {
            x: musicNum(source.x, 0),
            y: musicNum(source.y, 0),
            z: musicNum(source.z, 0)
        }
    }

    try {
        if (typeof source.getX === 'function' && typeof source.getY === 'function' && typeof source.getZ === 'function') {
            return {
                x: musicNum(source.getX(), 0),
                y: musicNum(source.getY(), 0),
                z: musicNum(source.getZ(), 0)
            }
        }
    } catch (e) { }

    try {
        if (source.getBlockPos && source.getBlockPos()) {
            let pos = source.getBlockPos()
            return {
                x: musicNum(pos.getX(), 0) + 0.5,
                y: musicNum(pos.getY(), 0) + 0.5,
                z: musicNum(pos.getZ(), 0) + 0.5
            }
        }
    } catch (e) { }

    return null
}

// 从事件、玩家、实体、方块实体、命令 source 中尽量找到 MinecraftServer。
// 这样调用方可以直接传 event.server、event.player、ctx.source 等常见对象。
function musicServerFrom(source) {
    if (!source) return null
    if (typeof source.runCommandSilent === 'function') return source
    if (source.server && typeof source.server.runCommandSilent === 'function') return source.server

    try {
        if (source.getServer && source.getServer()) return source.getServer()
    } catch (e) { }

    try {
        if (source.level && source.level.server) return source.level.server
    } catch (e) { }

    try {
        if (source.getLevel && source.getLevel() && source.getLevel().getServer) return source.getLevel().getServer()
    } catch (e) { }

    return null
}

// 根据 targets 参数生成 /playsound 的目标选择器。
// 支持：
//   all      -> @a
//   nearest  -> @p
//   self     -> @s
//   near     -> @a[x=...,y=...,z=...,distance=..radius]
//   @a/@p... -> 原样使用
//   玩家名   -> 自动加引号
//   player   -> 自动取玩家名并加引号
function musicBuildSelector(targets, pos, radius) {
    if (!targets || targets === 'all') return '@a'
    if (targets === 'nearest') return '@p'
    if (targets === 'self') return '@s'
    if (targets === 'near') {
        if (!pos || radius <= 0) return '@a'
        return '@a[x=' + pos.x + ',y=' + pos.y + ',z=' + pos.z + ',distance=..' + radius + ']'
    }
    if (typeof targets !== 'string') {
        let playerTarget = musicPlayerTarget(targets)
        if (playerTarget) return musicQuote(playerTarget)
    }
    if (targets.charAt && targets.charAt(0) === '@') return targets
    return musicQuote(targets)
}

// 最底层播放函数。
// 通常不需要直接调用，优先用 playAll / playAt / playForPlayer / playNearPlayer。
//
// options 可选字段：
//   targets: 'all' | 'near' | 'nearest' | 'self' | '@a[...]' | 玩家名 | player
//   pos: 播放位置，支持玩家/实体/方块实体/{x,y,z}
//   category: 声音分类，默认 master，也可用 record、music、player 等
//   volume: 音量，默认 1
//   pitch: 音高，默认 1
//   minVolume: 最小音量；playAll 默认会设为 1，确保所有人都能听到
//   radius: targets 为 near 时的半径
function musicPlay(source, soundId, options) {
    options = options || {}

    let server = musicServerFrom(options.server || source)
    if (!server) {
        console.log('[MUSIC] Cannot play sound without a server object: ' + soundId)
        return false
    }

    let pos = musicPosFrom(options.pos || source)
    if (!pos && options.level) pos = musicPosFrom(options.level)
    if (!pos) pos = { x: 0, y: 0, z: 0 }

    let category = options.category || options.source || 'master'
    let volume = musicNum(options.volume, 1.0, 0.0)
    let pitch = musicNum(options.pitch, 1.0, 0.0, 2.0)
    let minVolume = musicNum(options.minVolume, 0.0, 0.0, 1.0)
    let radius = musicNum(options.radius, 0, 0)
    let targets = musicBuildSelector(options.targets || 'all', pos, radius)

    let command = 'playsound ' + soundId + ' ' + category + ' ' + targets + ' ' +
        pos.x + ' ' + pos.y + ' ' + pos.z + ' ' + volume + ' ' + pitch + ' ' + minVolume

    try {
        server.runCommandSilent(command)
        return true
    } catch (e) {
        console.log('[MUSIC] Failed to run: ' + command + ' -> ' + e)
        return false
    }
}

global.music.play = musicPlay

// 全服播放。默认 minVolume = 1，所以即使玩家离播放坐标很远也能听见。
// 适合：Boss 登场、开店、全服事件、剧情音乐。
global.music.playAll = function (source, soundId, options) {
    options = options || {}
    options.targets = 'all'
    if (options.minVolume === undefined) options.minVolume = 1.0
    return musicPlay(source, soundId, options)
}

// 在某个位置播放给所有玩家。
// 注意：这里 targets 仍然默认是 all，但不强制 minVolume = 1。
// 如果玩家离得太远，可能听不见。需要全服都听见请用 playAll。
global.music.playAt = function (source, soundId, posSource, options) {
    options = options || {}
    options.pos = posSource
    options.targets = options.targets || 'all'
    return musicPlay(source, soundId, options)
}

// 在某个位置附近播放，只给半径内玩家听。
// 适合：机器音效、某个方块触发的环境音、局部事件。
global.music.playNear = function (source, soundId, posSource, radius, options) {
    options = options || {}
    options.pos = posSource
    options.targets = 'near'
    options.radius = radius
    return musicPlay(source, soundId, options)
}

// 以玩家位置为中心播放，只给附近玩家听。
// 默认半径 32 格。
global.music.playNearPlayer = function (player, soundId, options) {
    options = options || {}
    options.pos = player
    options.targets = options.targets || 'near'
    options.radius = options.radius || 32
    return musicPlay(player, soundId, options)
}

// 只给指定玩家播放。
// 默认以该玩家当前位置作为播放坐标，因此只有这个玩家会听见。
global.music.playForPlayer = function (player, soundId, options) {
    options = options || {}
    options.pos = options.pos || player
    options.targets = musicPlayerTarget(player)
    if (!options.targets) return false
    return musicPlay(player, soundId, options)
}

// 停止声音。
// 不传 soundId 时，停止指定分类下所有声音；默认分类 master。
// 传 soundId 时，只停止该声音。
global.music.stop = function (source, soundId, options) {
    options = options || {}
    let server = musicServerFrom(options.server || source)
    if (!server) return false

    let targets = musicBuildSelector(options.targets || 'all', null, 0)
    let category = options.category || options.source || 'master'
    let command = soundId
        ? 'stopsound ' + targets + ' ' + category + ' ' + soundId
        : 'stopsound ' + targets + ' ' + category

    try {
        server.runCommandSilent(command)
        return true
    } catch (e) {
        console.log('[MUSIC] Failed to run: ' + command + ' -> ' + e)
        return false
    }
}

global.music.stopForPlayer = function (player, soundId, options) {
    options = options || {}
    options.targets = musicPlayerTarget(player)
    if (!options.targets) return false
    return global.music.stop(player, soundId, options)
}

// 把一个业务事件名绑定到一个声音。
// 之后可以用 global.music.emit('事件名', source) 播放。
// 适合把“声音选择”集中写在一个地方，其他玩法只负责触发事件。
global.music.bind = function (eventName, soundId, options) {
    if (!eventName || !soundId) return false
    global.music.events['' + eventName] = {
        soundId: '' + soundId,
        options: options || {}
    }
    return true
}

// 移除事件绑定。
global.music.unbind = function (eventName) {
    if (!eventName) return false
    delete global.music.events['' + eventName]
    return true
}

// 触发已经绑定的音乐事件。
// emit 默认走 playAll，因此绑定事件默认是全服可听。
// 第三个参数 options 可以临时覆盖 bind 时写的参数。
global.music.emit = function (eventName, source, options) {
    let entry = global.music.events['' + eventName]
    if (!entry) {
        console.log('[MUSIC] Unknown music event: ' + eventName)
        return false
    }

    let merged = {}
    let base = entry.options || {}
    for (let k in base) merged[k] = base[k]
    options = options || {}
    for (let k in options) merged[k] = options[k]

    return global.music.playAll(source, entry.soundId, merged)
}

// 调试命令：
//   /musicjs demo      播放当前 sounds.json 里已有的 kubejs:l1.07
//   /musicjs stop_all  停止 master 分类声音
ServerEvents.commandRegistry(event => {
    const Commands = event.commands

    event.register(
        Commands.literal('musicjs')
            .requires(src => src.hasPermission(2))
            .then(Commands.literal('demo')
                .executes(ctx => {
                    global.music.playAll(ctx.source, 'kubejs:l1.07')
                    return 1
                })
            )
            .then(Commands.literal('stop_all')
                .executes(ctx => {
                    global.music.stop(ctx.source)
                    return 1
                })
            )
    )
})

console.log('[MUSIC] Global sound framework loaded')
