/*
 draw arrows as people vote and have them go away like 5 seconds after the move is made
 after voting it would be cool if player whose move was selected was flashed across the board

(Owen): also there should be a way to send messages to specific people in the game chat
OwenKraweki: maybe using @

support for the Maxthon Browser

~OwenKraweki: (clock) bottom right
~OwenKraweki: and top right when it's opponents move

arrows after move?
clock shift on flip?
weird sound loops with multiple games
 */

let time_div = document.getElementById("div-time");
let time_txt = document.getElementById("txt-time");
let time_can = document.getElementById("can-time");
let time_ctx = time_can.getContext("2d");
let countdown_can = document.createElement("canvas");
let countdown_ctx = countdown_can.getContext("2d");
let main_div = document.getElementById("div-main");
let main_board_div = document.getElementById("main-board");
let comm_div = document.getElementById("div-comm");
let games_div = document.getElementById("div-games");
let moves_div = document.getElementById("div-moves");
let games_select = document.getElementById("select-games");
let play_tbl = document.getElementById("table-players");
let moves_list = document.getElementById("div-movelist");
let moves_range = document.getElementById("range-history");
let score_div = document.getElementById("div-highscores");
let score_tbl = document.getElementById("table-highscores");
let sidebar_left = document.getElementById("div-sidebar-left");
let div_left_tabs = document.getElementById("div-left-tabs");
let div_info_tab = document.getElementById("div-info");
let chat_input = document.getElementById("chat-msg");
let login_butt = document.getElementById("login-butt");
let logout_butt = document.getElementById("logout-butt");
let enter_butt = document.getElementById("enter-butt");
let welcome_screen = document.getElementById("div-welcome");
let splash_screen = document.getElementById("div-splash");
let turntime_range = document.getElementById("range-time");
let turntime_out = document.getElementById("turn-time-out");
let maxplayers_range = document.getElementById("range-max-players");
let maxplayers_out = document.getElementById("max-players-out");
let chk_mole_move_predict = document.getElementById("chk-mole-move-prediction");
let chk_mole_piece_predict = document.getElementById("chk-mole-piece-prediction");
let chk_team_move_predict = document.getElementById("chk-team-move-prediction");
let chk_mole_veto = document.getElementById("chk-mole-veto");
let chk_hide_move = document.getElementById("chk-hide-move-vote");
let select_piece_style = document.getElementById("select-piece-style");
let color_dark_square = document.getElementById("color-dark-square");
let color_light_square = document.getElementById("color-light-square");
let mole_pawns = document.getElementById("chk-mole-pawns");
let div_defect = document.getElementById("div-defect");
let div_defect_overlay = document.getElementById("defect-overlay");
let div_ramp = document.getElementById("div-ramp");
let div_veto = document.getElementById("div-veto");

const COLOR_UNKNOWN = -1, COLOR_BLACK = 0, COLOR_WHITE = 1;
const TAB_PFX = "tab-pfx", TAB_BUTT = "tab-butt";
let current_tab = "serv";
let current_ply = 0;
let current_hover = null;
let move_cells = [];
let current_board_style;
let splash_img = new Image();
let BLACK = 0, WHITE = 1;
let move_history = [];
let games;
let selected_game = "";
let selected_player;
let zug_board;
let lichess = new LichessLogger("https://lichess.org", "molechess.com");
let starting = false;
let oauth_token;

const obs =  new URL(document.location).searchParams.get("obs");
if (obs) initGame(false);

turntime_range.oninput = () => { turntime_out.innerHTML = turntime_range.value; };
maxplayers_range.oninput = () => { maxplayers_out.innerHTML = maxplayers_range.value; };
mole_pawns.onchange = select_piece_style.onchange = () => {
    zug_board.setBoardStyle(
        { board_tex: "plain", pieces: select_piece_style.value, pawns: mole_pawns.checked ? "mole-pawns" : undefined }
    );
};
color_dark_square.onchange = () => {
    zug_board.black_square_color = color_dark_square.value; zug_board.updateBoard();
};
color_light_square.onchange = () => {
    zug_board.white_square_color = color_light_square.value; zug_board.updateBoard();
};

