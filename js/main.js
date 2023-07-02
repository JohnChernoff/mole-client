/*
 draw arrows as people vote and have them go away like 5 seconds after the move is made
 after voting it would be cool if player whose move was selected was flashed across the board

(Owen): also there should be a way to send messages to specific people in the game chat
OwenKraweki: maybe using @

support for the Maxthon Browser

~OwenKraweki: (clock) bottom right
~OwenKraweki: and top right when it's opponents move

Clarify current position in movelist

arrows after move
clock shift on flip

checkerfill bug?
votelist move numbers

~tooltips!
 */

function createEnum(arr) {
    let obj = Object.create(null);
    for (let val of arr) {
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}
function createList(list) {
    let obj = Object.create(null);
    for (let i = 0; i < list.length; i++) {
        obj[list[i]] = { "name" : list[i], "index" : i }
    }
    return {
        "enum" : Object.freeze(obj),
        "length" : list.length
    };
}

let AUDIO = false;
let AUDIO_PRELOAD = -1; let AUDIO_LOAD = AUDIO_PRELOAD;
const AUDIO_CLIPS = createList(['INTRO','EPIC','CREATE','VOTE','ACCUSE','FUGUE','BUMP','IS_MOLE','NOT_MOLE']);
let clips = [AUDIO_CLIPS.length];
let current_clip, fader;
const LAYOUT_STYLES = createEnum(['UNDEFINED','HORIZONTAL','VERTICAL']);
let layout_style = LAYOUT_STYLES.UNDEFINED;
const COLOR_UNKNOWN = -1, COLOR_BLACK = 0, COLOR_WHITE = 1;
const TAB_PFX = "tab-pfx", TAB_BUTT = "tab-butt";
let current_tab = "serv";
let current_ply = 0;
let current_hover = null;
let move_cells = [];
let mole_div = document.getElementById("div-mole");
let mole_txt = document.getElementById("mole-txt");
let time_div = document.getElementById("div-time");
let time_txt = document.getElementById("txt-time");
let time_can = document.getElementById("can-time");
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
let splash_can = document.getElementById("splash-can");
let splash_img = new Image();
let BLACK = 0, WHITE = 1;
let main_board = [];
let move_history = [];
let games;
let selected_game = "";
let selected_player;
let zug_board;
let lichess = new LichessLogger("https://lichess.org", "molechess.com"); //"example.com");
let oauth_token = null;
let starting = false;
document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState == "visible") {
        console.log("tab is active");
    } else {
        console.log("tab is inactive");
        if (checker_timer != undefined) clearInterval(checker_timer);
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
    send("update", selected_game);
});

games_select.addEventListener("dblclick", () =>  {
    send("update", selected_game); //TODO: refresh time
    handleMessage("",selected_game); //updates message tab
});

function closeModalWindow(element) {
    element.style.display = "none";
    fadeAndPlay();
}

function loadAudio(onload) {
    AUDIO_LOAD = 0; let track = 0;
    for (let clip in AUDIO_CLIPS.enum) {
        clips[track] = new Audio("audio/" + clip.toLowerCase() + ".mp3");
        clips[track++].addEventListener('loadeddata', () => {
            AUDIO_LOAD++;
            console.log("Loaded: " + clip + " (" + AUDIO_LOAD + "/" + AUDIO_CLIPS.length + ")");
            if (AUDIO_LOAD === AUDIO_CLIPS.length) {
                console.log("Loaded all audio files");
                onload();
            }
        });
    }
}

async function toggleAudio(audio) {
    if (audio !== undefined) AUDIO = audio; else AUDIO = !AUDIO;
    let buttons = document.getElementsByClassName("audio-toggle");
    for (let i =0; i < buttons.length; i++) {
        buttons[i].innerHTML = AUDIO ? "Sound Off" : "Sound On";
    }
    if (AUDIO) await playClip(current_clip); else pauseClip(current_clip);
}

async function playClip(clip,switch_clips = true) {
    if (clip === undefined) return;
    let prev_clip = current_clip;
    current_clip = clip;
    if (switch_clips) pauseClip(prev_clip);
    if (current_clip !== prev_clip || clips[prev_clip.index].ended) clips[current_clip.index].currentTime = 0;

    if (AUDIO) {
        console.log("Playing: " + clip.name);
        clips[current_clip.index].volume = .8;
        try {
            if (switch_clips && prev_clip !== undefined && prev_clip !== current_clip && !clips[prev_clip.index].ended)
            clips[current_clip.index].addEventListener("ended",() => {
                current_clip = prev_clip;
                clips[current_clip.index].play();
            });
            else clips[current_clip.index].addEventListener("ended",() => {});
            clips[current_clip.index].loop = false;
            await clips[current_clip.index].play();

        }
        catch(err) { console.log("Error: " + err); }
    }
}

