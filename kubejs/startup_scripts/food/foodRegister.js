// priority: 11
// ============================================================
// Food 系统 - 注册器
// 只收集定义，不注册物品：食物都是各 mod 已有物品，用 setItem 指向其物品 id。
// 新增食物：在 food/ 下新建 priority 低于 11 的文件，例如
//   global.foodRegister.register(food => {
//       food.setItem("minecraft:bread")
//           .setDemands({ jiaozhang: 1 })
//           .setRandomDemand(0)
//           .setSatisfaction(5)
//           .setRareGuests(["rare_yuyuko", "rare_yuyuko_hell"])
//           .setContainer("minecraft:bowl")
//   })
// 部位 key：jiaozhang 脚掌 / jiaogen 脚后跟 / jiaozhi 脚趾 / jiaoxin 脚心
// 生效入口：需求清单 UI 的奉茶按钮 → 服务端 foot_serve_food（pfNetworkHandler.js）
// 稀客 id 对应 server_scripts/pathfinder/pfCustomerTypes.js 中 PF_RARE_BY_DIMENSION 的 id（按维度区分，
// 服务端只取当前维度稀客池中存在的那一个）。
// ============================================================

function FoodRegister() {
    this.foods = []
    this.foodsByItem = {}

    this.register = function (foodFactory) {
        let newFood = new Food()
        foodFactory(newFood)
        if (this.foodsByItem[newFood.item]) {
            console.log("[FOOD] 重复注册食物: " + newFood.item)
        }
        this.foods.push(newFood)
        this.foodsByItem[newFood.item] = newFood
    }

    this.getFood = function (itemId) {
        return this.foodsByItem["" + itemId] || null
    }
}

function Food() {
    this.item = ""
    this.name = ""
    this.demands = {}
    this.randomDemand = 0
    this.satisfaction = 0
    this.rareGuests = []
    this.rareGuestNames = []
    this.container = ""

    this.setItem = function (item) {
        this.item = item
        return this
    }

    this.setName = function (name) {
        this.name = name
        return this
    }

    this.setDemands = function (demands) {
        this.demands = demands
        return this
    }

    this.setRandomDemand = function (count) {
        this.randomDemand = count
        return this
    }

    this.setSatisfaction = function (satisfaction) {
        this.satisfaction = satisfaction
        return this
    }

    this.setRareGuests = function (rareGuests) {
        this.rareGuests = rareGuests
        return this
    }

    // 仅供客户端 tooltip 展示；稀客名在 server_scripts 里，客户端拿不到
    this.setRareGuestNames = function (names) {
        this.rareGuestNames = names
        return this
    }

    this.setContainer = function (container) {
        this.container = container
        return this
    }
}

global.foodRegister = new FoodRegister()
