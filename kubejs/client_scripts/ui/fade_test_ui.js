// 渐隐测试页客户端入口：服务端 /fadetest 发 pf_fade_test_open → 客户端 screen() 打开最小测试页。
let ApricityUIFade = Java.loadClass("com.sighs.apricityui.ApricityUI");

NetworkEvents.dataReceived('pf_fade_test_open', event => {
    try {
        ApricityUIFade.screen("kubejs/fade_test.html")
        console.log("[FADE-TEST] 打开渐隐测试页")
    } catch (e) {
        console.log("[FADE-TEST] 打开失败: " + e)
    }
})
