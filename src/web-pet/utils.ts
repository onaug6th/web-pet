/**
 * 是函数吗?
 * @param fn 
 */
const isFn = function(fn){
    return (typeof fn == "function" && fn.constructor == Function);
}

export {
    isFn
}