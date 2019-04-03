import * as tpl from "./template";
import * as utils from "./utils";

/**
 * webPet配置模型
 */
interface WebPetOptions {
    //  名称
    name?: string
    //  脚印
    footPrint?: boolean
    //  页面关闭时是否上报数据
    report?: boolean
    //  上报地址
    reportUrl?: string
    //  首次出现位置
    firstPosition?: string | object
    //  操作
    operate?: {
        chat?: boolean
    }
    //  行为
    action?: {
        //  间隔
        interval?: {
            [propName: string]: any
        }
        //  首次招呼
        firstGreet?: boolean
        //  随机走动
        randomMove?: boolean
        //  随机说话
        randomSay?: boolean
    }
    //  状态图片
    statusImg?: {
        //  默认
        default?: string
        //  触摸
        hover?: string
        //  移动
        move?: string
    }
    //  服务端配置
    server?: {
        //  回答时的配置
        answer?: {
            url: string
            dataPath?: string
            [propName: string]: any
        }
        //  学习时的配置
        learn?: {
            url: string
            dataPath?: string
            [propName: string]: any
        }
    }
    //  事件
    on?: {
        create?: Function
        mounted?: Function
    }
}

/**
 * 分析数据模型
 */
interface analyticsData {
    /**
     * 操作相关
     * 点击最多，触摸webpet次数
     */
    operateInfo?: {
        //  触摸宠物次数
        hoverPet?: number
    }
    //  本次会话信息
    sessionInfo?: {
        //  语言
        language?: string
        //  用户设备
        userAgent?: string
        //  打开时间
        startTime?: number
        //  关闭时间
        endTime?: number
        //  总会话时间
        sessionTime?: number
        //  入口来源
        refer?: string
        //  白屏时间
        firstPaintTime?: number
        //  首屏时间
        domReady?: number
        //  总下载时间
        onLoad?: number
    }
}

class WebPet {

    //  私有jquery
    private $;
    //  容器外壳
    private $container;
    //  pet
    private $pet;
    //  消息外壳
    private $message;
    //  消息展示容器
    private $msg;
    //  菜单
    private $menu;
    //  操作区域
    private $operate;
    /**
     * 状态
     * default  默认
     * move     移动
     */
    private $status;
    //  脚印外壳队列
    private $pawWrapQueue: Array<any> = [];
    //  分析数据
    private $analyticsData: analyticsData = {
        operateInfo: {
            hoverPet: 0
        },
        sessionInfo: {}
    };
    //  默认配置
    private options: WebPetOptions = {
        name: "pet",
        footPrint: true,
        report: false,
        reportUrl: "",
        firstPosition: "rightLower",
        operate: {
            chat: true
        },
        action: {
            interval: {
                randomMove: 35000,
                randomSay: 30000
            },
            firstGreet: true,
            randomMove: true,
            randomSay: true
        },
        statusImg: {
            default: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/default.png",
            hover: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/move.png",
            move: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/default.png"
        },
        server: {
            answer: {
                url: "",
                method: "POST",
                dataPath: "data",
                separator: "."
            },
            learn: {
                url: "",
                method: "POST"
            }
        },
        on: {
            create() { },
            mounted() { }
        }
    }

    /**
     * WebPet构造器
     * @param options WebPet配置
     */
    constructor(options?: WebPetOptions) {
        const that = this;
        if (!window) {
            throw new Error("Sorry, I can only play in the browser.")
        };

        if (!window["$"] || !window["$"].fn) {
            utils.getJquery().then(() => {
                that.create(options);
            });
        } else {
            that.create(options);
        }
    }

    /**
     * 创建webPet
     * @param options WebPet配置
     */
    private create(options: WebPetOptions) {
        this.$ = window["$"];

        options && (this.options = this.$.extend(true, {}, this.options, options));

        this.trigger("create")
            .init()
            .checkDictionary()
            .actionEvent()
            .done();
    }

