---
slug: miniprogram-new-era
title: 小程序的全栈开发新时代
authors: heyli
tags: [hola, docusaurus]
---

> 李成熙，腾讯云高级工程师。2014年度毕业加入腾讯AlloyTeam，先后负责过QQ群、花样直播、腾讯文档等项目。2018年加入腾讯云云开发团队。专注于性能优化、工程化和小程序服务。[微博](https://weibo.com/leehkfs/) | [知乎](https://www.zhihu.com/people/leehey/) | [Github](https://github.com/lcxfs1991)

## 什么是小程序·云开发

小程序·云开发是微信团队和腾讯云团队共同研发的一套小程序基础能力，简言之就是：云能力将会成为小程序的基础能力。整套功能是基于腾讯云全新推出的[云开发(Tencent Cloud Base)](https://cloud.tencent.com/product/tcb)所研发出来的一套完备的小程序后台开发方案。

小程序·云开发为开发者提供完整的云端流程，简化后端开发和运维概念，无需搭建服务器，使用平台提供的 API 进行核心业务开发，即可实现快速上线和迭代。

该解决方案目前提供三大基础能力支持：

* 存储：在小程序前端直接上传/下载云端文件，在小程序云控制台可视化管理

* 数据库：一个既可在小程序前端操作，也能在云函数中读写的文档型数据库

* 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码


未来，我们还会集成更多的服务能力，为小程序提供更强有力的云端支持。

## 如何使用小程序·云开发

![](https://ask.qcloudimg.com/draft/1011618/v0cgtzsdav.png)

上面就是小程序·云开发简单的使用图谱：在小程序端，直接用官方提供的接口，在云函数端，直接用官方提供的 Node SDK，就可以操作你云的资源。以前开发小程序所担忧的数据库搭建、文件系统部署，通通没有。

你只需要有在小程序开发 `IDE` 里面的 `云开发`，开通一下，填写环境 `ID`，便可以拥有小程序的云能力！

![](https://ask.qcloudimg.com/draft/1011618/u4al25m5ub.png)

![image](https://ask.qcloudimg.com/draft/1011618/853vr3fift.png)


当然，其实用云开发，并不排斥原有的后台架构，通过下面的架构，你也可以无缝与原有的后台服务兼容，也简化了一些小程序鉴权的逻辑：

![](https://ask.qcloudimg.com/draft/1011618/neslk6t8dr.png)


接下来，我会分别从小程序端、服务端讲述如何使用这些云资源。

## 使用云能力
### 小程序端
客户端，这里是指在小程序端中。如果要使用云开发能力，请做以下配置：

* 在 `app.json / game.json` 中， 中增加字段 `"cloud": true`
* project.config.json 中增加了字段 cloudfunctionRoot 用于指定存放云函数的目录
* 初始化云开发能力：

```javascript
//app.js
App({
  onLaunch: function () {
    wx.cloud.init({
        traceUser: true // 用户信息会显示在云开发控制台的用户面板中
    });
  }
});
```
[小程序端初始化能力文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-client-api/init.html)

在用户管理中会显示使用云能力的小程序的访问用户列表，默认以访问时间倒叙排列，访问时间的触发点是在小程序端调用 `wx.cloud.init` 方法，且其中的 `traceUser` 参数传值为 `true`。

### 服务端
如果你想在云函数中，操作文件、数据库和云函数资源，你可以使用我们提供的服务端 SDK 进行操作。首先，进入到你的某个云函数中，安装以下依赖包：

```javascript
npm i --save tcb-admin-node
```

在云函数中初始化
```javascript
// 初始化示例
const app = require('tcb-admin-node');

// 初始化资源
// 云函数下不需要secretId和secretKey。
// env如果不指定将使用默认环境
app.init({
  secretId: 'xxxxx',
  secretKey: 'xxxx', 
  env: 'xxx'
});

//云函数下使用默认环境
app.init()

//云函数下指定环境
app.init({
  env: 'xxx'
});
```
[服务端初始化文档](https://cloud.tencent.com/document/product/876/19391)

## 存储
云开发提供存储空间、上传文件、下载文件、CDN加速文件访问等能力,开发者可以在小程序端与服务端通过 `API` 使用这些能力。 

### 小程序端
```javascript
// 选择图片
wx.chooseImage({
    success: dRes => {
        // 上传图片
        const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`, // 随机图片名
            filePath: dRes.tempFilePaths[0], // 本地的图片路径
            success: console.log,
            fail: console.error
        });
    },
    fail: console.error,
});
```

[小程序端存储文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-client-api/storage/)

### 服务端
```javascript
const app = require('tcb-admin-node');
app.init();

app.uploadFile({
    cloudPath: "cover.png",
    fileContent: fs.createReadStream(`${__dirname}/cover.png`)
}).then((res) => {
    console.log(res);
}).catch((err) => {
    console.error(err);
});;
```

### 控制台

上传好的文件，就会出现在控制台中，如下图。你可以在控制台里删除、下载或者查看图片的详情。
![](https://ask.qcloudimg.com/draft/1011618/oui5qovisg.png)

你还可以控文件整体的权限，这里还有一些具体的介绍。
![](https://ask.qcloudimg.com/draft/1011618/28lfvt4zs4.png)

[服务端存储文档](https://cloud.tencent.com/document/product/876/18442)

## 数据库
小程序云提供文档型数据库 ( document-oriented database )，数据库包含多个集合（相当于关系型数据中的表），集合近似于一个 JSON 数组，数组中的每个对象就是一条记录，记录的格式是 JSON 文档。

每条记录都有一个 `_id` 字段用以唯一标志这条记录、一个 `_openid` 字段用以标志记录的创建者，即小程序的用户。开发者可以自定义 `_id`，但不可在小程序端自定义（在服务端可以） `_openid` 。`_openid` 是在文档创建时由系统根据小程序用户默认创建的，开发者可使用其来标识和定位文档。

数据库 `API` 分为小程序端和服务端两部分，小程序端 `API` 拥有严格的调用权限控制，开发者可在小程序内直接调用 `API` 进行非敏感数据的操作。对于有更高安全要求的数据，可在云函数内通过服务端 `API` 进行操作。云函数的环境是与客户端完全隔离的，在云函数上可以私密且安全的操作数据库。

数据库 `API` 包含增删改查的能力，使用 `API` 操作数据库只需三步：获取数据库引用、构造查询/更新条件、发出请求。切记，在操作数据库前，请先在控制台中创建 `collection`。

### 小程序端
```javascript
const db = wx.cloud.database();

// 插入数据
db.collection('photo').add({
    data: {
        photo: 'cloud://tcb-xxx/05ca1d38f86f90d66d4751a730379dfa6584dde05ab4-Ma9vMN_fw658.jpg',
        title: '风景'
    }
});

// 提取数据
db.collection('photo').get().then((res) => {
    let data = res.data;
    console.log(data);
});

// 输出
// 在小程序端， _openid 会自动插入到数据库中
{
    photo: 'cloud://tcb-xxx/05ca1d38f86f90d66d4751a730379dfa6584dde05ab4-Ma9vMN_fw658.jpg',
    title: '风景',
    _openid: 'oLlMr5FICCQJV-QgVLVzKu1212341'
}
```

[小程序端数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-client-api/database/)

### 服务端
```javascript
const app = require('tcb-admin-node');
app.init();
const db = app.database();

db.collection('photo').limit(10).get().then((res) => {
    console.log(res);
}).catch((err) => {
    console.error(err);
});

// 输出
// 因为是在服务端，其它用户的也可以提取出来
{
    photo: 'cloud://tcb-xxx/05ca1d38f86f90d66d4751a730379dfa6584dde05ab4-Ma9vMN_fw658.jpg',
    title: '风景',
    _openid: 'oLlMr5FICCQJV-QgVLVzKu1342121'
}
{
    photo: 'cloud://tcb-xxx/0dc3e66fd6b53641e328e091ccb3b9c4e53874232e6bf-ZxSfee_fw658.jpg',
    title: '美女',
    _openid: 'DFDFEX343xxdf-QgVLVzKu12452121'
}
{
    photo: 'cloud://tcb-xxx/104b27e339bdc93c0da15a47aa546b6e9c0e3359c315-L8Px2Y_fw658.jpg',
    title: '动物',
    _openid: 'DFDFEX343xxdf-QgVLVzKu1342121'
}
```

[服务端数据库文档](https://cloud.tencent.com/document/product/876/18441)

### 控制台

可以在控制台里，看到用户操作的数据，你也可以自己在控制台上添加、更新或删除数据。
![](https://ask.qcloudimg.com/draft/1011618/0tnnyajzed.png)

如果数据量庞大，可以设置索引提供查询的效率。
![](https://ask.qcloudimg.com/draft/1011618/orzcc1lt6t.png)

数据库也可以通过设置权限，管控每个 `collection`。
![](https://ask.qcloudimg.com/draft/1011618/jqif2f69dw.png)

## 云函数
云函数是一段运行在云端的代码，无需管理服务器，在开发工具内一键上传部署即可运行后端代码。

开发者可以在云函数内获取到每次调用的上下文（`appid`、`openid` 等），无需维护复杂的鉴权机制，即可获取天然可信任的用户登录态（`openid`）。

### 小程序端
```javascript
wx.cloud.callFunction({
    name: 'addblog', // 云函数名称
    data: { // 传到云函数处理的参数
        title: '云开发 TCB',
        content: '存储、数据库存、云函数'
    }
}).then(res => {
    console.log(res)
}).catch((err) => {
    console.error(err);
});
```

[小程序端云函数文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-client-api/functions/)


### 服务端
```javascript
const app = require("tcb-admin-node");
app.init();

app.callFunction({
    name: 'addblog', // 云函数名称
    data: { // 传到云函数处理的参数
        title: '云开发 TCB',
        content: '存储、数据库存、云函数'
    }
}).then((res) => {
    console.log(res);
}).catch((err) => {
    console.error(err);
});

```

[服务端云函数文档](https://cloud.tencent.com/document/product/876/18440)

### 控制台

上传好之后的云函数，都会在这里罗列出来。
![](https://ask.qcloudimg.com/draft/1011618/bqexv0w3ii.png)

每次调用云函数，都可以在这里看到日志，还可以构造测试的参数，用于调试。
![](https://ask.qcloudimg.com/draft/1011618/tc2pm4vynf.png)

## 语法糖
大部份的接口，目前都支持两种写法，分别是Promise 和 Async/Await，本节以  `callFunction` 作为例子，在`云函数`中介绍这两种写法。 `Async/Awai`t 本质上是基于 `Promise` 的一种语法糖，它只是把 `Promise` 转换成同步的写法而已。

### Promise
```javascript
const app = require("tcb-admin-node");
app.init();

exports.main = (event, context, callback) => {
    app.callFunction({
        name: 'addblog', // 云函数名称
        data: { // 传到云函数处理的参数
            title: '云开发 TCB',
            content: '存储、数据库存、云函数'
        }
    }).then((res) => {
        console.log(res);
        callback(null, res.data);
    }).catch((err) => {
        callback(err);
    });
};
```

### Async/Await
```javascript
const app = require("tcb-admin-node");
app.init();

exports.main = async (event, context) => {
    let result = null;

    try {
        result = await app.callFunction({
            name: 'addblog', // 云函数名称
            data: { // 传到云函数处理的参数
                title: '云开发 TCB',
                content: '存储、数据库存、云函数'
            }
        });
    }
    catch (e) {
        return e;
    }

    return result;
};
```

在云函数里使用，由于是 `Node 8.9` 或以上的环境，因此天然支持 `Async/Await` 诘法，但在小程端要使用的话，需要额外引入 `Polyfill`，比如这个开源的项目：[regenerator](https://github.com/facebook/regenerator/blob/master/packages/regenerator-runtime/runtime.js)

## 开发者资源

由于小程序·云开发是基于腾讯云的云开发开发的功能，因此在腾讯云与小程序两边都有不少的开发者资源，这里供大家参阅读：

* [腾讯云开发者资源及文档](https://cloud.tencent.com/document/product/876)
* [腾讯云云开发平台官方 Github](https://github.com/TencentCloudBase)
* [微信小程序·云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)