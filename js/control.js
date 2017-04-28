/**
 * Created by dustar on 2017/4/27.
 *
 * control.js - 控制实现
 */
// 上行键
function up(f) {
    if (gv.isOnColdDown) {
        sendMessage('操作过快，眨个眼再继续吧。', 0, 'fa fa-ban', 'normal')
        return
    }
    coldDown() // 冷却
    if (!gv.isOnWait[f].up) {
        let n = buildName()
        gv.isOnWait[f].up = true // 按钮已被按下，正在等待请求处理
        $('#floor-man-' + f).fadeIn(1000)
        $('#up-button-' + f).addClass("up-button-active")
        $('#up-button-' + f).children().addClass('fa-spinner')
        setTimeout(() => {
            $('#up-button-' + f).children().removeClass('fa-spinner')
        }, 1000)
        gv.queue.push({
            name: n,
            floor: f,
            direction: Enum.StateType.Up
        }) // 加入请求队列
        sendMessage(n + '在 ' + f + ' 楼按下上行键，请稍作等待。', 0, 'fa fa-arrow-up', 'up')
    }
}

// 下行键
function down(f) {
    if (gv.isOnColdDown) {
        sendMessage('操作过快，眨个眼再继续吧。', 0, 'fa fa-ban', 'normal')
        return
    }
    coldDown() // 冷却
    if (!gv.isOnWait[f].down) {
        let n = buildName()
        gv.isOnWait[f].down = true
        $('#floor-man-' + f).fadeIn(1000)
        $('#down-button-' + f).addClass("down-button-active")
        $('#down-button-' + f).children().addClass('fa-spinner')
        setTimeout(() => {
            $('#down-button-' + f).children().removeClass('fa-spinner')
        }, 1000)
        gv.queue.push({
            name: n,
            floor: f,
            direction: Enum.StateType.Down
        })
        sendMessage(n + '在 ' + f + ' 楼按下下行键，请稍作等待。', 0, 'fa fa-arrow-down', 'down')
    }
}

function moveElevators() { // 遍历移动电梯
    for (let i = 1; i <= gv.elevator; i++)
        gv.ev[i].move()
}


function manageRequest() { // 处理请求队列
    var min
    var min_point
    var isQueue
    var ans
    while (gv.queue.size() > 0) {
        let request = gv.queue.tail() // 每次只处理队尾请求，FIFO
        min = gv.floor + gv.runCost
        min_point = -1
        isQueue = false
        for (let i = 1; i <= gv.elevator; i++) {
            ans = gv.ev[i].check(request) // 遍历检查请求是否可被执行
            if (ans.b && (ans.cost < min || (ans.cost === min &&
                    Math.random() >= 0.5 // 若多个电梯同时满足最小代价完成请求，这时需考虑负载均衡，而非由某一部电梯反复执行请求
                ))) {
                min = ans.cost
                min_point = i
                isQueue = ans.isQueue
            }
        }
        if (min_point > 0 && !gv.ev[min_point].isAllocated) { // 分配任务成功
            gv.ev[min_point].addRequestFloor(request, true, isQueue)
            gv.ev[min_point].isAllocated = true // 分配进程锁
            sendMessage('去 ' + request.floor + ' 楼接' + request.name + '的任务被分配给 ' + min_point + ' 号电梯。',
                min_point, "fa fa-hashtag", 'task')
        } else
            return false // 若分配失败，则下个Tick继续尝试分配队尾请求
        gv.queue.pop()
    }
    return true
}

function question(id, from, state, members) { // 询问楼层（当角色进入到电梯后）
    var header = '<div>' + members + ', 你现在在 ' + from + ' 楼: </div>'
    var text = ''
    members = '\'' + members + '\''
    if (state == Enum.StateType.Up) {
        for (let i = from + 1; i <= gv.floor; i++)
            text +=
                '<span class="select-floor" onclick="gv.ev[' + id + '].press(' + i + ',' + state + ',' + members + ')">'
                + i + '</span> '
    }
    if (state == Enum.StateType.Down) {
        for (let i = 1; i < from; i++)
            text +=
                '<span class="select-floor" onclick="gv.ev[' + id + '].press(' + i + ',' + state + ',' + members + ')">'
                + i + '</span> '
    }
    //sendMessage(header)
    gv.ev[id].myToast = $.toast({ // 弹出Toast框
        bgColor: gv.color[id],
        heading: header,
        text: text,
        showHideTransition: 'slide',
        icon: 'info',
        allowToastClose: false,
        stack: gv.elevator,
        hideAfter: false
    })
}

function coldDown() {
    gv.isOnColdDown = true
    setTimeout(() => {
        gv.isOnColdDown = false
    }, gv.coldDownTime)
}