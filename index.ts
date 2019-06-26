const domain = "srcds.devan.network"

const servers = [
    "devan.network:27015",
    "devan.network:27020",
    "devan.space:27015",
    "devan.space:27020"
];

interface IInfoResponse {
    type: string;
    version: number;
    serverName: string;
    map: string;
    gameType: string;
    gameName: string;
    appID: number;
    numPlayers: number;
    maxPlayers: number;
    numBots: number;
    dedicated: string;
    os: string;
    password: number;
    secure: boolean;
    gameVersion: string;
    ip: string;
    port: number;
    pw: boolean;
}

class Server {

    private ip: string;
    private port: string;
    public data: IInfoResponse | null;

    constructor(ip: string, port: string) {
        this.ip = ip;
        this.port = port;
        this.data = null;
        this.fetchServerInfo();
    }

    async fetchServerInfo() {
        const url = `https://${domain}/?ip=${this.ip}&port=${this.port}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.status !== "error") {
            const serverData = Object.assign({}, json, {
                status: "available",
                mapImage: `/images/maps/${json.map}.png`,
                connect: `steam://connect/${json.ip}:${json.port}`,
                loading: false
            });

            return serverData;
        }
    }

    render() {
        const serverNode = document.createElement("div");
        const text = document.createTextNode(this.ip);
        serverNode.appendChild(text);
        serverNode.appendChild(text);
        return serverNode;
    }
}

class View {

    servers: string[];

    constructor(servers: string[]) {
        this.servers = servers;
    }

    mount(id: string) {
        const _mount = document.getElementById(id);
        if (!_mount) {
            throw new Error("No element to mount to");
        }

        const serverNodes = this.servers.map(server => {
            const [ip, port] = server.split(":");
            const s = new Server(ip, port);
            return s.render();
        });

        serverNodes.forEach(n => {
            _mount.appendChild(n);

        });

    }
}



// // create vue control
// const serverControl = new Vue({
//     el: "#servers",

//     // initial data seed
//     data: {
//         servers: []
//     },

//     created() {
//         this.servers = servers.map((url) => {
//             return Object.assign({}, serverTemplate, {
//                 url: url,
//                 serverName: url
//             });
//         });

//         this.fetchData();
//     },

//     methods: {
//         fetchData: function () {
//             this.servers.forEach((server, index) => {
//                 const [ip, port] = server.url.split(":");
//                 this.fetchServerInfo(ip, port, index);
//             });
//         },
//         fetchServerInfo: async function (ip, port, index) {
//             const url = `https://${domain}/?ip=${ip}&port=${port}`;
//             const response = await fetch(url);
//             const json = await response.json();
//             if (json.status !== "error") {
//                 const serverData = Object.assign({}, serverTemplate, json, {
//                     status: "available",
//                     mapImage: `/images/maps/${json.map}.png`,
//                     gameImage: `/images/games/${convertToGame(json.gameName)}.png`,
//                     connect: `steam://connect/${json.ip}:${json.port}`,
//                     loading: false
//                 });

//                 Vue.set(this.servers, index, serverData);
//             }
//             else {
//                 const serverData = Object.assign({}, serverTemplate, this.servers[index], {
//                     status: "error",
//                     loading: false
//                 });

//                 Vue.set(this.servers, index, serverData);
//             }
//         }
//     }
// });