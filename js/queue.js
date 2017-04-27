/**
 * Created by dustar on 2017/4/26.
 *
 * queue.js - 队列伪类
 */

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
    removeByValue(val) {
       // for(let i = 0; i < this.list.length; i++) {
       //     if(this.list[i] === val) {
       //         this.list.splice(i, 1);
        //        break;
        //    }
       // }
    }

    clear() {
        this.list.splice(0, this.size())
    }
}