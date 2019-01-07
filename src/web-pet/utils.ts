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

export {
    isFn,
    getJquery
}