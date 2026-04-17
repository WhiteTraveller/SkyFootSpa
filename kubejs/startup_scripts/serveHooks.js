// priority: 7
// ============================================================
// Serve 系统 - 点击结算 Hook 框架（启动阶段占位）
//
// 目标：
// - 把“额外功能（如抹油、连击奖励等）”从 pathfinder.js 的主流程里拆出去；
// - pathfinder 只在关键节点调用一次 hook；
// - 具体功能以独立 server_scripts 文件注册 hook 的方式接入。
// ============================================================

global.serveClickHooks = global.serveClickHooks || []

global.registerServeClickHook = function (hookFn) {
    if (hookFn) {
        global.serveClickHooks.push(hookFn)
    }
}

global.runServeClickHooks = function (ctx) {
    let hooks = global.serveClickHooks
    if (!hooks || hooks.length === 0) return
    for (let i = 0; i < hooks.length; i++) {
        try {
            hooks[i](ctx)
            if (ctx && ctx.cancel) return
        } catch (e) {
            console.log('[SERVE-HOOK] hook error: ' + e)
        }
    }
}
