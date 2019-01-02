import { containerTpl } from "./template";

/**
 * 组件渲染数据模型
 */
interface WebPetOptionsModel {
    name?: string
    status?: {
        default: string
        hover: string
        move: string
        drop: string
    }
    serverUrl?: {
        learn: string
        answer: string
    }
    [propName: string]: any
}

class WebPet {
    private options: WebPetOptionsModel = {};

    constructor() {
        this.init();
    }

    private init() {
        console.info("hello world, i am your web pet")
    }

}

export { WebPet }
