// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("coin")
        .setNameZH("金币")
        .setDescription(Text.gray("无效果"))
        .setTags([global.margueriteTags.metal])
})