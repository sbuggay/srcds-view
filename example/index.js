"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
function renderHeader(header) {
    var container = div("header");
    var image = document.createElement("img");
    image.src = getIcon(header);
    container.append(image);
    container.append(div("", header));
    return container;
}
function render(server) {
    var container = div("server");
    var left = div("left");
    var right = div("right");
    container.appendChild(left);
    container.appendChild(right);
    left.appendChild(div("title", server.data ? server.data.info.serverName : server.host + ":" + server.port));
    switch (server.state) {
        case EInfoState.Loaded:
            if (server.data) {
                var info = server.data.info;
                left.appendChild(div("detail", info.numPlayers + " / " + info.maxPlayers + " players on " + info.map));
                left.appendChild(div("detail", info.gameType + " " + info.gameVersion));
                if (server.data.error) {
                    container.classList.add("error");
                }
                else {
                    var buttonLink = document.createElement("a");
                    buttonLink.href = "steam://connect/" + server.host + ":" + server.port;
                    buttonLink.classList.add("connect");
                    buttonLink.innerText = "Connect";
                    var copyDiv = div("copySection");
                    var copyInput_1 = document.createElement("input");
                    copyInput_1.classList.add("copyInput");
                    copyInput_1.value = "connect " + server.host + ":" + server.port;
                    copyInput_1.readOnly = true;
                    var copyButton = document.createElement("button");
                    copyButton.onclick = function () {
                        copyInput_1.select();
                        copyInput_1.setSelectionRange(0, 99999);
                        document.execCommand("copy");
                    };
                    var pasteSpan = document.createElement("span");
                    pasteSpan.className = "icon-paste";
                    copyButton.appendChild(pasteSpan);
                    copyDiv.appendChild(copyInput_1);
                    copyDiv.appendChild(copyButton);
                    right.appendChild(copyDiv);
                    right.appendChild(buttonLink);
                    container.classList.add("available");
                }
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
var View = (function () {
    function View(domain, servers) {
        this.domain = domain;
        if (servers) {
            this.servers = servers.map(function (server) {
                var _a = server.split(":"), host = _a[0], port = _a[1];
                return {
                    host: host,
                    port: port,
                    state: EInfoState.None
                };
            });
        }
        else {
            this.servers = [];
        }
        this._mount = null;
    }
    View.prototype.getServers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.domain + "/auto";
                        return [4, fetch(url)];
                    case 1:
                        response = _a.sent();
                        return [4, response.json()];
                    case 2:
                        json = _a.sent();
                        return [2, json];
                }
            });
        });
    };
    View.prototype.fetchServerInfo = function (ip, port) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.domain + "/?host=" + ip + "&port=" + port;
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
    };
    View.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var servers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getServers()];
                    case 1:
                        servers = _a.sent();
                        this.servers = Object.keys(servers).map(function (key) {
                            var _a = key.split(":"), host = _a[0], port = _a[1];
                            return {
                                host: host,
                                port: port,
                                state: EInfoState.Loaded,
                                data: servers[key]
                            };
                        });
                        return [2];
                }
            });
        });
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
        var buckets = new Map();
        this.servers.forEach(function (server) {
            var _a, _b, _c;
            console.log(server);
            var category = ((_b = (_a = server.data) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.gameName) || "Error";
            if (server.state === EInfoState.Loading) {
                category = "Unknown";
            }
            if (buckets.has(category)) {
                (_c = buckets.get(category)) === null || _c === void 0 ? void 0 : _c.push(server);
            }
            else {
                buckets.set(category, [server]);
            }
        });
        var keys = Array.from(buckets.keys()).filter(function (a, b) {
            if (a === "Error" || a === "Unknown")
                return false;
            return true;
        });
        keys.forEach(function (key) {
            var servers = buckets.get(key);
            if (!servers)
                return;
            _this.appendMount(renderHeader(key));
            servers.forEach(function (server) {
                _this.appendMount(render(server));
            });
        });
    };
    View.prototype.mount = function (id, timeout) {
        var _this = this;
        this._mount = document.getElementById(id);
        if (!this._mount) {
            throw new Error("No element to mount to");
        }
        var refreshAndRender = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.refresh()];
                    case 1:
                        _a.sent();
                        this.render();
                        return [2];
                }
            });
        }); };
        refreshAndRender();
        setInterval(refreshAndRender, 15000);
        this.render();
    };
    return View;
}());
var iconMapping = {
    "Half-Life": "70_icon.jpg",
    "Half-Life 2 Deathmatch": "320_icon.jpg",
    "Ricochet": "60_icon.jpg",
    "Counter-Strike": "10_icon.jpg",
    "Counter-Strike: Source": "240_icon.jpg",
    "Counter-Strike: Global Offensive": "730_icon.jpg"
};
function getIcon(gamename) {
    if (iconMapping[gamename]) {
        return "/icons/" + iconMapping[gamename];
    }
    else {
        return "/icons/unknown.jpg";
    }
}
//# sourceMappingURL=index.js.map