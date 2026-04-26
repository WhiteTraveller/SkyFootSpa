// priority: 11

function RelicRegister() {
    this.relics = []
    this.commonRelics = []
    this.specialRelics = []
    this.curseRelics = []
    this.shopRelics = []
    this.spaceRelics = []
    this.currentStage = 0  // 当前注册阶段，各stage文件顶部设置
    /**
    * @param {Relic} relic
    */
    this.register = function(relic) {
        let newRelic = new Relic()
        relic(newRelic)
        // 自动继承当前阶段
        if (newRelic.stage === 0 && this.currentStage > 0) {
            newRelic.stage = this.currentStage
        }
        this.relics.push(newRelic)
        if (newRelic.pool.name == "普通") {
            this.commonRelics.push(newRelic)
        } else if(newRelic.pool.name == "特殊") {
            this.specialRelics.push(newRelic)
        } else if(newRelic.pool.name == "诅咒") {
            this.curseRelics.push(newRelic)
        } else if(newRelic.pool.name == "商店") {
            this.shopRelics.push(newRelic)
        }
    }
    this.getCommonRelics = function() {
        let relics = []
        for (let i = 0; i < this.relics.length; i++) {
            if (this.relics[i].pool.name == "普通") {
                relics.push(this.relics[i])
            }
        }
        return relics
    }

}

global.raritys = {
    common: {
        name : "普通",
        tooltip : Text.white("普通"),
    },
    uncommon: {
        name : "少见",
        tooltip : Text.yellow("少见"),
    },
    rare: {
        name : "稀有",
        tooltip : Text.blue("稀有"),
    },
    epic: {
        name : "史诗",
        tooltip : Text.lightPurple("史诗"),
    }
}

global.relicTypes = {
    doll : {
        name : "人偶",
        onLoad : function() {
            
        }
    }
}

global.relicPool = {
    common : {name : "普通"},
    shop: {name : "商店"},
    curse: {name : "诅咒"},
    special: {name : "特殊"},
    space: {name : "空白"}
}


function Relic() {
    this.name = ""
    this.nameZH = ""
    this.description = Text.gray("无效果")
    this.specialDescription = null
    this.story = ""
    this.tags = []
    this.guideTexture = []
    this.rarity = global.raritys.common
    this.pool = global.relicPool.common
    this.stage = 0  // 所属阶段 1~5
    this.getRelicId = function() {
        return "marguerite:" + this.name
    }
    this.canEquip = function() { return true }
    this.canUnEquip = function() { return true }
    this.onLoad = function() {}
    this.onDoDamage = function() {}
    this.onEquip = function(slotContext, oldStack, newStack) {}
    this.onUnEquip = function(slotContext, oldStack, newStack) {}
    this.onKill = function() {}
    this.setOnKill = function(onKill) {
        this.onKill = onKill
        return this
    }
    this.setOnEquip = function(onEquip) {
        this.onEquip = onEquip
        return this
    }
    this.setOnUnEquip = function(onUnEquip) {
        this.onUnEquip = onUnEquip
        return this
    }
    this.setOnLoad = function(onLoad) {
        this.onLoad = onLoad
        return this
    }
    this.setOnDoDamage = function(onDoDamage) {
        this.onDoDamage = onDoDamage
        return this
    }
    this.setTags = function(tags) {
        this.tags = tags
        return this
    }
    this.setGuideTexture = function(textures) {
        this.guideTexture = textures
        return this
    }
    this.setName = function(name) {
        this.name = name
        return this
    }
    this.setNameZH = function(nameZH) {
        this.nameZH = nameZH
        return this
    }
    this.setDescription = function(description) {
        this.description = description
        return this
    }
    this.setSpecialDescription = function(specialDescription) {
        this.specialDescription = specialDescription
        return this
    }
    this.setStory = function(story) {
        this.story = story
        return this
    }
    this.setCanEquip = function(canEquip) {
        this.canEquip = canEquip
        return this
    }
    this.setCanUnEquip = function(canUnEquip) {
        this.canUnEquip = canUnEquip
        return this
    }
    this.setRarity = function(rarity) {
        this.rarity = rarity
        return this
    }
    this.setPool = function(pool) {
        this.pool = pool
        return this
    }
    this.setStage = function(stage) {
        this.stage = stage
        return this
    }

}

global.relicRegister = new RelicRegister()