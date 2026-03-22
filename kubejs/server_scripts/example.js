ItemEvents.rightClicked(event => {
    console.log(event)
    global.rightClickedEntity(event)
})

/**
 * @param {Internal.ItemClickedEventJS} event
 */
global.rightClickedEntity = event => {
    let target = event.getTarget().entity
    console.log(target)
    event.player.sendData('open_foot_ui', {})
    ApricityUI
    
    // 检查是否是寻路系统创建的实体（通过 pfPhase 判断）
    if (target && target.persistentData) {
        let pfPhase = target.persistentData.getInt("pfPhase")
        // pfPhase 存在说明是寻路实体
        if (pfPhase > 0) {
            // 发送网络包给客户端，通知打开UI
            event.player.sendData('open_foot_ui', {})
        }
    }
}
