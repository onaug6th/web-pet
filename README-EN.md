# web-pet

![](./githubImage/webPet.png)

[![npm (scoped)](https://img.shields.io/npm/v/web-pet.svg)](https://www.npmjs.com/package/web-pet)

A little cat dozing off on the page, occasionally chatting with users. Responsible for accompanying and guiding users.

~~But its actual function is to record user behavior and device page performance information, and report statistics for each time.~~

English | [简体中文](./README.md)

## Install
```
npm run dev
```

## Build
```
npm run build
```

## Usage

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

## WebPet Options
You can personalize the configuration to generate custom attributes for pets.
```js
{
  name: '二狗',
  footPrint: false,
  report: true,
  reportUrl: "http://localhost:3000/api/report",
  action: {
    firstGreet: false,
    randomMove: true,
    randomSay: true
  },
  server: {
    answer: {
      url: "http://localhost:3000/api/answer",
      dataPath: "data.msg",
      separator: "."
    }
  },
  on: {
    create: function(){ },
    mounted: function(){ }
  }
  ...
}
```

## License

MIT
