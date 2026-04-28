// priority: 11
// ============================================================
// Oil 系统 - 注册器
// 作用：
// - 统一收集所有“油”的定义数据（name/nameZH/durability/tags...）
// - 提供链式配置 API，保持与 relicRegister.js 相同的注册体验
// ============================================================

function OilRegister() {
    this.oils = []

    /**
     * 注册一个油定义
     * @param {Oil} oilFactory
     */
    this.register = function (oilFactory) {
        let newOil = new Oil()
        oilFactory(newOil)
        this.oils.push(newOil)
    }
}

function Oil() {
    this.name = ""
    this.nameZH = ""
    this.description = Text.gray("无效果")
    this.tags = []
    this.durability = 16

    this.getOilId = function () {
        return "marguerite:" + this.name
    }

    this.setName = function (name) {
        this.name = name
        return this
    }

    this.setNameZH = function (nameZH) {
        this.nameZH = nameZH
        return this
    }

    this.setDescription = function (description) {
        this.description = description
        return this
    }

    this.setTags = function (tags) {
        this.tags = tags
        return this
    }

    this.setDurability = function (durability) {
        this.durability = durability
        return this
    }
}

global.oilRegister = new OilRegister()