    /**
     * 初始化WebPet各结构与状态
     */
    private init() {
        const $ = this.$;

        this.$container = $(tpl.container);
        this.$pet = $(tpl.pet);
        /**
         * 消息窗口
         * isOpen: 是否打开
         * type: 当前窗口类型 default: 默认窗，confirm：确认窗
         */
        this.$message = $(tpl.message).data("state", {
            isOpen: false,
            type: "default"
        });
        this.$msg = this.$message.find("div.pet-msg");
        this.$menu = $(tpl.menu).on("click", (e: MouseEvent) => {
            this[$(e.target).data("fn")]().toggleMenu("fadeOut");
        });
        this.$operate = this.initOperate();

        this.$container.append(this.$pet, this.$message, this.$menu, this.$operate);
        this.changeStatus("default");

        return this;
    }

    //  右键菜单时的回调函数
    private chat() {
        this.toggleOperateContent("chat");
        return this;
    }

    //  检查本地词典
    private checkDictionary() {
        !localStorage.getItem("petDictionary") && (localStorage.setItem("petDictionary", JSON.stringify(utils.defaultDictionary)));
        return this;
    }

    //  根据配置生成操作区域
    private initOperate() {
        const $ = this.$;
        const that = this;
        const $operate = $(tpl.operate);
        for (let i in that.options.operate) {
            const $btn = $(tpl[`${i}Btn`]).on("click", function () {
                return that.toggleOperateContent(i);
            });
            const $content = $(tpl[`${i}Content`]);
            const $return_btn = $(tpl.returnBtn).on("click", function () {
                return that.toggleOperateContent();
            });
            that.onContentEvent($content, i);

            $operate.find("div.pet-operate-list").append($btn);
            $operate.find("div.switch-animate").append($content.append($return_btn));
        }
        return $operate;
    }

    /**
     * 监听操作区域各功能事件
     * @param $content 
     * @param type 切换的类型
     */
    private onContentEvent($content, type: string) {
        const that = this;
        if (type == "chat") {
            $content.on("keydown", function (e: KeyboardEvent) {
                if (e.keyCode == 13) {
                    //  生成回复内容
                    that.initAnswer(e.target["value"]);
                    //  清空输入框内容
                    e.target["value"] = "";
                }
            });
        }
    }

    /**
     * 切换操作区域内容
     * @param type 切换的类型
     */
    private toggleOperateContent(type?: string) {
        const $switch = this.$operate.find(".switch-animate");
        const $target = $switch.find(`[data-type=${type}]`);
        const distant = type ? -50 * $target.siblings().length : 0;
        $switch.css("top", `${distant}px`);
    }

    /**
     * 根据配置，进行信息处理分发
     * @param value 用户输入的内容
     */
    private initAnswer(value: string) {
        const server = this.options.server;
        //  当存在服务端配置
        server.answer.url ? this.answerFromServer(value) : this.answerFromBrowser(value);
    }

    /**
     * 根据服务端配置，请求拉取消息
     * @param value 用户输入的内容
     */
    private answerFromServer(value) {
        const that = this;
        const $ = that.$;
        const server = that.options.server;
        const opt = $.extend(true, server.answer, {
            data: { msg: value },
            success: function (result) {
                const answerText = utils.getDeepAttrValue(result, opt.dataPath, opt.separator);
                that.message(answerText);
            },
            error: function () { that.message("抱歉，服务出了点问题"); }
        });
        $.ajax(opt);
    }

    /**
     * 处理消息
     * @param value 
     */
    private answerFromBrowser(value: string) {
        const petDictionary: Array<any> = JSON.parse(localStorage.getItem("petDictionary"));
        let answerText: string = "";
        petDictionary["answer"].forEach(item => {
            if (item.key.includes(value)) {
                answerText = item.value;
            }
        });
        this.message(answerText || "抱歉，这个我不会。");
    }

