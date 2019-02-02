/**
 * 获取jquery依赖库
 */
function getJquery() {
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
 * 计算消息窗口大小
 * @param text
 */
function countMessageSize(text: string) {
    const size = {
        s: {
            "height": 50,
            "width": 100
        },
        m: {
            "height": 70,
            "width": 150
        },
        l: {
            "height": 90,
            "width": 250
        }
    }
    const len = text.length;
    return len < 10 ? size.s : (
        len < 30 ? size.m : size.l
    );
}

/**
 * 计算对角线长度
 * @param x 
 * @param y 
 */
function countDiagonal(x: number, y: number) {
    return Math.sqrt(x * x + y * y);
}

/**
 * 根据计算旋转的角度
 * @param quadrant 象限
 * @param angle 角度
 */
function countAngle(quadrant: number, angle: number) {
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
function countQuadrant(orgin, target) {
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
function getDeepAttrValue(obj: object, path: string, separator: string) {
    let value: any;
    path.split(separator).forEach((item, i) => {
        i ? value = value[item] : value = obj[item];
    });
    return value;
}

/**
 * 默认词典
 *  [
 *      [回答],
 *      [交流],
 *      [招呼]
 *  ]
 */
const defaultDictionary: Object = {
    answer: [
        { key: "你好,hello,雷猴", value: "你好" },
        { key: "名字,你叫什么名字", value: "为什么要告诉你" },
    ],
    conversation: [
        { key: "random", value: "..." },
        { key: "random", value: "你好，人类" },
        { key: "random", value: "-. -" },
        { key: "random", value: "(^・ω・^ )" },
        { key: "random", value: "今天遇到了什么有趣的事情了吗？" },
        { key: "hover", value: "- -" },
        { key: "hover", value: "莫挨老子" },
        { key: "hover", value: "老是碰我干嘛" }
    ],
    greet: [
        { key: "common", value: "很高兴认识你" },
        { key: "beforeSunrise", value: "天快亮了吧" },
        { key: "earlyMorning", value: "新的一天，要开心啊" },
        { key: "earlyMorning", value: "你也起的挺早的" },
        { key: "earlyMorning", value: "(￣o￣) . z Z" },
        { key: "morning", value: "早上好" },
        { key: "afternoon", value: "下午好" },
        { key: "afternoon", value: "下午就是漫长难熬" },
        { key: "night", value: "晚上好" },
        { key: "night", value: "该动身回家了" },
        { key: "latenight", value: "很晚了，该去睡觉了" },
        { key: "latenight", value: "(￣o￣) . z Z" },
        { key: "midnight", value: "去睡觉，现在，马上！" },
        { key: "midnight", value: "已经很晚了，马上睡觉！" }
    ]
};

export {
    getJquery,
    countMessageSize,
    countDiagonal,
    countAngle,
    countQuadrant,
    getDeepAttrValue,
    defaultDictionary
}