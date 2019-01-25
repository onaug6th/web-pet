# web-pet

[![npm (scoped)](https://img.shields.io/npm/v/web-pet.svg)](https://www.npmjs.com/package/web-pet)

a pet for your webpage.

## Install

Using npm:

```bash
npm install web-pet
```

Using script:

```html
<script src="/dist/webPet.min.js"></script>
```
## Example

```js
import WebPet from "web-pet";

const firstPet = new WebPet();

const opt = {
  ...
}

const otherPet = new WebPet(opt);
```

## WebPet Config
You can customize your pet, his appearance and some behavior. is comming soon!
```js
{
  name: 'pet',
  language: 'mandarin',
  character: 'lazy',
  action: {
    randomMove: true,
    sayMyself: true,
    joke: true
  },
  statusImg: {
    
  },
  serverUrl: {
    learn: "",
    answer: ""
  },
  on: {
    create: function(){

    },
    mounted: function(){

    }
  }
}
```

## License

MIT
