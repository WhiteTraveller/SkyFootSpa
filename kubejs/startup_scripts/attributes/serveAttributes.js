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

StartupEvents.registry('attribute', event => {
  // 这一段是在“启动阶段”注册新的 Attribute（属性类型），类似原版的 attack_damage / max_health。
  // 我们只注册 10 个：5 个部位的“点击满意度增量”，5 个部位的“点击金钱增量”。
  //
  // 说明：
  // - sat_gain.xxx 的默认值是 10：表示点这个部位一次，满意度 +10（在服务端结算时使用）。
  // - money_gain.xxx 的默认值是 1：表示点这个部位一次，金钱 +1（在服务端结算时使用）。
  // - 遗物会通过 AttributeModifier 去修改这些值，从而改变每次点击带来的增量。
  let parts = ['jiaobei','jiaozhang','jiaogen','jiaozhi','jiaoxin']
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i]
    event.createCustom('kubejs:serve.sat_gain.' + p, () => createRangedAttribute('attribute.name.serve.sat_gain.' + p, 10.0, 0.0, 1024.0))
    event.createCustom('kubejs:serve.money_gain.' + p, () => createRangedAttribute('attribute.name.serve.money_gain.' + p, 1.0, 0.0, 1024.0))
  }
})

ForgeModEvents.onEvent('net.minecraftforge.event.entity.EntityAttributeModificationEvent', event => {
  // 这一段把“我们注册的 Attribute”真正挂到玩家实体上。
  // 如果只注册不添加，player.getAttribute('kubejs:...') 可能会拿不到实例（返回 null）。
  let parts = ['jiaobei','jiaozhang','jiaogen','jiaozhi','jiaoxin']
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i]
    let sat = 'kubejs:serve.sat_gain.' + p
    let money = 'kubejs:serve.money_gain.' + p
    if (!event.has('player', sat)) event.add('player', sat)
    if (!event.has('player', money)) event.add('player', money)
  }
})
