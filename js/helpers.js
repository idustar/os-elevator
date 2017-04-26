/**
 * Created by dustar on 2017/4/26.
 *
 * helpers.js - 辅助函数
 */

// 随机生成角色名
function buildName() {
    return gv.names.last[Math.floor(Math.random()*gv.names.last.length)] +
        gv.names.middle[Math.floor(Math.random()*gv.names.middle.length)] +
        gv.names.first[Math.floor(Math.random()*gv.names.first.length)]
}

// 发送消息到消息列表
function sendMessage(message, owner = 0, icon = '', type = 'normal') {
    let icode = icon !== '' ? '<i class="message-icon ' + icon + '"></i>  ': ''
    let own = owner > 5 ? 0 : owner
    $('#message-panel').append('<div style="color:'+ gv.color[owner]+'">'+ icode + message+'</div>')
    // 始终滚动到最后
    let mainContainer = $('.right-panel'),
        scrollToContainer = $('#message-footer');
    mainContainer.scrollTop(
        scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
    )
}