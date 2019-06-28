"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var domain = "srcds.devan.network";
var EInfoState;
(function (EInfoState) {
    EInfoState[EInfoState["None"] = 0] = "None";
    EInfoState[EInfoState["Loading"] = 1] = "Loading";
    EInfoState[EInfoState["Loaded"] = 2] = "Loaded";
    EInfoState[EInfoState["Error"] = 3] = "Error";
})(EInfoState || (EInfoState = {}));
function div(className, innerText) {
    var div = document.createElement("div");
    div.innerText = innerText || "";
    div.className = className || "";
    return div;
}
function loadingSpinner() {
    var container = div("lds-ellipsis");
    container.appendChild(div(""));
    container.appendChild(div(""));
    container.appendChild(div(""));
    return container;
}
function render(server) {
    var container = div("server");
    var left = div("left");
    var right = div("right");
    container.appendChild(left);
    container.appendChild(right);
    left.appendChild(div("title", server.data ? server.data.serverName : server.ip + ":" + server.port));
    switch (server.state) {
        case EInfoState.Loaded:
            if (server.data) {
                left.appendChild(div("map", server.data.map));
                left.appendChild(div("players", server.data.numPlayers + " / " + server.data.maxPlayers + " players"));
                var buttonLink = document.createElement("a");
                buttonLink.href = "steam://connect/" + server.ip + ":" + server.port;
                buttonLink.classList.add("connect");
                buttonLink.innerText = "Connect";
                right.appendChild(buttonLink);
                container.classList.add("available");
            }
            break;
        case EInfoState.Error:
            container.classList.add("error");
            left.appendChild(div("error", "Not able to reach game server"));
            break;
        case EInfoState.None:
        case EInfoState.Loading:
            var loading = div("loading");
            loading.appendChild(loadingSpinner());
            container.appendChild(loading);
            break;
        default:
            break;
    }
    return container;
}
function fetchServerInfo(ip, port) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://" + domain + "/?ip=" + ip + "&port=" + port;
                    return [4, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4, response.json()];
                case 2:
                    json = _a.sent();
                    if (json.status === "error") {
                        throw new Error(json.status);
                    }
                    return [2, json];
            }
        });
    });
}
var View = (function () {
    function View(servers) {
        this.servers = servers.map(function (server) {
            var _a = server.split(":"), ip = _a[0], port = _a[1];
            return {
                ip: ip,
                port: port,
                state: EInfoState.None
            };
        });
        this._mount = null;
    }
    View.prototype.refresh = function () {
        var _this = this;
        this.servers.forEach(function (server) {
            server.state = EInfoState.Loading;
            fetchServerInfo(server.ip, server.port).then(function (response) {
                server.state = EInfoState.Loaded;
                server.data = response;
                _this.render();
            })["catch"](function (error) {
                server.state = EInfoState.Error;
                _this.render();
            });
        });
        this.render();
    };
    View.prototype.clearMount = function () {
        if (!this._mount)
            return;
        this._mount.innerHTML = "";
    };
    View.prototype.appendMount = function (elem) {
        if (!this._mount)
            return;
        this._mount.appendChild(elem);
    };
    View.prototype.render = function () {
        var _this = this;
        this.clearMount();
        this.servers.forEach(function (server) {
            _this.appendMount(render(server));
        });
    };
    View.prototype.mount = function (id, timeout) {
        this._mount = document.getElementById(id);
        if (!this._mount) {
            throw new Error("No element to mount to");
        }
        this.refresh();
    };
    return View;
}());
//# sourceMappingURL=index.js.map