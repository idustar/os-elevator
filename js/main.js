/**
 * Created by dustar on 2017/4/25.
 */

var gv = {
    lineHeight: 22,
    isOnWait: [],
    floor: 20,
    elevator: 5,
    color: {6:'#cc0022', 7:'#33ff55', 0:'#000000', 1:'#008AFF', 2:'#ee8811', 3:'#bb0077', 4:'#7700bb', 5:'#007788'},
    runCost: 100,
    openTime: 3,
    ev: {},
    names: {
        last: ['朱', '颜', '杜', '吕', '蒋', '王', '张', '陈', '莫', '金', '谢', '薛', '江', '胡', '毛', '应', '鹿', '钱', "马", '梁', "袁",
            '季', '范', '牛', '李', '林', '顾', '高', '兰', '邱'],
        first: ['明', '花', '美', '丽', '敏', '霞', '天', '刚', '伟', '航', '樵', '晗', '凯', '松', '汁', '强', '平', '鹏', "蛤", '璐', "阳",
            '全', '友', '华', '冰', '源', '琴', '磊', '宇'],
        middle: ['', '小', '大']
    }

}

$(document).ready(function() {
    Enum()
    init()
    gv.queue = new Queue()
    nextTick()
    updateUI()
})

function Enum() {}
Enum.StateType = {Idle:0, Up: 1, Down: 2, Error:3}

function length(a) {
    return Object.getOwnPropertyNames(a).length
}

class Queue{
    constructor() {
        this.list = []
    }
    push(data) {
        if (data === null)
            return false
        this.list.unshift(data)
        return true
    }
    pop() {
        return this.list.pop()
    }
    tail() {
        return this.list[this.size() - 1]
    }
    size() {
        return this.list.length
    }
    queue() {
        return this.list
    }
    find(data) {
        return (this.list.findIndex(i => (i === data)) > 0? true : false)
    }
    remove(data) {
        let ans = this.list.findIndex(i => (i === data))
        if (ans > 0) {
            this.list.splice(ans, 1)
            return true
        }
        return false
    }
    removeIndex(index) {
        if (this.list.splice(index, 1))
            return true
        else
            return false
    }
    clear() {
        this.list.splice(0, this.size())
    }
    nextState() {
        if (this.size() <= 1 || this.list[this.size()-1]===this.list[this.size()-2])
            return Enum.StateType.Idle
        if (this.list[this.size()-1]>this.list[this.size()-2])
            return Enum.StateType.Down
        if (this.list[this.size()-1]<this.list[this.size()-2])
            return Enum.StateType.Up
    }
}

class Elevator {
    constructor(i) {
        this.id = i
        this.floor = 1
        this.queue = new Queue()
        this.request = new Map()
        /* floor: {isuser:[], member:[]*/
        this.state = Enum.StateType.Idle
        this.openRemain = 0
        this.questioning = false
        this.isLoaded = false
        this.isAllocated = false
        this.myToast = {}
    }

    move() {
        this.isAllocated = false
        if (this.openRemain > 0) {
            this.openRemain--
        }
        else if (this.questioning)
            return
        else {
            if (this.state === Enum.StateType.Idle) {
                if (this.queue.tail() > this.floor) {
                    this.state = Enum.StateType.Up
                    sendMessage(this.id + ' 号电梯像火箭一样飞窜上天。', this.id, 'fa fa-play-circle-o', 'start')
                }
                else if (this.queue.tail() < this.floor) {
                    this.state = Enum.StateType.Down
                    sendMessage(this.id + ' 号电梯加足马力开始工作了。', this.id, 'fa fa-play-circle-o', 'start')
                }
                if (this.queue.tail() === this.floor && this.request.get(this.floor).question) {
                    this.state = this.request.get(this.floor).direction
                    this.questioning = true
                    setTimeout(()=>{openDoor(this.id)},1000)
                    userIn(this.id, true)
                    this.openRemain = 3
                    question(this.id, this.floor, this.request.get(this.floor).direction, this.request.get(this.floor).member)
                    this.removeOutSideButtonAttr(this.request.get(this.queue.tail()))
                    sendMessage(this.id + ' 号电梯停在 '+this.floor+' 楼，'+
                        this.request.get(this.queue.tail()).member+'进入电梯。', this.id,"fa fa-arrow-left",'enter')
                    this.queue.pop()
                    this.request.delete(this.floor)
                }
            } else {
            if (this.state === Enum.StateType.Up)
                this.up()
            else if (this.state === Enum.StateType.Down)
                this.down()
            }
        }
    }