    /**
     * 根据配置信息生成对话框
     * param = "你好" || {
     *  text: "你好",
     *  btnList: [
     *      {
     *          type: "",   //  confirm, cancel
     *          text: "确认",
     *          fn: function() {
     *          }
     *      }
     *  ]
     * }
     * @param param 文本或配置
     */
    private message(param: string | { [propName: string]: any }) {
        if (!param) {
            throw new Error("请传递配置以生成消息框");
        }
        const that = this;
        const $ = that.$;
        const $msgOperate = that.$message.find(".pet-msg-operate");
        //  消息框状态
        const $state = that.$message.data("state");
        //  重置文本框里的各项内容
        (
            that.$msg.text("").hide(),
            $msgOperate.empty().hide()
        )

        //  初始化文本框各项内容
        if (typeof param == "string") {
            $state.type = "default";
            that.$msg.text(param);
        } else {
            $state.type = "confirm";
            that.$msg.text(param.text);
            param.btnList.forEach(item => {
                const type = item.type;
                if (!"confirm,cancel".includes(type)) {
                    throw new Error("type必须是confirm, cancel之一。");
                }
                const $msgBtn = $(tpl.msgBtn).text(item.text || (type == "confirm" ? "确认" : "取消")).on("click", function () {
                    if (type == "cancel") {
                        //  马上关闭
                        that.closeMessage(true);
                    }
                    $.isFunction(item.fn) ? item.fn.call(that) : $.noop;
                }).addClass(type);
                $msgOperate.append($msgBtn);
            });
        }

        let animateOpt = {};
        const messageSize = utils.countMessageSize(typeof param == "string" ? param : param.text);

        //  如果已经打开，马上刷新窗口内的内容
        if ($state.isOpen) {
            that.$msg.fadeIn();
            $msgOperate.fadeIn();
            //  如果为普通模式，延迟关闭时间
            $state.type == "default" && that.closeMessage(false, true);
        }
        //  否则动画打开窗口后刷新窗口后的内容
        else {
            $state.isOpen = true;
            animateOpt = {
                duration: 500,
                complete: function () {
                    that.$msg.fadeIn();
                    $msgOperate.fadeIn();
                    //  如果不为确认模式，设置自动关闭时间
                    $state.type == "default" && that.closeMessage();
                }
            }
        }
        that.$message.stop().animate(messageSize, animateOpt);
    }

    /**
     * 消息框隐藏倒计时
     * @param now 马上关闭
     * @param extend 延长时间
     */
    private closeMessage(now?: boolean, extend?: boolean) {
        const that = this;
        const $msg = that.$msg;
        const $state = that.$message.data("state");
        const time: number = 5;

        if (now) {
            clearInterval($state.interval);
            $state.interval = null;
            return that.hideMessage();
        }
        $msg.data("countDown", time).attr("data-countDown", time);
        //  如果没有在计时，且打开且是默认类型，需要开始倒计时
        const shouldCountDown: boolean = !$state.interval && $state.isOpen && $state.type == "default";
        if (!extend || shouldCountDown) {
            $state.interval = setInterval(function () {
                const t = $msg.data("countDown");
                $msg.data("countDown", t - 1).attr("data-countDown", t - 1);
                if (t === 0) {
                    clearInterval($state.interval);
                    $state.interval = null;
                    $state.type == "default" && that.hideMessage();
                }
            }, 1000);
        }
    }

    //  隐藏消息框
    private hideMessage() {
        this.$message.data("state").isOpen = false;
        this.$msg.fadeOut().text("");
        this.$message.find(".pet-msg-operate").fadeOut().empty();
        this.$message.animate({ height: 0, width: 0 }, { duration: 500 });
    }

    /**
     * 收集设备信息和性能信息
     */
    private recordData() {
        const timing = window.performance.timing;
        const navigator = window.navigator
        const sessionInfo = this.$analyticsData.sessionInfo;

        //  语言
        sessionInfo.language = navigator.language;
        //  用户设备
        sessionInfo.userAgent = navigator.userAgent;
        //  初始访问时间
        sessionInfo.startTime = timing.navigationStart;
        //  页面来源
        sessionInfo.refer = document.location.href;
        //  页面准备时间
        sessionInfo.domReady = timing.domInteractive - timing.navigationStart;
        //  总下载时间
        sessionInfo.onLoad = timing.loadEventStart - timing.navigationStart;

        return this;
    }

