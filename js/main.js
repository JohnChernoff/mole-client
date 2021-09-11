/*
 I'm not sure about the mechanics, but it seems like voting should be possible on any move. Because it only takes one move to lose the game.
Railbird80: like all the mole has to do is hang the queen.
and the arrows should be visible after each move maybe
move history scrollbar
 draw arrows as people vote and have them go away like 5 seconds after the move is made
 */

let main_board_div = document.getElementById("main-board");
let counter = document.getElementById("counter");
let radio_black = document.getElementById("chk_black");
let games_div = document.getElementById("div-games");
let moves_div = document.getElementById("div-movetab");
let moves_range = document.getElementById("range-history");
let lobby_input = document.getElementById("lobby-msg");
let game_input = document.getElementById("game-msg");
let BLACK = "0", WHITE = "1";
let main_board = [];
let move_history = [];
let selected_game;
let selected_player;
let timer;
let seconds = 0;
let zug_board;
let lichess = new LichessLogger("https://lichess.org","example.com");

window.addEventListener("keyup", e => { //console.log("Key up: " + e.code);
    if (e.code === "Enter") {
        if (lobby_input === document.activeElement) sendChat(lobby_input,"lobby");
        else if (game_input === document.activeElement) sendChat(game_input, selected_game);
    }
} , false);

function initGame() {
    let token = lichess.getCookie("lichess_oauth");
    lichess.init().then(() => {
        if (lichess.accessContext) { //console.log(JSON.stringify(lichess.accessContext));
            oauth_token = lichess.accessContext.token.value;
            if (token === "") lichess.setCookie("lichess_oauth",oauth_token);
        }
        else {
            if (token !== "") oauth_token = token;
            else lichess.login(); //.then(console.log("logged in"));
        }
        if (oauth_token !== null) startSocket();
    });
    zug_board = new ZugBoard(main_board_div,onMove,onPieceLoad,{
        square: { black: "#227722", white: "#AAAA88" },
        //square: { black: "#884444", white: "#22AAAA" },
        //square: { black: "#9B5C5C", white: "#5C9B5C" },
        piece: { black: "#000000", white: "#FFFFFF"}
    });
}

function onPieceLoad() {
    console.log("Pieces loaded");
    window.onresize = () => { zug_board.resize(main_board,main_board_div); zug_board.drawGridBoard(main_board); };
    zug_board.updateBoard();
}

function onMove(move) {
    if (selected_game !== undefined) {
        send("move", {
            move: ZugBoard.getAlgebraicMove(move),
            board: selected_game,
            promotion: move.promotion
        });
    }
}

function updateGame(data) { //console.log("Update Data: " + JSON.stringify(data));
    if (data.fen !== undefined) zug_board.updateBoard(data.fen);
}

function countdown(data) {
    if (timer !== null) clearInterval(timer);
    seconds = parseInt(data);
    counter.textContent = "" + seconds;
    timer = setInterval(() => {
        counter.textContent = "" + (--seconds);
        if (seconds <= 0) clearInterval(timer);
    },1000);
}

function displayMoves(moves) { //console.log("Displaying Move:" + JSON.stringify(moves));
    zug_board.updateBoard(moves.fen);
    for (let i=0;i<moves.selected.length;i++) {
        zug_board.drawArrow(moves.selected[0].move,
            moves.selected[i].player === null ? "#555555" : moves.selected[i].player.play_col);
    }
    for (let i=0;i<moves.alts.length;i++) {
        zug_board.drawArrow(moves.alts[i].move,moves.alts[i].player.play_col);
    }
    moves_range.value = moves.ply;
}

function clearElement(e) {
    while (e.firstChild) e.removeChild(e.lastChild);
}

