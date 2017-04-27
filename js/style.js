/**
 * Created by dustar on 2017/4/26.
 *
 * style.js - 修改显示，加载动画
 */

function openDoor(i) {  // 开门动画
    $('#elevator-door-left-'+i).animate({
        width: '0'
    }, 1000)
    $('#elevator-door-right-'+i).animate({
        width: '0',
        left: '+=23px'
    }, 1000)
    setTimeout(()=>{closeDoor(i)}, 1000*gv.openTime)    // 在opentime秒后关门
}

function closeDoor(i) { // 关门动画
    $('#elevator-door-left-'+i).animate({
        width: '23px'
    }, 1000)
    $('#elevator-door-right-'+i).animate({
        width: '23px',
        left: '-=23px'
    }, 1000)
}

function userOut(i, isTimeout = true, remain = false) { // 角色离开
    let floor = gv.ev[i].floor
    setTimeout(() => {
        if (!remain) {
            $('#user-' + i).animate({
                fontSize: '30px',
                opacity: '0'
            }, 1000)
        }
        if (!(gv.isOnWait[i].up || gv.isOnWait[i].down)) {
            $('#floor-man-' + gv.ev[i].floor).fadeIn(1000)
            setTimeout(() => {
                $('#floor-man-' + floor).fadeOut(1000)
            }, 1000)
        }
    }, isTimeout ? 2000 : 0)
}

function userIn(i, isTimeout = true, remain = false) {  // 角色进入
    let floor = gv.ev[i].floor
    setTimeout(()=>{
        if (!remain) {
            $('#user-' + i).animate({
                fontSize: '16px',
                opacity: '1'
            }, 1000)
        }
        if (!(gv.isOnWait[i].up || gv.isOnWait[i].down)) {
            $('#floor-man-' + floor).fadeOut(1000)
        }
    },isTimeout?3000:0)
}

function upAnim(i) {    // 上升动画
    $('#elevator-card-' + i).animate({
        top: "-=22px"
    }, 1000)
    changeCount(i)  // 修改数值
}

function downAnim(i) {  // 下降动画
    $('#elevator-card-' + i).animate({
        top: "+=22px"
    }, 1000)
    changeCount(i)
}

function changeCount(i){    // 修改数值
    let dom = $('#elevator-count-'+i)
    let domp = $('#elevator-pointer-'+i)
    // 数值动画
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

function updatePointerAnim(i) { // 指示符动画（指示符不断变化）
    var pointer = $('#elevator-pointer-' + i)
    switch (gv.ev[i].state) {
        case 1:
            setTimeout(()=>{
                pointer.html('<i class="fa fa-angle-up"></i>');
                setTimeout(()=>{
                    pointer.html('<i class="fa fa-angle-double-up"></i>');
                }, 333)
            }, 333)
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

function updatePointer(i){  // 更新指示符
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

function emerAnim(i) {  // 紧急动画（警报闪烁）
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
            }, 500)
        }
    }, 500)
}

function changeButtonColorToRequest(floor, direction) {
    if (direction === Enum.StateType.Up) {
        $('#up-button-' + floor).addClass("up-button-request")
        $('#up-button-' + floor).children().removeClass('fa-spinner')
    }
    else {
        $('#down-button-' + floor).addClass("down-button-request")
        $('#down-button-' + floor).children().removeClass('fa-spinner')
    }
}

function removeButtonColor(floor, direction) {
    if (direction === Enum.StateType.Up) {
        let dom = $('#up-button-' + floor)
        gv.isOnWait[floor].up = false
        dom.removeClass("up-button-request")
        dom.removeClass("up-button-active")
    }
    else {
        gv.isOnWait[floor].down = false
        let dom = $('#down-button-' + floor)
        dom.removeClass("down-button-request")
        dom.removeClass("down-button-active")
    }
}