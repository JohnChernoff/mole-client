let web_socket;
const SOCK_EVENT = {
    CONNECTION_OPEN: "Connection Open",
    CONNECTION_ALREADY_OPEN: "WebSocket is already opened",
    CONNECTION_INCOMING_MSG: "Incoming Message",
    CONNECTION_CLOSED: "Connection closed",
    CONNECTION_ERROR: "Connection error",
}

function openSocket(url,sockHandler) {

    if (web_socket !== undefined && web_socket.readyState !== WebSocket.CLOSED) {
        sockHandler(SOCK_EVENT.CONNECTION_ALREADY_OPEN); return;
    }

    web_socket = new WebSocket(url);
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

}
