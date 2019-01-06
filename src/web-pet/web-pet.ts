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
    //  服务端地址
    serverUrl?: {
        //  学习
        learn?: string
        //  回答
        answer?: string
    }
    //  事件
    on?: {
        create?: Function;
        mounted?: Function
    }
    [propName: string]: any
}

class WebPet {

    private $;

    private $container;

    private $pet;

    private $menu;

    private $chat;

    private options: WebPetOptions = {
        name: "pet",
        language: "mandarin",
        character: "lazy",
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
        serverUrl: {},
        on: {
            create: () => { },
            mounted: () => { }
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
    private create(options) {
        this.$ = window["jQuery"];

        options && (this.options = this.$.extend(true, {}, this.options, options));
        this.eventEmiter("create")
            .init()
            .event()
            .done();
    }

    /**
     * 初始化WebPet容器
     */
    private init() {
        const $ = this.$;
        const $container = $(tpl.container);
        const $pet = $(tpl.pet);
        const $menu = $(tpl.menu);
        const $chat = $(tpl.chat);
        $container.append($pet, $menu, $chat);

        this.$container = $container;
        this.$pet = this.$container.find("div.pet");
        this.$menu = this.$container.find("div.pet-menu");
        this.$chat = this.$container.find("div.pet-chat");
        this.changeStatus("default");
        return this;
    }

    /**
     * 处理事件
     */
    private event() {
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
        }, 30000));

        $(document).mousemove((e) => {
            if (_move) {
                that.changeStatus("move");
                var x = e.pageX - _x;
                var y = e.pageY - _y;
                var wx = $(window).width() - $container.width();
                var dy = $(document).height() - $container.height();
                if (x >= 0 && x <= wx && y > 0 && y <= dy) {
                    $container.css({
                        top: y,
                        left: x
                    });
                    isMove = true;
                }
            }
        }).mouseup(() => {
            _move = false;
        });

        $container
            .mouseover(() => {
                that.toggleChatBox("show");
                that.changeStatus("move");
            })
            .mouseout((e) => {
                const $target = e.target;
                const nodeName = $target.nodeName;
                const className = $target.className;
                if(nodeName == "div" && className == "pet-chat"){

                }else{
                    that.toggleChatBox("hide");
                }
                that.changeStatus("default");
            })
            .mousedown((e) => {
                if (e.which == 3) {

                }
                _move = true;
                _x = e.pageX - parseInt($container.css("left"));
                _y = e.pageY - parseInt($container.css("top"));
            });

        $pet.click(() => {
            if (!isMove) {
                that.changeStatus("move");
                that.randomMove();
            } else {
                isMove = false;
            }
        });

        return this;
    }

    /**
     * 结束，挂载
     */
    private done() {
        const options = this.options;
        this.$(window.document.body).append(this.$container);
        console.info(`hello, my name is ${options.name}`);
        this.eventEmiter("mounted");
        return this;
    }

    /**
     * 改版pet状态
     * @param status 状态名称
     */
    private changeStatus(status: string) {
        const $pet = this.$pet;
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

    private randomMove() {
        const direction = {};
        const distant: Array<number> = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.75];
        const offset: number = Math.floor(Math.random() * distant.length);
        ["top", "right", "bottom", "left"].forEach(item => {
            if (parseInt(String(Math.random() * 10)) > 5) {
                let length: number = document.body.offsetWidth;
                ["top", "bottom"].indexOf(item) !== -1 && (length = document.documentElement.clientHeight);
                direction[item] = length / 2 * (1 + distant[offset])
            }
        });
        this.$container.animate(direction, {
            duration: 500,
            complete: () => { }
        });
        return this;
    }

    /**
     * 切换显示消息框
     * @param type 
     */
    private toggleChatBox(type: string = "show") {
        let method = type == "show" ? "fadeIn" : "fadeOut";
        this.$chat["stop"]()[method]();
        return this;
    }

    /**
     * 切换显示菜单
     * @param type 
     */
    private toggleMenu(type: string = "show") {
        let method = type == "show" ? "fadeIn" : "fadeOut";
        this.$menu["stop"]()[method]();
        return this;
    }

}

export default WebPet;