document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState === "visible") {
        console.log("tab is active");
        send("update", selected_game);
    } else {
        console.log("tab is inactive");
        if (checker_timer !== undefined) clearInterval(checker_timer);
    }
});

window.addEventListener("keyup", e => { //console.log("Key up: " + e.code);
    if (e.code === "Enter") {
        if (chat_input === document.activeElement) {
            sendChat(chat_input,current_tab);
        }
    }
    else if (e.code === "ArrowLeft") {
        if (current_ply > 0) selectMove(move_history[current_ply - 1]);
    }
    else if (e.code === "ArrowRight") {
        if (current_ply < move_history.length - 1) selectMove(move_history[current_ply + 1]);
    }
} , false);

games_select.addEventListener("change", () =>  {
    selected_game = games_select.value; //console.log("Selected: " + selected_game);
    if (selected_game !== "") send("update", selected_game);
});

games_select.addEventListener("dblclick", () =>  {
    send("update", selected_game);
    handleMessage("",selected_game); //updates message tab
});

function initGame(audio) {
    welcome_screen.style.display = "none"; splash_screen.style.display = "block";
    toggleSound(audio);
    splash_img.onload = () => {
        console.log("Loaded Image: " + splash_img);
        loadSounds(() => {
            zug_board = new ZugBoard(main_board_div,sendMove,() => {
                console.log("Pieces loaded");
                initLichess().then(() => showLogin());
            },{
                board_tex: "plain",
                pieces: select_piece_style.value,
                pawns: mole_pawns.checked ? "mole-pawns" : undefined
            },{
                square: { black: "#2F4F4F", white: "#AAAA88" },
                piece: { black: "#000000", white: "#FFFFFF"}
            });
            if (obs) {
                enterGame();
            }
            else {
                colorCycle(splash_screen,250);
                playTrack(AUDIO_CLIPS.music.enum.INTRO);
                animateMole(5000);
            }
        });
    };
    splash_img.src = "img/bkg/mole-splash2a.png";
}

