---
slug: webpack-code-generation-analysis
title: webpack2生成代码分析
authors: heyli
tags: [webpack, generation, analysis]
---

[原文链接](https://github.com/lcxfs1991/blog/issues/14)
## 打包一个模块

``` javascript
// webpack.config.js
module.exports = {
    entry: {
        index: "./main.js",
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'
    },
};
```

``` javascript
// main.js, entry chunk
import { chunk2, chunk3 } from './main1';
import chunk5, { C1, C2, C3 } from './main2';

var chunk1 = 1;
exports.chunk1 = chunk1;


exports.chunk4 = {
    a: 1,
    b: 2
};

console.log(C1);
console.log(chunk3);
```

``` javascript
// main1.js
var chunk2 = 2;
exports.chunk2 = chunk2;


var chunk3 = 3;
exports.chunk3 = chunk3;

export function f1() {
    return 'f1';
}
export function f2() {
    return 'f2';
}
```

``` javascript
// main2.js
export function f3() {
    return 'f3';
}

export default class C3 {
    constructor() {

    }

    f1() {
        console.log("f1")
    }

    f2() {
        console.log("f2");
    }
}

export const C1 = 'c1';
export const C2 = 'c2';
```

``` javascript
// result file, index.js
(function(modules) { 
    // modules在webpack1的时候是数组，现在变成了key值是数字的对象
    // module的缓存
    var installedModules = {};

    // require方法，转义成此
    function __webpack_require__(moduleId) {

        // 若module已被缓存，直接返回
        if(installedModules[moduleId])
            return installedModules[moduleId].exports;

        // 创建一个新的module，被放入缓存中
        // webpack1的时候都是全称，现在估计为了省点空间，都变成了id => i, load => l
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // 执行module
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // 标明此module已被加载
        module.l = true;

        // module.exports通过在执行module的时候，作为参数存进去，然后会保存module中暴露给外界的接口，
        // 如函数、变量等
        return module.exports;
    }


    // 在源文件中，直接使用__webpack_modules__，生成文件用__webpack_require__.m替换
    __webpack_require__.m = modules;

    // 暴露module缓存
    __webpack_require__.c = installedModules;

    // identity function for calling harmory imports with the correct context
    __webpack_require__.i = function(value) { return value; };

    // 为harmory exports 定义 getter function, configurable=false表明，此属性不能修改
    // 例如export const，由于是常量，需要用__webpack_require__.d进行定义
    __webpack_require__.d = function(exports, name, getter) {
        Object.defineProperty(exports, name, {
            configurable: false,
            enumerable: true,
            get: getter
        });
    };

    // 兼容 non-harmony 模块，这些模块如果设了__esModule属性，则被标记为non-harmony
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };

    // Object.prototype.hasOwnProperty.call polyfill
    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

    // 使用__webpack_public_path__，则会替换__webpack_require__.p
    __webpack_require__.p = "//localhost:8000/";

    // 加载入口模块，并返回exports
    return __webpack_require__(__webpack_require__.s = 143);
})
/************************************************************************/
({

    143: // 入口模块
    function(module, exports, __webpack_require__) {

        module.exports = __webpack_require__(64);

    },

    64: // main.js
    function(module, exports, __webpack_require__) {

        "use strict";
        /* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__main1__ = __webpack_require__(72);
        /* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main2__ = __webpack_require__(73);

        var chunk1 = 1;
        exports.chunk1 = chunk1;

        exports.chunk4 = {
            a: 1,
            b: 2
        };
        // 此如由于引用了C1，而C1又是常用，它事先定义成属性a，此处直接引用对象的属性a
        console.log(__WEBPACK_IMPORTED_MODULE_1__main2__["a" /* C1 */]);
        console.log(__WEBPACK_IMPORTED_MODULE_0__main1__["chunk3"]);

    },

    72: // main1.js
    function(module, exports, __webpack_require__) {

        "use strict";
        /* unused harmony export f1 */
        /* unused harmony export f2 */
        // 此处注释表示，这两个harmony export模块没有被使用，后续如果使用unglify插件，f1与f2会被去掉
        // 这个就是著名的tree-shaking
        var chunk2 = 2;
        exports.chunk2 = chunk2;

        var chunk3 = 3;
        exports.chunk3 = chunk3;

        function f1() {
            return 'f1';
        }
        function f2() {
            return 'f2';
        }

    },

    73: // main2.js
    function(module, exports, __webpack_require__) {

        "use strict";
        /* unused harmony export f3 */
        /* unused harmony export default */
        /* harmony export (binding) */ __webpack_require__.d(exports, "a", function() { return C1; });
        /* unused harmony export C2 */
        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

        function f3() {
            return 'f3';
        }

        var C3 = function () {
            function C3() {
                _classCallCheck(this, C3);
            }

            C3.prototype.f1 = function f1() {
                console.log("f1");
            };

            C3.prototype.f2 = function f2() {
                console.log("f2");
            };

            return C3;
        }();

        var C1 = 'c1';
        var C2 = 'c2';

    }

});
```

整个立即执行函数，主要是webpack_require, **webpack_require**.n, **webpack_require**.d起作用。installedModules是用于缓存已经加载的模块。
## 异步加载

``` javascript

// webpack.config.js
module.exports = {
    entry: {
        index: "./main.js",
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'，
        chunkFilename: "js/[name].js",
    },
};
```

``` javascript
// main.js
var chunk1 = 1;
exports.chunk1 = chunk1;

function errorLoading(err) {
    console.error('Dynamic page loading failed', err);
}
function loadRoute(cb) {
    console.log("dynamic loading success");
    return (module) => cb(null, module.default);
}

// 符合es6规范的异步加载模块方法
System.import('./main1')
                  .then(loadRoute(cb))
                  .catch(errorLoading);
```

``` javascript
// main1.js
var chunk2 = 2;
exports.chunk2 = chunk2;


var chunk3 = 3;
exports.chunk3 = chunk3;

export function f1() {
    return 'f1';
}
export function f2() {
    return 'f2';
}

export default function f3() {
    return 'f3';
}
```

``` javascript
// result file, index.js
```

``` javascript
// result file, 0.js
webpackJsonp([0],{
    144:
    function(module, exports, __webpack_require__) {

        "use strict";
        /* harmony export (immutable) */ exports["f1"] = f1;
        /* harmony export (immutable) */ exports["f2"] = f2;
        /* harmony export (immutable) */ exports["default"] = f3;
        var chunk2 = 2;
        exports.chunk2 = chunk2;

        var chunk3 = 3;
        exports.chunk3 = chunk3;

        function f1() {
            return 'f1';
        }
        function f2() {
            return 'f2';
        }

        function f3() {
            return 'f3';
        }

    }
});
```

``` javascript
// result file index.js
(function(modules) { // webpackBootstrap
    // install a JSONP callback for chunk loading
    var parentJsonpFunction = window["webpackJsonp"];
    // 全局定义webpackJsonp，让chunk加载的时候，直接可调用
    window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
        // 将异加载的moreModules，添加到entry chunk的modules里面
        // 然后使所有chunk标记为已加载，并触发回调函数
        var moduleId, chunkId, i = 0, resolves = [], result;
        for(;i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            if(installedChunks[chunkId]) {
                resolves.push(installedChunks[chunkId][0]);
            }
            installedChunks[chunkId] = 0;
        }
        // 将moreModules存入modules中
        for(moduleId in moreModules) {
            if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                modules[moduleId] = moreModules[moduleId];
            }
        }

        if(parentJsonpFunction) {
            parentJsonpFunction(chunkIds, moreModules, executeModules);
        }
        // resolves就是需要触发的回调
        while(resolves.length) {
            resolves.shift()();
        }

    };

    // The module cache
    var installedModules = {};

    // objects to store loaded and loading chunks
    var installedChunks = {
        3: 0
    };

    // The require function
    function __webpack_require__(moduleId) {

        // Check if module is in cache
        if(installedModules[moduleId])
            return installedModules[moduleId].exports;

        // Create a new module (and put it into the cache)
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // Execute the module function
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Flag the module as loaded
        module.l = true;

        // Return the exports of the module
        return module.exports;
    }

    // 异步加载函数，返回promise对象
    __webpack_require__.e = function requireEnsure(chunkId) {
        // 如果已经加载，则返回Promise.resolve
        if(installedChunks[chunkId] === 0)
            return Promise.resolve();

        // an Promise means "currently loading".
        if(installedChunks[chunkId]) {
            return installedChunks[chunkId][2];
        }
        // 开始加载
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        script.timeout = 120000;

        // 加载的资源位置
        script.src = __webpack_require__.p + "js/chunk/" + ({}[chunkId]||chunkId) + ".js";
        var timeout = setTimeout(onScriptComplete, 120000);
        script.onerror = script.onload = onScriptComplete;
        function onScriptComplete() {
            // avoid mem leaks in IE.
            script.onerror = script.onload = null;
            clearTimeout(timeout);
            var chunk = installedChunks[chunkId];
            if(chunk !== 0) {
                if(chunk) chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
                installedChunks[chunkId] = undefined;
            }
        };
        head.appendChild(script);

        var promise = new Promise(function(resolve, reject) {
            // resolve与reject，属于installedChunks[chunkId]的回调函数，
            // 在webpackJsonpCallback函数中，有可能被调用
            installedChunks[chunkId] = [resolve, reject];
            console.log(installedChunks[chunkId]);
        });
        return installedChunks[chunkId][2] = promise;
    };

    // expose the modules object (__webpack_modules__)
    __webpack_require__.m = modules;

    // expose the module cache
    __webpack_require__.c = installedModules;

    // identity function for calling harmory imports with the correct context
    __webpack_require__.i = function(value) { return value; };

    // define getter function for harmory exports
    __webpack_require__.d = function(exports, name, getter) {
        Object.defineProperty(exports, name, {
            configurable: false,
            enumerable: true,
            get: getter
        });
    };

    // getDefaultExport function for compatibility with non-harmony modules
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };

    // Object.prototype.hasOwnProperty.call
    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

    // __webpack_public_path__
    __webpack_require__.p = "//localhost:8000/";

    // on error function for async loading
    __webpack_require__.oe = function(err) { console.error(err); throw err; };

    // Load entry module and return exports
    return __webpack_require__(__webpack_require__.s = 141);
})
/************************************************************************/
({

    141:
    function(module, exports, __webpack_require__) {

        module.exports = __webpack_require__(64);

    },

    64:
    function(module, exports, __webpack_require__) {

        var chunk1 = 1;
        exports.chunk1 = chunk1;

        function errorLoading(err) {
            console.error('Dynamic page loading failed', err);
        }
        function loadRoute() {
            console.log("dynamic loading success");
            return function (module) {
                console.log(module.default);
            };
        }
        // 符合es6规范的异步加载模块
        __webpack_require__.e/* System.import */(0).then(__webpack_require__.bind(null, 144)).then(loadRoute()).catch(errorLoading);

    }

});
```

异步加载，主要是多了webpackJsonp全局函数，以及**webpack_require**.e作为加载script的函数。
## CommonsChunkPlugin 提取公共包

``` javascript

// webpack.config.js
module.exports = {
    entry: {
        index: "./main.js",
        spa: "./spamain.js"
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'，
        chunkFilename: "js/[name].js",
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "commons",
            filename: "commons.js",
            chunks: ['index', 'spa'],
        }),
    ]
};
```

``` javascript
// result file, index.js
(function(modules) { // webpackBootstrap
    // install a JSONP callback for chunk loading
    var parentJsonpFunction = window["webpackJsonp"];
    window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
        // add "moreModules" to the modules object,
        // then flag all "chunkIds" as loaded and fire callback
        var moduleId, chunkId, i = 0, resolves = [], result;
        for(;i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            if(installedChunks[chunkId])
                resolves.push(installedChunks[chunkId][0]);
            installedChunks[chunkId] = 0;
        }
        for(moduleId in moreModules) {
            if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                modules[moduleId] = moreModules[moduleId];
            }
        }
        if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
        while(resolves.length)
            resolves.shift()();
                // 这里比异步加载相同的函数多了一段执行逻辑，主要用于执行entry chunk
        if(executeModules) {
            for(i=0; i < executeModules.length; i++) {
                result = __webpack_require__(__webpack_require__.s = executeModules[i]);
            }
        }
        return result;
    };

    // The module cache
    var installedModules = {};

    // objects to store loaded and loading chunks
    var installedChunks = {
        3: 0
    };

    // The require function
    function __webpack_require__(moduleId) {

        // Check if module is in cache
        if(installedModules[moduleId])
            return installedModules[moduleId].exports;

        // Create a new module (and put it into the cache)
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // Execute the module function
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Flag the module as loaded
        module.l = true;

        // Return the exports of the module
        return module.exports;
    }

    // This file contains only the entry chunk.
    // The chunk loading function for additional chunks
    __webpack_require__.e = function requireEnsure(chunkId) {
        if(installedChunks[chunkId] === 0)
            return Promise.resolve();

        // an Promise means "currently loading".
        if(installedChunks[chunkId]) {
            return installedChunks[chunkId][2];
        }
        // start chunk loading
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        script.timeout = 120000;

        script.src = __webpack_require__.p + "js/chunk/" + ({"0":"index","1":"spa"}[chunkId]||chunkId) + ".js";
        var timeout = setTimeout(onScriptComplete, 120000);
        script.onerror = script.onload = onScriptComplete;
        function onScriptComplete() {
            // avoid mem leaks in IE.
            script.onerror = script.onload = null;
            clearTimeout(timeout);
            var chunk = installedChunks[chunkId];
            if(chunk !== 0) {
                if(chunk) chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
                installedChunks[chunkId] = undefined;
            }
        };
        head.appendChild(script);

        var promise = new Promise(function(resolve, reject) {
            installedChunks[chunkId] = [resolve, reject];
        });
        return installedChunks[chunkId][2] = promise;
    };

    // expose the modules object (__webpack_modules__)
    __webpack_require__.m = modules;

    // expose the module cache
    __webpack_require__.c = installedModules;

    // identity function for calling harmory imports with the correct context
    __webpack_require__.i = function(value) { return value; };

    // define getter function for harmory exports
    __webpack_require__.d = function(exports, name, getter) {
        Object.defineProperty(exports, name, {
            configurable: false,
            enumerable: true,
            get: getter
        });
    };

    // getDefaultExport function for compatibility with non-harmony modules
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };

    // Object.prototype.hasOwnProperty.call
    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

    // __webpack_public_path__
    __webpack_require__.p = "//localhost:8000/";

    // on error function for async loading
    __webpack_require__.oe = function(err) { console.error(err); throw err; };
})
/************************************************************************/
({

    8:
    function(module, exports, __webpack_require__) {

        "use strict";
        /* unused harmony export f1 */
        /* unused harmony export f2 */
        /* unused harmony export default */
        var chunk2 = 2;
        exports.chunk2 = chunk2;

        var chunk3 = 3;
        exports.chunk3 = chunk3;

        function f1() {
            return 'f1';
        }
        function f2() {
            return 'f2';
        }

        function f3() {
            return 'f3';
        }

    }

});
```

``` javascript
// main.js
webpackJsonp([0],{

    14:
    function(module, exports, __webpack_require__) {

        "use strict";
        /* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__main1__ = __webpack_require__(8);
        /* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main2__ = __webpack_require__(24);

        var chunk1 = 1;
        exports.chunk1 = chunk1;

        exports.chunk4 = {
            a: 1,
            b: 2
        };

    },

    24:
    function(module, exports, __webpack_require__) {

        "use strict";
        /* unused harmony export f3 */
        /* unused harmony export default */
        /* unused harmony export C1 */
        /* unused harmony export C2 */
        /* unused harmony export C4 */
        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

        function f3() {
            return 'f3';
        }

        var C3 = function () {
            function C3() {
                _classCallCheck(this, C3);
            }

            C3.prototype.f1 = function f1() {
                console.log("f1");
            };

            C3.prototype.f2 = function f2() {
                console.log("f2");
            };

            return C3;
        }();




        var C1 = 'c1';
        var C2 = 'c2';
        var C4 = 'c4';

    },

    41:
    function(module, exports, __webpack_require__) {

        module.exports = __webpack_require__(14);

    }

},[41]);
```

``` javascript
// spamain.js
webpackJsonp([1],{

16:
function(module, exports, __webpack_require__) {

    "use strict";
    /* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index_main1__ = __webpack_require__(8);

    console.log(__WEBPACK_IMPORTED_MODULE_0__index_main1__["chunk2"]);

},

43:
function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(16);

}

},[43]);
```

提取公共包的这种情况，跟异步加载很类似，不过它将主要的功能函数都提取到common.js中，并且新增了执行module的逻辑。但主要入口的chunk都在主要逻辑的index.js与spa.js中。

webpack2使用了一些低端浏览器并不支持的接口，因此如果需要支持这些低端浏览器的业务，需要谨慎使用。
