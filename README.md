# 梅沙科技前端监控脚本

收集运行于浏览器端JS错误信息、记录页面加载时间、记录设备相关信息，AJAX发送至后端统计与分析。



## 开发配置

1. ``git clone``此项目；
2. ``npm install``；
3. ``npm run dev``，在gulp下继续开发；
4. ``npm run build``构建用于生产环境的``meisha-watch.js``。



## 使用方法

### 引入

``npm install --save meisha-fe-watch``，支持以下任一方式加入前端项目中：

1、作为JS文件通过``<script>``引入html中，但必须保证在所有JS脚本的最前执行：

```javascript
<script src="path/to/meisha-watch.js"></script>
```

2、支持ES6+的import引入：

```javascript
import MeishaWatch from 'meisha-fe-watch';
```

3、支持require引入：

```javascript
const MeiShaWatch = require('meisha-fe-watch');
```



### 配置

引入后，在项目入口调用``MeishaWatch.init()``方法全局配置：

```javascript
MeiShaWatch.init({
  isReport: true, // 是否向后端提交MeishaWatch收集信息，默认为true，可自行检测当前环境，在开发、测试、预发布环境关闭，如：isReport: !/127.0.0.1|192.168|localhost|test-|pre-/.test(window.location.host)
  reportURL: '/path/to/report', // 向后端提交MeishaWatch收集信息的URL(必需，否则无法提交)
  projectName: 'project name', // 项目名称(必需，否则无法提交)
  moduleName: 'module name' // 项目下的具体模块名(可选)
});
```

对于使用``Vue`` 2.2.0以上版本的项目，还需要以下配置：

```javascript
import Vue from 'vue';
...
Vue.use(MeiShaWatch.useVue()); // 添加MeishaWatch为Vue插件
...
new Vue({
  ...
});
```

为了能定位到出错的用户，在用户登录后，还要设置用户的识别信息：

```javascript
MeiShaWatch.setUser(userId); // userId可替换为任一能识别用户身份的信息，可以是任何能转换成JSON的类型
```

``MeiShaWatch``默认在页面关闭后上传所有错误信息，如果需要主动上报，可调用``report``方法。

```javascript
MeiShaWatch.report();
```

之后就可以愉快地使用了 :)



### 使用技巧

对于混淆压缩后的JS代码，可能无法定位到出错的具体位置，为了更精确地定位，可在代码中通过``try`` ``catch``捕获错误，并主动通过``console.error``输出，``MeishaWatch``代理了``console``，通过``console.log``、``console.error``等输出的错误信息都会记录。请去掉生产环境代码中多余的``console.log``，否则会当作错误处理。

对于使用``vue``的项目，在生产模式构建后``devtools``不可用，如果要快速开启，可在url参数加上devtools=true后刷新页面。



## 功能

1. 收集``window.onerror``的错误信息，对于``Vue``，通过``Vue.config.errorHandler``收集；
2. 代理``console``，收集打印的记录；
3. 代理``XMLHTTPRequest``，收集AJAX出错信息；
4. 通过``performance``接口收集性能信息，如页面加载完成的时间，解析DOM树结构的时间，请求资源的时间；
5. 收集用户浏览器信息，如``useragent``。