    //  处理事件动作
    private actionEvent() {
        const $ = this.$;
        const that = this;
        const $container = that.$container;
        const $pet = that.$pet;
        const options = that.options;
        const action = options.action;
        let isMousedown: boolean = false;
        let isMove: boolean = false;
        let _x: number;
        let _y: number;

        setTimeout(function () {
            //  五秒后首次招呼
            action.firstGreet && that.$status != "hide" && that.firstGreet();
            //  设置随机移动倒计时
            action.randomMove && (window.setInterval(function () {
                that.$status != "hide" && that.randomMove();
            }, action.interval.randomMove));
            //  设置随机说话倒计时
            action.randomSay && (window.setInterval(function () {
                that.$status != "hide" && that.randomSay();
            }, action.interval.randomSay));

        }, 5000);

        options.report && window.addEventListener('load', function () {
            that.recordData();
            (!window["webPetOnReport"]) && (window["webPetOnReport"] = true, window.addEventListener('unload', function () {
                return that.report.call(that);
            }, false));
        });

        $(document)
            //  鼠标移动时
            .mousemove(function (e: MouseEvent) {
                if (isMousedown) {
                    that.changeStatus("move");
                    const x: number = e.pageX - _x;
                    const y: number = e.pageY - _y;
                    const wx: number = $(window).width() - $container.width();
                    const dy: number = $(document).height() - $container.height();
                    if (x >= 0 && x <= wx && y > 0 && y <= dy) {
                        $container.css({ top: y, left: x });
                        isMove = true;
                    }
                }
            })
            //  鼠标松开时
            .mouseup(function () {
                isMousedown = false;
            });

        $pet
            /**
             * 点击宠物本体时：
             * 1. 随机乱跑
             * 2. 改变状态
             */
            .click(function () {
                if (!isMove) {
                    that.randomMove();
                } else {
                    isMove = false;
                }
            })
            /**
             * 鼠标按下时
             * 1. 若是右键，切换显示菜单
             * 2. 拖动位置
             */
            .mousedown(function (e: MouseEvent) {
                that.stopMove();
                if (e.which == 3) {
                    that.toggleMenu();
                }
                isMousedown = true;
                _x = e.pageX - parseInt($container.css("left"));
                _y = e.pageY - parseInt($container.css("top"));
            })
            .bind("contextmenu", function () { return false; })
            .mouseover(function () {
                that.$analyticsData.operateInfo.hoverPet++;
                that.initiativeSay("conversation", "hover", 5);
            });

        $container
            /**
             * 鼠标经过时容器时
             * 1. 显示底部菜单
             */
            .mouseover(function (e: MouseEvent) {
                const $target = e.target;
                const className = $target["className"];
                const mouseInMsgBox = className == "pet-message" || $($target).parents(".pet-message").length;

                //  触摸信息框，不会显示菜单
                if (!mouseInMsgBox) {
                    that.toggleOperate("show");
                    //  触摸状态
                    that.changeStatus("hover");
                }
            })
            /**
             * 鼠标离开时
             * 1. 隐藏底部菜单
             */
            .mouseout(function (e: MouseEvent) {
                const $target = e.target;
                const nodeName = $target["nodeName"];
                const className = $target["className"];
                const activeEle = document.activeElement;
                //  触摸区域为操作区域不隐藏
                if (nodeName == "div" && className == "pet-operate") { }
                //  当前激活控件为聊天窗口，不隐藏
                else if (activeEle.nodeName == "INPUT" && activeEle.className == "pet-chat") { }
                else {
                    that.toggleOperate("hide");
                }
                //  如果不是在移动中，闭上眼睛
                that.$status !== "move" && that.changeStatus("default");
            });

        return this;
    }

    /**
     * 结束，挂载
     */
    private done() {
        this.$(window.document.body).prepend(this.$container);
        this.countFirstPosition();
        this.trigger("mounted");
    }

