# 操作系统 - 电梯调度系统

## 设计⽬的

1.	体会并理理解多线程概念

2.	学习特定环境下多线程编程⽅方法

3.	体会电梯调度思想

## 使⽤说明

打开 `index.html` 即可运⾏行行。因引⽤用公共 CDN 上的 JQuery 等框架和插件， 请保证在联⽹状态下⽤用。您也可以通过 GitHub 上的 Page 来远程预览： 

[DEMO](https://idustar.github.io/os-elevator/index.html)

因开发过程中使⽤用了了 `ES6` 新特性，推荐使⽤用 `Chrome`, `Safari`, `Firefox` 最新内核浏览器。
 

⻚面可分为三个部分。

楼层⾯板：对应电梯外部视图。⽤用户如需从某⼀一层发出上⾏行行或下⾏行行请求，可按下相应标识按钮。按下后按钮点亮，等待请求执⾏行行。楼层按钮有三种颜⾊色：蓝⾊色表示未被按下，红⾊色表示按下但未被响应，绿⾊色表示按下且已被响应。
 
 
![pUiTnH.png](https://s1.ax1x.com/2018/01/15/pUiTnH.png)


电梯视图：显示电梯位置、状态。警报键在每个电梯运⾏行行路路径的下⽅方，⽤用于发出 故障警报和解除故障警报。指示灯有四种符号，○表示空闲，↓表示下⾏行行，↑表示上⾏行行，×表示故障警报。五种主题⾊色对应五部不不同电梯。故障警报时，电梯闪烁红色。

![pUih9K.png](https://s1.ax1x.com/2018/01/15/pUih9K.png)


消息窗⼝：输出运⾏行行⽇日志，包括上下⾏行行请求、请求分配及响应、电梯开关⻔门及⻆角⾊色进出事件、故障事件等。
 
![pUiHHA.png](https://s1.ax1x.com/2018/01/15/pUiHHA.png)
 

询问弹出层：⽤用户发出请求后，当电梯到达⽤用户所在楼层，会弹出询问层，请求⽬目的楼层。当询问操作结束前，电梯将不不运⾏行行。

![pUiIje.png](https://s1.ax1x.com/2018/01/15/pUiIje.png)



## 程序实现

### ⽂件结构

![pUi7Bd.png](https://s1.ax1x.com/2018/01/15/pUi7Bd.png)

 

### 程序设计

#### Elevator 类

> 电梯关键节点（内部请求）队列列电梯⾮非关键节点（内部请求）集电梯当前状态
 
> 电梯关⻔门倒计时，初始为 0 是否正在询问，初始为 false 当前周期是否已被分配请求询问弹出层 DOM 节点


##### 调度⾏为分析

###### 乘客

1.	在任何⼀一楼发出上下⾏行行请求。

2.	当所请求电梯到达乘客楼层时，弹出查询层，可以选择⽬目标楼层。

3.	随时发出故障警报或解除故障警报。


###### 电梯

1.	若电梯⻔门未关，则更更新计时器器，直到电梯⻔门被关上，不不执⾏行行以下命令。

2.	若当前电梯正在执⾏行行询问操作，则等待询问结束，不不执⾏行行以下命令。

3.	检查系统发送的某个请求是否可被⾃自身响应。可被响应需满⾜足以下条件：
 
>- 电梯正在运⾏行行中，请求所在楼层相对位置及请求⽅方向与当前电梯的运⾏行行⽅方向相同且所在楼层位于当前电梯运⾏行行路路径上。
- 电梯处于空闲状态，队列列中⽆无请求（电梯未在当前时钟周期已响应某⼀一请求）且并⾮非正在询问操作。
返回检查结果。若检查结果为 true，则返回代价。代价计算⽅方式：

>>代价为当前楼层与请求所在楼层的差的绝对值。
>>
>>条件②计算所得代价将被加以某⼀一较⼤大常数，以表示条件①优先考虑。

4.	在每⼀一个时钟周期，检查并更更新状态。

> 若到达关键节点时，更更新到响应最新状态。关键节点满⾜足：
> 
1. 上⾏行行转下⾏行行
2. 下⾏行行转上⾏行行
3. 在当前运⾏行行⽅方向追加⼀一个更更远的楼层
4. 运⾏行行转停⽌止
5. 在空队列列中产⽣生⼀一个新请求节点

> 若内部请求队列列中有请求⽽而原状态为空闲，则根据请求⽅方向转为上⾏行行或下⾏行行状态。

5.	在每⼀一个时钟周期，若当前状态为上⾏行行或下⾏行行，则执⾏行行移动。加载移动动画。

6.	接 6，若存在内部请求指向到达楼层，则执⾏行行开⻔门、上下客操作，加载开关

⻔门动画。

7.	在满⾜足条件 6  或满⾜足条件“当前状态为空闲且请求队列列中有请求”的情况下， 若内部请求指向到达楼层且该请求为关键节点，则弹出内部请求队列列的队尾  节点，响应新队尾节点（若内部请求队列列为空，则转为空闲状态）。
8.	接 7，若关键节点为⼀一询问节点，则调⽤用弹出询问层函数，等待询问结束。

9.	响应询问结果，将产⽣生的新内部⾮非询问请求加⼊入内部请求队列列，请求信息包    括⽬目标楼层，请求者。
10.	响应警报。切换故障警报或解除故障警报状态，加载或停⽌止警报动画，修改显示及状态。若响应故障警报，将其中的询问请求释放到外部请求队列列中（在内部请求队列列中删除），并保留留已在执⾏行行中的⾮非询问请求。
11.	若接收到由系统分配的外部请求，则将其加⼊入内部请求队列列。

内部请求队列列分为关键节点队列列和请求集，请求集储存包含⻆角⾊色名及其对应     的⻆角⾊色类型、⽅方向、楼层信息等。⼀一个请求必须包含在请求集内，若满⾜足关
 
键节点条件还应加⼊入关键节点队列列。

![pUi5cD.png](https://s1.ax1x.com/2018/01/15/pUi5cD.png)

### 系统

1.	响应外部请求的创建。

当⽤用户发出上下⾏行行请求时，系统调⽤用 up(floor)或 down(floor)函数，创建⼀一个个询问请求。请求分为两种：
 
①  询问请求。当⽤用户在外部按上下⾏行行键后创建的请求，该类请求在执⾏行行完后会弹出询问层，询问操作会产⽣生⼀一个⾮非询问请求。
② ⾮非询问请求。当⽤用户在内部按键后创建的请求。该类请求直接创建于电梯内部队列列中。请求执⾏行行结束⽆无附加操作。
请求信息包括请求者、⽬目标楼层及请求⽅方向。

2.	在每⼀一个时钟周期，将外部请求队列列的队尾请求，发送给每个电梯检查。当    每个电梯返回检查结果后，⽐比较可⾏行行结果的代价，将队尾请求分配给可相应且代价最⼩小的电梯执⾏行行；若存在多个最⼩小代价，则随机选择⼀一个电梯执⾏行行。 若请求被分配，则弹出该队尾请求，在同⼀一时间周期内继续对新的队尾请求执⾏行行相同操作，直到请求队列列为空。
3.	询问操作。向⽤用户推送⼀一个 TOAST 的弹出层，显示请求者及可响应楼层。可相应楼层由请求楼层及⽅方向决定（若请求楼层为 17F，且⽅方向为上⾏行行，则18F, 19F, 20F 可被响应）。
4.	响应发送消息事件。若电梯或系统调⽤用 sendMessage()函数，则在消息窗⼝口中推送新消息。
 
## 体现的多线程思想

1.	每个电梯可以看作不不同线程，系统可以看作操作系统。

2.	系统在每个时钟周期内尝试分配外部请求队列列中的请求。请求只能分配给其中⼀一个电梯执⾏行行。
3.	每个周期内电梯并发执⾏行行上述相关操作。若电梯被分配请求，则电梯必须⼀一个接⼀一个地执⾏行行请求。不不同电梯之间互不不影响。
4.	当电梯接受警报事件，其中⼀一部电梯的⼯工作即刻停⽌止，其他电梯正常⼯工作。

