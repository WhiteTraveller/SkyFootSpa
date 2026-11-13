// ============================================================
// 教学 GIF Overlay - 客户端脚本
// ------------------------------------------------------------
// 服务端 /playgif <name> → sendData('pf_play_tutorial')
//   → 本文件 createDocument(tutorial_gif.html) + setReloadPersistent(true)
//   → Overlay 叠在 MC 任意 Screen（含 FTB Quests）之上。
//
// 关闭方式只有一种：页面右上角 X 按钮（页面内 ApricityUI.removeDocument）。
// GIF 路径规则：apricity/kubejs/tutorials/<name>.gif
// ============================================================

let ApricityUI = Java.loadClass("com.sighs.apricityui.ApricityUI")

const TUTORIAL_DOC = 'kubejs/tutorial_gif.html'

if (global.pfTutorialOpen === undefined) global.pfTutorialOpen = false
if (global.pfTutorialGifName === undefined) global.pfTutorialGifName = ''

// ===== 服务端触发：创建 Overlay =====

NetworkEvents.dataReceived('pf_play_tutorial', event => {
    let name = '' + event.data.name
    if (!name) name = 'default'
    global.pfTutorialGifName = name

    // 重复触发时先关掉旧 Overlay，再按新名字重建
    try { ApricityUI.removeDocument(TUTORIAL_DOC) } catch (e) {}

    let doc = ApricityUI.createDocument(TUTORIAL_DOC)
    if (doc == null) {
        console.error('[TUTORIAL] createDocument 失败: ' + TUTORIAL_DOC)
        global.pfTutorialOpen = false
        return
    }
    doc.setReloadPersistent(true)
    global.pfTutorialOpen = true
    console.info('[TUTORIAL] 打开 GIF Overlay: ' + name + '.gif')
})

// ===== X 按钮关闭后回收状态 =====

ClientEvents.tick(event => {
    if (!global.pfTutorialOpen) return
    let docs = ApricityUI.getDocument(TUTORIAL_DOC)
    if (docs == null || docs.isEmpty()) {
        global.pfTutorialOpen = false
    }
})

// ===== 会话清理 =====

ClientEvents.loggedOut(event => {
    try { ApricityUI.removeDocument(TUTORIAL_DOC) } catch (e) {}
    global.pfTutorialOpen = false
    global.pfTutorialGifName = ''
})
