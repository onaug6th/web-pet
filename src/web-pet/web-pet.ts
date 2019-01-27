import * as tpl from "./template";
import * as util from "./utils";
import './web-pet.scss';

/**
 * webPet配置模型
 */
interface WebPetOptions {
    //  名称
    name?: string
    //  语言
    language?: string
    /**
     * 性格
     */
    character?: string
    //  脚印
    footPrint?: boolean
    //  行为
    action?: {
        //  随机走动
        randomMove?: boolean
        //  自言自语
        sayMyself?: boolean
        //  说笑
        joke?: boolean
    }
    //  状态图片
    statusImg?: {
        //  默认
        default?: string
        //  触摸
        hover?: string
        //  移动
        move?: string
        //  拖动
        drop?: string
    }
    //  服务端配置
    server?: {
        //  回答时的配置
        answer?: {
            url: string,
            dataPath?: string,
            [propName: string]: any
        }
        //  学习时的配置
        learn?: {
            url: string,
            dataPath?: string,
            [propName: string]: any
        }
    }
    //  事件
    on?: {
        create?: Function;
        mounted?: Function
    }
    [propName: string]: any
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
    //  消息内容
    private $msg;
    //  菜单
    private $menu;
    //  操作区域
    private $operate;
    /**
     * 状态
     * defalut  默认
     * move     移动
     */
    private $status;
    //  脚印外壳队列
    private $pawWrapQueue: Array<any> = [];
    //  默认配置
    private options: WebPetOptions = {
        name: "pet",
        language: "mandarin",
        character: "lazy",
        footPrint: true,
        operate: {
            chat: true
        },
        position: {
            x: 0,
            y: 0
        },
        action: {
            randomMove: true,
            sayMyself: true,
            joke: true
        },
        statusImg: {
            default: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/default.png",
            hover: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/hover.png",
            move: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/move.png",
            drop: "https://web-pet-1253668581.cos.ap-chengdu.myqcloud.com/drop.png"
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
                method: "POST",
                dataPath: "data",
                separator: "."
            }
        },
        on: {
            create() { },
            mounted() { }
        }
    };

    /**
     * WebPet构造器
     * @param options WebPet配置
     */
    constructor(options?: WebPetOptions) {
        const that = this;
        if (!window) throw new Error("抱歉，我只能在浏览器中花里胡哨");

        if (!window["jQuery"] || !window["$"].fn) {
            util.getJquery().then(() => {
                that.create(options);
            });
        } else {
            that.create(options);
        }
    }

    /**
     * 创建webPet
     * @param options 
     */
    private create(options: WebPetOptions) {
        this.$ = window["jQuery"];

        options && (this.options = this.$.extend(true, {}, this.options, options));
        this.eventEmiter("create")
            .init()
            .checkDictionary()
            .actionEvent()
            .done();
    }

    /**
     * 初始化WebPet容器
     */
    private init() {
        const $ = this.$;
        const $container = $(tpl.container);
        const $pet = $(tpl.pet);
        const $message = $(tpl.message);
        const $menu = $(tpl.menu);
        const $operate = this.initOperate();

        $container.append($pet, $message, $menu, $operate);

        this.$container = $container;
        this.$pet = this.$container.find("div.pet");
        this.$message = this.$container.find("section.pet-message");
        this.$msg = this.$message.find("div.pet-msg");
        this.$menu = this.$container.find("div.pet-menu");
        this.$operate = this.$container.find("div.pet-operate");
        this.changeStatus("default");

        return this;
    }

    /**
     * 检查本地词典
     */
    private checkDictionary() {
        const defaultDictionary: Array<object> = [
            {
                key: ["你好", "hello", "雷猴"],
                value: "你好啊！"
            }
        ];
        !localStorage.getItem("petDictionary") && localStorage.setItem("petDictionary", JSON.stringify(defaultDictionary));
        return this;
    }

    /**
     * 生成操作区域
     */
    private initOperate() {
        const $ = this.$;
        const that = this;
        const $operate = $(tpl.operate);
        const operateOpt = this.options.operate;
        for (let i in operateOpt) {
            const $btn = $(tpl[`${i}Btn`]);
            const $content = $(tpl[`${i}Content`]);
            const $return_btn = $(tpl.returnBtn);

            that.onContentEvent($content, i);

            $btn.on("click", function () {
                return that.toggleOperateContent(i);
            });

            $return_btn.on("click", function () {
                return that.toggleOperateContent();
            });

            $operate.find("div.pet-operate-list").append($btn);
            $operate.find("div.switch-animate").append(
                $content.append($return_btn)
            );
        }
        return $operate;
    }

    /**
     * 监听操作区域事件
     * @param $content 
     * @param type 切换的类型
     */
    private onContentEvent($content, type: string) {
        const that = this;
        if (type == "chat") {
            $content.on("keydown", function (e: KeyboardEvent) {
                if (e.keyCode == 13) {
                    that.initMessage(e.target["value"]);
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
        const distant = -50 * $target.siblings().length;
        if (type) {
            $switch.css("top", `${distant}px`);
        } else {
            $switch.css("top", `0px`);
        }
    }

    /**
     * 分发回复消息处理
     * @param value 用户输入的内容
     */
    private initMessage(value: string) {
        const that = this;
        const server = that.options.server;
        that.cleanChatText();

        //  当存在服务端配置
        if (server.answer.url) {
            that.answerFromServer(value);
        }
        //  否则本地读取词典
        else {
            that.handleMessage(value);
        }
    }

    /**
     * 处理消息
     * @param value 
     */
    private handleMessage(value: string) {
        const petDictionary: Array<any> = JSON.parse(localStorage.getItem("petDictionary"));
        let answerText: string = "";
        petDictionary.forEach(item => {
            if (item.key.includes(value)) {
                answerText = item.value;
            }
        });
        this.messageEnd(answerText || "抱歉，我不知道怎么回答。");
    }

    /**
     * 将消息显示到界面上
     * @param answerText 回答内容
     */
    private messageEnd(answerText: string) {
        const that = this;
        that.$msg.text(answerText);
        !that.$message.width() && that.$message.animate(
            {
                height: 100,
                width: 150
            }, {
                duration: 1000,
                complete: function () {
                    that.$msg.fadeIn();
                    that.hideMessageBox();
                }
            }
        );
    }

    /**
     * 隐藏消息框
     * @param time 多久
     */
    private hideMessageBox(time?) {
        const that = this;
        setTimeout(function () {
            that.$msg.text("");
            that.$message.animate(
                {
                    height: 0,
                    width: 0
                }, {
                    duration: 1500
                }
            );
        }, time || 5000);
    }

    /**
     * 清除聊天区域内容
     */
    private cleanChatText() {
        this.$operate.find(".pet-operate-content input").val("");
    }

    /**
     * 根据服务端配置，请求拉取消息
     * @param value 用户输入的内容
     */
    private answerFromServer(value) {
        const $ = this.$;
        const server = this.options.server;
        const opt = $.extend(true, server.answer, {
            data: {
                msg: value
            },
            success: function (result) {
                const answerText = util.getDeepAttrValue(result, opt.dataPath, opt.separator);
                this.messageEnd(answerText);
            }
        });
        $.ajax(opt);
    }

    /**
     * 处理动作
     */
    private actionEvent() {
        const $ = this.$;
        const that = this;
        const $container = that.$container;
        const $pet = that.$pet;

        let _move: boolean = false;
        let isMove: boolean = false;
        let _x: number;
        let _y: number;

        that.options.action.randomMove && (window.setInterval(function () {
            that.randomMove();
        }, 20000));

        $(document).mousemove(function (e: MouseEvent) {
            if (_move) {
                that.changeStatus("move");
                const x: number = e.pageX - _x;
                const y: number = e.pageY - _y;
                const wx: number = $(window).width() - $container.width();
                const dy: number = $(document).height() - $container.height();
                if (x >= 0 && x <= wx && y > 0 && y <= dy) {
                    const position = {
                        top: y,
                        left: x
                    };
                    $container.css(position);
                    isMove = true;
                }
            }
        }).mouseup(function () {
            _move = false;
        });

        $container
            /**
             * 鼠标经过时
             * 1. 显示底部菜单
             */
            .mouseover(function (e: MouseEvent) {
                const $target = e.target;
                const className = $target["className"];
                //  触摸聊天框，不会显示菜单
                if (className !== "pet-message") {
                    that.toggleOperateBox("show");
                    //  睁开眼睛
                    that.changeStatus("move");
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
                if (nodeName == "div" && className == "pet-operate") {

                }
                //  当前激活控件为聊天窗口，不隐藏
                else if (activeEle.nodeName == "INPUT" && activeEle.className == "pet-chat") {

                }
                else {
                    that.toggleOperateBox("hide");
                }
                //  如果不是在移动中，闭上眼睛
                that.$status !== "move" && that.changeStatus("default");
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
                if (e.which == 3) {
                    that.toggleMenu();
                }
                _move = true;
                _x = e.pageX - parseInt($container.css("left"));
                _y = e.pageY - parseInt($container.css("top"));
            })
            .bind("contextmenu", function (e: MouseEvent) {
                return false;
            });

        return this;
    }

    /**
     * 结束，挂载
     */
    private done() {
        const options = this.options;
        this.$(window.document.body).append(this.$container);
        this.eventEmiter("mounted");
        console.info(`hello, my name is ${options.name}`);
        return this;
    }

    /**
     * 改变pet状态
     * @param status 状态名称
     */
    private changeStatus(status: string) {
        const $pet = this.$pet;
        this.$status = status;
        $pet.attr("style", `background-image: url(${this.options.statusImg[status]})`);
        return this;
    }

    /**
     * 事件发布函数
     * @param event 事件名称
     */
    private eventEmiter(event: string) {
        const on = this.options.on;
        util.isFn(on[event]) && on[event].call(this);
        return this;
    }

    /**
     * 随机移动
     */
    private randomMove() {
        const that = this;
        const $ = that.$;
        const orgin = that.$container.offset();
        const target = {
            top: 0,
            left: 0
        };
        const offset: Array<number> = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.75];

        ["top", "left"].forEach((direction) => {
            const length: number = "top" == direction ? document.documentElement.clientHeight : document.body.offsetWidth;
            const distant: number = Math.floor(Math.random() * offset.length);
            const value: number = length / 2 * (1 + offset[distant]);
            target[direction] = value;
        });

        let pawWrap;
        let pawStart: number = 30;

        that.options.footPrint && (pawWrap = that.initPawWrap(orgin, target));
        that.changeStatus("move");
        that.$container.stop().animate(target, {
            duration: 5000,
            step: function () {
                if (pawWrap) {
                    const nowPosition = that.$container.offset();
                    const x: number = Math.abs(nowPosition.left - orgin.left);
                    const y: number = Math.abs(nowPosition.top - orgin.top);
                    const diagonal: number = that.countDiagonal(x, y);
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
     * 计算对角线长度
     * @param x 
     * @param y 
     */
    private countDiagonal(x: number, y: number) {
        return Math.sqrt(x * x + y * y);
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
        const diagonal: number = this.countDiagonal(x, y);
        //  对角线角度
        const angle: number = Math.round((Math.asin(y / diagonal) / Math.PI * 180));

        //  脚印外壳
        const $pawWrap = $(tpl.pawList);
        //  设置基础位置
        $pawWrap.css(orgin);
        //  目标位置象限
        const quadrant: number = util.countQuadrant(orgin, target);
        //  脚印列表
        const $pawList = $pawWrap.find(".pet-paw-list");
        //  设置旋转角度及高度
        $pawList.css({
            "transform": `rotate(${this.angleByQuadrant(quadrant, angle)}deg)`,
            "height": diagonal
        });
        //  挂载脚印外壳，并且推入脚印外壳队列
        $(window.document.body).prepend($pawWrap), this.$pawWrapQueue.push($pawWrap);
        return {
            x,
            y,
            diagonal,
            angle,
            $pawList
        }
    }

    /**
     * 根据计算旋转的角度
     * @param quadrant 象限
     * @param angle 角度
     */
    private angleByQuadrant(quadrant: number, angle: number) {
        if (quadrant == 1) {
            return 90 + angle;
        }
        if (quadrant == 2) {
            return 270 + angle;
        }
        if (quadrant == 3) {
            return 270 - angle;
        }
        if (quadrant == 4) {
            return 90 - angle;
        }
    }

    /**
     * 更新pet的x, y轴坐标
     * @param top 
     */
    private updatePosition(newPosition?: { top: number, left: number }) {
        this.options.position = newPosition || this.$pet.offset();
    }

    /**
     * 切换显示功能栏
     * @param type 
     */
    private toggleOperateBox(type: string = "show") {
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

}

export default WebPet;
