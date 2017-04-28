/**
 * Created by dustar on 2017/4/26.
 *
 * main.js - 主要函数
 */
$(document).ready(function () {
    Enum()
    init()
    gv.queue = new Queue() // 电梯请求队列
    nextTick()
})

// 每1000ms刷新一次
function nextTick() {
    manageRequest() // 处理队列中的请求
    moveElevators() // 移动电梯
    setTimeout(nextTick, 1000)
}

function init() {
    // 初始化楼层列表
    for (let i = gv.floor; i > 0; i--) {
        gv.isOnWait[i] = {
            up: false,
            down: false
        }
        let css_number = '<span class="floor-number">' + i + '</span>'
        let css_up = i !== gv.floor ? '<span class="up-button" id="up-button-' + i + '" onclick="up(' + i + ')">' +
            '<i class="fa fa-chevron-up"></i></span>' : '<span style="padding: 12px"></span>'
        let css_down = i !== 1 ? '<span class="down-button" id="down-button-' + i + '" onclick="down(' + i + ')">' +
            '<i class="fa fa-chevron-down"></i></span>' : ''
        let css_man = '<span class="floor-man" id="floor-man-' + i + '"><i class="fa fa-user"></i></span>'
        $('.left-panel').append('<div class="floor" id="floor-' + i + '">' + css_number +
            css_up + css_down + css_man + '</div>')
    }

    // 初始化电梯界面
    for (let i = 1; i <= gv.elevator; i++) {
        gv.ev[i] = new Elevator(i)
        let code = '<div class="elevator-route"><div class="elevator-card" id="elevator-card-' + i + '"><div ' +
            'class="elevator-pointer tc-' + i + '" id="elevator-pointer-' + i + '"><i class="fa fa-circle"></i>' +
            '<span class="fa"></span></div><div class="elevator-counter  bg-' + i + '" ' +
            'id="elevator-counter-' + i + '"><div class="elevator-count" id="elevator-count-' + i + '">1</div>' +
            '</div><div class="elevator-item"><div class="elevator-door-left bg-' + i +
            '" id="elevator-door-left-' + i + '">&nbsp;</div><div ' +
            'class="elevator-door-right bg-' + i + '" id="elevator-door-right-' + i + '">&nbsp;' +
            '</div><i class="fa fa-user fa-user-e" id="user-' + i + '"></i></div><div ' +
            'class="elevator-text-container">' + i + '号电梯</div></div><div class="elevator-line"></div>' +
            '<div class="elevator-emer" id="elevator-emer-' + i + '" onclick="gv.ev[' + i + '].emerEvent()">' +
            '<i class="fa fa-bell"></i></div></div>'
        $('.center-panel').append(code)
    }

    sendMessage('操作系统第一次作业 By 杜佳豪 1552652。', 0, "fa fa-user", 'normal')
    sendMessage('电梯调度系统准备就绪。', 0, "fa fa-check-square-o", 'normal')
}