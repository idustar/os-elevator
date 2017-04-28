/**
 * Created by dustar on 2017/4/26.
 *
 * helpers.js - 辅助函数
 */
// 随机生成角色名
function buildName() {
    return gv.names.last[Math.floor(Math.random() * gv.names.last.length)] +
        gv.names.middle[Math.floor(Math.random() * gv.names.middle.length)] +
        gv.names.first[Math.floor(Math.random() * gv.names.first.length)]
}

// 发送消息到消息列表
function sendMessage(message, owner = 0, icon = '', type = 'normal') {
    let icode = icon !== '' ? '<i class="message-icon ' + icon + '"></i>  ' : ''
    let own = owner > 5 ? 0 : owner
    $('#message-panel').append('<div style="color:' + gv.color[owner] + '">' + icode + message + '</div>')
    // 始终滚动到最后
    let mainContainer = $('.right-panel'),
        scrollToContainer = $('#message-footer');
    mainContainer.scrollTop(
        scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
    )
}

class Member {
    constructor(n, q) {
        this.qlist = []
        this.nqlist = []
        this.add(n, q)
    }
    add(n, q) {
        if (q)
            this.qlist.push(n)
        else
            this.nqlist.push(n)
        return this
    }
    printQ() {
        return this.qlist
    }
    printNQ() {
        return this.nqlist
    }
    print() {
        let nq = this.nqlist.toString()
        return this.qlist + nq.length ? '' : ',' + nq
    }
    printInAndOut() {
        let aq = '' + this.qlist
        let anq = '' + this.nqlist
        let q = '' + aq + (aq.length ? '走进电梯' : '')
        let nq = '' + anq + (anq.length ? '走出电梯' : '')
        let s = q + (anq.length > 0 ? '，' : '') + nq + '。'
        return s
    }
    countNQ() {
        return this.nqlist.length
    }
}