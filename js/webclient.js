let web_socket;
const SOCK_EVENT = {
    CONNECTION_OPEN: "Connection Open",
    CONNECTION_ALREADY_OPEN: "WebSocket is already opened",
    CONNECTION_INCOMING_MSG: "Incoming Message",
    CONNECTION_CLOSED: "Connection closed",
    CONNECTION_ERROR: "Connection error",
}
const SERV = "serv";

function startSocket() {
    openSocket(MOLE_ENV.host,gameSockHandler);
}

function openSocket(url,sockHandler) {
    if (web_socket !== undefined && web_socket.readyState !== WebSocket.CLOSED) {
        sockHandler(SOCK_EVENT.CONNECTION_ALREADY_OPEN); return;
    }

    web_socket = new WebSocket(url); if (web_socket === undefined) return false;
    web_socket.onopen = event => {
        sockHandler(SOCK_EVENT.CONNECTION_OPEN,event);
    };

    web_socket.onmessage = event => {  //console.log("Data: " + event.data);
        sockHandler(SOCK_EVENT.CONNECTION_INCOMING_MSG,event);
    };

    web_socket.onclose = event => {
        sockHandler(SOCK_EVENT.CONNECTION_CLOSED,event);
    };

    web_socket.onerror = event => {
        sockHandler(SOCK_EVENT.CONNECTION_ERROR,event);
    }

    return true;
}

function gameSockHandler(event_type,event) {
    switch (event_type) {
        case SOCK_EVENT.CONNECTION_ALREADY_OPEN:
            console.log(SOCK_EVENT.CONNECTION_ALREADY_OPEN); break;
        case SOCK_EVENT.CONNECTION_OPEN:
            console.log(SOCK_EVENT.CONNECTION_OPEN);
            if (event.data !== undefined) { handleMessage(event.data,SERV); }
            if (obs) send("obs",obs); else send("login",oauth_token);
            break;
        case SOCK_EVENT.CONNECTION_INCOMING_MSG:
            let json = JSON.parse(event.data);
            if (json.type !== undefined && json.data !== undefined) msgHandler(json.type,json.data);
            break;
        case SOCK_EVENT.CONNECTION_CLOSED:
            handleMessage("Connection closed",SERV);
            break;
        case SOCK_EVENT.CONNECTION_ERROR:
            handleMessage("Connection error: " + event.data,SERV);
            break;
    }
}

function send(type,data) {
    if (web_socket === undefined || web_socket.readyState === WebSocket.CLOSED) { handleMessage("Not connected",SERV); }
    else { web_socket.send(JSON.stringify({type: type, data: data ? data : ""})); }
}

function closeSocket() {
    handleMessage("Closing socket...",SERV);
    web_socket.close();
}

let username = "?";
function msgHandler(type,data) { console.log("Msg Type: " + type); // + ", Data: " + JSON.stringify(data));
    if (type === "chat") {
        if (data.source === "serv") handleMessage(data.user + ": " + data.msg,data.source,null);
        else handleMessage(data.player.user.name + ": " + data.msg,data.source,data.player);
    }
    else if (type === "serv_msg") handleMessage(data.msg,data.source,data.player);
    else if (type === "game_msg") handleMessage(data.msg,data.source,data.player);
    else if (type === "err_msg") handleMessage(data.msg,data.source);
    else if (type === "log_OK")  { handleMessage(data.welcome,SERV); username = data.name; }
    else if (type === "info") handleMessage(JSON.stringify(data),SERV);
    else if (type === "games_update") updateGames(data);
    else if (type === "game_update") updateGame(data);
    else if (type === "role" && !obs) notifyRole(data.msg,data.source);
    else if (type === "top") updateHighScores(data);
    else if (type === "users") showPlayers(data.users);
    else if (type === "phase") { newPhase(data); }
    else if (type === "status") { handleStatus(data.msg, data.source); }
    else if (type === "votelist") { handleVote(data.list, data.move, data.source); }
    else if (type === "side") { flipAtStart(data.color === "black"); }
    else if (type === "move") { handleMove(data); }
    else if (type === "move_conf") { moveConfirm(data.player,data.move,data.san,data.game.title); }
    else if (type === "defection") { handleDefection(data); }
    else if (type === "rampage") { handleRampage(data); }
    else if (type === "options") { showGameOptions(data); }
    else if (type === "join") { selected_game = data.title; current_fen = START_FEN; updateGame(data); }
    else if (type === "part") { partGame(data); }
    else if (type === "veto") {}
    else if (type === "history") { showHistory(data.pgn_list,JSON.stringify(data.player_data)); }
    else if (type === "ping") { send("pong","pong"); }
    else if (type === "conn_stat") { console.log("Connection Status: " + data.msg); }
    else if (type === "spam") { alert(data.msg); }
    else if (type === "molebomb") {
        openModalWindow(document.getElementById("div-bomb"));
        playSFX(AUDIO_CLIPS.sound.enum.BOMB);
    }
    //else if (type === "countdown") countdown(data.title, data.turn, data.seconds);
    //else if (type === "movelist") updateMoveList(data);
    else {
        console.log("Unknown Type: " + type);
    }
}
