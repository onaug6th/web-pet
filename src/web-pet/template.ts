//  容器
const container: string = `<div class="web-pet"></div>`;

//  pet
const pet: string = `<div class="pet"></div>`;

//  菜单
const menu: string =
    `<div class="pet-menu">
        <ul>
            <li>聊天</li>
        </ul>
    </div>`;

//  操作区域
const operate: string =
    `<div class="pet-operate">
        <div class="switch-anmiate">
            <div class="pet-operate-list"></div>
        </div>
    </div>`;

//  操作区域-返回按钮
const returnBtn: string =
    `<button class="return-btn">取消</button>`;

//  操作区域-聊天按钮
const chatBtn: string =
    `<a>
        <img class="emoji" alt="chat" height="20" width="20" src="https://assets-cdn.github.com/images/icons/emoji/speech_balloon.png">
    </a>`;

//  操作区域-聊天区域
const chatContent: string =
    `<div class="pet-operate-content" data-type="chat">
        <input />
    </div>`;

//  爪子列表
const pawList: string =
    `<div class="pet-paw-warp">
        <svg>
            <symbol id="pet-paw-svg" viewBox="0 0 249 209.32">
                <ellipse cx="27.917" cy="106.333" stroke-width="0" rx="27.917" ry="35.833"></ellipse>
                <ellipse cx="84.75" cy="47.749" stroke-width="0" rx="34.75" ry="47.751"></ellipse>
                <ellipse cx="162" cy="47.749" stroke-width="0" rx="34.75" ry="47.751"></ellipse>
                <ellipse cx="221.083" cy="106.333" stroke-width="0" rx="27.917" ry="35.833"></ellipse>
                <path stroke-width="0" d="M43.98 165.39s9.76-63.072 76.838-64.574c0 0 71.082-6.758 83.096 70.33 0 0 2.586 19.855-12.54 31.855 0 0-15.75 17.75-43.75-6.25 0 0-7.124-8.374-24.624-7.874 0 0-12.75-.125-21.5 6.625 0 0-16.375 18.376-37.75 12.75 0 0-28.29-7.72-19.77-42.86z"></path>
            </symbol>
        </svg>
        <div class="pet-paw-list">
            
        </div>
    </div>
    `;

//  一对爪子
const paw: string = 
    `
    <div class="temp">
        <div class="pet-paw">
            <svg class="icon">
                <use xlink:href="#pet-paw-svg"></use>
            </svg>
        </div>
        <div class="pet-paw">
            <svg class="icon">
                <use xlink:href="#pet-paw-svg"></use>
            </svg>
        </div>
    </div>
    `;

export {
    container,
    pet,
    menu,
    operate,
    returnBtn,
    chatBtn,
    chatContent,
    pawList,
    paw
}