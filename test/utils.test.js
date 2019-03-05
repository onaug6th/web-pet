import * as utils from "../src/web-pet/utils";

describe('工具类测试套件', function () {

    it(`应当能够下载Jquery`, function (done) {
        utils.getJquery().then(result => {
            done();
        });
    });

    describe(`计算消息窗口大小`, function () {
        const s = "长度小于十的文字。";
        const m = "长度介于十到三十之间的文字。";
        const l = "长度大于三十的文字，长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长。";

        it(`应当能计算出小窗口的尺寸`, function () {
            const obj = utils.countMessageSize(s);
            expect(obj.height).toBe(50);
            expect(obj.width).toBe(100);
        });

        it(`应当能计算出中窗口的尺寸`, function () {
            const obj = utils.countMessageSize(m);
            expect(obj.height).toBe(70);
            expect(obj.width).toBe(150);
        });

        it(`应当能计算出大窗口的尺寸`, function () {
            const obj = utils.countMessageSize(l);
            expect(obj.height).toBe(90);
            expect(obj.width).toBe(250);
        });

    });

    it(`应当计算出斜边的平方根`, function () {
        const x = 1;
        const y = 2;
        expect(utils.countDiagonal(x, y)).toBe(Math.sqrt(x * x + y * y));
    });

    describe(`基于屏幕左上角，计算象限`, function () {
        const quadrant1 = { left: 3, top: 1 };
        const quadrant2 = { left: 1, top: 1 };
        const quadrant3 = { left: 1, top: 3 };
        const quadrant4 = { left: 3, top: 3 };
        const orgin = { left: 2, top: 2 };

        it(`能够计算出第一象限`, function () {
            expect(
                utils.countQuadrant(orgin, quadrant1)
            ).toBe(1);
        });

        it(`能够计算出第二象限`, function () {
            expect(
                utils.countQuadrant(orgin, quadrant2)
            ).toBe(2);
        });

        it(`能够计算出第三象限`, function () {
            expect(
                utils.countQuadrant(orgin, quadrant3)
            ).toBe(3);
        });

        it(`能够计算出第四象限`, function () {
            expect(
                utils.countQuadrant(orgin, quadrant4)
            ).toBe(4);
        });

        it(`默认返回第二象限`, function () {
            expect(
                utils.countQuadrant(orgin, orgin)
            ).toBe(2);
        });
    });

    it(`应当能根据配置获取深层属性`, function () {
        const obj = {
            name: "august",
            goods: {
                apple: 1
            }
        }

        expect(
            utils.getDeepAttrValue(obj, "name", ".")
        ).toBe("august");

        expect(
            utils.getDeepAttrValue(obj, "goods.apple", ".")
        ).toBe(1);
    });

});