function updateMoveList(data) { //console.log(JSON.stringify(data));
    clearElement(moves_div);
    move_history[data.title] = [data.history.length];
    let move_tab = document.createElement("table");
    let move_row = document.createElement("tr");
    let n = 0;
    for (let i=0; i<data.history.length; i++) {
        move_history[data.title][i] = {
            ply: i,
            turn: data.history[i].turn,
            fen: data.history[i].fen,
            selected: data.history[i].selected,
            alts: data.history[i].alts
        };
        let move_entry = document.createElement("td");
        let m = ""; if (i % 2 === 0) m = (++n) + ".";
        if (data.history[i].selected.length > 0) {
            move_entry.textContent =
                m + data.history[i].selected[0].move.from + "-" + data.history[i].selected[0].move.to;
        }
        else move_entry.textContent = "?";
        move_entry.onclick = () => { displayMoves(move_history[data.title][i]); };
        move_row.appendChild(move_entry);
        if ((i+1) % 4 === 0) {
            move_tab.appendChild(move_row);
            move_row = document.createElement("tr");
        }
        else if (i === data.history.length-1) {
            move_tab.appendChild(move_row);
        }
    }
    moves_div.appendChild(move_tab);
    moves_range.max = data.history.length-1; //TODO: obviously buggy
}

function updateGameTable(data) { //console.log("Data: " + JSON.stringify(data));
    clearElement(games_div);
    for (let i=0; i<data.length; i++) {
        let game_tab = document.createElement("table");
        let title_row = document.createElement("tr");
        title_row.style.borderColor = "black";
        title_row.style.flexGrow = "0";
        let title_butt = document.createElement("button");
        title_butt.textContent = data[i].title;
        title_butt.addEventListener("click", () =>  {
            send("joingame",{ title: data[i].title, color: radio_black.checked ? BLACK : WHITE });
            selected_game = data[i].title;
        });
        let game_chk = document.createElement("input");
        game_chk.type = "radio"; game_chk.name = "game_chk";
        if (selected_game === data[i].title) game_chk.checked = true;
        game_chk.addEventListener("click", () => {
            selected_game = data[i].title; console.log("Selected: " + selected_game);
        });
        let title_butt_td = document.createElement("td"); title_butt_td.appendChild(title_butt);
        let title_chk_td = document.createElement("td"); title_chk_td.appendChild(game_chk);
        title_row.appendChild(title_butt_td);
        title_row.appendChild(title_chk_td);
        game_tab.appendChild(title_row);
        for (let t=0;t<2;t++) {
            for (let p = 0; p < data[i].teams[t].players.length; p++) {
                game_tab.appendChild(playRow(data[i].teams[t].players[p],data[i].title));
            }
        }
        games_div.appendChild(game_tab);
    }
}

function playRow(pdata,title) { //console.log(JSON.stringify(pdata));
    let play_row = document.createElement("tr");
    let play_name = document.createElement("td");
    play_name.innerHTML = pdata.away ? pdata.user.name.strike() : pdata.user.name; //+= "(away)";
    play_name.style.color = "black";
    play_name.style.background = pdata.play_col;
    if (selected_player !== undefined && selected_player.name === pdata.user.name && selected_player.title === title) {
        selected_player.element = play_name;
        selected_player.element.style.background = "#AAAAAA";
    }
    play_name.onclick = () => {
        if (selected_player !== undefined) { //console.log("Unselected: " + JSON.stringify(selected_player));
            selected_player.element.style.background = selected_player.color;
            if (selected_player.name === pdata.user.name && selected_player.title === title) {
                selected_player = undefined; return;
            }
        }
        play_name.style.background = "#AAAAAA";
        selected_player = { element: play_name, color: pdata.play_col, name: pdata.user.name, title: title };
    }
    play_row.appendChild(play_name);
    let play_col = document.createElement("td");
    play_col.style.background = pdata.game_col === 0 ? "black" : "white";
    play_col.style.width = "8px";
    play_row.appendChild(play_col);
    //let play_score = document.createElement("td");
    //play_score.textContent = pdata.score; play_row.appendChild(play_score);
    return play_row;
}

function castVote() {
    if (selected_player !== null) {
        send("voteoff",{
            suspect: selected_player.name,
            board: selected_game
        });
    }
}

function createGame() {
    let title = prompt("Enter a new game title");
    if (title !== "null") send("newgame",title);
}

function gameCmd(cmd) {
    if (selected_game !== undefined) send(cmd, selected_game);
}

function rangeSelect() {
    displayMoves(move_history[selected_game][moves_range.value]);
}

function flipBoard() {
    zug_board.flip();
}

function sendChat(input, source) {
    send("chat",{ msg: input.value, source: source });
    input.value = "";
}

let toggle = true;
function test() { toggle = !toggle; }
