/**
 * Created by dustar on 2017/4/25.
 *
 * elevator.js - 电梯伪类
 */
class Elevator {
    constructor(i) {
        this.id = i
        this.floor = 1
        this.queue = new Queue() // 储存关键节点请求（上行转下行，下行转上行或运行转停止）
        this.request = new Map() // 储存将要停的楼层
        this.state = Enum.StateType.Idle // 状态
        this.openRemain = 0 // 关门倒计时
        this.questioning = false // 是否正在询问
        this.isAllocated = false
        this.myToast = {}
    }

    // 移动角色
    move() {
        this.isAllocated = false
        if (this.openRemain > 0) { // 如果还未关门，不移动
            this.openRemain--
        } else if (this.questioning) // 如果正在询问，不移动
            return
        else {
            if (this.state === Enum.StateType.Idle) {
                // 如果队列中有请求，则改变状态
                if (this.queue.tail() > this.floor) {
                    this.state = Enum.StateType.Up
                    sendMessage(this.id + ' 号电梯像火箭一样飞窜上天。', this.id, 'fa fa-play-circle-o', 'start')
                } else if (this.queue.tail() < this.floor) {
                    this.state = Enum.StateType.Down
                    sendMessage(this.id + ' 号电梯加足马力开始工作了。', this.id, 'fa fa-play-circle-o', 'start')
                }
                // 如果本层楼即为请求目标（一般为当前所停楼层有人按外部按钮）
                if (this.queue.tail() === this.floor && this.request.size > 0 && this.request.get(this.floor).question) {
                    // 改变状态，调用询问
                    this.state = this.request.get(this.floor).direction
                    this.questioning = true
                    updatePointer(this.id)
                    question(this.id, this.floor, this.request.get(this.floor).direction,
                        this.request.get(this.floor).member.printQ())
                    // 显示开门、进人动画
                    setTimeout(() => {
                        openDoor(this.id)
                    }, 1000)
                    userIn(this.id, true, (this.sumNQ() > 0 ? true : false))
                    console.log('userIn' + this.id + '/' + this.floor + '/' + this.request.size, this.request)
                    this.openRemain = 3
                    // 恢复外部按钮
                    this.removeOutSideButtonAttr(this.request.get(this.queue.tail()))
                    sendMessage(this.id + ' 号电梯停在 ' + this.floor + ' 楼，' +
                        this.request.get(this.queue.tail()).member.printInAndOut(),
                        this.id, "fa fa-arrow-left", 'enter')

                    this.queue.pop()
                    this.request.delete(this.floor)
                }
            } else {
                // 开始执行
                if (this.state === Enum.StateType.Up)
                    this.up()
                else if (this.state === Enum.StateType.Down)
                    this.down()
            }
        }
    }

    // 恢复外部按钮
    removeOutSideButtonAttr(rq) {
        removeButtonColor(this.floor, rq.direction)
    }

    up() {
        // 楼层加1
        this.floor++
        // 上升动画
        upAnim(this.id)
        if (this.request.has(this.floor)) {
            setTimeout(() => {
                openDoor(this.id)
            }, 1000)
            this.openRemain = gv.openTime
            let rq = this.request.get(this.floor)
            if (rq && rq.question) {
                // 进电梯
                this.removeOutSideButtonAttr(rq)
                sendMessage(this.id + ' 号电梯停在 ' + this.floor + ' 楼，' + rq.member.printInAndOut(),
                    this.id, "fa fa-arrow-left", 'enter')
                userIn(this.id, true, (this.sumNQ() > 0 ? true : false))
                console.log('userIn' + this.id + '/' + this.floor + '/' + this.request.size, this.request)
                this.questioning = true
                question(this.id, this.floor, rq.direction, rq.member.printQ())
            } else {
                // 出电梯
                sendMessage(this.id + ' 号电梯停在 ' + this.floor + ' 楼，' + rq.member.printNQ() + '走出电梯。',
                    this.id, "fa fa-arrow-right", 'leave')
                userOut(this.id, true, (this.sumNQ() > 0 ? true : false))
                console.log('userOut' + this.id + '/' + this.floor + '/' + this.request.size, this.request)

            }
            if (this.floor === this.queue.tail()) {
                // 重要节点（上行转下行，下行转上行，运行转停止）
                this.queue.pop();
                if (this.queue.size() === 0 || this.queue.tail() === this.floor) // 若无更多请求，则转为空闲状态
                    this.state = Enum.StateType.Idle
                if (this.queue.tail() < this.floor) // 若有下行请求，则转为下行转台
                    this.state = Enum.StateType.Down
                if (this.questioning)
                    this.state = rq.direction
            }
            this.request.delete(this.floor)
        }
    }