function fadeAndPlay(clip) { //console.log("Fading...");
    if (current_clip != undefined) {
        let audio = clips[current_clip.index];
        if (fader !== undefined) clearInterval(fader);
        fader = setInterval(()=> {
            let v = audio.volume - 0.1;
            if (AUDIO && v >= 0) { //console.log("Volume: " + v);
                audio.volume = v;
            }
            else {
                clearInterval(fader);
                current_clip = undefined;
                playClip(clip);
            }
        },200);
    }
    else playClip(clip);
}

function pauseClip(clip) {
    if (clip !== undefined) clips[clip.index].pause();
}

function countdown(title,turn,max_seconds) { //console.log(JSON.stringify(data));
    if (title !== selected_game) return;
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
function initGame(audio) {
    welcome_screen.style.display = "none"; splash_screen.style.display = "block";
    toggleAudio(audio);
    splash_img.onload = () => {
        console.log("Loaded Image: " + splash_img);
        //rndCheckerFill(splash_img,1000,.001,splash_can,"black", null,() => { splash_can.style.visibility = "hidden"; });
        loadAudio(() => {
            zug_board = new ZugBoard(main_board_div,sendMove,() => {
                console.log("Pieces loaded");
                initLichess().then(() => showLogin());
            },{ board_tex: "plain", pieces: "comp" },{
                square: { black: "#2F4F4F", white: "#AAAA88" }, piece: { black: "#000000", white: "#FFFFFF"}
            });
            colorCycle(splash_screen,250);
            playClip(AUDIO_CLIPS.enum.INTRO);
            animateMole(5000);
        });
    };
    splash_img.src = "img/bkg/mole-splash2a.png";
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
    stopCycle();
    splash_screen.style.display = "none";
    window.onresize = () => { resize(); }; resize();
    if (oauth_token !== null) startSocket();
    fadeAndPlay(AUDIO_CLIPS.enum.BUMP);
}

function resize() {
    setLayout();
    zug_board.resize(main_board,main_board_div);
}

function setLayout() {
    let main_div_size;
    if (window.innerWidth > window.innerHeight) {
        layout_style = LAYOUT_STYLES.HORIZONTAL;
        sidebar_left.style.left = "0px";
        sidebar_left.style.top = "0px";
        sidebar_left.style.width = "20vw";
        sidebar_left.style.height = "100vh";

        main_div_size = Math.floor(Math.min(window.innerWidth /2, window.innerHeight * .89));
        let extra_width = ((window.innerWidth/2) - main_div_size)/2;
        main_div.style.left = Math.floor((window.innerWidth * .25) + (extra_width > 0 ? extra_width : 0)) + "px";

        time_div.style.left =  main_div.style.left;
        time_div.style.top = "";
        time_div.style.bottom = "1vh";
        time_div.style.width = main_div_size + "px";
        time_div.style.height = "7vh";

        games_div.style.left = "80vw";
        games_div.style.top = "0px";
        games_div.style.width = "20vw";
        games_div.style.height = "50vh";

        moves_div.style.left = "80vw";
        moves_div.style.top = "50vh";
        moves_div.style.width = "20vw";
        moves_div.style.height = "50vh";
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

        let clock_height = 50;
        time_div.style.left = main_div.style.left;
        time_div.style.top = lower_div_height + "px";
        time_div.style.bottom = "";
        time_div.style.width = main_div_size + "px";
        time_div.style.height = clock_height + "px";

        games_div.style.left = "33vw";
        games_div.style.top = (lower_div_height + clock_height + 20) + "px";
        games_div.style.width =  (main_div_size / 2) + "px";
        games_div.style.height = (window.innerHeight - lower_div_height) + "px";

        moves_div.style.left = "66vw";
        moves_div.style.top = (lower_div_height + clock_height + 20) + "px";
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

function notifyMole(mole) {
    for (const e of mole_txt.getElementsByClassName("mole-header")) mole_txt.removeChild(e);
    let h1 = document.createElement("h1"); h1.className = "mole-header";
    let h2 = document.createElement("h2"); h2.className = "mole-header";
    if (mole) {
        h1.textContent = "You're the Mole!"
        h2.textContent = "Your job is to try and lose the game for your side, but be careful - " +
            "if the moves you make are too obviously bad, your teammates may try and vote you out."
        mole_div.style.backgroundImage = 'url("img/bkg/mole-board.jpg")';
        playClip(AUDIO_CLIPS.enum.IS_MOLE);
    }
    else {
        h1.textContent = "You're not the Mole!"
        h2.textContent = "Your job is to try and win the game for your side, but be careful - " +
            "there's a Mole on your team!"
        mole_div.style.backgroundImage = 'url("img/bkg/not-mole.png")';
        playClip(AUDIO_CLIPS.enum.NOT_MOLE);
    }
    mole_txt.appendChild(h1); mole_txt.appendChild(h2);
    mole_div.style.display = "block"; //setTimeout(() => { mole_div.style.display = "none"; },5000);

}

function selectMove(moves) { //console.log("Displaying Arrows for Move:" + JSON.stringify(moves));
    if (current_hover !== null) current_hover.style.visibility = "hidden";
    zug_board.updateBoard(moves.fen);
    move_cells[current_ply].style.color = "#FFFFFF";
    move_cells[current_ply].style.border = "none";
    let tools = move_cells[current_ply].getElementsByClassName("tooltiptext");
    tools[0].style.visibility = "hidden";
    for (let i=0;i<moves.selected.length;i++) {
        zug_board.drawArrow(moves.selected[0].move,
            moves.selected[i].player === null ? "#555555" : moves.selected[i].player.play_col);
    }
    for (let i=0;i<moves.alts.length;i++) {
        zug_board.drawArrow(moves.alts[i].move,moves.alts[i].player.play_col);
    }
    current_ply = moves_range.value = moves.ply;
    move_cells[current_ply].style.color = "#FFFF00";
    move_cells[current_ply].style.border = "solid";
    tools = move_cells[current_ply].getElementsByClassName("tooltiptext");
    tools[0].style.visibility = "visible";
}

function exportPGN() {
    console.log(JSON.stringify(move_history));
    let pgn_txt = "";
    for (let i=0; i<move_history.length; i++) {
        pgn_txt += (move_history[i].selected[0].move.san + " ");
    }
    alert(pgn_txt);
}

function updateGame(game) { //console.log("Update Game: " + JSON.stringify(game));
    if (game.title === selected_game) {
        if (game.currentFEN !== undefined) {
            if (game.currentFEN !== zug_board.currentFEN) {
                let cancelMove = zug_board.promoting;
                zug_board.clearPromotion(cancelMove);
            }
            zug_board.updateBoard(game.currentFEN);
            if (game.timeRemaining !== undefined) countdown(selected_game,game.turn,game.timeRemaining);
        }
        if (game.history !== undefined) updateMoveList(game.history);
        updatePlayTbl(game);
    }
}

function voteSummary(votes) {  //console.log(votes.selected[0]);
    let n = Math.ceil((votes.ply + 1) / 2) +  (votes.ply % 2 === 0 ? "." : "...");
    let txt = n + votes.selected[0].move.san + " -> " +
        (votes.selected[0].player !== null ? votes.selected[0].player.user.name : "?") + " <br> ";
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

            if (history[i].selected.length > 0) {
                move_entry.textContent = m + history[i].selected[0].move.san;
            }
            else move_entry.textContent = "?";
            move_entry.onclick = () => { selectMove(move_history[i]); };

            let move_span = document.createElement("span");
            move_span.className = "tooltiptext";
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
    play_name.innerHTML = pdata.away ? pdata.user.name.strike() : pdata.user.name;
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
    clearElement(score_tbl);
    for (let i=0;i<data.length;i++) {
        let row = document.createElement("tr");
        let play_field = document.createElement("td");
        play_field.textContent = data[i].name;
        let rating_field = document.createElement("td");
        rating_field.textContent = data[i].rating;
        row.appendChild(play_field); row.appendChild(rating_field);
        score_tbl.appendChild(row);
    }
}

function showPlayers(players) {
    writeMessage("Active Players:",selectTab("serv").messages);
    for (let i=0;i<players.length;i++) {
        writeMessage(players[i].name,selectTab("serv").messages);
    }
}

function showHighScores() {
    score_div.style.display = "block";
    send("top",10);
    fadeAndPlay(AUDIO_CLIPS.enum.EPIC);
}

function showHelp() {
    document.getElementById('div-help').style.display='block';
    fadeAndPlay(AUDIO_CLIPS.enum.FUGUE)
}

function clearElement(e) {
    while (e.firstChild) e.removeChild(e.lastChild);
}

function createGame() {
    let title = prompt("Enter a new game title",username);
    console.log("Starting: " + title);
    if (title !== null) {
        send("newgame", {title: title, color: COLOR_UNKNOWN});
        playClip(AUDIO_CLIPS.enum.BUMP);
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

let toggle = true;
function test() { toggle = !toggle; }