function showLogin() {
    logout_butt.style.display = "inline"; enter_butt.style.display = "none";
    if (!oauth_token) {
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
    stopCycle();
    splash_screen.style.display = "none";
    window.onresize = () => { resize(); }; resize();
    if (oauth_token || obs) startSocket();
    fadeAndPlay(AUDIO_CLIPS.sound.enum.BUMP,true);
}

function resize() {
    setLayout();
    zug_board.resize(main_board_div);
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

function openModalWindow(e,overlay) {
    if (e.style.display === "block") return false;
    if (!overlay) overlay = main_div;
    e.style.top = overlay.style.top;
    e.style.left = overlay.style.left;
    e.style.width = overlay.style.width;
    e.style.height = overlay.style.height;
    e.style.display = "block";
    return true;
}

function closeModalWindow(element) {
    element.style.display = "none";
    fadeAndPlay();
}

function clearCountdown() {  //console.log("Clearing countdown :" + time_can.width + "," + time_can.height);
    if (checker_timer !== undefined) clearInterval(checker_timer.timer);
    time_ctx.drawImage(splash_img,0,0,time_can.width,time_can.height);
}

function countdown(title,turn,max_seconds) { //console.log("Countdown: " + max_seconds);
    if (title !== selected_game || max_seconds <= 0) return;
    let millis = ((max_seconds) * 1000);
    countdown_ctx.fillStyle = (turn === BLACK ? "white" : "black");
    countdown_ctx.fillRect(0,0,countdown_can.width,countdown_can.height);
    createImageBitmap(countdown_can).then(img => { //console.log(img);
        rndCheckerFill(img,millis,.1,time_can,rndColor(),() => {
            time_txt.innerHTML = (turn === BLACK ? "Black" : "White") + ": " +
                Math.floor(checker_timer.seconds) + " seconds";
        })
    });
}

function selectMove(moves) { //console.log("Displaying Arrows for Move:" + JSON.stringify(moves));
    if (current_hover !== null) current_hover.style.visibility = "hidden";
    zug_board.updateBoard(moves.fen);
    move_cells[current_ply].style.color = "#FFFFFF";
    move_cells[current_ply].style.border = "none"; //console.log("Current cell: " + move_cells[current_ply]);
    let tools = move_cells[current_ply].getElementsByClassName("movetiptext");
    tools[0].style.visibility = "hidden";
    zug_board.drawArrow(moves.selected.move,
        moves.selected.player === null ? "#555555" : moves.selected.player.play_col);
    for (let i=0;i<moves.alts.length;i++) {
        zug_board.drawArrow(moves.alts[i].move,moves.alts[i].player.play_col);
    }
    current_ply = moves_range.value = moves.ply;
    move_cells[current_ply].style.color = "#FFFF00";
    move_cells[current_ply].style.border = "solid";
    tools = move_cells[current_ply].getElementsByClassName("movetiptext");
    tools[0].style.visibility = "visible";
}

function exportPGN() {
    console.log(JSON.stringify(move_history));
    let pgn_txt = "";
    for (let i=0; i<move_history.length; i++) {
        pgn_txt += (move_history[i].selected.move.san + " ");
    }
    alert(pgn_txt);
}

function updateGame(game) {//console.log("Update Game: " + game.title + "," + game.phase);//JSON.stringify(game));
    if (game.title === selected_game || obs) {
        if (game.currentFEN !== undefined) {
            if (game.currentFEN !== zug_board.currentFEN) {
                let cancelMove = zug_board.promoting;
                zug_board.clearPromotion(cancelMove);
            }
            zug_board.updateBoard(game.currentFEN);
        }
        if (game.timeRemaining && (game.phase === "VOTING" || game.phase === "VETO")) {
            countdown(selected_game,game.turn,game.timeRemaining);
        }
        else clearCountdown();
        if (game.history !== undefined) updateMoveList(game.history);
        updatePlayTbl(game);
    }
}

function voteSummary(votes) {  //console.log(JSON.stringify(votes) + "," + votes.selected);
    let n = Math.ceil((votes.ply + 1) / 2) +  (votes.ply % 2 === 0 ? "." : "...");
    let txt = n + votes.selected.move.san + " -> " +
        (votes.selected.player !== null ? votes.selected.player.user.name : "?") + " <br> ";
    for (let i=0; i < votes.alts.length; i++) {
        txt += n + votes.alts[i].move.san + " -> " + votes.alts[i].player.user.name + " <br> ";
    }
    return txt;
}

function updateMoveList(history) {
    move_cells = [];
    clearElement(moves_list);
    move_history = [history.length];
    let move_tab = document.createElement("table");
    let move_row = document.createElement("tr");
    let n = 0;
    for (let i= 0; i<=history.length; i++) {
        let move_entry = document.createElement("td");
        let m = ""; if (i % 2 === 0) m = (++n) + ".";
        if (i < history.length) {
            move_history[i] = {
                ply: i,
                turn: history[i].turn,
                fen: i < 1 ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" : history[i-1].fen,
                selected: history[i].selected,
                alts: history[i].alts
            };

            if (history[i].selected) {
                move_entry.textContent = m + history[i].selected.move.san;
            }
            else move_entry.textContent = "?";
            move_entry.onclick = () => { selectMove(move_history[i]); };

            let move_span = document.createElement("span");
            move_span.className = "movetiptext";
            move_span.innerHTML = voteSummary(move_history[i]);
            move_entry.addEventListener("mouseover", () => {
                move_span.style.visibility = "visible";
                current_hover = move_span;
            });
            move_entry.addEventListener("mouseout", () => {
                move_span.style.visibility = "hidden";
                current_hover = null;
            });
            move_entry.appendChild(move_span);
            move_cells.push(move_entry);
        }
        else {
            move_entry.textContent = "Current position (click to update)";
            move_entry.onclick = () => { send("update", selected_game); };
        }

        move_row.appendChild(move_entry);

        if ((i+1) % 2 === 0) {
            move_tab.appendChild(move_row);
            move_row = document.createElement("tr");
        }
        else if (i === history.length) {
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
            updatePlayTbl(games[i]);
        }
    }
    if (!selected_game_exists) {
        if (games.length > 0) {
            selected_game = games[0].title;
            updatePlayTbl(games[0]);
        }
        else selected_game = "";
    }
}

function updatePlayTbl(game) { //console.log(JSON.stringify(game));
    clearElement(play_tbl);
    play_tbl.appendChild(getHeaders(["Player","Color","Rating","Vote","Accuse","Kick"]));
    if (game.bucket !== undefined) {
        for (let p = 0; p < game.bucket.length; p++) {
            play_tbl.appendChild(playRow(game.bucket[p],game.title));
        }
    }
    for (let t=0;t<2;t++) {
        for (let p = 0; p < game.teams[t].players.length; p++) {
            play_tbl.appendChild(playRow(game.teams[t].players[p],game.title));
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
    play_name.innerHTML = pdata.user.name;
    if (pdata.away || pdata.kicked) play_name.style.setProperty('text-decoration', 'line-through');

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
    if (pdata.game_col === COLOR_UNKNOWN) play_color.style.background = "grey";
    else if (pdata.game_col === COLOR_BLACK) play_color.style.background = "black";
    else play_color.style.background = "white";
    play_color.style.width = "8px";
    play_row.appendChild(play_color);

    let play_rating = document.createElement("td"); //TODO: include both ratings
    if (pdata.user.blitz) play_rating.textContent = pdata.user.blitz; else play_rating.textContent = "?";
    play_row.appendChild(play_rating);

    let play_vote = document.createElement("td");
    play_vote.textContent = pdata.votename;
    play_row.appendChild(play_vote);

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
    clearElement(score_div);
    for (let i=0;i<data.length;i++) {
        /* let row = document.createElement("tr");
        let play_field = document.createElement("td");
        play_field.textContent = data[i].name;
        let rating_field = document.createElement("td");
        rating_field.textContent = data[i].rating;
        row.appendChild(play_field); row.appendChild(rating_field);
        score_tbl.appendChild(row); */

        if (score_div.style.display === "block") {
            let e = document.createElement("span");
            e.innerHTML = (i + 1) + ". " + data[i].name + ": " + data[i].rating;
            e.style.color = rndColor();
            e.style.backgroundColor = "black";
            e.className = "high-score-entry";
            score_div.appendChild(e);
            animateWanderingElement(score_div,e);
        }
    }


}

function showPlayers(players) {
    writeMessage("Active Players:",selectTab("serv").messages);
    for (let i=0;i<players.length;i++) {
        writeMessage(players[i].name,selectTab("serv").messages);
    }
}

function showHighScores() {
    if (!openModalWindow(score_div)) return;
    send("top",10);
    fadeAndPlay(AUDIO_CLIPS.music.enum.EPIC);
}

function showHelp() {
    if (!openModalWindow(document.getElementById('div-help'))) return;
    fadeAndPlay(AUDIO_CLIPS.music.enum.FUGUE)
}

function clearElement(e) {
    while (e.firstChild) e.removeChild(e.lastChild);
}

function createGame() {
    let title = prompt("Enter a new game title",username);
    if (title !== null) {
        console.log("Starting: " + title);
        send("newgame", {title: title, color: COLOR_BLACK}); //TODO: non-bucket color choice
        playSFX(AUDIO_CLIPS.sound.enum.BUMP);
    }
}

function joinGame() {
    send("joingame",{ title: selected_game, color: COLOR_UNKNOWN });
}

function gameCmd(cmd) {
    if (selected_game !== undefined) send(cmd, selected_game);
}

function startGame() {
    starting = true;
    send("status",selected_game);
}

function setTime() {
    if (selected_game !== undefined) {
        let t = prompt("Enter move time in seconds: ");
        if (t > 0) send("time",{ game: selected_game, time : t });
    }
}

function rangeSelect() { //TODO: game change bug
    selectMove(move_history[moves_range.value]);
}

function flipAtStart(isBlack) {
    if (isBlack && !zug_board.povBlack || !isBlack && zug_board.povBlack) {
        flipBoard();
    }
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

function handleMessage(msg,src,player) {
    if (player === undefined || player === null) writeMessage(msg,selectTab(src).messages,"white");
    else writeMessage(msg,selectTab(src).messages, player.play_col);
}

function handleStatus(msg,src) {
    if (starting) {
        if (msg === "voting" || msg === "postgame" || msg === "wtf") alert("Bad Phase: " + msg);
        else if (msg === "ready" || confirm("Game not ready - add AI?")) gameCmd('startgame');
        starting = false;
    }
}

function selectTab(title) { //TODO: don't switch tabs?
    if (!title || title === "") title = "serv";
    let selected = null;
    let tab_areas = document.getElementsByClassName(TAB_PFX);
    for (const area of tab_areas) {
        if (area.id === TAB_PFX + title) {
            area.style.display = "block"; selected = area;
        }
        else area.style.display = "none";
    }
    if (selected == null) selected = addTabArea(title);
    current_tab = title;

     return {
        "messages" : selected.getElementsByClassName("msg-class")[0],
        "votes" : selected.getElementsByClassName("vote-class")[0]
    };
}

function addTabArea(title) {
    let tab = document.createElement("button");
    tab.id = TAB_BUTT + title;
    tab.className = TAB_BUTT;
    tab.textContent = title;
    tab.onclick = () => selectTab(title);
    tab.oncontextmenu = () => {
        if (title !== "serv") removeTabArea(title);
        return false;
    }
    div_left_tabs.appendChild(tab);
    let area = document.createElement("div");
    area.id = TAB_PFX + title;
    area.className = TAB_PFX;

    let messages=document.createElement("div"); messages.className="msg-class"; area.appendChild(messages);
    let vote_tbl=document.createElement("table"); vote_tbl.className="vote-class"; area.appendChild(vote_tbl);

    div_info_tab.appendChild(area);
    return area;
}

function removeTabArea(title) {
    if (title === undefined) title = current_tab;
    let tabs = document.getElementsByClassName(TAB_BUTT);
    for (const tab of tabs) if (tab.id === (TAB_BUTT + title)) div_left_tabs.removeChild(tab);
    let areas = document.getElementsByClassName(TAB_PFX);
    for (const area of areas) if (area.id === (TAB_PFX + title)) div_info_tab.removeChild(area);
}

function writeMessage(text, chat_div, c) { //console.log("Response: " + text);
    let span = document.createElement("span"); span.style.color = c;
    span.appendChild(document.createTextNode(text));
    chat_div.appendChild(span);
    chat_div.appendChild(document.createElement("br"));
    chat_div.scrollTop = chat_div.scrollHeight;
    if (chat_div.childElementCount > 128) chat_div.removeChild(chat_div.childNodes[0]);
}

function handleVote(votelist,turn,source) { //console.log("Vote List: " + JSON.stringify(votelist));
    let area = selectTab(source);
    area.votes.innerHTML = "";
    let thead = document.createElement('thead');
    let th1 = document.createElement('th'); th1.textContent = "Player"; thead.appendChild(th1);
    let th2 = document.createElement('th'); th2.textContent = "Move"; thead.appendChild(th2);
    area.votes.appendChild(thead);
    let tbody = document.createElement('tbody');
    for (let i=0;i<votelist.length;i++) {
        let row = document.createElement("tr");
        let name = document.createElement("td"); name.textContent = votelist[i].player_name;
        let move = document.createElement("td"); move.textContent = votelist[i].player_move;
        row.appendChild(name); row.appendChild(move);
        tbody.appendChild(row);
    }
    area.votes.appendChild(tbody);
}

function showOptions(curr_opts) {

    if (!openModalWindow(document.getElementById("div-opt"),moves_div)) return;

    console.log(JSON.stringify(curr_opts));
    turntime_range.value = turntime_out.innerHTML = curr_opts.move_time;
    maxplayers_range.value = maxplayers_out.innerHTML = curr_opts.max_play;
    chk_mole_move_predict.checked = curr_opts.mole_move_predict;
    chk_mole_piece_predict.checked = curr_opts.mole_piece_predict;
    chk_team_move_predict.checked = curr_opts.team_move_predict;
    chk_mole_veto.checked = curr_opts.mole_veto;
    chk_hide_move.checked = curr_opts.hide_move;

    current_board_style = {
        dark_square :  zug_board.black_square_color,
        light_square : zug_board.white_square_color,
        piece_style : zug_board.board_style.pieces,
        mole_pawns : zug_board.board_style.pawns
    };

    color_dark_square.value = current_board_style.dark_square;
    color_light_square.value = current_board_style.light_square;
    select_piece_style.value = current_board_style.piece_style;
    mole_pawns.checked = current_board_style.mole_pawns;
}

function cancelOptions() {
    closeModalWindow(document.getElementById("div-opt"));
    zug_board.setBoardStyle(
        {
            board_tex: "plain",
            pieces:  current_board_style.piece_style,
            pawns: current_board_style.mole_pawns ? "mole-pawns" : undefined
        }
    );
    zug_board.black_square_color = current_board_style.dark_square;
    zug_board.white_square_color = current_board_style.light_square;
    zug_board.updateBoard();
}

function submitOptions() {
    let new_opts = {
        game : selected_game,
        time : turntime_range.value,
        max_players : maxplayers_range.value,
        mole_veto : chk_mole_veto.checked,
        hide_move_vote : chk_hide_move.checked,
        mole_predict_move : chk_mole_move_predict.checked,
        mole_predict_piece : chk_mole_piece_predict.checked,
        team_predict_move : chk_team_move_predict.checked

    };
    send("set_opt", new_opts);
    closeModalWindow(document.getElementById("div-opt"));
}

function newPhase(data) {
    console.log("New phase: " + data.phase);
    if (data.phase !== "VETO") {
        div_veto.style.display = "none";
        time_can.style.display = "block";
    }
    updateGame(data);
}

function handleDefection(data) {
    playSFX(AUDIO_CLIPS.sound.enum.DEFECT);
    animateDefection(5000,data); //updateGame?
}

function handleRampage(data) {
    playSFX(AUDIO_CLIPS.sound.enum.RAMPAGE);
    animateRampage(5000,data);
}

function handleMove(data) {
    playSFX(data.game.turn ? AUDIO_CLIPS.sound.enum.MOVE1 : AUDIO_CLIPS.sound.enum.MOVE2);
}

function notifyMole(mole) {
    if (mole) {
        openModalWindow(document.getElementById("div-mole"));
        playSFX(AUDIO_CLIPS.sound.enum.IS_MOLE);
    }
    else {
        openModalWindow(document.getElementById("div-not-mole"));
        playSFX(AUDIO_CLIPS.sound.enum.NOT_MOLE);
    }
}

function sendVeto(confirm) {
    send("veto", {
        game: selected_game,
        confirm: confirm
    });
}

let toggle = true;
function test() { toggle = !toggle; }
