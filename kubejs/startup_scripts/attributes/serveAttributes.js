// priority: 8
let $RangedAttribute = Java.loadClass('net.minecraft.world.entity.ai.attributes.RangedAttribute')

function createRangedAttribute(descriptionId, defaultValue, min, max) {
  let attr = new $RangedAttribute(descriptionId, defaultValue, min, max)
  try {
    // 让该属性同步到客户端。
    // 这不代表“原版属性面板一定会显示”，但至少客户端可以拿到数值，便于 UI/调试/同步类模组读取。
    attr.setSyncable(true)
  } catch (e) {}
  return attr
}

// 4部位属性默认值配置
// 脚趾(jiaozhi): 高钱低满高耗 | 脚掌(jiaozhang): 低钱高满中高耗
// 脚心(jiaoxin): 低收益低耗    | 脚跟(jiaogen): 均衡
// 脚背(jiaobei): 已从 pathfinder 中移除，仅供遗物引用兼容（无实际效果）
let PART_DEFAULTS = {
  jiaozhi:   { sat: 5.0,  money: 5.0, stamina: 150.0 },
  jiaozhang: { sat: 10.0, money: 2.0, stamina: 120.0 },
  jiaoxin:   { sat: 5.0,  money: 2.0, stamina: 70.0  },
  jiaogen:   { sat: 7.0, money: 3.0, stamina: 100.0 },
  jiaobei:   { sat: 0.0,  money: 0.0, stamina: 100.0 }
}
let SERVE_PARTS = ['jiaozhi', 'jiaozhang', 'jiaoxin', 'jiaogen', 'jiaobei']

StartupEvents.registry('attribute', event => {
  // 注册搛脚相关属性（4部位 × 3属性）
  // - sat_gain.xxx：点这个部位一次，满意度增量
  // - money_gain.xxx：点这个部位一次，金钱增量
  // - stamina_cost.xxx：点这个部位一次，体力消耗
  // - 遗物会通过 AttributeModifier 去修改这些值
  for (let i = 0; i < SERVE_PARTS.length; i++) {
    let p = SERVE_PARTS[i]
    let d = PART_DEFAULTS[p]
    event.createCustom('kubejs:serve.sat_gain.' + p, () => createRangedAttribute('attribute.name.serve.sat_gain.' + p, d.sat, 0.0, 1024.0))
    event.createCustom('kubejs:serve.money_gain.' + p, () => createRangedAttribute('attribute.name.serve.money_gain.' + p, d.money, 0.0, 1024.0))
    event.createCustom('kubejs:serve.stamina_cost.' + p, () => createRangedAttribute('attribute.name.serve.stamina_cost.' + p, d.stamina, 0.0, 10000.0))
  }
})

ForgeModEvents.onEvent('net.minecraftforge.event.entity.EntityAttributeModificationEvent', event => {
  for (let i = 0; i < SERVE_PARTS.length; i++) {
    let p = SERVE_PARTS[i]
    let sat = 'kubejs:serve.sat_gain.' + p
    let money = 'kubejs:serve.money_gain.' + p
    let stamina = 'kubejs:serve.stamina_cost.' + p
    if (!event.has('player', sat)) event.add('player', sat)
    if (!event.has('player', money)) event.add('player', money)
    if (!event.has('player', stamina)) event.add('player', stamina)
  }
})