    /**
     * 计算首次出现位置
     */
    private countFirstPosition() {
        const w: number = document.body.offsetWidth;
        const h: number = document.documentElement.clientHeight;
        const firstPosition: string | object = this.options.firstPosition;
        const position = {
            top: { left: w / 2 - 150, top: 0 },
            rightUpper: { left: w - 150, top: 0 },
            right: { left: w - 150, top: h / 2 - 150 },
            rightLower: { left: w - 150, top: h - 150 },
            bottom: { left: w / 2 - 150, top: h - 150 },
            leftLower: { left: 0, top: h - 150 },
            left: { left: 0, top: h / 2 - 150 },
            leftUpper: { left: 0, top: 0 }
        }
        this.$container.css(typeof firstPosition == "object" ? firstPosition : position[firstPosition]);
    }

    /**
     * 上报已收集的数据
     */
    private report() {
        const sessionInfo = this.$analyticsData.sessionInfo;
        sessionInfo.endTime = new Date().getTime();
        sessionInfo.sessionTime = sessionInfo.endTime - sessionInfo.startTime;

        const params = JSON.stringify(this.$analyticsData);
        if (navigator.sendBeacon) {
            navigator.sendBeacon(this.options.reportUrl, params);
        } else {
            this.$.ajax({
                url: this.options.reportUrl,
                method: "POST",
                contentType: "application/json",
                data: params
            });
        }
    }

    /**
     * 改变pet状态
     * @param status 状态名称
     */
    private changeStatus(status: string) {
        const img = this.options.statusImg[status] || this.options.statusImg["default"];
        this.$status = status;
        this.$pet.attr("style", `background-image: url(${img})`);
        return this;
    }

    /**
     * 事件发布函数
     * @param event 事件名称
     */
    private trigger(event: string) {
        const on = this.options.on;
        this.$.isFunction(on[event]) && on[event].call(this);
        return this;
    }

    //  首次打招呼
    private firstGreet() {
        const nowHour = new Date().getHours();
        let timeSolt = "";
        if (0 <= nowHour && nowHour <= 3) {
            timeSolt = "midnight";
        } else if (5 <= nowHour && nowHour < 6) {
            timeSolt = "beforeSunrise";
        } else if (6 <= nowHour && nowHour < 9) {
            timeSolt = "earlyMorning";
        } else if (6 <= nowHour && nowHour < 12) {
            timeSolt = "morning"
        } else if (12 <= nowHour && nowHour < 18) {
            timeSolt = "afternoon"
        } else if (18 <= nowHour && nowHour < 22) {
            timeSolt = "night";
        } else if (22 <= nowHour && nowHour < 24) {
            timeSolt = "latenight";
        } else {
            timeSolt = "common";
        }
        this.initiativeSay("greet", timeSolt);
    }

    /**
     * 随机说话
     */
    private randomSay() {
        this.initiativeSay("conversation", "random");
    }

    /**
     * 根据类型和关键字，取词说话
     * @param type 触发类型
     * @param key 关键字
     * @param percent 概率
     */
    private initiativeSay(type: string, key: string, percent: number = 100) {
        if (this.$message.data("state").type == "default") {
            const defaultDictionary = utils.defaultDictionary[type];
            const afterFilter = defaultDictionary.filter(item => {
                if (item["key"].split(",").includes(key)) {
                    return item;
                }
            });
            const can: boolean = ~~(Math.random() * 100) < percent;
            can && this.message(afterFilter[Math.floor(Math.random() * afterFilter.length)]["value"]);
        }
    }

    //  停止移动
    private stopMove() {
        this.$pet.removeClass("moving");
        this.$container.stop();
        return this;
    }

    /**
     * 随机移动
     * @param position 移动的目标位置
     * @param speed 移动速度
     * @param callback 回调
     */
    private randomMove(position?, speed?: number, callback?: Function) {
        const that = this;
        const $ = that.$;
        const orgin = {
            top: that.$container[0].offsetTop,
            left: that.$container[0].offsetLeft
        };
        const target = position || { top: 0, left: 0 };
        const offset: Array<number> = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.75];

        !position && ["top", "left"].forEach((direction: string) => {
            const length: number = "top" == direction ? document.body.offsetHeight : document.body.offsetWidth;
            const distant: number = Math.floor(Math.random() * offset.length);
            const value: number = length / 2 * (1 + offset[distant]);
            target[direction] = value;
        });

