// priority: 20
// ============================================================
// "皴" 掉落数量接口
// ------------------------------------------------------------
// 每次搓脚有效点击后，由 pfNetworkHandler 调用 getDropCount 决定
// 当次掉落多少个 marguerite:cun。后期扩展在此文件集中修改：
//   - 根据玩家属性（如 serve.cun_gain）增幅
//   - 根据 Boss/遗物/季节等条件上调
//   - 一键满足时按总清零次数整体结算
// ============================================================

global.pfCunDrop = {
    // 基础掉落随机范围（每一次"有效点击"独立随机）
    minDropPerClick: 3,
    maxDropPerClick: 5,

    // 搓泥宝精油的物品 id 与倍率
    cuonibaoId: 'marguerite:cuonibao',
    cuonibaoMultiplier: 2,

    /**
     * 生成一次点击的基础掉落数（3-5 随机，包含端点）
     */
    rollBase: function () {
        let lo = this.minDropPerClick | 0
        let hi = this.maxDropPerClick | 0
        if (hi < lo) hi = lo
        return lo + Math.floor(Math.random() * (hi - lo + 1))
    },

    /**
     * 检查玩家副手是否持有搓泥宝；持有则返回 stack，否则 null
     */
    getCuonibaoOffhand: function (player) {
        try {
            if (!player) return null
            let off = player.getOffhandItem()
            if (off && off.id === this.cuonibaoId) return off
        } catch (e) { }
        return null
    },

    /**
     * 副手搓泥宝耐久 -1（创意模式不扣）。若扣完自动消失。
     */
    damageCuonibao: function (player, stack) {
        try {
            if (!player || !stack) return
            if (player.creative) return
            stack.hurtAndBreak(1, player, (_p) => true)
            player.setOffhandItem(stack)
        } catch (e) {
            console.log('[CUN] 搓泥宝耐久扣除失败: ' + e)
        }
    },

    /**
     * 计算本次应掉落的"皴"数量
     * @param {$Player_}       player  操作玩家（可为 null）
     * @param {$LivingEntity_} entity  被操作的顾客实体（可为 null）
     * @param {string}         part    部位名 jiaozhang/jiaogen/jiaozhi/jiaoxin
     * @param {number}         clicks  本次"有效点击"次数
     *                                 正常模式=1；一键满足=所有部位剩余需求之和
     * @returns {number} 应掉落的皴数量（>=0 的整数）
     */
    getDropCount: function (player, entity, part, clicks) {
        let c = (typeof clicks === 'number' && clicks > 0) ? Math.floor(clicks) : 1

        // 每次点击独立 roll 3-5，再累加
        let total = 0
        for (let i = 0; i < c; i++) total += this.rollBase()

        // 搓泥宝倍率（副手持有 → 翻倍并扣 1 耐久）
        let cuonibao = this.getCuonibaoOffhand(player)
        if (cuonibao) {
            total = total * this.cuonibaoMultiplier
            this.damageCuonibao(player, cuonibao)
        }

        // 独立加成：顾客 NBT 上的 pfCunBonusPerClick（来自泡脚）
        // 不受搓泥宝倍率影响，按"每次有效点击 +N"线性累加
        try {
            if (entity) {
                let item = entity.getMainHandItem()
                if (item && item.nbt) {
                    let bonusPerClick = item.nbt.getInt('pfCunBonusPerClick') || 0
                    if (bonusPerClick > 0) {
                        total += bonusPerClick * c
                    }
                }
            }
        } catch (e) { }

        if (total < 0) total = 0
        return total
    }
}

console.log('[CUN] pfCunDrop 接口已就绪 (rand ' + global.pfCunDrop.minDropPerClick + '-' + global.pfCunDrop.maxDropPerClick + ', 搓泥宝x' + global.pfCunDrop.cuonibaoMultiplier + ')')
