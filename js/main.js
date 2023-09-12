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

let status_div = document.getElementById("div-status");
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
//let chk_mole_piece_predict = document.getElementById("chk-mole-piece-prediction");
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
let img_status = document.getElementById("img-status");
let div_gen_opt = document.getElementById("div-general-opt");
let div_game_opt = document.getElementById("div-game-opt");
let div_history = document.getElementById("div-history");
let history_tbl = document.getElementById("table-history");
let chk_streaming = document.getElementById("chk-streaming");

const COLOR_UNKNOWN = -1, COLOR_BLACK = 0, COLOR_WHITE = 1;
const TAB_PFX = "tab-pfx", TAB_BUTT = "tab-butt";
let current_tab = "serv";
let current_ply = 0;
let current_hover = null;
let move_cells = [];
let current_board_style;
let splash_img = new Image();
let phase_imgs = [
    { img: new Image(), src: "img/phases/pregame.png" },
    { img: new Image(), src: "img/phases/move_white.png" },
    { img: new Image(), src: "img/phases/move_black.png" },
    { img: new Image(), src: "img/phases/veto_white.png" },
    { img: new Image(), src: "img/phases/veto_black.png" },
    { img: new Image(), src: "img/phases/game_over.png" },
];
let PREGAME = 0, MOVE_WHITE = 1, MOVE_BLACK = 2, VETO_WHITE = 3, VETO_BLACK = 4, POSTGAME= 5;
let BLACK = 0, WHITE = 1;
let move_history = [];
let games;
let selected_game = "";
let selected_player;
let zug_board;
let lichess = new LichessLogger("https://lichess.org", "molechess.com");
let starting = false;
let oauth_token;
let streaming = false;

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
        if (selected_game) send("update", selected_game);
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

function loadPhaseImgs(i,callback) {
    if (i >= phase_imgs.length) callback();
    else {
        phase_imgs[i].img.onload = () => {
            console.log("Loaded Image: " + phase_imgs[i].img.src);
            loadPhaseImgs(i+1,callback);
        }
        phase_imgs[i].img.src = phase_imgs[i].src;
    }
}

function loadImages(callback) {
    splash_img.onload = () => {
        console.log("Loaded Image: " + splash_img.src);
        loadPhaseImgs(0,callback);
    }
    splash_img.src = "img/bkg/mole-splash2a.png";
}