        let pawWrap;
        let pawStart: number = 30;

        that.options.footPrint && (pawWrap = that.initPawWrap(orgin, target));
        that.changeStatus("move");
        that.$pet.addClass("moving");
        that.$container.animate(target, {
            duration: speed || 5000,
            step: function () {
                if (pawWrap) {
                    const nowPosition = {
                        top: that.$container[0].offsetTop,
                        left: that.$container[0].offsetLeft
                    }
                    const x: number = Math.abs(nowPosition.left - orgin.left);
                    const y: number = Math.abs(nowPosition.top - orgin.top);
                    const diagonal: number = utils.countDiagonal(x, y);
                    if (diagonal - pawStart > 0) {
                        const $paw = $(tpl.paw);
                        $paw.css({
                            bottom: diagonal
                        });
                        pawWrap.$pawList.append($paw);
                        pawStart = diagonal + 30;
                    }
                }
            },
            complete: function () {
                pawStart = null;
                that.changeStatus("default");
                that.cleanPawWrap();
                that.stopMove();
                $.isFunction(callback) && callback();
            }
        });
        return that;
    }

    /**
     * 清除脚印移动外壳
     */
    private cleanPawWrap() {
        const that = this;
        setTimeout(function () {
            that.$status !== "move" && that.$pawWrapQueue.forEach(($pawWrap) => { $pawWrap.remove() });
        }, 1000);
    }

    /**
     * 生成脚印路径外壳
     * @param orgin 
     * @param target 
     */
    private initPawWrap(orgin, target) {
        const $ = this.$;
        //  外壳到达x轴坐标
        const x: number = Math.abs(target.left - orgin.left);
        //  外壳到达y轴坐标
        const y: number = Math.abs(target.top - orgin.top);
        //  对角线长度
        const diagonal: number = utils.countDiagonal(x, y);
        //  对角线角度
        const angle: number = Math.round((Math.asin(y / diagonal) / Math.PI * 180));

        //  脚印外壳
        const $pawWrap = $(tpl.pawWrap);
        //  设置基础位置
        $pawWrap.css(orgin);
        //  目标位置象限
        const quadrant: number = utils.countQuadrant(orgin, target);
        //  脚印列表
        const $pawList = $pawWrap.find(".pet-paw-list");
        //  设置旋转角度及高度
        $pawList.css({
            "transform": `rotate(${utils.countAngle(quadrant, angle)}deg)`,
            "height": diagonal
        });
        //  挂载脚印外壳，并且推入脚印外壳队列
        $(window.document.body).prepend($pawWrap), this.$pawWrapQueue.push($pawWrap);
        return { x, y, diagonal, angle, $pawList };
    }

    /**
     * 切换显示功能栏
     * @param type 
     */
    private toggleOperate(type: string = "show") {
        type = type == "show" ? "fadeIn" : "fadeOut";
        this.$operate["stop"]()[type]();
        return this;
    }

    /**
     * 切换显示菜单
     * @param type 
     */
    private toggleMenu(type?: string) {
        type = type ? type == "show" ? "fadeIn" : "fadeOut" : "fadeToggle";
        this.$menu["stop"]()[type]();
        return this;
    }

    /**
     * 显示webpet
     */
    private show() {
        const that = this;
        if (that.$status == "hide") {
            that.message("你好");
            that.$container.fadeIn();
            that.changeStatus("default");
        } else {
            console.info("目标不在隐藏状态");
        }
    }

    /**
     * 隐藏webpet
     * @param now 马上
     * @param position 隐藏的位置
     */
    private hide(now?: boolean) {
        const that = this;
        if (that.$status == "hide") {
            console.info("目标已经隐藏了");
        } else {
            if (now) {
                that.$container.fadeOut();
                that.changeStatus("hide");
            } else {
                that.message("再见");
                setTimeout(() => {
                    that.$container.fadeOut();
                    that.closeMessage(true);
                    that.changeStatus("hide");
                }, 3000);
            }
        }
    }

}

export default WebPet;
