/*
 I'm not sure about the mechanics, but it seems like voting should be possible on any move. Because it only takes one move to lose the game.
Railbird80: like all the mole has to do is hang the queen.
and the arrows should be visible after each move maybe
move history scrollbar
 draw arrows as people vote and have them go away like 5 seconds after the move is made
 after voting it would be cool if player whose move was selected was flashed across the board
fix clock
 */

let main_board_div = document.getElementById("main-board");
let counter = document.getElementById("counter");
let radio_black = document.getElementById("chk_black");
let games_select = document.getElementById("select-games");
let play_tab = document.getElementById("table-players");
let moves_div = document.getElementById("div-movetab");
let moves_range = document.getElementById("range-history");
let score_div = document.getElementById("div-highscores");
let score_tab = document.getElementById("table-highscores");
let lobby_input = document.getElementById("lobby-msg");
let game_input = document.getElementById("game-msg");
let login_butt = document.getElementById("login-butt");
let logout_butt = document.getElementById("logout-butt");
let enter_butt = document.getElementById("enter-butt");
let splash_screen = document.getElementById("div-splash");
let BLACK = "0", WHITE = "1";
let main_board = [];
let move_history = [];
let games;
let selected_game = "";
let selected_player;
let timer;
let seconds = 0;
let zug_board;
let lichess = new LichessLogger("https://lichess.org", "molechess.com"); //"example.com");
let oauth_token = null;

window.addEventListener("keyup", e => { //console.log("Key up: " + e.code);
    if (e.code === "Enter") {
        if (lobby_input === document.activeElement) sendChat(lobby_input,"lobby");
        else if (game_input === document.activeElement) sendChat(game_input, selected_game);
    }
} , false);

games_select.addEventListener("change", () =>  {
    selected_game = games_select.value;
    console.log("Selected: " + selected_game);
    send("update", selected_game);
});

function countdown(data) {
    if (timer !== null) clearInterval(timer);
    seconds = parseInt(data);
    counter.textContent = "Time: " + seconds;
    timer = setInterval(() => {
        counter.textContent = "Time: " + (--seconds);
        if (seconds <= 0) clearInterval(timer);
    },1000);
}

function initGame() {
    zug_board = new ZugBoard(main_board_div,sendMove,onPieceLoad,{
        square: { black: "#227722", white: "#AAAA88" },
        //square: { black: "#884444", white: "#22AAAA" },
        //square: { black: "#9B5C5C", white: "#5C9B5C" },
        piece: { black: "#000000", white: "#FFFFFF"}
    });
}

function onPieceLoad() {
    console.log("Pieces loaded");
    initLichess().then(() => showLogin());
}

function showLogin() {
    logout_butt.style.display = "inline";
    enter_butt.style.display = "none";
    if (oauth_token === null) {
        login_butt.style.display = "inline";
    }
    else {
        login_butt.style.display = "none";
        fetch("https://lichess.org/api/account",{
            method: "get",
            headers:{ 'Accept':'application/json', 'Authorization': `Bearer ` + oauth_token }
        }).then(result => result.json()).then(json => {
            enter_butt.textContent = "Login as " + json.username;
            enter_butt.style.display = "inline";
        });
    }
}

async function initLichess() {
    let token = lichess.getCookie("lichess_oauth");
    await lichess.init().then(() => {
        if (lichess.accessContext) { //console.log(JSON.stringify(lichess.accessContext));
            oauth_token = lichess.accessContext.token.value;
            if (token !== oauth_token) lichess.setCookie("lichess_oauth",oauth_token);
        }
        else if (token !== "") oauth_token = token;
    });
}

function login() { lichess.login(); }
function logout() {
    lichess.logout().then(() => {
        oauth_token = null; lichess.setCookie("lichess_oauth",""); showLogin();
    });
}
function enterGame() {
    splash_screen.style.display = "none";
    window.onresize = () => { zug_board.resize(main_board,main_board_div); zug_board.drawGridBoard(main_board); };
    zug_board.updateBoard();
    if (oauth_token !== null) startSocket();
}

