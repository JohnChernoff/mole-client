import LichessPgnViewer from './chess/lichess-pgn-viewer.min.js';
let lpv;
export const loadPGN =  (e,pgn_txt) => {
    lpv = LichessPgnViewer(e, {
        pgn: pgn_txt,
    });
    console.log("Game PGN: " + lpv.game);
}

window.loadPGN=loadPGN;