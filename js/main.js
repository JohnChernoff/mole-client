/*
 I'm not sure about the mechanics, but it seems like voting should be possible on any move. Because it only takes one move to lose the game.
Railbird80: like all the mole has to do is hang the queen.
and the arrows should be visible after each move maybe
move history scrollbar
 draw arrows as people vote and have them go away like 5 seconds after the move is made
 after voting it would be cool if player whose move was selected was flashed across the board
fix clock
Railbird80: When you review the game it would be cool to see which moves the moles made.

OwenKraweki: wait I mised the beginning
OwenKraweki: idk if i'm the mole

OwenKraweki: is says Bad Move: g2g1
ornicar2: I dig the new board
OwenKraweki: yeah when I tried to play Qc8 is also said bad move

(Owen): also there should be a way to send messages to specific people in the game chat
OwenKraweki: maybe using @

support for the Maxthon Browser

~OwenKraweki: (clock) bottom right
~OwenKraweki: and top right when it's opponents move

arrows after move
clock shift on flip

 */

//let body = document.getElementById("body"));

function createEnum(values) {
    const enumObject = {};
    for (const val of values) enumObject[val] = val;
    return Object.freeze(enumObject);
}

let LAYOUT_STYLES = createEnum('UNDEFINED','HORIZONTAL','VERTICAL');
let layout_style = LAYOUT_STYLES.UNDEFINED;
let main_div = document.getElementById("div-main");
let main_board_div = document.getElementById("main-board");
let comm_div = document.getElementById("div-comm");
let games_div = document.getElementById("div-games");
let moves_div = document.getElementById("div-moves");
let top_clock = document.getElementById("counter-top");
let bottom_clock = document.getElementById("counter-bottom");
let radio_black = document.getElementById("chk_black");
let games_select = document.getElementById("select-games");
let play_tab = document.getElementById("table-players");
let moves_list = document.getElementById("div-movetab");
let moves_range = document.getElementById("range-history");
let score_div = document.getElementById("div-highscores");
let score_tab = document.getElementById("table-highscores");
let lobby_chk = document.getElementById("chk_lobby");
let chat_input = document.getElementById("chat-msg");
let login_butt = document.getElementById("login-butt");
let logout_butt = document.getElementById("logout-butt");
let enter_butt = document.getElementById("enter-butt");
let splash_screen = document.getElementById("div-splash");
let BLACK = 0, WHITE = 1;
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
        if (chat_input === document.activeElement) {
            if (lobby_chk.checked) sendChat(chat_input,"lobby");
            else sendChat(chat_input,selected_game);
        }
    }
} , false);

games_select.addEventListener("change", () =>  {
    selected_game = games_select.value;
    console.log("Selected: " + selected_game);
    send("update", selected_game);
});

function countdown(data) { //console.log(JSON.stringify(data));
    if (data.title !== selected_game) return;
    if (timer !== null) clearInterval(timer);
    bottom_clock.style.display = 'none'; top_clock.style.display = 'none';
    let counter = data.turn === BLACK ?
        zug_board.povBlack ? bottom_clock : top_clock :
        zug_board.povBlack ? top_clock : bottom_clock;
    counter.style.display = 'flex';
    let seconds = data.seconds;
    counter.textContent = "Time: " + seconds;
    timer = setInterval(() => {
        counter.textContent = "Time: " + (--seconds);
        if (seconds <= 0) clearInterval(timer);
    },1000);
}

function initGame() {
    zug_board = new ZugBoard(main_board_div,sendMove,onPieceLoad,{ board_tex: "plain", pieces: "comp" },{
        square: { black: "#2F4F4F", white: "#AAAA88" }, //square: { black: "#227722", white: "#AAAA88" },
        piece: { black: "#000000", white: "#FFFFFF"}
    });
}

function onPieceLoad() {
    console.log("Pieces loaded");
    initLichess().then(() => showLogin());
}

function showLogin() {
    logout_butt.style.display = "inline"; enter_butt.style.display = "none";
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
    window.onresize = () => { resize(); }; resize();
    if (oauth_token !== null) startSocket();
}

function resize() {
    setLayout();
    zug_board.resize(main_board,main_board_div);
}

function setLayout() {
    let main_div_size;
    if (window.innerWidth > window.innerHeight) {
        layout_style = LAYOUT_STYLES.HORIZONTAL;
        comm_div.style.left = "0px";
        comm_div.style.top = "0px";
        comm_div.style.width = "20vw";
        comm_div.style.height = "99vh";

        main_div_size = Math.floor(Math.min(window.innerWidth /2, window.innerHeight * .89));
        let extra_width = ((window.innerWidth/2) - main_div_size)/2;
        main_div.style.left = Math.floor((window.innerWidth * .25) + (extra_width > 0 ? extra_width : 0)) + "px";

        games_div.style.left = "80vw";
        games_div.style.top = "0px";
        games_div.style.width = "20vw";
        games_div.style.height = "49vh";

        moves_div.style.left = "80vw";
        moves_div.style.top = "50vh";
        moves_div.style.width = "20vw";
        moves_div.style.height = "49vh";
    }
    else {
        layout_style = LAYOUT_STYLES.VERTICAL;
        comm_div.style.left = "0px";
        comm_div.style.top = "0px";
        comm_div.style.width = "30vw";
        comm_div.style.height = "99vh";

        main_div_size = Math.floor(window.innerWidth * .67);
        main_div.style.left = "33vw"; //(window.innerWidth * .25) + "px";

        let lower_div_height = Math.floor(window.innerWidth * .70);

        games_div.style.left = "33vw";
        games_div.style.top = lower_div_height + "px";
        games_div.style.width =  (main_div_size / 2) + "px";
        games_div.style.height = (window.innerHeight - lower_div_height) + "px";

        moves_div.style.left = "66vw";
        moves_div.style.top = lower_div_height + "px";
        moves_div.style.width =  (main_div_size / 2) + "px";
        moves_div.style.height = (window.innerHeight - lower_div_height) + "px";
    }
    main_div.style.top = "1vh";
    main_div.style.width =  main_div_size + "px";
    main_div.style.height = main_div_size + "px";
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

function displayMoveArrows(moves) { //console.log("Displaying Arrows for Move:" + JSON.stringify(moves));
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
    clearElement(moves_list);
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
        move_entry.onclick = () => { displayMoveArrows(move_history[i]); };
        move_row.appendChild(move_entry);
        if ((i+1) % 4 === 0) {
            move_tab.appendChild(move_row);
            move_row = document.createElement("tr");
        }
        else if (i === history.length-1) {
            move_tab.appendChild(move_row);
        }
    }
    moves_list.appendChild(move_tab);
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

function showPlayers(players) {
    writeResponse("Active Players:");
    for (let i=0;i<players.length;i++) {
        writeResponse(players[i].name);
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
    displayMoveArrows(move_history[moves_range.value]);
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
