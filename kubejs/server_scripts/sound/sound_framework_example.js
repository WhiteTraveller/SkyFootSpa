// priority: 19
// ============================================================
// Sound framework example
// ------------------------------------------------------------
// 测试方式：
//   右键世界里的钻石块，所有玩家都会听见自定义音乐。
//
// 这个示例演示 bind + emit 的规范用法：
//   1. 先用 bind 把“业务事件名”绑定到具体声音 ID。
//   2. 玩法逻辑里只 emit 这个业务事件名。
//
// 确认框架可用后，可以删除本文件或把逻辑改成你的正式事件。
// ============================================================

// 把“点击钻石块”这个业务事件绑定到 skyfootspa 命名空间下的自定义声音。
// 这个声音事件注册在：
//   kubejs/assets/skyfootspa/sounds.json
//
// 对应的 ogg 文件在：
//   kubejs/assets/skyfootspa/sounds/sound_music/click_diamond_block.ogg
global.music.bind('click_diamond_block', 'skyfootspa:click_diamond_block', {
    // music 分类会走游戏设置里的“音乐”音量。
    // 如果你希望它走总音量，可以改成 master。
    category: 'music',

    // volume 是音量倍率，1 是正常音量。
    volume: 1,

    // pitch 是音高倍率，1 是原音高。
    pitch: 1
})

BlockEvents.rightClicked('minecraft:diamond_block', event => {
    // 这里不直接写声音 ID，而是触发上面 bind 过的业务事件名。
    // emit 默认走 playAll，因此所有玩家都能听见。
    global.music.emit('click_diamond_block', event.server)
})
