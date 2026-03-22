NetworkEvents.dataReceived('open_foot_ui', event => {
    global.openFootUI()
})

global.openFootUI = () => {
    console.log('Opening foot UI...')
    ApricityUI.openScreen('kubejs/footui.html')
}
