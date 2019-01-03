import * as $ from "jquery"
import * as tpl from "./template";
import * as util from "./utils";
import './web-pet.css'

/**
 * webPet配置模型
 */
interface WebPetOptions {
    //  名称
    name?: string
    //  不可以做
    cant?: {
        //  走
        move?: boolean
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
    //  钩子
    hook?: {
        create?: Function;
        mounted?: Function
    }
    [propName: string]: any
}

class WebPet {

    private $container;

    private options: WebPetOptions = {
        name: "pet",
        cant: {},
        statusImg: {},
        serverUrl: {},
        hook: {
            create: function () { },
            mounted: function () { }
        }
    };

    /**
     * WebPet构造器
     * @param options WebPet配置
     */
    constructor(options?: WebPetOptions) {
        if (!window) throw new Error("抱歉，我只能在浏览器中花里胡哨");

        options && (this.options = $.extend(true, {}, this.options, options));

        this.init();
        this.done();
    }

    /**
     * 初始化WebPet
     */
    private init() {
        this.$container = $(tpl.container);

    }

    /**
     * 结束，挂载
     */
    private done() {
        $(window.document.body).append(this.$container);
        console.info("hello world, i am your web pet");
        util.isFn(this.options.hook.mounted) && this.options.hook.mounted.call(this);
    }

}

export default WebPet;
