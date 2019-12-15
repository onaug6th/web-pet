import $ from 'jquery';
import WebPet from '../src';

window.$ = $;

describe('wetPet测试套件', () => {

    test('可以实例化，并且是构造函数的实例。', () => {
        const pet = new WebPet();

        expect(pet.constructor).toBe(WebPet);
    });

    describe('webPet基础信息测试套件', () => {
        const opt = {
            name: "二狗",
            footPrint: false,
            report: false,
            reportUrl: "http://www.onaug6th.com",
            firstPosition: {
                left: 1000,
                top: 2000
            }
        };

        const pet = new WebPet(opt);

        const options = pet.options;

        test("名称符合配置", () => {
            expect(options.name).toBe(opt.name);
        });

        test("脚印是否出现符合配置", () => {
            expect(options.footPrint).toBe(opt.footPrint);
        });

        test("是否上报符合配置", () => {
            expect(options.report).toBe(opt.report);
        });

        //  jsdom没有高度，这里吗
        describe("首次出现位置测试套件", () => {
            console.info(pet.$container[0].offsetLeft);
            console.info(pet.$container[0].offsetTop);
        });

    });

    test('webPet生命周期钩子运行正常', (done) => {
        new WebPet({
            on: {
                create() {
                    done();
                },
                mounted() {
                    done();
                }
            }
        });

    });

});
