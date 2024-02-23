---
slug: frontend-cross-domain
title: 前端跨域知识简介
authors: heyli
tags: [前端, 跨域]
---

## 前端跨域知识简介
## 灵感

差不多2年前，由于业务需要，了解各种各样不同的跨域方式。但由于各种方式千奇百怪，我觉得有必要将各种方法封装起来，方便使用，弄了个简单的跨域使用库，里面包含各种跨域的使用函数，都存放在[steamer-cross v1.0分支里](https://github.com/SteamerTeam/steamer-cross/tree/v1.0)。但2年过后，IE8以下的浏览器已经逐渐淡出市场，基本上跨域的方案可以由postMessage一统天下，于是在[MessengerJS](https://github.com/biqing/MessengerJS)启发下，自己写了一个[steamer-cross v2.0版本](https://github.com/SteamerTeam/steamer-cross/tree/v2.0.0)，更灵活的用法，且兼顾父子窗口之间互相传递数据。

v1.0版本可能有bug，仅供学习参考，v2.0已写测试样例，可以`test`文件夹中看到，文档不清楚的地方，也可以参考`test/index.html`的写法。

本文主不会详细述说各种方法的具体实现，具体的办法可以点击后文参考资料里面的三篇文章。本文只会提及实现过程中的一些坑，以及框架的实现办法。具体的实现方法，可以参考[steamer-cross v1.0](https://github.com/SteamerTeam/steamer-cross/tree/v1.0)版本中的文件，各种办法的实现，可以看对应文件夹里面的文件。
## 跨域方法 -- 单向
### jsonp

这是最直观的办法，只需要一个页面，在页面内包含一个指向数据页面的script tag，然后在src后面多加一个回调函数即可以获取数据。
### cross origin resource sharing (cors)

这个办法前后端都涉及，因此前端的同学需要后端的配合。其实质只是一个ajax，可以接收除了post和get之后的其它服务器请求例如put。后端需要修改的是.htaccess文件。加入以下一句

```
Header set Access-Control-Allow-Origin *
```

符号*代表接收任意的HTTP请求，你也可以通过修改，限制接受请求的域名或者IP地址。

另外一个隐藏坑是，ie10以下的浏览器是不支持的。值得注意的是，ie8和ie9是通过XDomainRequest来进行CORS通信的。XDomainRequest同样支持get和post方法。对象详细内容请见参考资料。

XDomainRequest的另一个坑是，当发送POST请求的时候，无法设置Header，如

```
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
```

这可能导致后台没法辨认POST数据。如果是PHP的话，后台需要特殊的处理，例如

```
if(isset($HTTP_RAW_POST_DATA))
{
    parse_str($HTTP_RAW_POST_DATA, $output);
    echo json_encode($output);
}
```

CORS支持情况：Chrome 4 , Firefox 3.5 , IE 8~9(XDomainRequest), IE 10+ , Opera 12 , Safari
### location.hash

这个办法坑比较多，网上的办法会有些问题。这个办法需要三个页面，分别是主调用页(index.html), 数据页(data.html),和代理页(proxy.html)。实质的结构是，index.html里有一个iframe指向data.html，而data.html里又有一个iframe指向proxy.html。要注意的是,index.html和proxy.html主域和子域都相同，只有data.html是异域，因此当data.html生成数据时，将数据放在proxy.html链接的hash(#)后面，然后再由proxy.html里的代码通过parent.parent这样的调用，将数据放到proxy.html的祖父index.html的链接上面。

大多数教程都是停留在这一步。这是不够的，还需要在index.html里面设置一个setInterval去监听index.html中#的变化，进而获取数据。据说有些高端浏览器里面可以直接用hashchange来监听，但低端的话最好还是用setInterval。因此框架里面用setInterval实现。
### window.name

由于window.name在iframe的src的变化时不会改变，所以这个办法也可以用于跨域。这个方式虽然也需要跟location.hash也需要三个页面，但proxy.html的作用非常次要。由于data.html能够直接对window.name写值，因此写值完毕后，只需要将src改成与index.html主域和子域一致的页面，就可以让index.html直接调用了。也有不需要proxy页面的写法，将iframe的src写成"about:blank;"就可以了。
## 跨域方法 -- 双向
### document.domain

这个办法对于主调用页(index.html)和数据页(data.html)而言是双向的，即两个页面都可以得到对方的数据(主要是DOM元素)。实质就是index.html包含一个指向data.html的iframe，然后在data.html中改变document.domain，使之和index.html的document.domain是一样的，这样就可以使两个页面互相调用对方的数据。唯一的缺点是只能应用于子域不同，但主域相同的两个页面。
### postMessage

网上大部份教程都只教从index.html传数据到data.html。其实data.html也可以发数据到index.html。实现方法一样，只要在data.html里面发送的地址跟index.html的地址一样就可以了。否则浏览器会报错。这是比较优秀的一个办法，缺点是旧式浏览器并不支持。
### window.navigator

这是ie6和ie7的一个安全bug。目前似乎还没有补丁打上，所以主页面和iframe页面之间可以自由调用。
### 参考资料
- [浅谈跨域](http://targetkiller.net/cross-domain/)
- [HTML5安全：CORS（跨域资源共享）简介](http://blog.csdn.net/hfahe/article/details/7730944)
- [JavaScript最全的10种跨域共享的方法](http://www.oschina.net/question/12_15673)
- [XDomainRequest object](http://msdn.microsoft.com/en-us/library/cc288060%28v=vs.85%29.aspx)
- [iframe跨域通信的通用解决方案-第二弹!（终极解决方案）](http://www.alloyteam.com/2013/11/the-second-version-universal-solution-iframe-cross-domain-communication/)