function initGame(audio) {
    welcome_screen.style.display = "none"; splash_screen.style.display = "block";
    toggleSound(audio);
    loadImages(() => {
        console.log("Loaded all images");
        loadSounds(() => {
            zug_board = new ZugBoard(main_board_div,sendMove,() => {
                console.log("ZugBoard loaded");
                initLichess().then(() => showLogin());
            },{
                board_tex: "plain",
                pieces: select_piece_style.value,
                pawns: mole_pawns.checked ? "mole-pawns" : undefined
            },{
                square: { black: "#676A58", white: "#AAAA88" },
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
    });
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
            game: selected_game,
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

function exportPGN() { //TODO request PGN from server
    if (move_history.length > 1) {
        console.log(JSON.stringify(move_history));
        let pgn_txt = "";
        for (let i=0; i<move_history.length; i++) {
            pgn_txt += (move_history[i].selected.move.san + " ");
        }
        alert(pgn_txt);
    }
}

function updateGame(game) {//console.log("Update Game: " + game.title + "," + game.phase);//JSON.stringify(game));
    if (game.title === selected_game || obs) {
        if (game.currentFEN) {
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
        if (game.history) updateMoveList(game.history);
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
        else {
            selected_game = "";
            updatePlayTbl();
        }
    }
}

function updatePlayTbl(game) { //console.log(JSON.stringify(game));
    clearElement(play_tbl); if (!game) return;
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

function getActionButton(title,player,action_msg,active) {
    let play_col = document.createElement("td");
    let play_butt = document.createElement("button");
    if (active) {
        play_butt.textContent = "X"; play_butt.addEventListener("click",() => {
            send(action_msg,{ player: player, game: title });
        });
    }
    else play_butt.textContent = "-";
    play_col.appendChild(play_butt);
    return play_col;
}

function updateHighScores(data) {
    clearElement(score_div);
    for (let i= data.length-1;i >= 0;i--) {
        /* let row = document.createElement("tr");
        let play_field = document.createElement("td");
        play_field.textContent = data[i].name;
        let rating_field = document.createElement("td");
        rating_field.textContent = data[i].rating;
        row.appendChild(play_field); row.appendChild(rating_field);
        score_tbl.appendChild(row); */

        if (score_div.style.display === "block") {
            let e = document.createElement("span");
            e.className = "high-score-entry";
            e.innerHTML = (i + 1) + ". " + data[i].name + ": " + data[i].rating;
            let colors = hsvToRgb(Math.random(),1,1);
            e.style.color = "rgb(" + colors[0] + "," + colors[1] + "," + colors[2] + ")";
            let r = Math.round((Math.random() * 100));
            let g = Math.round((Math.random() * 100));
            let b = Math.round((Math.random() * 100));
            let a = .5; //Math.random();
            e.style.backgroundColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
            score_div.appendChild(e);
            let font_size = (15 + ((data.length - i)*4)) + "px";
            animateWanderingElement(score_div,e,font_size);
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
        send("newgame", {game: title, color: COLOR_BLACK}); //TODO: non-bucket color choice
        playSFX(AUDIO_CLIPS.sound.enum.BUMP);
    }
}

function joinGame() {
    send("joingame",{ game: selected_game, color: COLOR_BLACK });
}

function gameCmd(cmd) {
    if (selected_game) {
        console.log("Sending: " + cmd);
        send(cmd, selected_game);
    }
}

function startGame() {
    starting = true;
    send("status",selected_game);
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
    if (msg === "?") {
        send("role",selected_game);
    }
    else {
        send("chat",{ msg: input.value, source: source });
    }
    input.value = "";
}

function handleMessage(msg,src,player,spoiler_txt) {
    if (player) writeMessage(msg,selectTab(src).messages, player.play_col,spoiler_txt);
    else writeMessage(msg,selectTab(src).messages,"white",spoiler_txt);
}

function handleStatus(msg) {
    if (starting) {
        if (msg === "voting" || msg === "postgame" || msg === "wtf") alert("Bad Phase: " + msg);
        else if (msg === "ready" || confirm("Game not ready - add AI?")) gameCmd('startgame');
        starting = false;
    }
}

function selectTab(title,swap) {
    if (!title || title === "") title = "serv";
    let selected = document.getElementById(TAB_PFX + title);
    if (swap || selected == null) {
        if (selected == null) selected = addTabArea(title);
        switchTabs(selected);
        current_tab = title;
    }

    let butt = document.getElementById(TAB_BUTT + title);
    if (butt) highlightButt(butt);

    return {
        "messages" : selected.getElementsByClassName("msg-class")[0],
        "votes" : selected.getElementsByClassName("vote-class")[0]
    };
}

function switchTabs(tab) {
    for (const area of  document.getElementsByClassName(TAB_PFX)) {
        if (area === tab) area.style.display = "block";
        else area.style.display = "none";
    }
}

function highlightButt(tab) { //TODO: maintain highlight of unread tabs?
    let curr_butt = document.getElementById(TAB_BUTT + current_tab);
    for (const butt of  document.getElementsByClassName(TAB_BUTT)) {
        if (butt === tab) {
            if (butt === curr_butt) butt.style.color = "white"; else butt.style.color = "bisque";
        }
        else {
            if (butt === curr_butt) butt.style.color = "cyan"; else butt.style.color = "darkslategrey";
        }
    }
}

function findTab(tab_id) {
    for (const area of  document.getElementsByClassName(TAB_PFX)) if (area.id === tab_id) return area;
    return null;
}

function addTabArea(title) {
    let tab = document.createElement("button");
    tab.id = TAB_BUTT + title;
    tab.className = TAB_BUTT;
    tab.textContent = title;
    tab.onclick = () => selectTab(title,true);
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

function writeMessage(text, chat_div, c, spoiler_txt) { //console.log("Response: " + text);
    let e,txt;
    if (spoiler_txt) {
        e = document.createElement("details");
        e.style.color = "white";
        e.innerHTML = text;
        txt = document.createElement("summary");
        txt.innerHTML = spoiler_txt;
        e.appendChild(txt);
    }
    else {
        e = document.createElement("span"); e.style.color = c;
        e.appendChild(document.createTextNode(text));
    }
    chat_div.appendChild(e);
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

function getGameOptions() {
    if (selected_game) gameCmd('get_opt');
}

function showGameOptions(curr_opts) {  //console.log(JSON.stringify(curr_opts));
    if (!openModalWindow(div_game_opt,moves_div)) return;
    //chk_mole_piece_predict.checked = curr_opts ? curr_opts.mole_piece_predict : false;
    turntime_range.value = turntime_out.innerHTML = curr_opts ? curr_opts.move_time : 0;
    maxplayers_range.value = maxplayers_out.innerHTML = curr_opts ? curr_opts.max_play : 0;
    chk_mole_move_predict.checked = curr_opts ? curr_opts.mole_move_predict : false;
    chk_team_move_predict.checked = curr_opts ? curr_opts.team_move_predict : false;
    chk_mole_veto.checked = curr_opts ? curr_opts.mole_veto : false;
    chk_hide_move.checked = curr_opts ? curr_opts.hide_move : false;
}

function submitGameOptions() {
    let new_opts = {
        game : selected_game,
        time : turntime_range.value,
        max_players : maxplayers_range.value,
        mole_veto : chk_mole_veto.checked,
        hide_move_vote : chk_hide_move.checked,
        mole_predict_move : chk_mole_move_predict.checked, //mole_predict_piece : chk_mole_piece_predict.checked,
        team_predict_move : chk_team_move_predict.checked
    };
    send("set_opt", new_opts);
    closeModalWindow(div_game_opt);
}

function cancelGameOptions() {
    closeModalWindow(div_game_opt);
}

function showGeneralOptions() {
    if (!openModalWindow(div_gen_opt,moves_div)) return;
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
    chk_streaming.checked = streaming;
}

function submitGeneralOptions() {
    streaming = chk_streaming.checked;
    closeModalWindow(div_gen_opt);
}

function cancelGeneralOptions() {
    closeModalWindow(div_gen_opt);
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

function newPhase(game) { //console.log(JSON.stringify(game));
    time_can.style.display = "none";
    console.log("New phase: " + game.phase);
    if (game.phase === "PREGAME") {
        img_status.src = phase_imgs[PREGAME].src;
    }
    else if (game.phase === "VOTING") {
        if (game.turn === BLACK) img_status.src = phase_imgs[MOVE_BLACK].src;
        else img_status.src = phase_imgs[MOVE_WHITE].src;
    }
    if (game.phase === "VETO") {
        if (game.turn === BLACK) img_status.src = phase_imgs[VETO_BLACK].src;
        else img_status.src = phase_imgs[VETO_WHITE].src;
    }
    else if (game.phase === "POSTGAME") {
        img_status.src = phase_imgs[POSTGAME].src;
    }

    updateGame(game);
}

function handleDefection(data) {
    playSFX(AUDIO_CLIPS.sound.enum.DEFECT);
    animateDefection(8000,data); //updateGame?
}

function handleRampage(data) {
    playSFX(AUDIO_CLIPS.sound.enum.RAMPAGE);
    animateRampage(5000,data);
}

function handleMove(data) {
    playSFX(data.game.turn ? AUDIO_CLIPS.sound.enum.MOVE1 : AUDIO_CLIPS.sound.enum.MOVE2);
}

function notifyMole(mole,game) {
    if (streaming) {
        handleMessage(mole ? "You're the mole!" : "You're not the mole",game,null,"Mole Status");
    }
    else if (mole) {
        openModalWindow(document.getElementById("div-mole"));
        playSFX(AUDIO_CLIPS.sound.enum.IS_MOLE);
    }
    else {
        openModalWindow(document.getElementById("div-not-mole"));
        playSFX(AUDIO_CLIPS.sound.enum.NOT_MOLE);
    }
}

function moveConfirm(player,move,san,game) {
    if (streaming) {
        handleMessage(san,game,player,"Your vote:");
    }
    else {
        handleMessage("Your vote: " + san,game,player);
    }
}

function sendVeto(confirm) {
    send("veto", {
        game: selected_game,
        confirm: confirm
    });
    return false;
}

function showHistory(pgnlist) { //console.log(JSON.stringify(pgnlist));
    openModalWindow(div_history);
    clearElement(history_tbl);
    history_tbl.style.height = (pgnlist.length < 10 ? (pgnlist.length * 10) : 95) + "%";
    for (let i=0;i<pgnlist.length;i++) {
        let row = document.createElement("tr");
        let teams = parsePGN(pgnlist[i].pgn);

        for (let w=0;w<teams.white_players.length;w++) {
            let white_field = document.createElement("td");
            white_field.textContent = teams.white_players[w];
            white_field.className = "team-white";
            row.appendChild(white_field);
        }
        for (let b=0;b<teams.black_players.length;b++) {
            let black_field = document.createElement("td");
            black_field.textContent = teams.black_players[b];
            black_field.className = "team-black";
            row.appendChild(black_field);
        }
        let pgn_field = document.createElement("td");
        pgn_field.textContent = "PGN";
        pgn_field.style.backgroundColor = "green";
        pgn_field.onclick = (ev) => {
            navigator.clipboard.writeText(pgnlist[i].pgn).then(function() {
                alert('PGN copied to clipboard');
            }, function(err) {
                alert('Error: Could not copy PGN to clipboard: ' + err);
            });
            ev.stopPropagation();
        }
        row.appendChild(pgn_field);
        history_tbl.appendChild(row);
    }
}

function showHistory2(pgnlist) {
    openModalWindow(div_history);
    clearElement(div_history);
    for (let g=0;g<pgnlist.length;g++) {
        let teams = parsePGN(pgnlist[g].pgn);

        let div = document.createElement("div");
        div.style.width = "90%";
        div.style.height = "10%";
        div.style.backgroundColor = "brown";
        div.style.borderStyle = "ridge";
        div.style.borderColor = "cornsilk";

        for (let i=0;i<teams.white_players.length;i++) {
            let white_butt = document.createElement("button");
            white_butt.textContent = teams.white_players[i];
            white_butt.className = "team-white";
            div.appendChild(white_butt);
        }
        div.appendChild(document.createElement("br"));
        for (let i=0;i<teams.black_players.length;i++) {
            let black_butt = document.createElement("button");
            black_butt.textContent = teams.black_players[i];
            black_butt.className = "team-black";
            div.appendChild(black_butt);
        }
        div.appendChild(document.createElement("br"));
        let pgn_butt = document.createElement("button");
        pgn_butt.textContent = "PGN";
        pgn_butt.style.backgroundColor = "green";
        pgn_butt.onclick = (ev) => {
            navigator.clipboard.writeText(pgnlist[g].pgn).then(function() {
                alert('PGN copied to clipboard');
            }, function(err) {
                alert('Error: Could not copy PGN to clipboard: ' + err);
            });
            ev.stopPropagation();
        }
        div.appendChild(pgn_butt);
        div_history.appendChild(div);
    }
}

function parsePGN(pgn) {
    let tags = [];
    pgn.replace(/\[(.*?)\]/g, function(g0,g1){tags.push(g1);});
    return {
        white_players :  (tags[2].replaceAll("\"","").split(" ").slice(1)), //TODO: IE breaks
        black_players :  (tags[3].replaceAll("\"","").split(" ").slice(1))
    };
}

function partGame(game) { //console.log("Parting: " + JSON.stringify(game));
    if (selected_game === game.title) { clearCountdown(); selected_game = ""; } //updateGame(game);
}

let toggle = true;
function test() { toggle = !toggle; }
