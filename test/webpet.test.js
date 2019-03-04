import $ from 'jquery';
import webPet from '../src/index';

describe('wetPet单元测试', () => {

    test('可以实例化，并且是构造函数的实例。', () => {
        const pet = new webPet();
        expect(pet.constructor).toBe(webPet);
    });
    
});
