// ============================================================
// 筋膜枪 - 可充电电动工具 (PowerfulJS FE Capability)
// ------------------------------------------------------------
// marguerite:fascia_gun
// 电力容量: 10000 FE
// 充电/放电速率: 1000 FE/t
// ============================================================

StartupEvents.registry("item", event => {
    event.create('marguerite:fascia_gun')
        .displayName('§b§l筋膜枪')
        .maxStackSize(1)
        .attachCapability(
            CapabilityBuilder.ENERGY.customItemStack()
                .canExtract(i => {return true})
                .canReceive(i => {return true})
                .getEnergyStored(i => {
                    let nbt = i.nbt || {}
                    return nbt.pfFE || 0
                })
                .getMaxEnergyStored(i => {
                    return 10000
                })
                .extractEnergy((be, amount, simulate) => {
                    let nbt = be.nbt || {}
                    let energy = nbt.pfFE || 0
                    let extracted = Math.min(energy, amount)
                    if (!simulate) {
                        nbt.pfFE = energy - extracted
                        be.nbt = nbt
                    }
                    return extracted
                })
                .receiveEnergy((be, amount, simulate) => {
                    let nbt = be.nbt || {}
                    let energy = nbt.pfFE || 0
                    let received = Math.min(10000 - energy, amount)
                    if (!simulate) {
                        nbt.pfFE = energy + received
                        be.nbt = nbt
                    }
                    return received
                })
        )
})
