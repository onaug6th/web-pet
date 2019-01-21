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

    private $operate;

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
    private create(options: WebPetOptions) {
        this.$ = window["jQuery"];

        options && (this.options = this.$.extend(true, {}, this.options, options));
        this.eventEmiter("create")
            .init()
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
        const $menu = $(tpl.menu);
        const $operate = this.initOperate();

        $container.append($pet, $menu, $operate);

        this.$container = $container;
        this.$pet = this.$container.find("div.pet");
        this.$menu = this.$container.find("div.pet-menu");
        this.$operate = this.$container.find("div.pet-operate");
        this.changeStatus("default");

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

            that.handleContentEvent($content, i);

            $btn.on("click", () => {
                return that.toggleOperateContent(i);
            });

            $return_btn.on("click", () => {
                return that.toggleOperateContent();
            });

            $operate.find("div.pet-operate-list").append($btn);
            $operate.find("div.switch-anmiate").append(
                $content.append($return_btn)
            );
        }
        return $operate;
    }

    /**
     * 处理操作区域事件
     * @param $content 
     * @param type 切换的类型
     */
    private handleContentEvent($content, type: string) {
        if (type == "chat") {
            $content.on("keydown", (e: KeyboardEvent) => {
                if (e.keyCode == 13) {

                }
            });
        }
    }

    /**
     * 切换操作区域内容
     * @param type 切换的类型
     */
    private toggleOperateContent(type?: string) {
        const $switch = this.$operate.find(".switch-anmiate");
        const $target = $switch.find(`[data-type=${type}]`);
        const distant = -50 * $target.siblings().length;
        if (type) {
            $switch.css("top", `${distant}px`);
        } else {
            $switch.css("top", `0px`);
        }
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

        // that.options.action.randomMove && (window.setInterval(function () {
        //     that.randomMove();
        // }, 20000));

        $(document).mousemove((e: MouseEvent) => {
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
                    that.updatePosition(position)
                    isMove = true;
                }
            }
        }).mouseup(() => {
            _move = false;
        });

        $container
            .mouseover(() => {
                that.toggleOperateBox("show");
                that.changeStatus("move");
            })
            .mouseout((e) => {
                const $target = e.target;
                const nodeName = $target.nodeName;
                const className = $target.className;
                if (nodeName == "div" && className == "pet-operate") {

                } else {
                    that.toggleOperateBox("hide");
                }
                that.changeStatus("default");
            });

        $pet
            .click(() => {
                if (!isMove) {
                    that.changeStatus("move");
                    that.randomMove();
                } else {
                    isMove = false;
                }
            })
            .mousedown((e: MouseEvent) => {
                if (e.which == 3) {
                    that.toggleMenu("show");
                }
                _move = true;
                _x = e.pageX - parseInt($container.css("left"));
                _y = e.pageY - parseInt($container.css("top"));
            })
            .bind("contextmenu", function (e) {
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
        this.updatePosition();
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
        const orgin = that.options.position;
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
        target["left"] = orgin.left + 600;
        target["top"] = orgin.top;

        that.options.footPrint && (that.initFootPrint(orgin, target));

        that.$container.stop().animate(target, {
            duration: 5000,
            complete: () => {
                that.updatePosition({ top: target.top, left: target.left });
            }
        });
        return that;
    }

    /**
     * 生成脚印
     * @param orgin 
     * @param target 
     */
    private initFootPrint(orgin, target) {
        const $ = this.$;
        //  x轴坐标
        const x: number = Math.abs(target.left - orgin.left);
        //  y轴坐标
        const y: number = Math.abs(target.top - orgin.top);
        //  z轴长度
        const z: number = Math.sqrt(x * x + y * y);
        //  对角线角度
        const angle: number = Math.round((Math.asin(y / z) / Math.PI * 180));

        //  脚印外壳
        const $pawWrap = $(tpl.pawList);
        //  设置基础位置
        $pawWrap.css(orgin);
        //  目标位置象限
        const quadrant: number = this.countQuadrant(orgin, target);
        //  脚印列表
        const $pawList = $pawWrap.find(".pet-paw-list");
        //  设置旋转角度及高度
        $pawList.css({
            "transform": `rotate(${this.angleByQuadrant(quadrant, angle)}deg)`,
            "height": z
        });
        //  总脚印数
        const paws: number = Math.ceil(z / 30);

        const time = 5;
        const head = time * 0.2;
        const tail = time * 0.2;
        const body = time - Math.floor(head) - Math.floor(tail);
        //  每个区间展示的数量
        const block = paws / time;

        //  设置脚印消失时间与追加脚印
        for (let i = 0; i < paws; i++) {
            const $paw = $(tpl.paw);
            // $paw.css("animation-delay", `${1 + paws / ((2 * i) || i)}s`);
            $pawList.append($paw);
        }
        //  挂载脚印模板
        $(window.document.body).prepend($pawWrap);
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
     * 计算位置象限，待优化
     * @param orgin 
     * @param target 
     */
    private countQuadrant(orgin, target) {
        const x: number = orgin.left;
        const y: number = orgin.top;
        const tx: number = target.left;
        const ty: number = target.top;

        //  1, 4
        if (tx > x) {
            //  1
            if (ty > y) {
                return 1;
            }
            //  4
            if (ty < y) {
                return 4;
            }
        }
        //  2, 3
        if (tx < x) {
            //  2
            if (ty < y) {
                return 2;
            }
            //  3
            if (ty > y) {
                return 3;
            }
        }
        if (ty == y) {
            //  1, 2
            if (ty > 0) {
                //  1
                if (tx > x) {
                    return 1;
                }
                //  2
                if (tx < x) {
                    return 2;
                }
            }
            //  3, 4
            if (ty < 0) {
                //  4
                if (tx > x) {
                    return 4;
                }
                //  3
                if (tx < x) {
                    return 3;
                }
            }
        }
        if (tx == x) {
            //  1, 4
            if (tx > 0) {
                //  1
                if (ty > y) {
                    return 1;
                }
                //  4
                if (ty < y) {
                    return 4;
                }
            }
            //  2, 3
            if (tx < 0) {
                //  2
                if (ty > y) {
                    return 2;
                }
                //  3
                if (ty < y) {
                    return 3;
                }
            }
        }
        return 4;
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
        let method: string = type == "show" ? "fadeIn" : "fadeOut";
        this.$operate["stop"]()[method]();
        return this;
    }

    /**
     * 切换显示菜单
     * @param type 
     */
    private toggleMenu(type: string = "show") {
        let method: string = type == "show" ? "fadeIn" : "fadeOut";
        this.$menu["stop"]()[method]();
        return this;
    }

}

export default WebPet;
