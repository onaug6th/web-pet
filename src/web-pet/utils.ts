/**
 * 是函数吗?
 * @param fn 
 */
const isFn: Function = function (fn: Function) {
    return (typeof fn == "function" && fn.constructor == Function);
}

/**
 * 获取jquery依赖库
 */
const getJquery: Function = function () {
    return new Promise((resolve, reject) => {
        const script: HTMLScriptElement = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js";
        script.onload = (res) => { resolve(res) };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * 计算位置象限，待优化
 * @param orgin 
 * @param target 
 */
const countQuadrant: Function = function (orgin, target) {
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
 * 获取深层属性
 * @param obj 对象
 * @param path 属性
 * @param separator 分隔符
 */
const getDeepAttrValue: Function = function (obj, path, separator) {
    let value: any;
    path.split(separator).forEach((item, i) => {
        i ? value = value[item] : value = obj[item];
    });
    return value;
}

export {
    isFn,
    getJquery,
    countQuadrant,
    getDeepAttrValue
}