# 普通物品注册

普通物品指不需要特殊 Capability、也没有分 tier 变体的独立物品。

## 代表物品

| 文件 | 物品 ID | 说明 |
| --- | --- | --- |
| cun_item.js | marguerite:cun | 搓脚副产物 |
| grass_ash.js | marguerite:grass_ash | 烧草所得，搅拌机原料 |
| magic_dust.js | marguerite:magic_dust | 第二章产线最终产物 |
| electrolyte_bottle.js | marguerite:electrolyte_bottle | 恢复 750 体力 |
| oil.js | marguerite:oil | 精油，消耗品 |
| phone.js | marguerite:phone_s23ultra | 三星手机 |

## 模板

```js
StartupEvents.registry("item", event => {
    try {
        let builder = event.create("marguerite:xxx")
            .displayName("显示名")
            .maxStackSize(64)
            .tooltip("说明")
            .texture("minecraft:item/gunpowder")
        try { builder.rarity("common") } catch (e) {}
    } catch (e) {
        console.log("注册失败: " + e)
    }
})
```

## 注意点

- rarity 在某些 KubeJS 版本会抛异常，因此项目内统一用内层 try/catch 包裹。
- 贴图不指定时，KubeJS 默认使用 assets/marguerite/textures/item/<id>.png。
- 饮用 / 使用逻辑写在 server_scripts 对应文件中。
