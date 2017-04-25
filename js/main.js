/**
 * Created by dustar on 2017/4/25.
 */

var gv = {
    floor: 20,
    elevator: 5,
    color: {6:'#cc0022', 7:'#33ff55', 0:'#000000', 1:'#00bbff', 2:'#ee8811', 3:'#bb0077', 4:'#7700bb', 5:'#007788'},
    runCost: 5,
    openTime: 3,
    ev: {}
}

$(document).ready(function() {
    Enum()
    init()
    gv.queue = new Queue()
    nextTick()
})

function Enum() {}
Enum.StateType = {Idle:0, Up: 1, Down: 2, Error:3}

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
        this.list.clear()
    }
}

class Elevator {
    constructor(i) {
        this.id = i
        this.floor = 1
        this.toMax = 0
        this.toMin = gv.floor + 1
        this.state = Enum.StateType.Idle
        this.next = Enum.StateType.Idle
        this.request = {}
        this.openRemain = 0
        this.questioning = false
        this.isLoaded = false
    }

    move() {
        if (this.openRemain > 0) {
            this.openRemain--
        }
        else if (this.questioning)
            return
        else {
            this.handleQRequest()
            if (this.state === Enum.StateType.Idle) {
                if (this.toMax > this.floor) {
                    this.state = Enum.StateType.Up
                    sendMessage(this.id + '号电梯启动。')
                }
                else if (this.toMin < this.floor) {
                    this.state = Enum.StateType.Down
                    sendMessage(this.id + '号电梯启动。')
                }
            }
            if (this.state === Enum.StateType.Up)
                this.up()
            else if (this.state === Enum.StateType.Down)
                this.down()
        }
    }

    handleQRequest() {
        if (this.QRequest.has(this.floor)) {
            this.QRequest.delete(this.floor)
            this.openRemain = gv.openTime
            sendMessage(this.id + '号电梯门开了。')
            this.questioning = true
            question(this.id, this.floor, this.next)
            return true
        }
        return false
    }
    handleRequest() {
        if (this.request.has(this.floor)) {
            this.request.delete(this.floor)
            this.openRemain = gv.openTime
            sendMessage(this.id + '号电梯门开了。')
            return true
        }
        return false
    }
    handleIdle(state) {
        if (this.state === Enum.StateType.Up && this.next === Enum.StateType.Idle) {
            this.toMin = gv.floor + 1
        }
        if (this.state === Enum.StateType.Down && this.next === Enum.StateType.Idle) {
            this.toMax = 0
        }
    }

    up() {
        console.log(this.id + '/F' + this.floor+ '/S' +this.state+ '/MIN' +this.toMin+ '/MAX' +this.toMax+ '/N' +this.next)
        if (this.toMax > this.floor)
            this.floor++
        else {
            this.state = Enum.StateType.Idle
            return
        }
        //check
        if ()

        if (this.handleQRequest()) {
            if (this.toMax === this.floor) {
                this.toMax = 0
                //this.handleIdle()
                this.state = this.next
                this.next = Enum.StateType.Idle

            }
        } else if (this.handleRequest()) {
            if (this.toMax === this.floor) {
                this.toMax = 0
                this.handleIdle()
                this.state = this.next
                this.next = Enum.StateType.Idle
            }
        }
    }

    down() {
        console.log(this.id + '/F' + this.floor+ '/S' +this.state+ '/MIN' +this.toMin+ '/MAX' +this.toMax+ '/N' +this.next)
       // this.toMax = this.toMax > this.floor? this.floor : this.toMax
        if (this.toMin < this.floor)
            this.floor--
        else {
            this.state = Enum.StateType.Idle
            return
        }
        //check
        if (this.handleQRequest()) {
            if (this.toMin === this.floor) {
                this.toMin = gv.floor + 1
                this.handleIdle()
                this.state = this.next
                this.next = Enum.StateType.Idle

            }
        } else if (this.handleRequest()) {
            if (this.toMin === this.floor) {
                this.toMin = gv.floor + 1
                this.handleIdle()
                this.state = this.next
                this.next = Enum.StateType.Idle
            }
        }
    }

    addRequestFloor(r, qs) {
        console.log(r.floor, r.direction, qsn)
        this.request[r.floor] = {count: 0, direction: r.direction, question: qs}
        if (this.toMax < r.floor && r.direction === Enum.StateType.Up) {
            this.toMax = r.floor
        }
        if (r.floor < this.toMin && r.direction === Enum.StateType.Down) {
            this.toMin = r.floor
        }
        if (this.state === Enum.StateType.Idle && this.floor === r.floor)
            this.state = r.direction
    }

