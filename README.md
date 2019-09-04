# 梅沙科技前端监控脚本

![version](https://img.shields.io/badge/meisha--fe--watch-1.0.2-brightgreen.svg)  ![license](https://img.shields.io/badge/license-MIT-blue.svg)  ![license](https://img.shields.io/badge/typescript-%3E=2.4.2-orange.svg)

收集运行于浏览器端JS的错误信息、记录页面加载时间、记录AJAX出错信息并发送至后端统计与分析。



## 开发配置

1. ``git clone``此项目；

2. ``npm install``；

3. ``npm run dev``，在**Gulp**下继续开发；

4. ``npm run build``构建用于生产环境的``meisha-watch.js``。

   ​

## 使用方法

### 引入

``npm install --save meisha-fe-watch``，支持以下任一方式加入前端项目中：

1、作为JS文件通过``<script>``引入html中，但必须保证在所有JS脚本的最前执行：

```javascript
<script src="/meisha-fe-watch/dist/meisha-watch.js"></script>
```

2、支持ES6+的import引入：

```javascript
import MeishaWatch from 'meisha-fe-watch';
```

3、支持CommonJS语法引入：

```javascript
const MeishaWatch = require('meisha-fe-watch');
```



### 配置

引入后，在项目入口调用``MeishaWatch.init()``方法全局配置：

```javascript
MeishaWatch.init({
  isReport: true, // 是否向后端提交MeishaWatch收集信息，默认为true，可自行检测当前环境，在开发、测试、预发布环境关闭，如：isReport: !/127.0.0.1|192.168|localhost|test-|pre-/.test(window.location.host)
  reportURL: '/path/to/report', // 向后端提交MeishaWatch收集信息的URL(必填，否则无法提交)
  projectId: 'project id', // 日志系统设置的项目英文名（必填，否则无法提交）
});
```

对于使用``Vue`` 2.2.0以上版本的项目，还需要以下配置：

```javascript
import Vue from 'vue';
...
Vue.use(MeishaWatch.useVue()); // 添加MeishaWatch为Vue插件
...
new Vue({
  ...
});
```

为了能定位到出错的用户，在用户登录后，还要设置用户的识别信息：

```javascript
MeishaWatch.setUser(userId); // userId可替换为任一能识别用户身份的信息，可以是任何能转换成JSON的类型
```

之后就可以愉快地使用了 :)



### 错误上报时机

1.进入系统时（进入系统会获取``localStorage``的``_msLogs``字段（注意⚠️：避免在业务系统中用到``localstorage``中的``_msLogs``字段）。

2.当前存储的``log``数大于等于5时。

3.每次捕获到一条错误信息，会同步到``localstorage``；每次执行错误上报，也会同步移除``localstorage``的``_msLogs``字段

``MeishaWatch``会自动进行错误上报，使用时无需关注细节。如果需要主动上报，可调用``report``方法。

```javascript
MeishaWatch.report();
```

### 页面性能上报

如果需要主动上报页面设置的埋点耗时，可调用``reportPageTime``方法。

```javascript
MeishaWatch.reportPageTime(name, time); // name为自定义标签，time为耗时
```



### 使用技巧

对于混淆压缩后的JS代码，可能无法定位到出错的具体位置，为了更精确地定位，可在代码中通过``try`` ``catch``捕获错误，并主动通过``console.error``输出，``MeishaWatch``代理了``console``，通过``console.log``、``console.error``等输出的错误信息都会记录。请去掉生产环境代码中多余的``console.log``，否则会当作错误处理。

对于使用``Vue``的项目，在定义组件时，请务必为组件命名，以便更快定位到报错的位置，如：

```javascript
// main.vue
export default {
  name: 'Main',
  ...
}
```

另外，在生产模式构建后``Vue``的浏览器开发者工具``devtool``不可用，如果要快速开启，可在url参数加上devtools=true后刷新页面。



## 更新日志

### v1.1.0-rc.1

1. 修复部分error未收集到localStorage的bug

### v1.1.0

1. 新增接口客户端UA字段上报。

2. 新增自定义页面性能上报。

3. 原配置中的``projectId``的值改为原有字段``partionId``的值，并移除字段``partitionId``。

4. 上报方式全部改为异步上报。
   
5. 上报时机：  
（1）进入系统时（进入系统会获取``localStorage``的``_msLogs``字段（注意⚠️：避免在业务系统中用到``localstorage``中的``_msLogs``字段）。  
（2）当前存储的``log``数大于等于5时。

6. 取消原有的iOS系统进入页面的初次上报机制


### v1.0.5

1. 修复上报数据中``url``字段带特殊符号上报信息被截断的问题


### v1.0.4

1. 优化接口收集的性能信息，如：页面完全加载时间、HTML加载完成时间、首次渲染时间、DOM解析耗时、DNS解析耗时、网络请求耗时、数据传输耗时、首次可交互时间、首包时间、资源加载耗时。

2. 设置iOS的初次上报延迟1.5s


### v1.0.3

1. 请求上报添加超时时长参数，默认为1s


### v1.0.2

1. 将Android设备错误上报改回同步请求。

2. 修复对循环引用对象做JSON.stringify操作时``TypeError: Converting circular structure to JSON``的错误。


### v1.0.1

1. 修复在部分Android设备微信浏览器中偶现``NetworkError: Failed to execute 'send' on 'XMLHttpRequest'``的错误，将错误上报改为异步请求。


### v1.0.0

1. 新增收集``window.onerror``的错误信息，对于``Vue``，通过``Vue.config.errorHandler``收集；

2. 新增代理``console``，收集打印的记录；

3. 新增代理``XMLHTTPRequest``，收集AJAX出错信息； 

4. 新增通过``performance``接口收集性能信息，如页面加载完成的时间，解析DOM树结构的时间，请求资源的时间。


## 兼容性

支持IE9+，Edge，Firefox 18+，Chrome 33+，Safari 6.1+，iOS Safari 7.1+，Android Browser 4.4+。

不支持微信小程序内使用。
