// priority: 9
let curiosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');

global.relicRegister.register(relic => {
    relic.setName("horn")
        .setNameZH("冲锋号")
        .setSpecialDescription(Text.gray("根据你的移动速度提供加伤"))
        .setStory("")
        .setTags([global.margueriteTags.perform])
        
})