const container: string = `<div class="web-pet"></div>`;

const pet: string = `<div class="pet"></div>`;

const menu: string =
    `<div class="pet-menu">
        <ul>
            <li>聊天</li>
        </ul>
    </div>`;

const operate: string =
    `<div class="pet-operate">
        <div class="pet-operate-list">
        </div>
    </div>`;

const chatBtn: string =
    `<a>
        <img class="emoji" alt="chat" height="20" width="20" src="https://assets-cdn.github.com/images/icons/emoji/speech_balloon.png">
    </a>`;

const chatContent: string =
    `<div class="pet-operate-content" data-type="chat">
        <input />
    </div>`;

export {
    container,
    pet,
    menu,
    operate,
    chatBtn,
    chatContent
}