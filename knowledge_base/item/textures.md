# 物品贴图约定

## 默认贴图路径

未显式调用 `.texture(...)` 时，KubeJS 默认查找：

```
assets/marguerite/textures/item/<item_id>.png
```

例如：`marguerite:cun` 对应 `assets/marguerite/textures/item/cun.png`。

## 复用原版贴图

```js
builder.texture("minecraft:item/gunpowder")  // 草灰
builder.texture("minecraft:item/potion")      // 电解质水瓶
builder.texture("minecraft:item/honey_bottle")
builder.texture("minecraft:item/experience_bottle")
```

## 自定义贴图

```js
builder.texture("kubejs:item/hand_jiaozhang")
builder.texture("marguerite:item/wrench_copper")
```

自定义贴图需要把 PNG 文件放到对应资源包路径：

```
kubejs/assets/kubejs/textures/item/hand_jiaozhang.png
kubejs/assets/marguerite/textures/item/wrench_copper.png
```

## 不指定贴图

不指定时务必确认 `assets/marguerite/textures/item/<id>.png` 存在，否则游戏中会显示紫色缺失贴图。
