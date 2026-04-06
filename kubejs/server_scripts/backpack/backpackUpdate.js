let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

function getAttributeList() {
  // 这个列表用于“背包重算”：
  // 每次玩家更换 Curios/遗物时，我们会把这些属性上已经存在的 modifier 全部清掉（removeModifiers），
  // 然后再遍历当前装备的遗物，把遗物效果重新加回去（relic.onLoad）。
  //
  // 为什么要这样做：
  // - 避免重复叠加：如果不先清空，onLoad 每调用一次就会叠加一次，数值会越加越大。
  // - 自动撤回：卸下遗物后，下一次重算不会再把该遗物的 modifier 加回来，效果自然消失。
  let attrs = [
    "generic.max_health", 
    "generic.follow_range",
    "generic.knockback_resistance",
    "generic.movement_speed", 
    "generic.flying_speed",
    "generic.attack_damage",
    "generic.attack_knockback", 
    "generic.attack_speed",
    "generic.armor", 
    "generic.armor_toughness",
    "generic.luck", 
    "l2damagetracker:crit_rate",
  ];

  // 我们的“服务玩法”自定义属性：
  // - 每个部位有两条：满意度增量 sat_gain / 金钱增量 money_gain
  // - 这 10 条属性由 startup_scripts/attributes/serveAttributes.js 注册并挂到玩家身上
  let parts = ["jiaobei", "jiaozhang", "jiaogen", "jiaozhi", "jiaoxin"]
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i]
    attrs.push("kubejs:serve.sat_gain." + p)
    attrs.push("kubejs:serve.money_gain." + p)
  }
  return attrs
}

global.updatePlayerBackpack = function (player) {
  // 获取Curios物品
  let curiosHelper = curiosApi.getCuriosHelper();
  let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();

  // 1) 先清空所有已在属性上的 modifier（相当于“清缓存”）
  for (let i = 0; i < getAttributeList().length; i++) {
    if (player.getAttributes().hasAttribute(getAttributeList()[i])) {
      if (player.getAttribute(getAttributeList()[i]) != null) {
        player.getAttribute(getAttributeList()[i]).removeModifiers();
      }
    }
  }

  // 2) 再遍历当前所有 Curios 槽位的物品，执行遗物 onLoad，把效果重新加上
  // 遍历所有Curios槽位
  for (let i = 0; i < curiosAll.getSlots(); i++) {
    let curiosItem = curiosAll.getStackInSlot(i);
    if (!curiosItem.isEmpty()) {
      // 根据物品执行不同效果
      allRelicEffect(player, curiosItem.getId(), i);
    }
  }
}
  
function allRelicEffect(player, name, i) {
  let relics = global.relicRegister.relics;
  for (let j = 0; j < relics.length; j++) {
    let relic = relics[j];
    if (name == global.getRelicId(relic.name)) {
      relic.onLoad(player, i)
    }
  }
}