    removeOutSideButtonAttr(rq) {
        if (rq.direction === Enum.StateType.Up) {
            gv.isOnWait[this.floor].up = false
            $('#up-button-' + this.floor).removeClass("up-button-active")
        }
        else {
            gv.isOnWait[this.floor].down = false
            $('#down-button-' + this.floor).removeClass("down-button-active")
        }
    }

    up() {
        console.log(this.id+this.floor, this.queue, this.request)
        this.floor++
        upAnim(this.id)
        if (this.request.has(this.floor)) {
            setTimeout(()=>{openDoor(this.id)}, 1000)
            this.openRemain = gv.openTime
            let rq = this.request.get(this.floor)
            if (rq && rq.question) {
                console.log(rq.member)
                this.removeOutSideButtonAttr(rq)
                sendMessage(this.id + ' 号电梯停在 '+this.floor+' 楼，'+rq.member+'进入电梯。', this.id,"fa fa-arrow-left",'enter')
                userIn(this.id)
                console.log(rq)
                this.questioning = true
                question(this.id, this.floor, rq.direction, rq.member)
            } else {
                sendMessage(this.id + ' 号电梯停在 '+this.floor+' 楼，'+rq.member+'走出电梯。', this.id,"fa fa-arrow-right",'leave')
                userOut(this.id)

            }
            if (this.floor === this.queue.tail()) {
                this.queue.pop();
                if (this.queue.size() === 0 || this.queue.tail() === this.floor)
                    this.state = Enum.StateType.Idle
                if (this.queue.tail() < this.floor)
                    this.state = Enum.StateType.Down
                if (this.questioning)
                    this.state = rq.direction
            }
            this.request.delete(this.floor)
        }
    }

    down() {
        console.log(this.id+this.floor, this.queue, this.request)
        this.floor--
        downAnim(this.id)
        if (this.request.has(this.floor)) {
            this.openRemain = gv.openTime
            setTimeout(()=>{openDoor(this.id)}, 1000)
            let rq = this.request.get(this.floor)
            if (rq && rq.question) {
                this.removeOutSideButtonAttr(rq)
                sendMessage(this.id + ' 号电梯停在 '+this.floor+' 楼，'+rq.member+'进入电梯。', this.id, "fa fa-arrow-left",'enter')
                userIn(this.id)
                this.questioning = true

                question(this.id, this.floor, rq.direction, rq.member)
            } else {
                sendMessage(this.id + ' 号电梯停在 '+this.floor+' 楼，'+rq.member+'走出电梯。', this.id, "fa fa-arrow-right",'leave')
                userOut(this.id)
            }
            if (this.floor === this.queue.tail()) {
                this.queue.pop();
                if (this.queue.size() === 0 || this.queue.tail() === this.floor)
                    this.state = Enum.StateType.Idle
                if (this.queue.tail() > this.floor)
                    this.state = Enum.StateType.Up
                if (this.questioning)
                    this.state = rq.direction
            }
            this.request.delete(this.floor)
        }
    }

    addRequestFloor(r, qs, isQueue = true) {
        console.log(r.floor, r.direction, qs)
        let rq = this.request.get(this.floor)
        if (rq) {
            let members = [rq.member, r.name]
            console.log(members)
            this.request.set(r.floor, {member: members, direction: r.direction, question: qs | rq.question})
        }
        else {
            let members = [r.name]
            console.log(members)
            this.request.set(r.floor, {member: members, direction: r.direction, question: qs})
        }
        console.log("addRequestFloor:"+r.floor+r.direction+qs)
        if (this.queue.size() === 0 && !((this.queue[0] > r.floor && r.floor > this.floor) ||
            (this.queue[0] < r.floor && r.floor < this.floor))) {
            this.queue.push(r.floor)
        }
    }

