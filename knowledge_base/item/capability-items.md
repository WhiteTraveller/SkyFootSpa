# 带 Capability 的物品

目前项目中唯一使用 Forge Capability 的物品是筋膜枪系列。

## 源码

- `kubejs/startup_scripts/item/fascia_gun.js`

## 设计要点

1. 使用 `CapabilityBuilder.ENERGY.customItemStack()` 创建 FE 能量 Capability。
2. 能量存储在物品 NBT 的 `pfFE` 字段中。
3. 通过 `.barWidth()` 和 `.barColor()` 自定义耐久条，反映电量。
4. 无头筋膜枪、4 个头、4 个有头筋膜枪共 9 个物品一起注册。

## 关键代码片段

```js
function buildFasciaGunCapability() {
    return CapabilityBuilder.ENERGY.customItemStack()
        .canExtract(function(i) { return true })
        .canReceive(function(i) { return true })
        .getEnergyStored(function(i) {
            var nbt = i.nbt || {}
            return nbt.pfFE || 0
        })
        .getMaxEnergyStored(function(i) { return 10000 })
        .extractEnergy(function(be, amount, simulate) { ... })
        .receiveEnergy(function(be, amount, simulate) { ... })
}
```

## 全局映射

脚本底部导出三个全局对象：

- `global.FASCIA_GUN_PARTS`：部位数组。
- `global.FASCIA_GUN_DEMAND_KEY_TO_ITEM`：需求键 → 有头筋膜枪 ID。
- `global.FASCIA_GUN_HEAD_MAP` / `global.FASCIA_GUN_HEAD_REVERSE_MAP`：头与有头筋膜枪互转。