    check(request) {
        console.log(request)
        if (request.floor > this.floor && request.floor < this.toMax &&
            this.state === Enum.StateType.Up &&
            (request.direction === this.next || this.next === Enum.StateType.Idle)) {
            return {b: true, cost: request.floor - this.floor}

        }
        if (request.floor < this.floor && request.floor > this.toMin &&
            this.state === Enum.StateType.Down &&
            (request.direction === this.next || this.next === Enum.StateType.Idle)) {
            return {b: true, cost: this.floor - request.floor}
        }
        if (this.state === Enum.StateType.Idle) {
            return {b: true, cost: Math.abs(this.floor - request.floor) + gv.runCost}
        }
        return {b: false, cost: -1}
    }

    press(f, state) {
        this.addRequestFloor({floor: f, direction: Enum.StateType.Idle}, false)
        this.questioning = false
        sendMessage(this.id + '号电梯启动，新增：于' + f + '层停靠。')
    }
}

function nextTick() {
    manageRequest()
    moveElevators()
    updateUI()
    setTimeout(nextTick, 1000)
}

function manageRequest() {
    while (gv.queue.size() > 0) {
        let request = gv.queue.tail()
        var min = gv.floor + gv.runCost
        var min_point = -1
        for(let i = 1; i <= gv.elevator; i++) {
            let ans = gv.ev[i].check(request)
            console.log(i + '-' + ans.b + '-' + ans.cost)
            if (ans.b && ans.cost < min) {
                min = ans.cost
                min_point = i
            }
        }
        if (min_point > 0)
            gv.ev[min_point].addRequestFloor(request, true)
        else
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
        $('#current-floor-' + i).text(gv.ev[i].floor)
        switch (gv.ev[i].state) {
            case 0:
                $('#current-state-' + i).text('空闲状态')
                break
            case 1:
                $('#current-state-' + i).text('上行中')
                break
            case 2:
                $('#current-state-' + i).text('下行中')
                break
            case 3:
                $('#current-state-' + i).text('电梯故障')
                break
        }
        if (gv.ev[i].questioning)
            $('#current-state-' + i).text($('#current-state-' + i).text() + ' 请求按钮')

    }
}

function question(id, from, state) {
    console.log(id, from, state)
    var header = '<div>' + id + '号电梯已到达' + from + '楼：</div>'
    if (state == Enum.StateType.Up) {
        for (let i = from + 1; i <= gv.floor; i++)
            header = header + '<button onclick="gv.ev[' + id + '].press('+ i + ',' + state + ')">' + i + '</button>'
    }
    if (state == Enum.StateType.Down) {
        for (let i = 1; i < from; i++)
            header = header + '<button onclick="gv.ev[' + id + '].press('+ i + ',' + state + ')">' + i + '</button>'
    }
    sendMessage(header)
}

function init() {
    for (let i = gv.floor; i > 0; i--) {
        let css_number = '<span class="floor-number">'+i+'</span>'
        let css_up = i!==gv.floor ? '<span class="up-button" id="up-button-'+i+'" onclick="up('+i+')">' +
        '<i class="fa fa-arrow-up"></i></span>' : '<span style="padding: 12px"></span>'
        let css_down = i!==1 ? '<span class="down-button" id="down-button-'+i+'" onclick="down('+i+')">' +
            '<i class="fa fa-arrow-down"></i></span>' : ''
        $('.left-panel').append('<div class="floor" id="floor-'+i+'">' + css_number + css_up + css_down + '</div>')
    }
    //gv.ev = {1:new Elevator(1),2:new Elevator(2),3:new Elevator(4),4:new Elevator(5),5:new Elevator(5)}
    for (let i=1; i<=5; i++)
        gv.ev[i] = new Elevator(i)
    updateUI()
    sendMessage('电梯调度系统准备就绪。')
}

function sendMessage(message, type = 0) {
    $('.message').append('<div style="color:'+gv.color[type]+'">'+message+'</div>')
}

function up(f) {
    gv.queue.push({floor: f, direction: Enum.StateType.Up})
    sendMessage('有人在 ' + f + ' 楼按动了电梯按钮，电梯将载他上楼。' )
}

function down(f) {
    gv.queue.push({floor: f, direction: Enum.StateType.Down})
    sendMessage('有人在 ' + f + ' 楼按动了电梯按钮，电梯将载他下楼。' )
}