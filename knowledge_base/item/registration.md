# 物品通用注册模式

## 入口

所有物品注册脚本均位于 `kubejs/startup_scripts/item`，使用 KubeJS 的 `StartupEvents.registry("item", ...)` 事件注册。

## 命名空间约定

- 项目统一命名空间为 `marguerite`。
- 物品 ID 格式：`marguerite:<snake_case_name>`。
- 同一功能有多个变体时，使用下划线 + 部位 / tier 编号。

## 基础 Builder 链式调用

```js
StartupEvents.registry("item", event => {
    event.create("marguerite:example")
        .displayName("示例物品")
        .maxStackSize(64)
        .tooltip("第一行说明")
        .texture("minecraft:item/gunpowder")
})
```

## 错误处理

项目内注册代码通常包裹 try/catch，避免一个物品注册失败导致整个事件中断。
