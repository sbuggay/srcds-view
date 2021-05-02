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
    host: string;
    port: string;
    state: EInfoState;
    data?: {
        error: any;
        lastSeen: number;
        info: IInfoData;
    };
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

function renderHeader(header: string) {
    const container = div("header");
    const image = document.createElement("img");
    image.src = getIcon(header);
    container.append(image);
    container.append(div("", header));
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
    left.appendChild(div("title", server.data ? server.data.info.serverName : `${server.host}:${server.port}`));

    switch (server.state) {
        case EInfoState.Loaded:
            if (server.data) {

                const info = server.data.info;

                // Details
                left.appendChild(div("detail", `${info.numPlayers} / ${info.maxPlayers} players on ${info.map}`));
                left.appendChild(div("detail", `${info.gameType} ${info.gameVersion}`));


                // Update container to change border
                if (server.data.error) {
                    container.classList.add("error");
                }
                else {
                    // Create connect button
                    const buttonLink = document.createElement("a");
                    buttonLink.href = `steam://connect/${server.host}:${server.port}`;
                    buttonLink.classList.add("connect");
                    buttonLink.innerText = "Connect";

                    const copyDiv = div("copySection");

                    const copyInput = document.createElement("input");
                    copyInput.classList.add("copyInput");
                    copyInput.value = `connect ${server.host}:${server.port}`;
                    copyInput.readOnly = true;

                    const copyButton = document.createElement("button");
                    copyButton.onclick = () => {
                        /* Select the text field */
                        copyInput.select();
                        copyInput.setSelectionRange(0, 99999); /*For mobile devices*/

                        /* Copy the text inside the text field */
                        document.execCommand("copy");
                    }


                    const pasteSpan = document.createElement("span");
                    pasteSpan.className = "icon-paste";

                    copyButton.appendChild(pasteSpan);

                    copyDiv.appendChild(copyInput);
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



class View {

    _mount: HTMLElement | null;
    servers: IServer[];
    domain: string;

    constructor(domain: string, servers?: string[]) {
        this.domain = domain;
        if (servers) {
            this.servers = servers.map((server) => {
                const [host, port] = server.split(":");
                return {
                    host,
                    port,
                    state: EInfoState.None
                }
            });
        }
        else {
            this.servers = [];
        }
        this._mount = null;
    }

    async getServers() {
        const url = `${this.domain}/auto`;
        const response = await fetch(url);
        const json = await response.json();

        return json;
    }

    async fetchServerInfo(ip: string, port: string) {
        const url = `${this.domain}/?host=${ip}&port=${port}`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.status === "error") {
            throw new Error(json.status);
        }

        return json;
    }

    async refresh() {

        // If we weren't supplied hardcoded servers, check for new ones on refresh from domian.

        const servers = await this.getServers();

        this.servers = Object.keys(servers).map(key => {
            const [host, port] = key.split(":");
            return {
                host,
                port,
                state: EInfoState.Loaded,
                data: servers[key]
            }
        });


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

        const buckets = new Map<string, IServer[]>();

        this.servers.forEach(server => {

            console.log(server);

            let category = server.data?.info?.gameName || "Error";

            if (server.state === EInfoState.Loading) {
                category = "Unknown";
            }

            if (buckets.has(category)) {
                buckets.get(category)?.push(server);
            }
            else {
                buckets.set(category, [server]);
            }

        });

        // Push the unknown bucket to the bottom
        const keys = Array.from(buckets.keys()).filter((a, b) => {
            if (a === "Error" || a === "Unknown") return false;
            return true;
        });

        keys.forEach((key) => {
            const servers = buckets.get(key);
            if (!servers) return;
            this.appendMount(renderHeader(key));
            servers.forEach(server => {
                this.appendMount(render(server));
            });
        });

    }


    mount(id: string, timeout?: number) {
        this._mount = document.getElementById(id);
        if (!this._mount) {
            throw new Error("No element to mount to");
        }

        const refreshAndRender = async () => {
            await this.refresh();
            this.render();
        }

        refreshAndRender();
        setInterval(refreshAndRender, 15000);

        this.render();

    }
}

const iconMapping: { [key: string]: string } = {
    "Half-Life": "70_icon.jpg",
    "Half-Life 2 Deathmatch": "320_icon.jpg",
    "Ricochet": "60_icon.jpg",
    "Counter-Strike": "10_icon.jpg",
    "Counter-Strike: Source": "240_icon.jpg",
    "Counter-Strike: Global Offensive": "730_icon.jpg",
}

function getIcon(gamename: string) {
    if (iconMapping[gamename]) {
        return `/icons/${iconMapping[gamename]}`;
    }
    else {
        return "/icons/unknown.jpg";
    }
}