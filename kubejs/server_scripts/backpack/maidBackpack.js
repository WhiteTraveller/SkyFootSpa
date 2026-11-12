// ============================================================
// 女仆 Curios 背包格
// ------------------------------------------------------------
// TLM 的女仆 Curios 页固定 6 列、36 格/页。女仆默认没有可用槽位
// （curios-common.toml 里除 package 外全部 size = 0，且女仆的
// curios/entities 列表不含 package），所以打开是空白的。
//
// 1. data/touhou_little_maid/curios/entities/maid_package.json
//    给女仆追加 package 槽位。Curios 会把同目录下的多个文件合并，
//    不需要覆盖 TLM 自带的 curios.json。
// 2. 把每个女仆的 package 槽位收缩到 36（6 × 6），玩家仍为 54。
//    大小写入 Curios 的 SavedBaseSize，每个女仆只需处理一次。
//
// EntityEvents.spawned 绑定的是 EntityJoinLevelEvent，女仆生成和
// 区块重新加载时都会触发，不需要额外的定时扫描。
// ============================================================

let maidCuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi')

const PF_MAID_PACKAGE_SLOT = 'package'
const PF_MAID_PACKAGE_SIZE = 36

function pfEnsureMaidPackageSlots(maid) {
    let opt = maidCuriosApi.getCuriosInventory(maid)
    if (!opt.isPresent()) return

    let handler = opt.resolve().get().getCurios().get(PF_MAID_PACKAGE_SLOT)
    if (!handler) return

    let stacks = handler.getStacks()
    let current = stacks.getSlots()
    if (current === PF_MAID_PACKAGE_SIZE) {
        if (typeof global.updateMaidBackpack === 'function') {
            global.updateMaidBackpack(maid)
        }
        return
    }

    // 收缩前确认尾部没有物品，避免丢东西
    if (current > PF_MAID_PACKAGE_SIZE) {
        for (let i = PF_MAID_PACKAGE_SIZE; i < current; i++) {
            if (!stacks.getStackInSlot(i).isEmpty()) {
                console.warn('[MAID-BACKPACK] 女仆 ' + maid.getStringUUID() + ' 的第 ' + i + ' 格有物品，跳过收缩')
                return
            }
        }
    }

    maidCuriosApi.getSlotHelper().setSlotsForType(PF_MAID_PACKAGE_SLOT, maid, PF_MAID_PACKAGE_SIZE)

    // 槽位创建完成后立即按女仆身上的遗物重算真实属性。
    if (typeof global.updateMaidBackpack === 'function') {
        global.updateMaidBackpack(maid)
    }
}

EntityEvents.spawned('touhou_little_maid:maid', event => {
    pfEnsureMaidPackageSlots(event.entity)
})