    down() {
        this.floor--
        downAnim(this.id)
        if (this.request.has(this.floor)) {
            this.openRemain = gv.openTime
            setTimeout(() => {
                openDoor(this.id)
            }, 1000)
            let rq = this.request.get(this.floor)
            if (rq && rq.question) {
                this.removeOutSideButtonAttr(rq)
                sendMessage(this.id + ' 号电梯停在 ' + this.floor + ' 楼，' + rq.member.printInAndOut(),
                    this.id, "fa fa-arrow-left", 'enter')
                userIn(this.id, true, (this.sumNQ() > 0 ? true : false))
                console.log('userIn' + this.id + '/' + this.floor + '/' + this.request.size, this.request)
                this.questioning = true

                question(this.id, this.floor, rq.direction, rq.member.printQ())
            } else {
                sendMessage(this.id + ' 号电梯停在 ' + this.floor + ' 楼，' + rq.member.printNQ() + '走出电梯。',
                    this.id, "fa fa-arrow-right", 'leave')
                userOut(this.id, true, (this.sumNQ() > 0 ? true : false))
                console.log('userOut' + this.id + '/' + this.floor + '/' + this.request.size, this.request)
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

    addRequestFloor(r, qs, isQueue = true) { // 加入内部请求队列
        // 是否已存在该楼层相关请求
        if (this.request.has(r.floor)) {
            let rq = this.request.get(r.floor)
            let members = rq.member.add(r.name, qs)
            let dir = Math.max(r.direction, rq.direction)
            this.request.set(r.floor, {
                member: members,
                direction: dir,
                question: qs | rq.question
            }) // 合并信息
        } else {
            let members = new Member(r.name, qs)
            this.request.set(r.floor, {
                member: members,
                direction: r.direction,
                question: qs
            })
        }
        // 改变按钮样式
        if (qs)
            changeButtonColorToRequest(r.floor, r.direction)
        // 判断是否为关键节点
        if (this.queue.size() === 0)
            this.queue.push(r.floor)
        else {
            if (this.queue.list[0] >= r.floor && r.floor > this.floor)
                return
            if (this.queue.list[0] <= r.floor && r.floor < this.floor)
                return
            this.queue.push(r.floor)
        }
    }

    sumNQ() {
        var sum = 0
        for (let [key, value] of this.request.entries()) {
            if (key !== this.floor)
                sum += value.member.countNQ()
        }
        return sum
    }

    check(request) { // 检查当前是否能处理某外界请求
        // 电梯上行、请求上行且在电梯运行区间
        if (request.floor > this.floor && request.floor <= this.queue.tail() &&
            this.state === Enum.StateType.Up && this.request.get(this.queue.tail()).direction !== Enum.StateType.Down
            && (request.direction === Enum.StateType.Up)) {
            return {
                b: true,
                cost: request.floor - this.floor,
                isQueue: false
            }
        }
        // 电梯下行、请求下行且在电梯运行区间
        if (request.floor < this.floor && request.floor >= this.queue.tail() &&
            this.state === Enum.StateType.Down && this.request.get(this.queue.tail()).direction !== Enum.StateType.Up
            && (request.direction === Enum.StateType.Down)) {
            return {
                b: true,
                cost: this.floor - request.floor,
                isQueue: false
            }
        }
        // 电梯空闲、无请求且未被询问
        if (this.state === Enum.StateType.Idle && this.queue.size() === 0 && !this.questioning) {
            return {
                b: true,
                cost: Math.abs(this.floor - request.floor) + gv.runCost
            }
        }
        // 返回可行性和代价
        return {
            b: false,
            cost: -1,
            isQueue: false
        }
    }

    press(f, state, members) { // 询问时按键
        this.addRequestFloor({
            floor: f,
            name: members,
            direction: Enum.StateType.Idle
        }, false, true) // 加入内部请求队列
        this.questioning = false
        $('#elevator-card-' + this.id).removeClass('elevator-card-active')
        this.myToast.reset()
        sendMessage('坐稳了，' + this.id + ' 号电梯启动了，' + '将前往 ' + f + ' 楼。',
            this.id, 'fa fa-play-circle-o', 'select')
    }

    emerEvent() { // 警报键
        if (this.state === Enum.StateType.Error) { // 若已被按下，则解除警报
            // 修改显示
            $('#elevator-emer-' + this.id).children().removeClass('fa-bell-slash')
            $('#elevator-emer-' + this.id).children().addClass('fa-bell')
            updatePointer(this.id)
            // 修改状态
            this.state = Enum.StateType.Idle

            sendMessage(this.id + ' 号电梯故障排除，可以正常使用了。', 7, 'fa fa-heart', 'disemer')
        } else {
            // 修改显示
            $('#elevator-emer-' + this.id).children().removeClass('fa-bell')
            $('#elevator-emer-' + this.id).children().addClass('fa-bell-slash')
            updatePointer(this.id)
            emerAnim(this.id)
            // 修改状态
            this.state = Enum.StateType.Error
            // 若该状态正在执行某外部请求，则释放其请求队列中所有请求，交由其他电梯处理
            var that = this
            this.request.forEach(function (value, key, map = this.request) {
                if (value.question) {
                    gv.queue.push({
                        name: value.member.printQ(),
                        floor: key,
                        direction: value.direction
                    })
                    that.queue.removeByValue(key)
                    that.request.delete(key)
                }
            })
            sendMessage(this.id + ' 号电梯出现故障，攻城狮正在紧张抢修。', 6, 'fa fa-exclamation-circle', 'emer')
        }
    }
}