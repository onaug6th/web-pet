import * as util from "../src/web-pet/utils";

describe('工具类测试套件', function () {

    // it(`应当能够下载Jquery`, function (done) {
    //     util.getJquery().then(result => {
    //         done();
    //     });
    // });

    describe(`计算消息窗口大小`, function () {
        const s = "长度小于十的文字。";
        const m = "长度介于十到三十之间的文字。";
        const l = "长度大于三十的文字，长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长。";

        test(`应当能计算出小窗口的尺寸`, function () {
            const obj = util.countMessageSize(s);
            expect(obj.height).toBe(50);
            expect(obj.width).toBe(100);
        });

        test(`应当能计算出中窗口的尺寸`, function () {
            const obj = util.countMessageSize(m);
            expect(obj.height).toBe(70);
            expect(obj.width).toBe(150);
        });

        test(`应当能计算出大窗口的尺寸`, function () {
            const obj = util.countMessageSize(l);
            expect(obj.height).toBe(90);
            expect(obj.width).toBe(250);
        });

    });

    test(`应当计算出勾股定理，斜边的平方根`, function () {
        const x = 1;
        const y = 2;
        expect(util.countDiagonal(x, y)).toBe(Math.sqrt(x * x + y * y));
    });

});
