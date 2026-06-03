# ⚡ PowerfulJS FE 电力系统使用说明

## 📋 概述

使用 **PowerfulJS 的 CapabilityBuilder** 为筋膜枪添加真实的 Forge Energy (FE) 存储能力:
- ✅ 通过 Mekanism/Create 等模组的电缆充电
- ✅ 与其他电力设备交互
- ✅ 显示真实电量百分比
- ✅ 电力不足时拒绝工作

---

## 🔧 核心文件

### 1. `startup_scripts/item/fascia_gun.js` (已修改)
使用 `CapabilityBuilder.ENERGY` 注册 FE 能力:
- **容量**: 10,000 FE
- **充电速率**: 1,000 FE/t
- **放电速率**: 按需提取
- **存储方式**: NBT (pfFE 字段)

### 2. `startup_scripts/item/fascia_gun.js` (修改)
- ✅ 使用 `.attachCapability()` 添加 FE 能力
- ✅ 添加 Tooltip 显示电力信息
- ✅ 更新物品名称为 `§b§l筋膜枪`

### 3. `server_scripts/powerfuljs/fe_utils.js` (修改)
FE 操作工具函数:
- `global.pfConsumeFE(player, feCost, hand)` - 消耗电力
- `global.pfGetItemFE(item)` - 获取当前电量
- `global.pfGetItemMaxFE(item)` - 获取最大容量

### 4. `server_scripts/pathfinder/pfNetworkHandler.js` (修改)
搓脚逻辑:
- ✅ 使用 `global.pfConsumeFE(player, 250, 'offhand')`
- ✅ 电力不足时提示并阻止操作

---

## 🎮 使用方式

### 1️⃣ 充电方法

**Mekanism 电缆:**
```
Mekanism 发电机 → 通用电缆 → 手持筋膜枪 (副手)
```

**Create 动力:**
```
使用 Create 动力发电机 → FE 转换器 → 电缆 → 筋膜枪
```

**手动充满 (创造模式):**
```javascript
// 使用 NBT 编辑器给筋膜枪添加:
{
  pfFE: 10000
}
```

### 2️⃣ 查看电量

**通过创造模式物品栏或 JEI 查看:**
- 鼠标悬停在筋膜枪上
- Tooltip 会显示当前 FE 电量

**或通过日志查看:**
- 搓脚时会在控制台输出: `[PF-NETWORK] 筋膜枪消耗 250 FE, 剩余: X FE`

### 3️⃣ 搓脚消耗

- 每次搓脚成功消耗 **250 FE**
- 10,000 FE 可搓脚 **40 次**
- 电力不足时提示: `§c⚡ 筋膜枪电力不足!请连接电缆充电`

---

## 📊 电力平衡参考

| 设备 | 发电速率 | 充满筋膜枪时间 |
|------|---------|--------------|
| 太阳能板 (基础) | 50 FE/t | ~200 秒 |
| 风力发电机 | 200 FE/t | ~50 秒 |
| Mekanism 热发电机 | 1,000 FE/t | ~10 秒 |
| Create 动力 (大齿轮) | 5,000+ FE/t | ~2 秒 |

---

## 🔍 调试日志

启用后会在控制台看到:
```
[PowerfulJS] ✅ FE 电力 Capability 注册完成
[PF-FE] ✅ FE 电力工具函数已加载
[PF-NETWORK] 筋膜枪消耗 250 FE, 剩余: 9,750 FE
```

---

## ⚠️ 注意事项

1. **必须安装 PowerfulJS** 才能使用 FE 能力
2. **旧存档兼容**: 已有耐久度的筋膜枪会失去耐久显示,但功能正常
3. **充电需要**: 手持筋膜枪时靠近电缆,或使用充电站
4. **多人游戏**: 电量数据存储在物品 NBT 中,跨维度同步

---

## 🚀 扩展建议

未来可以为以下设备添加 FE 能力:
- 搓脚床 (50,000 FE 容量)
- 泡脚盆 (加热系统 100 FE/t)
- 自动按摩机 (持续消耗 50 FE/t)

---

## 📚 参考资料

- [PowerfulJS 文档](https://github.com/ PowerfulJS/PowerfulJS)
- [Forge Energy API](https://mcforge.readthedocs.io/en/latest/utilities/energycapability/)
- [Create 电力兼容](https://create.fandom.com/wiki/Rotation_Speed_Controller)