function sendMove(move) {
    if (selected_game !== undefined) {
        send("move", {
            move: ZugBoard.getAlgebraicMove(move),
            board: selected_game,
            promotion: move.promotion
        });
    }
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

function updateGame(game) { //console.log("Update Game: " + JSON.stringify(game));
    if (game.title === selected_game) {
        if (game.currentFEN !== undefined) zug_board.updateBoard(game.currentFEN);
        if (game.history !== undefined) updateMoveList(game.history);
        updatePlayTab(game);
    }
}

function updateMoveList(history) { //console.log(JSON.stringify(data));
    clearElement(moves_div);
    move_history = [history.length];
    let move_tab = document.createElement("table");
    let move_row = document.createElement("tr");
    let n = 0;
    for (let i=0; i<history.length; i++) {
        move_history[i] = {
            ply: i,
            turn: history[i].turn,
            fen: history[i].fen,
            selected: history[i].selected,
            alts: history[i].alts
        };
        let move_entry = document.createElement("td");
        let m = ""; if (i % 2 === 0) m = (++n) + ".";
        if (history[i].selected.length > 0) {
            move_entry.textContent =
                m + history[i].selected[0].move.from + "-" + history[i].selected[0].move.to;
        }
        else move_entry.textContent = "?";
        move_entry.onclick = () => { displayMoves(move_history[i]); };
        move_row.appendChild(move_entry);
        if ((i+1) % 4 === 0) {
            move_tab.appendChild(move_row);
            move_row = document.createElement("tr");
        }
        else if (i === history.length-1) {
            move_tab.appendChild(move_row);
        }
    }
    moves_div.appendChild(move_tab);
    moves_range.max = history.length-1; //TODO: buggy?
}

function updateGames(data) { //console.log("Data: " + JSON.stringify(data));
    games = data;
    clearElement(games_select);
    let selected_game_exists = false;
    for (let i=0; i<games.length; i++) {
        let title_opt = document.createElement("option");
        title_opt.text = games[i].title; title_opt.value = games[i].title;
        games_select.appendChild(title_opt);
        if (games[i].title === selected_game) {
            games_select.selectedIndex = i; selected_game_exists = true;
            updatePlayTab(games[i]);
        }
    }
    if (!selected_game_exists) {
        if (games.length > 0) {
            selected_game = games[0].title;
            updatePlayTab(games[0]);
        }
        else selected_game = "";
    }
}

function updatePlayTab(game) { //console.log(JSON.stringify(game));
    clearElement(play_tab);
    play_tab.appendChild(getHeaders(["Player","Color","Rating","Accuse","Kick"]));
    for (let t=0;t<2;t++) {
        for (let p = 0; p < game.teams[t].players.length; p++) {
            play_tab.appendChild(playRow(game.teams[t].players[p],game.title));
        }
    }
    //for (let i=0; i<games.length; i++) { if (selected_game === games[i].title) {   }  }
}

function getHeaders(txt) {
    let head_row = document.createElement("tr");
    for (let i=0;i<txt.length;i++) {
        let head_txt = document.createElement("th"); head_txt.scope = "col"; head_txt.textContent = txt[i];
        head_row.appendChild(head_txt);
    }
    return head_row;
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

    let play_color = document.createElement("td");
    play_color.style.background = pdata.game_col === 0 ? "black" : "white";
    play_color.style.width = "8px";
    play_row.appendChild(play_color);

    let play_rating = document.createElement("td");
    if (pdata.user.data) play_rating.textContent = pdata.user.data.rating; else play_rating.textContent = "?";
    play_row.appendChild(play_rating);

    play_row.appendChild(getActionButton(title,pdata.user.name,"voteoff",true));
    play_row.appendChild(getActionButton(title,pdata.user.name,"kickoff",pdata.kickable));

    return play_row;
}

function getActionButton(board,player,action_msg,active) {
    let play_col = document.createElement("td");
    let play_butt = document.createElement("button");
    if (active) {
        play_butt.textContent = "X"; play_butt.addEventListener("click",() => {
            send(action_msg,{ player: player, board: board });
        });
    }
    else play_butt.textContent = "-";
    play_col.appendChild(play_butt);
    return play_col;
}

function updateHighScores(data) {
    clearElement(score_tab);
    for (let i=0;i<data.length;i++) {
        let row = document.createElement("tr");
        let play_field = document.createElement("td");
        play_field.textContent = data[i].name;
        let rating_field = document.createElement("td");
        rating_field.textContent = data[i].rating;
        row.appendChild(play_field); row.appendChild(rating_field);
        score_tab.appendChild(row);
    }
}

function showHighScores() {
    score_div.style.display = "block";
    send("top",10);
}

function clearElement(e) {
    while (e.firstChild) e.removeChild(e.lastChild);
}

function createGame() {
    let title = prompt("Enter a new game title");
    if (title !== "null") send("newgame",title);
}

function joinGame() {
    send("joingame",{ title: selected_game, color: radio_black.checked ? BLACK : WHITE });
}

function gameCmd(cmd) {
    if (selected_game !== undefined) send(cmd, selected_game);
}

function rangeSelect() { //TODO: game change bug
    displayMoves(move_history[moves_range.value]);
}

function flipBoard() {
    zug_board.flip();
}

function sendChat(input, source) {
    let msg = input.value;
    if (msg.startsWith("!") && msg.length > 1) {
        let tokens = msg.substring(1).split(" ");
        let cmd = tokens.shift();
        send("cmd",{ cmd: cmd, args: tokens });
    }
    else {
        send("chat",{ msg: input.value, source: source });
    }
    input.value = "";
}

let toggle = true;
function test() { toggle = !toggle; }
