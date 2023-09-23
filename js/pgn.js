import LichessPgnViewer from './chess/lichess-pgn-viewer.min.js';

let lpv;
export const loadPGN =  (e,pgn_txt) => {
    lpv = LichessPgnViewer(e, {
        pgn: pgn_txt,
    });
    console.log("Game PGN: " + lpv.game);
}

export function parsePlayersFromPGN(pgn) {
    let game = PgnParser.parse(pgn.replaceAll("0-0-0","O-O-O").replaceAll("0-0","O-O"),
        {startRule : "game" });
    return {
        white_players :  game.tags.White.split(" "), //TODO: IE breaks
        black_players :  game.tags.Black.split(" ")
    };
}

window.loadPGN=loadPGN;
window.parsePlayersFromPGN=parsePlayersFromPGN;