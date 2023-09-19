import {Chess} from "./chess/chess.js";

import LichessPgnViewer from './chess/lichess-pgn-viewer.min.js';

export const testPGN =  (domElement) => {
    let pgntxt = document.getElementById("txt-pgn").value;
    //let pgn = PgnParser.parse(pgntxt, { startRule: 'game'});
    //let prettyJson = JSON.stringify(pgn, null, 2); console.log(prettyJson);
    const game = new Chess();
    //game.loadPgn(pgntxt);
    //console.log(JSON.stringify(game.history({ verbose: true })));

    const lpv = LichessPgnViewer(domElement, {
        pgn: pgntxt,
    });

    // lpv is an instance of Ctrl, providing some utilities such as:
    lpv.goTo('first');
    lpv.goTo('next');
    lpv.flip();
    console.log(lpv.game);
}

window.testPGN=testPGN;