    check(request) {
        console.log(request, this.queue, this.state)
        if (request.floor > this.floor && request.floor <= this.queue.tail() &&
            this.state === Enum.StateType.Up && this.request.get(this.queue.tail()).direction !== Enum.StateType.Down
             && (request.direction === Enum.StateType.Up)) {
            return {b: true, cost: request.floor - this.floor, isQueue:false}

        }
        if (request.floor < this.floor && request.floor >= this.queue.tail() &&
            this.state === Enum.StateType.Down && this.request.get(this.queue.tail()).direction !== Enum.StateType.Up
            && (request.direction === Enum.StateType.Down)) {
            return {b: true, cost: this.floor - request.floor, isQueue:false}
        }
        if (this.state === Enum.StateType.Idle && this.queue.size() === 0 && !this.questioning) {
            return {b: true, cost: Math.abs(this.floor - request.floor) + gv.runCost}
        }
        return {b: false, cost: -1, isQueue: false}
    }

    press(f, state, members) {
        this.addRequestFloor({floor: f, name: members, direction: Enum.StateType.Idle}, false, true)
        this.questioning = false
        $('#elevator-card-'+this.id).removeClass('elevator-card-active')
        this.myToast.reset()
        sendMessage('坐稳了，' + this.id + ' 号电梯启动了，'  +'将前往 ' +f+' 楼。', this.id, 'fa fa-play-circle-o','select')
    }

    emerEvent() {
        if (this.state === Enum.StateType.Error) {
            //$("#elevator-emer-" + this.id + '').html("<i class='fa fa-bell'></i>")
            $('#elevator-emer-'+this.id).children().removeClass('fa-bell-slash')
            $('#elevator-emer-'+this.id).children().addClass('fa-bell')
            this.state = Enum.StateType.Idle
            changeCount(this.id)
            sendMessage(this.id + ' 号电梯故障排除，可以正常使用了。', 7, 'fa fa-heart-o', 'disemer')
        } else {
            //$("#elevator-emer-" + this.id + '').html("<i class='fa fa-bell-slash'></i>")
            $('#elevator-emer-'+this.id).children().removeClass('fa-bell')
            $('#elevator-emer-'+this.id).children().addClass('fa-bell-slash')
            this.state = Enum.StateType.Error
            changeCount(this.id)
            this.request.forEach(function(value, key, map=this.request) {
                if (value.question) {
                    gv.queue.push({name: value.member, floor: key, direction: value.direction})
                }
            })
            this.request.clear()
            this.queue.clear()
            emerAnim(this.id)
            sendMessage(this.id + ' 号电梯出现故障，攻城狮正在紧张抢修。', 6, 'fa fa-exclamation-circle','emer')
        }
    }
}

function emerAnim(i) {
    setTimeout(()=>{
        if (gv.ev[i].state === Enum.StateType.Error) {
            $('#elevator-pointer-'+i).addClass('tc-error')
            $('#elevator-counter-'+i).addClass('bg-error')
            $('#elevator-door-left-'+i).addClass('bg-error')
            $('#elevator-door-right-'+i).addClass('bg-error')
            setTimeout(()=>{
                $('#elevator-pointer-'+i).removeClass('tc-error')
                $('#elevator-counter-'+i).removeClass('bg-error')
                $('#elevator-door-left-'+i).removeClass('bg-error')
                $('#elevator-door-right-'+i).removeClass('bg-error')
                emerAnim(i)
            },500)
        }
    },500)
}

function nextTick() {
    manageRequest()
    moveElevators()
    setTimeout(nextTick, 1000)
}

function manageRequest() {
    var min
    var min_point
    var isQueue
    var ans
    while (gv.queue.size() > 0) {
        let request = gv.queue.tail()
        console.log(gv.queue.tail())
        min = gv.floor + gv.runCost
        min_point = -1
        isQueue = false
        for(let i = 1; i <= gv.elevator; i++) {
            ans = gv.ev[i].check(request)
            console.log(i + '-' + ans.b + '-' + ans.cost)
            if (ans.b && (ans.cost < min || (ans.cost === min && Math.random()>=0.5))) {
                min = ans.cost
                min_point = i
                isQueue = ans.isQueue
            }
        }
        if (min_point > 0 && !gv.ev[min_point].isAllocated) {
            gv.ev[min_point].addRequestFloor(request, true, isQueue)
            gv.ev[min_point].isAllocated = true
            sendMessage('去 ' + request.floor + ' 楼接'+request.name+'的任务被分配给 ' + min_point + ' 号电梯。',
                min_point, "fa fa-hashtag", 'task')
        }else
            return false
        gv.queue.pop()
    }
    return true
}

function moveElevators() {
    for(let i = 1; i <= gv.elevator; i++)
        gv.ev[i].move()
}

