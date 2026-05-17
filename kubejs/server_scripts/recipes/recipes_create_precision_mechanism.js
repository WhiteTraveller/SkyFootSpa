// priority: 10
// ============================================================
// 覆盖 Create 模组"精密构建 (Precision Mechanism)"配方
// ------------------------------------------------------------
// 变更：输入基材由 create:golden_sheet → create:brass_sheet
//       副产物（scrap）中的金板也一并替换为黄铜板
// ------------------------------------------------------------
// 参考：https://wiki.latvian.dev/books/kubejs-legacy/page/kubejs-create
//      原版配方 data: create/recipes/sequenced_assembly/precision_mechanism.json
// ============================================================

ServerEvents.recipes(event => {
    // 直接 try-catch 调用，避免 Rhino 对 Java 方法引用做 typeof/Object.keys 触发
    // "Cannot find default value for object" 报错。
    let transitional = 'create:incomplete_precision_mechanism'
    let base = 'create:brass_sheet'

    // 构造参数（一次构造多次尝试）
    let buildScrap = function () {
        return [
            Item.of('create:precision_mechanism').withChance(130.0),
            Item.of('create:brass_sheet').withChance(8.0),
            Item.of('create:andesite_alloy').withChance(8.0),
            Item.of('create:cogwheel').withChance(5.0),
            Item.of('create:shaft').withChance(2.0),
            Item.of('create:crushed_gold_ore').withChance(2.0),
            Item.of('2x gold_nugget').withChance(2.0),
            'iron_ingot',
            'clock'
        ]
    }

    // 尝试多种 deploying API 组合
    let buildSteps = function () {
        // 优先：event.recipes.create.deploying
        try {
            return [
                event.recipes.create.deploying(transitional, [transitional, 'create:cogwheel']),
                event.recipes.create.deploying(transitional, [transitional, 'create:large_cogwheel']),
                event.recipes.create.deploying(transitional, [transitional, 'iron_nugget']),
                event.recipes.create.deploying(transitional, [transitional, 'minecraft:redstone'])
            ]
        } catch (e1) {
            console.log("[CREATE-PM] create.deploying 不可用: " + e1)
        }
        // 兜底：event.recipes.createDeploying
        try {
            return [
                event.recipes.createDeploying(transitional, [transitional, 'create:cogwheel']),
                event.recipes.createDeploying(transitional, [transitional, 'create:large_cogwheel']),
                event.recipes.createDeploying(transitional, [transitional, 'iron_nugget']),
                event.recipes.createDeploying(transitional, [transitional, 'minecraft:redstone'])
            ]
        } catch (e2) {
            console.log("[CREATE-PM] createDeploying 不可用: " + e2)
        }
        return null
    }

    // 1) 移除原版精密构建配方
    try {
        event.remove({ id: 'create:sequenced_assembly/precision_mechanism' })
        event.remove({ type: 'create:sequenced_assembly', output: 'create:precision_mechanism' })
        console.log("[CREATE-PM] 已移除原版精密构建配方")
    } catch (e) {
        console.log("[CREATE-PM] 移除原版配方失败: " + e)
    }

    // 2) 构建 deploying 步骤
    let steps = buildSteps()
    if (!steps) {
        console.log("[CREATE-PM] 无法构建 deploying 步骤，跳过精密构建覆盖")
        return
    }

    // 3) 尝试多种 sequencedAssembly API 风格
    let registered = false
    let lastError = null

    // 风格 A: event.recipes.create.sequencedAssembly
    if (!registered) {
        try {
            event.recipes.create.sequencedAssembly(buildScrap(), base, steps)
                .transitionalItem(transitional)
                .loops(5)
                .id('kubejs:precision_mechanism_brass')
            console.log("[CREATE-PM] 注册成功 (API: create.sequencedAssembly)")
            registered = true
        } catch (e) {
            lastError = e
            console.log("[CREATE-PM] create.sequencedAssembly 失败: " + e)
        }
    }

    // 风格 B: event.recipes.create.sequenced_assembly
    if (!registered) {
        try {
            event.recipes.create.sequenced_assembly(buildScrap(), base, steps)
                .transitionalItem(transitional)
                .loops(5)
                .id('kubejs:precision_mechanism_brass')
            console.log("[CREATE-PM] 注册成功 (API: create.sequenced_assembly)")
            registered = true
        } catch (e) {
            lastError = e
            console.log("[CREATE-PM] create.sequenced_assembly 失败: " + e)
        }
    }

    // 风格 C: event.recipes.createSequencedAssembly
    if (!registered) {
        try {
            event.recipes.createSequencedAssembly(buildScrap(), base, steps)
                .transitionalItem(transitional)
                .loops(5)
                .id('kubejs:precision_mechanism_brass')
            console.log("[CREATE-PM] 注册成功 (API: createSequencedAssembly)")
            registered = true
        } catch (e) {
            lastError = e
            console.log("[CREATE-PM] createSequencedAssembly 失败: " + e)
        }
    }

    if (!registered) {
        console.log("[CREATE-PM] 所有 API 风格都失败，精密构建覆盖未生效。最后错误: " + lastError)
    } else {
        console.log("[CREATE-PM] 精密构建基材: create:brass_sheet (loops=5)")
    }
})
