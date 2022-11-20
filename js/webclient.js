//let sock_butt = document.getElementById("sock-butt");
let txt_messages = document.getElementById("txt-messages");

function startSocket() {
    //openSocket("wss://molechess.com/server",sockHandler);
    openSocket("ws://localhost:5555",sockHandler);
}

function sockHandler(event_type,event) {
    switch (event_type) {
        case SOCK_EVENT.CONNECTION_ALREADY_OPEN:
            console.log(SOCK_EVENT.CONNECTION_ALREADY_OPEN); break;
        case SOCK_EVENT.CONNECTION_OPEN:
            console.log(SOCK_EVENT.CONNECTION_OPEN);
            if (event.data !== undefined) { writeResponse(event.data); }
            //sock_butt.innerHTML = "Disconnect"; sock_butt.onclick = () => { closeSocket(); };
            send("login",oauth_token); //send("login",prompt("Enter your name"));
            break;
        case SOCK_EVENT.CONNECTION_INCOMING_MSG:
            let json = JSON.parse(event.data);
            if (json.type !== undefined && json.data !== undefined) msgHandler(json.type,json.data);
            break;
        case SOCK_EVENT.CONNECTION_CLOSED:
            writeResponse("Connection closed");
            sock_butt.innerHTML = " Connect ";
            sock_butt.onclick = () => { openSocket(); };
            break;
        case SOCK_EVENT.CONNECTION_ERROR:
            writeResponse("Connection error: " + event.data);
            break;
    }
}

function send(type,data) {
    if (web_socket === undefined || web_socket.readyState === WebSocket.CLOSED) { writeResponse("Not connected"); }
    else { web_socket.send(JSON.stringify({type: type, data: data})); }
}

function closeSocket() {
    console.log("Closing socket...");
    web_socket.close();
    sock_butt.innerText = "Connect";
}

function msgHandler(type,data) { //console.log("Type: " + JSON.stringify(type) + ", Data: " + JSON.stringify(data));
    if (type === "serv_msg") handleMessage(data.msg,"serv");
    else if (type === "chat") handleMessage(data.player + ": " + data.msg,data.source);
    else if (type === "err_msg") handleMessage(data.msg,"serv");
    else if (type === "log_OK") handleMessage(data.msg,"serv");
    else if (type === "info") handleMessage(JSON.stringify(data),"serv");
    else if (type === "games_update") updateGames(data);
    else if (type === "game_update") updateGame(data);
    else if (type === "countdown") countdown(data);
    else if (type === "mole") notifyMole();
    else if (type === "top") updateHighScores(data);
    else if (type === "users") showPlayers(data.users);
    else if (type === "phase") { console.log("New phase: " + data.msg); }
    //else if (type === "movelist") updateMoveList(data);
    else {
        console.log("Unknown Type: " + type);
    }
}
