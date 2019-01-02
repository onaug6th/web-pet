import * as $ from "jquery"
import { containerTpl } from "./template";

/**
 * webPet配置模型
 */
interface WebPetOptionsModel {
    //  名称
    name?: string
    //  不可以做
    cant?: {
        //  走
        move: boolean
        //  自言自语
        sayMyself: boolean
        //  说笑
        joke: boolean
    }
    //  状态图片
    statusImg?: {
        //  默认
        default: string
        //  触摸
        hover: string
        //  移动
        move: string
        //  拖动
        drop: string
    }
    //  服务端地址
    serverUrl?: {
        //  学习
        learn: string
        //  回答
        answer: string
    }
    [propName: string]: any
}

class WebPet {
    private options: WebPetOptionsModel = {};

    constructor() {
        if(!window) throw new Error("抱歉，我只能在浏览器中花里胡哨");

        this.init();
    }

    private init() {
        $(window.document.body).append(containerTpl);
        console.info("hello world, i am your web pet")
    }

}

export { WebPet }
