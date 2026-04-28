// priority: 10
// ============================================================
// Oil 系统 - 标签
// 作用：
// - 给油提供统一的 tag 常量，方便各个油定义文件复用
// ============================================================

global.oilTags = {
    oil: {
        id: "marguerite:tag_oil",
        nameZH: "精油",
        color: "yellow"
    }
}

global.getOilId = function (name) {
    return "marguerite:" + name
}
