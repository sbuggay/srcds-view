const domain = "srcds.devan.network"

enum EInfoState {
    None,
    Loading,
    Loaded,
    Error
}

interface IInfoData { // Data returned from a normal A2S_INFO Query
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

interface IServer {
    ip: string;
    port: string;
    state: EInfoState;
    data?: IInfoData;
}

// Helper function to create a div
function div(className: string, innerText?: string) {
    const div = document.createElement("div");
    div.innerText = innerText || "";
    div.className = className || "";
    return div;
}

function loadingSpinner() {
    const container = div("lds-ellipsis");
    container.appendChild(div(""));
    container.appendChild(div(""));
    container.appendChild(div(""));
    return container;
}

function render(server: IServer) {

    // Set up containers
    const container = div("server");
    const left = div("left");
    const right = div("right");

    // Set up structure
    container.appendChild(left);
    container.appendChild(right);

    // Add the title, which will always appear
    left.appendChild(div("title", server.data ? server.data.serverName : `${server.ip}:${server.port}`));

    switch (server.state) {
        case EInfoState.Loaded:
            if (server.data) {

                // Details
                left.appendChild(div("map", server.data.map));
                left.appendChild(div("players", `${server.data.numPlayers} / ${server.data.maxPlayers} players`));

                // Create connect button
                const buttonLink = document.createElement("a");
                buttonLink.href = `steam://connect/${server.ip}:${server.port}`;
                buttonLink.classList.add("connect");
                buttonLink.innerText = "Connect";
                right.appendChild(buttonLink);

                // Update container to change border
                container.classList.add("available");
            }
            break;
        case EInfoState.Error:
            container.classList.add("error");
            left.appendChild(div("error", "Not able to reach game server"));
            break;
        case EInfoState.None:
        case EInfoState.Loading:
            // Add loading spinner
            const loading = div("loading");
            loading.appendChild(loadingSpinner());
            container.appendChild(loading);
            break;
        default:
            break;
    }

    return container;
}

async function fetchServerInfo(ip: string, port: string) {
    const url = `https://${domain}/?ip=${ip}&port=${port}`;

    const response = await fetch(url);
    const json = await response.json();

    if (json.status === "error") {
        throw new Error(json.status);
    }

    return json;
}

class View {

    _mount: HTMLElement | null;
    servers: IServer[];

    constructor(servers: string[]) {
        this.servers = servers.map((server) => {
            const [ip, port] = server.split(":");
            return {
                ip,
                port,
                state: EInfoState.None
            }
        });

        this._mount = null;
    }

    refresh() {
        this.servers.forEach((server) => {
            server.state = EInfoState.Loading;
            fetchServerInfo(server.ip, server.port).then(response => {
                // Surely there is a better way to update this instead of being in it's own forEach..
                server.state = EInfoState.Loaded;
                server.data = response;
                this.render();
            }).catch(error => {
                server.state = EInfoState.Error;
                this.render();
            });
        });

        // Intial render
        this.render();
    }

    clearMount() {
        if (!this._mount) return;
        this._mount.innerHTML = ""; // best way to empty an element?
    }

    appendMount(elem: HTMLElement) {
        if (!this._mount) return;
        this._mount.appendChild(elem);
    }

    render() {
        // Clear out mounted element
        this.clearMount();

        // Render each server.. This means that we do N full rerenders per refresh, N being number of servers.
        this.servers.forEach(server => {
            this.appendMount(render(server));
        });

    }

    mount(id: string, timeout?: number) {
        this._mount = document.getElementById(id);
        if (!this._mount) {
            throw new Error("No element to mount to");
        }

        this.refresh();
    }
}
