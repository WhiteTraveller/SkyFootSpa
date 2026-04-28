// 商店生成方块 - 5个阶段各一个
// 放置后下一tick自动：1) 变为草方块  2) 在上方生成带随机遗物交易的NPC村民

StartupEvents.registry("block", (event) => {
    let stageNames = [
        "§eSTAGE · 1",
        "§6STAGE · 2",
        "§cSTAGE · 3",
        "§dSTAGE · 4",
        "§5STAGE · 5"
    ]
    let stageTextures = [
        "minecraft:block/oak_planks",
        "minecraft:block/redstone_block",
        "minecraft:block/purpur_block",
        "minecraft:block/diamond_block",
        "minecraft:block/amethyst_block"
    ]

    for (let i = 0; i < 5; i++) {
        let stage = i + 1
        event.create("shop_block_" + stage)
            .displayName("§a商店·" + stageNames[i])
            .textureAll(stageTextures[i])
            .blockEntity((entityInfo) => {
                entityInfo.serverTick(1, 0, (be) => {
                    if (global.shopBlockTick) global.shopBlockTick(be, stage)
                })
            })
    }
})