function updateUI() {
    for(let i = 1; i <= gv.elevator; i++) {
        //$('#elevator-count-' + i).text(gv.ev[i].floor)
    }
}

function question(id, from, state, members) {
    console.log(id, from, state)
    var header = '<div>' + members  + ', 你现在在 ' + from +' 楼: </div>'
    var text = ''
    members = '\'' + members + '\''
    if (state == Enum.StateType.Up) {
        for (let i = from + 1; i <= gv.floor; i++)
            text = text + '<span class="select-floor" onclick="gv.ev[' + id + '].press('+ i + ',' + state + ',' + members + ')">' + i + '</span> '
    }
    if (state == Enum.StateType.Down) {
        for (let i = 1; i < from; i++)
            text = text + '<span class="select-floor" onclick="gv.ev[' + id + '].press('+ i + ',' + state + ',' + members + ')">' + i + '</span> '
    }
    //sendMessage(header)
    gv.ev[id].myToast = $.toast({
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

function init() {
    for (let i = gv.floor; i > 0; i--) {
        gv.isOnWait[i] = {up: false, down: false}
        let css_number = '<span class="floor-number">'+i+'</span>'
        let css_up = i!==gv.floor ? '<span class="up-button" id="up-button-'+i+'" onclick="up('+i+')">' +
        '<i class="fa fa-chevron-up"></i></span>' : '<span style="padding: 12px"></span>'
        let css_down = i!==1 ? '<span class="down-button" id="down-button-'+i+'" onclick="down('+i+')">' +
            '<i class="fa fa-chevron-down"></i></span>' : ''
        let css_man = '<span class="floor-man" id="floor-man-'+i+'"><i class="fa fa-user"></i></span>'
        $('.left-panel').append('<div class="floor" id="floor-'+i+'">' + css_number +
            css_up + css_down + css_man +'</div>')
    }

    for (let i=1; i<=gv.elevator; i++) {
        gv.ev[i] = new Elevator(i)
        let code = '<div class="elevator-route"><div class="elevator-card" id="elevator-card-'+i+'"><div ' +
            'class="elevator-pointer tc-'+i+'" id="elevator-pointer-'+i+'"><i class="fa fa-circle"></i></div><di' +
            'v class="elevator-counter  bg-'+i+'" id="elevator-counter-'+i+'">' +
            '<div class="elevator-count" id="elevator-count-'+i+'">1</div>' +
            '</div><div class="elevator-item"><div class="elevator-door-left bg-'+i+'" id="elevator-door-left-'+i+'">' +
            '&nbsp;</div><div ' +
            'class="elevator-door-right bg-'+i+'" id="elevator-door-right-'+i+'">&nbsp;' +
            '</div><i class="fa fa-user fa-user-e" id="user-'+i+'"></i></div><div ' +
            'class="elevator-text-container">'+i+'号电梯</div></div><div class="elevator-line">' +

            '</div>' +
            '<div class="elevator-emer" id="elevator-emer-'+i+'" onclick="gv.ev['+i+'].emerEvent()">' +
            '<i class="fa fa-bell"></i></div>' +
            '</div>'
        $('.center-panel').append(code)
    }

    sendMessage('操作系统第一次作业 By 杜佳豪 1552652。',0,"fa fa-user", 'normal')
    sendMessage('电梯调度系统准备就绪。',0,"fa fa-check-square-o", 'normal')
}

function sendMessage(message, owner = 0, icon = '', type = 'normal') {
    let icode = icon !== '' ? '<i class="message-icon ' + icon + '"></i>  ': ''
    let own = owner > 5 ? 0 : owner
    $('#message-panel').append('<div style="color:'+ gv.color[owner]+'">'+ icode + message+'</div>')
    let mainContainer = $('.right-panel'),
        scrollToContainer = $('#message-footer');//滚动到<div id="thisMainPanel">中类名为son-panel的最后一个div处
    mainContainer.scrollTop(
      scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
    )

}

function up(f) {
    if (!gv.isOnWait[f].up) {
        let n = buildName()
        gv.isOnWait[f].up = true
        $('#floor-man-'+ f).fadeIn(1000)
        $('#up-button-' + f).addClass("up-button-active")
        gv.queue.push({name: n, floor: f, direction: Enum.StateType.Up})
        sendMessage( n + '在 ' + f + ' 楼按下上行键，请稍作等待。', 0, 'fa fa-arrow-up', 'up')
    }
}

function down(f) {
    if (!gv.isOnWait[f].down) {
        let n = buildName()
        gv.isOnWait[f].down = true
        $('#floor-man-'+ f).fadeIn(1000)
        $('#down-button-' + f).addClass("down-button-active")
        gv.queue.push({name: n, floor: f, direction: Enum.StateType.Down})
        sendMessage(n + '在 ' + f + ' 楼按下下行键，请稍作等待。', 0, 'fa fa-arrow-down', 'down')
    }
}

function buildName() {
    return gv.names.last[Math.floor(Math.random()*gv.names.last.length)] +
        gv.names.middle[Math.floor(Math.random()*gv.names.middle.length)] +
        gv.names.first[Math.floor(Math.random()*gv.names.first.length)]
}

function floorToHeight(floor) {
    return (468 - ( gv.floor - floor) * gv.lineHeight) + 'px'
}

function upAnim(i) {
    console.log('up'+i)
    $('#elevator-card-' + i).animate({
        top: "-=22px"
    }, 1000)
    changeCount(i)
}
function downAnim(i) {
    console.log('down'+i)
    $('#elevator-card-' + i).animate({
        top: "+=22px"
    }, 1000)
    changeCount(i)
}
function changeCount(i){
    let dom = $('#elevator-count-'+i)
    let domp = $('#elevator-pointer-'+i)
    dom.animate({
        fontSize: '10px',
        opacity: '0.3'
    }, 300,()=> {
        dom.text(gv.ev[i].floor)
    })
    dom.animate({
        fontSize: '25px',
        opacity: '1'
    }, 600)
    updatePointerAnim(i)
    setTimeout(()=>{updatePointer(i)},1000)
}

function updatePointerAnim(i) {
    var pointer = $('#elevator-pointer-' + i)
    switch (gv.ev[i].state) {
        case 1:
            setTimeout(()=>{
                pointer.html('<i class="fa fa-angle-up"></i>');
                setTimeout(()=>{
                    pointer.html('<i class="fa fa-angle-double-up"></i>');
                }, 333)
            }, 333)
            //pointer.html('<i class="fa fa-angle-up"></i>')
            break
        case 2:
            setTimeout(()=>{
                pointer.html('<i class="fa fa-angle-down"></i>');
                setTimeout(()=> {
                    pointer.html('<i class="fa fa-angle-double-down"></i>');
                }, 333)
            }, 333)
            break
    }
}

function updatePointer(i){
    var pointer = $('#elevator-pointer-' + i)
    switch (gv.ev[i].state) {
        case 0:
            pointer.html('<i class="fa fa-circle"></i>')
            break
        case 1:
            pointer.html('<i class="fa fa-chevron-up"></i>');
            break
        case 2:
            pointer.html('<i class="fa fa-chevron-down"></i>');
            break
        case 3:
            pointer.html('<i class="fa fa-close"></i>')
            break
    }
    if (gv.ev[i].questioning) {
        pointer.html(pointer.html() + ' <i class="fa fa-hourglass-2"></i>')
        $('#elevator-card-'+i).addClass('elevator-card-active')
    }
}

function openDoor(i) {
    $('#elevator-door-left-'+i).animate({
        width: '0'
    }, 1000)
    $('#elevator-door-right-'+i).animate({
        width: '0',
        left: '+=25px'
    }, 1000)
    setTimeout(()=>{closeDoor(i)}, 1000*gv.openTime)
}
function closeDoor(i) {
    $('#elevator-door-left-'+i).animate({
        width: '23px'
    }, 1000)
    $('#elevator-door-right-'+i).animate({
        width: '23px',
        left: '-=25px'
    }, 1000)
}
function userOut(i, isTimeout = true) {
    let floor = gv.ev[i].floor
    setTimeout(() => {
        $('#user-' + i).animate({
            fontSize: '30px',
            opacity: '0'
        }, 1000)
        $('#floor-man-' + gv.ev[i].floor).fadeIn(1000)
        setTimeout(() => {
            $('#floor-man-' + floor).fadeOut(1000)
        }, 1000)
    }, isTimeout?2000:0)
}
function userIn(i, isTimeout = true) {
    let floor = gv.ev[i].floor
    setTimeout(()=>{
        $('#user-'+i).animate({
            fontSize: '16px',
            opacity: '1'
        }, 1000)
        $('#floor-man-'+floor).fadeOut(1000)
    },isTimeout?3000:0)
}