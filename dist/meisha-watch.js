(function (root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    else if (typeof exports === 'object') {
        exports['MeishaWatch'] = factory();
    }
    else {
        root['MeishaWatch'] = factory();
    }
})(window, function () {
    var env = {
        wechat: !!navigator.userAgent.toLowerCase().match(/MicroMessenger/i),
        iOS: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        Android: !!navigator.userAgent.match(/Android/i),
        dev: /127.0.0.1|192.168|localhost/.test(window.location.host)
    };
    var MeishaWatch = (function () {
        function MeishaWatch() {
            var _this = this;
            this.settings = {
                isReport: true,
                reportURL: '',
                projectId: '',
                outTime: 1000
            };
            this.__logs = [];
            this.user = '';
            this.uniqueId = geneUniqueId();
            this.timer = null;
            this.reportTimes = 0;
            Object.defineProperty(this, 'logs', {
                value: [],
                configurable: true,
                enumerable: true,
                writable: true
            });
            Object.defineProperty(this, 'logs', {
                get: function () {
                    return this.__logs;
                },
                set: function (value) {
                    this.__logs = value;
                    if (value.length) {
                        this.checkLogs();
                    }
                }
            });
            this.agentConsole();
            this.agentAJAX();
            this.configSender();
            this.configListener();
            try {
                var logs = JSON.parse(window.localStorage.getItem('msLogs'));
                window.localStorage.removeItem('msLogs');
                if (this.isArray(logs))
                    this.logs = logs;
            }
            catch (error) {
            }
            window.addEventListener('beforeunload', function () {
                window.localStorage && window.localStorage.setItem('msLogs', JSON.stringify(_this.logs));
            }, false);
        }
        MeishaWatch.prototype.init = function (settings) {
            this.settings = settings;
        };
        MeishaWatch.prototype.agentConsole = function () {
            var _this = this;
            var methodList = ['log', 'info', 'warn', 'debug', 'error'];
            methodList.forEach(function (type) {
                var method = console[type];
                console[type] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (args.length && args[0] !== '[MeishaWatch Console]') {
                        _this.logs = _this.logs.concat([{
                                msg: args.map(function (v) {
                                    return (typeof v === 'object') ? JSON.stringify(decycle(v, undefined)) : v;
                                }).join(','),
                                url: encodeURIComponent(window.location.href),
                                type: type
                            }]);
                    }
                    method.apply(console, args);
                };
            });
        };
        MeishaWatch.prototype.agentAJAX = function () {
            var msw = this;
            var open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function () {
                var req = this;
                var args = [].slice.call(arguments), method = args[0], url = args[1];
                var onreadystatechange = req.onreadystatechange || function () {
                };
                req.onreadystatechange = function () {
                    if (req.readyState === 4 && req.status >= 400) {
                        msw.logs = msw.logs.concat([{
                                msg: method + " " + url + " " + req.status,
                                url: encodeURIComponent(window.location.href),
                                type: 'error'
                            }]);
                    }
                    return onreadystatechange.apply(req, arguments);
                };
                return open.apply(req, args);
            };
        };
        MeishaWatch.prototype.configListener = function () {
            var _this = this;
            window.onerror = function (msg, url, line, col, error) {
                var errMsg = msg;
                if (error && error.stack) {
                    errMsg = processStackMsg(error);
                }
                _this.logs = _this.logs.concat([{
                        msg: encodeURIComponent(errMsg.substr(0, 500)),
                        url: encodeURIComponent(window.location.href),
                        type: 'error',
                        line: line,
                        col: col
                    }]);
            };
        };
        MeishaWatch.prototype.configSender = function () {
            var _this = this;
            if (env.iOS) {
                window.addEventListener('load', function () {
                    setTimeout(function () {
                        _this.report(true);
                    }, 1500);
                }, false);
            }
            if (env.wechat && env.Android) {
                var hidden_1 = 'hidden';
                if (hidden_1 in document) {
                    document.addEventListener('visibilitychange', function () {
                        if (document[hidden_1]) {
                            _this.report(false);
                        }
                    }, false);
                }
                else if ((hidden_1 = 'webkitHidden') in document) {
                    document.addEventListener('webkitvisibilitychange', function () {
                        if (document[hidden_1]) {
                            _this.report(false);
                        }
                    }, false);
                }
            }
        };
        MeishaWatch.prototype.setUser = function (user) {
            this.user = user;
        };
        MeishaWatch.prototype.report = function (async) {
            if (async === void 0) { async = true; }
            if (this.settings) {
                var _a = this.settings, reportURL = _a.reportURL, projectId = _a.projectId, _b = _a.isReport, isReport = _b === void 0 ? true : _b, outTime = _a.outTime;
                if (isReport && this.reportTimes < 20) {
                    if (reportURL && projectId) {
                        var performance_1 = window.performance;
                        var times = {
                            dns: -1,
                            tcp: -1,
                            ttfb: -1,
                            trans: -1,
                            dom: -1,
                            res: -1,
                            firstbyte: -1,
                            fpt: -1,
                            tti: -1,
                            ready: -1,
                            load: -1,
                        };
                        if (performance_1) {
                            var t = performance_1.timing;
                            times.dns = t.domainLookupEnd - t.domainLookupStart;
                            times.tcp = t.connectEnd - t.connectStart;
                            times.ttfb = t.responseStart - t.requestStart;
                            times.trans = t.responseEnd - t.responseStart;
                            times.dom = t.domInteractive - t.responseEnd;
                            times.res = t.loadEventStart - t.domContentLoadedEventEnd;
                            times.firstbyte = t.responseStart - t.domainLookupStart;
                            times.fpt = t.responseEnd - t.fetchStart;
                            times.tti = t.domInteractive - t.fetchStart;
                            times.ready = t.domContentLoadedEventEnd - t.fetchStart;
                            times.load = t.loadEventStart - t.fetchStart;
                        }
                        var user = (isType(this.user, 'Number') || isType(this.user, 'String')) ? this.user : JSON.stringify(this.user);
                        var logs = JSON.stringify(decycle(this.logs.slice(), undefined));
                        var httpHost = window.location.host;
                        var requestUri = window.location.pathname;
                        var ua = window.navigator && window.navigator.userAgent;
                        this.logs = [];
                        try {
                            AJAX(reportURL, 'POST', {
                                project: projectId,
                                httpHost: httpHost,
                                requestUri: requestUri,
                                logs: logs,
                                times: JSON.stringify(times),
                                user: user,
                                uniqueId: this.uniqueId,
                                ua: ua
                            }, async, function () {
                            }, function () {
                            }, outTime);
                        }
                        catch (e) {
                        }
                        finally {
                            this.reportTimes++;
                        }
                    }
                }
            }
        };
        MeishaWatch.prototype.reportPageTime = function (pageName, pageTime) {
            if (this.settings) {
                var _a = this.settings, reportURL = _a.reportURL, projectId = _a.projectId, _b = _a.isReport, isReport = _b === void 0 ? true : _b;
                if (isReport) {
                    if (reportURL && projectId) {
                        var user = (isType(this.user, 'Number') || isType(this.user, 'String')) ? this.user : JSON.stringify(this.user);
                        var httpHost = window.location.host;
                        var requestUri = window.location.pathname;
                        var ua = window.navigator && window.navigator.userAgent;
                        var pageParams = JSON.stringify({
                            pageName: pageName,
                            pageTime: pageTime
                        });
                        try {
                            AJAX(reportURL, 'POST', {
                                project: projectId,
                                httpHost: httpHost,
                                requestUri: requestUri,
                                user: user,
                                uniqueId: this.uniqueId,
                                ua: ua,
                                pageParams: pageParams
                            }, true, function () {
                            }, function () {
                            }, 0);
                        }
                        catch (e) {
                        }
                        finally {
                        }
                    }
                }
            }
        };
        MeishaWatch.prototype.useVue = function () {
            var msw = this;
            return {
                install: function (Vue) {
                    var ver = Vue.version && Vue.version.split('.') || [];
                    if (+ver[0] >= 2 && +ver[1] >= 2) {
                        Vue.config.errorHandler = function (err, vm, info) {
                            console.error('[MeishaWatch Console]', err);
                            var errMsg = err ? (err.stack ? processStackMsg(err) : err) : '';
                            if (info) {
                                errMsg = "[Info: " + info + "]->" + errMsg;
                            }
                            if (vm && vm.$options && vm.$options.name) {
                                errMsg = "[Component Name: " + vm.$options.name + "]->" + errMsg;
                            }
                            msw.logs = msw.logs.concat([{
                                    msg: errMsg,
                                    url: encodeURIComponent(window.location.href),
                                    type: 'error'
                                }]);
                        };
                    }
                    if (getQueryString('devtools')) {
                        Vue.config.devtools = true;
                    }
                }
            };
        };
        MeishaWatch.prototype.checkLogs = function () {
            clearTimeout(this.timer);
            if (this.logs.length >= 5) {
                this.report();
            }
            else {
                this.timer = setTimeout(this.report, 3000);
            }
        };
        MeishaWatch.prototype.isArray = function (o) {
            return Object.prototype.toString.call(o).slice(8, -1) === 'Array';
        };
        return MeishaWatch;
    }());
    function processStackMsg(error) {
        var stack = error.stack
            .replace(/\n/gi, '')
            .split(/\bat\b/)
            .slice(0, 9)
            .join('@')
            .replace(/\?[^:]+/gi, '');
        var msg = error.toString();
        if (stack.indexOf(msg) < 0) {
            stack = msg + '@' + stack;
        }
        return stack;
    }
    function geneUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    function getQueryString(param) {
        var r = window.location.search.substr(1).match(new RegExp('(^|&)' + param + '=([^&]*)(&|$)', 'i'));
        return r ? decodeURI(r[2]) : '';
    }
    function toDataString(obj) {
        var str = '';
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                str += '&' + prop + '=' + obj[prop];
            }
        }
        return str.slice(1);
    }
    function AJAX(url, method, data, async, successCb, errorCb, outTime) {
        if (async === void 0) { async = true; }
        var isTimeOut = false;
        var xhr = new XMLHttpRequest();
        var timer = setTimeout(function () {
            isTimeOut = true;
            xhr.abort();
        }, outTime);
        xhr.onreadystatechange = function () {
            if (isTimeOut) {
                return;
            }
            ;
            clearTimeout(timer);
            if (xhr.readyState === 4) {
                ((xhr.status === 200) ? successCb : errorCb)(JSON.parse(xhr.responseText));
            }
        };
        xhr.open(method, method.toUpperCase() === 'GET' ? (url + '?' + toDataString(data)) : url, async);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(toDataString(data));
    }
    function isType(val, type) {
        if (type === 'Number' && Number.isNaN(val)) {
            return false;
        }
        return toString.call(val).replace(/.*\s(.*)]$/, '$1') === type;
    }
    function decycle(object, replacer) {
        var obj2Path = new WeakMap();
        return (function derez(value, path) {
            var oldPath;
            var newObj;
            if (replacer !== undefined) {
                value = replacer(value);
            }
            if (typeof value === 'object' && value !== null &&
                !(value instanceof Boolean) &&
                !(value instanceof Date) &&
                !(value instanceof Number) &&
                !(value instanceof RegExp) &&
                !(value instanceof String)) {
                oldPath = obj2Path.get(value);
                if (oldPath !== undefined) {
                    return {
                        $ref: oldPath
                    };
                }
                obj2Path.set(value, path);
                if (Array.isArray(value)) {
                    newObj = value.map(function (v, i) {
                        return derez(v, path + '[' + i + ']');
                    });
                }
                else {
                    newObj = {};
                    Object.keys(value).forEach(function (key) {
                        newObj[key] = derez(value[key], path + '[' + key + ']');
                    });
                }
                return newObj;
            }
            return value;
        }(object, '$'));
    }
    return new MeishaWatch();
});
