function ZugSquare(piece,color,canvas) {
    this.piece = piece;
    this.color = color;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
}

class ZugBoard {
    static PIECE_CHRS = "kqrbnp-PNBRQK";
    static PAWN = 1;

    constructor(wrapper,move_handler,callback,colors) {
        this.board = [];
        this.piece_imgs = [];
        this.board_background_color = [0,0,0];
        this.billinear = false;
        this.svg_pieces = false;
        this.square_width = 0;
        this.square_height = 0;
        this.pieces_loaded = 0;
        this.max_files = 8;
        this.max_ranks = 8;
        this.drag_move = null;
        this.povBlack = false;
        this.currentFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        if (colors !== undefined) {
            this.black_square_color = ZugBoard.hexToRgb(colors.square.black);
            this.white_square_color = ZugBoard.hexToRgb(colors.square.white);
            this.black_piece_color = colors.piece.black;
            this.white_piece_color = colors.piece.white;
        }
        else {
            this.white_piece_color = "#ffffff";
            this.black_piece_color = "#000000";
            this.white_square_color = ZugBoard.rgb(92,155,92);
            this.black_square_color = ZugBoard.rgb(155,92,92);
        }
        this.current_promotion = "Q"; //TODO: "q" and underpromotions
        this.loadPieces(callback);
        this.initGridBoard(wrapper,move_handler);
        this.overlay = document.createElement("canvas");
        this.overlay.style.position = "absolute";
        this.overlay.style.top = "0";
        this.overlay.style.left = "0";
        this.overlay.style.width = "100%";
        this.overlay.style.height = "100%";
        this.overlay.width = wrapper.clientWidth;
        this.overlay.height = wrapper.clientHeight;
        this.overlay.style.pointerEvents = "none";
        this.overlay_ctx = this.overlay.getContext("2d");
        wrapper.appendChild(this.overlay);
    }

    alg2coord(move) {
        let w2 = this.square_width/2, h2 = this.square_height/2;
        let x1 = (move.from.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)) * this.square_width;
        let y1 = (this.max_ranks - move.from.toLowerCase().charAt(1)) * this.square_height;
        let x2 = (move.to.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)) * this.square_width;
        let y2 = (this.max_ranks - move.to.toLowerCase().charAt(1)) * this.square_height;
        return {
            from: { x: x1 + w2, y: y1 + h2 },
            to: { x: x2 + w2, y: y2 + h2 }
        }
    }

    clearOverlay() {
        this.overlay_ctx.strokeStyle = "black";
        this.overlay_ctx.fillStyle = "black";
        this.overlay_ctx.fillRect(0,0,this.overlay.width,this.overlay.height);
        this.overlay_ctx.clearRect(0,0,this.overlay.width,this.overlay.height);
    }

    drawArrow(move,color) {
        let coords = this.alg2coord(move); //console.log(JSON.stringify(coords));
        this.overlay_ctx.fillStyle = color + "80";
        let dist = ZugBoard.calcDistance(coords);
        this.overlay_ctx.save();
        this.overlay_ctx.translate(coords.from.x+10,coords.from.y);
        let arrowhead_x = dist * .8;
        let arrowhead_y = this.square_height * .2;
        this.overlay_ctx.rotate(ZugBoard.calcAngle(coords));
        this.overlay_ctx.fillRect(0,-10,arrowhead_x,20);
        this.overlay_ctx.beginPath();
        this.overlay_ctx.moveTo(arrowhead_x,0);
        this.overlay_ctx.lineTo(arrowhead_x,arrowhead_y);
        this.overlay_ctx.lineTo(dist,0);
        this.overlay_ctx.lineTo(arrowhead_x,-arrowhead_y);
        this.overlay_ctx.lineTo(arrowhead_x,0);
        this.overlay_ctx.fill();
        this.overlay_ctx.closePath();
        this.overlay_ctx.restore();
    }

    loadPieces(callback) {
        console.log("Loading pieces...");
        for (let i=0;i<6;i++) {
            this.piece_imgs[i] = { black: new Image(), white: new Image() };
            this.fetchPiece("b",i+1,this.piece_imgs[i].black,callback);
            this.fetchPiece("w",i+1,this.piece_imgs[i].white,callback);
        }
    }

    fetchPiece(color,i,img,callback) {
        let id = color + i;
        if (this.svg_pieces) {
            fetch("img/pieces/" + id +  ".svg", {cache: "reload"}).
            then(response => response.text()).
            then(text => {
                let svg = document.createElement("template");
                svg.innerHTML = text; let e = svg.content.getElementById(id);
                e.getElementById("layer1").style =
                    color === "w" ? "fill:" + this.white_piece_color : "fill:" + this.black_piece_color;
                let xml = (new XMLSerializer).serializeToString(e);
                img.src = "data:image/svg+xml;charset=utf-8,"+xml;
                img.onload = () => {  if (++this.pieces_loaded >= 12) { callback(); } };
            });
        }
        else {
            img.src = "img/pieces/leipzig/" + id + ".png";
            img.onload = () => {  if (++this.pieces_loaded >= 12) { callback(); } };
        }
    }

    resize(board,wrapper) {
        let width = Math.floor(wrapper.clientWidth/8)-1;
        let height = Math.floor(wrapper.clientHeight/8)-1;
        for (let file=0;file<this.max_files;file++) {
            for (let rank = 0; rank < this.max_ranks; rank++) {
                this.board[file][rank].canvas.width = width;
                this.board[file][rank].canvas.height = height;
            }
        }
    }

    updateBoard(fen) {
        zug_board.clearOverlay();
        zug_board.setFEN(fen !== undefined ? fen : this.currentFEN);
        zug_board.drawGridBoard();
    }

    initGridBoard(wrapper,moveHandler) {
        this.square_width = Math.floor(wrapper.clientWidth/8)-1;
        this.square_height = Math.floor(wrapper.clientHeight/8)-1;
        for (let file=0;file<this.max_files;file++) this.board[file] = [];
        for (let rank=0;rank<this.max_ranks;rank++) {
            for (let file=0;file<this.max_files;file++) {
                let can = document.createElement("canvas");
                can.id = "" + (file + (rank * this.max_ranks));
                can.draggable = true;
                can.width = this.square_width;
                can.height = this.square_height;
                wrapper.appendChild(can);
                let white = file % 2 === 0; if (rank % 2 === 1) white = !white;
                this.board[file][rank] = new ZugSquare(
                    0,white ? this.white_square_color : this.black_square_color, can);
                can.addEventListener("dragstart", ev => {
                    this.drag_move = { from: this.getCoords(ev.target.id), to: null, x: 0, y: 0, promotion: null };
                })
                can.addEventListener("dragenter", ev => {
                    this.drag_move.to = this.getCoords(ev.target.id);
                });
                can.addEventListener("dragend", () => {
                    let rect = wrapper.getBoundingClientRect();
                    let piece = Math.abs(this.board[this.drag_move.from.x][this.drag_move.from.y].piece);
                    if (piece === ZugBoard.PAWN &&
                        (this.drag_move.to.y === 0 || this.drag_move.to.y >= this.max_ranks-1)) {
                        this.drag_move.promotion = this.current_promotion;
                    }
                    if (ZugBoard.inBounds(this.drag_move.x,this.drag_move.y,rect)) {
                        console.log(ZugBoard.getAlgebraicMove(this.drag_move));
                        moveHandler(this.drag_move);
                    }
                });
                //for fucking firefox...
                can.addEventListener("dragover", ev => {
                    can.dispatchEvent(new MouseEvent('drag', ev)); ev.preventDefault();
                });
                can.addEventListener("drag", ev => {
                    this.drag_move.x = ev.pageX; this.drag_move.y = ev.pageY;
                });
            }
        }
    }

    povRank(rank) { if (this.povBlack) return this.max_ranks - rank - 1; else return rank; }
    povFile(file) { if (this.povBlack) return this.max_files - file - 1; else return file; }

    flip() {
        this.povBlack = !this.povBlack; this.updateBoard(this.currentFEN);
    }

    getCoords(id) {
        return { x: this.povFile(id % this.max_files), y: this.povRank(Math.floor(id / this.max_ranks)) };
    }

    setFEN(fen) {
        this.currentFEN = fen;
        for (let y=0;y<this.max_ranks;y++) for (let x=0;x<this.max_files;x++) this.board[x][y].piece = 0;
        let ranks = fen.split(" ")[0].split("/");
        for (let rank = 0; rank < ranks.length; rank++) {
            let file = 0; let pov_rank = this.povRank(rank); //console.log("POV_RANK: " + pov_rank);
            for (let i = 0; i < ranks[rank].length; i++) {
                let char = ranks[rank].charAt(i);
                let piece = ZugBoard.PIECE_CHRS.indexOf(char);
                if (piece === -1) file += parseInt(char); else {
                    this.board[this.povFile(file++)][pov_rank].piece = piece - 6;
                }
            }
        }
    }

    drawGridBoard() {
        if (this.billinear) this.drawInterpolatedSquares(); else this.drawNormalSquares();
        for (let y=0;y<this.max_ranks;y++) for (let x=0;x<this.max_files;x++) this.drawGridPiece(this.board[x][y]);
    }

    drawNormalSquares() {
        for (let y = 0; y < this.max_ranks; y++) {
            for (let x = 0; x < this.max_files; x++) {
                this.board[x][y].ctx.fillStyle = this.board[x][y].color;
                this.board[x][y].ctx.fillRect(0,0,this.board[x][y].canvas.width,this.board[x][y].canvas.height);
            }
        }
    }

    drawGridPiece(square) {
        if (square.piece !== 0) {
            let piece_width,piece_x,piece_height,piece_y;
            if (this.svg_pieces) {
                piece_width = square.canvas.width/2; piece_x = square.canvas.width/4;
                piece_height = square.canvas.height/2; piece_y = square.canvas.height/3;
            }
            else {
                piece_width = square.canvas.width * .8; piece_height = square.canvas.height * .8;
                piece_x = square.canvas.width * .1; piece_y = square.canvas.height * .1;
            }
            if (square.piece > 0) {
                square.ctx.drawImage(this.piece_imgs[square.piece-1].white,piece_x,piece_y,piece_width,piece_height);
            }
            else square.ctx.drawImage(this.piece_imgs[-square.piece-1].black,piece_x,piece_y,piece_width,piece_height);
        }
    }

    drawInterpolatedSquares() {
        let pix_array = this.getInterpolatedBoard();
        for (let y = 0; y < this.max_ranks; y++) {
            for (let x = 0; x < this.max_files; x++) {
                this.board[x][y].ctx.putImageData(this.getInterpolatedSquare(x,y,pix_array),0,0);
            }
        }
    }

    getInterpolatedBoard() {
        let edge_col = this.board_background_color;
        let padded_board_width = this.square_width * (this.max_files+2);
        let padded_board_height = this.square_height * (this.max_ranks+2);
        let pix_array = [];
        for (let w=0; w < (padded_board_width); w++) {
            pix_array[w] = [];
            for (let h=0; h < (padded_board_height); h++) {
                pix_array[w][h] = [];
                for (let i = 0; i < 3; i++) pix_array[w][h][i] = 0;
            }
        }
        let rect = { left: 0, top: 0, right: this.max_files-1, bottom: this.max_ranks-1 };
        let x_center = Math.floor(this.square_width/2), y_center = Math.floor(this.square_height/2);
        for (let nx = -1; nx < 8; nx++) {
            for (let ny = -1; ny < 8; ny++) {
                let sqr_x = Math.floor(((nx + 1) * this.square_width) + x_center);
                let sqr_y = Math.floor(((ny + 1) * this.square_height) + y_center);
                let c1 = ZugBoard.inBounds(nx, ny, rect) ?
                    ZugBoard.rgb2array(this.board[nx][ny].color) : edge_col;
                let c2 = ZugBoard.inBounds(nx + 1, ny, rect) ?
                    ZugBoard.rgb2array(this.board[nx + 1][ny].color) : edge_col;
                let c3 = ZugBoard.inBounds(nx, ny + 1, rect) ?
                    ZugBoard.rgb2array(this.board[nx][ny + 1].color) : edge_col;
                let c4 = ZugBoard.inBounds(nx + 1, ny + 1, rect) ?
                    ZugBoard.rgb2array(this.board[nx + 1][ny + 1].color) : edge_col;
                for (let i = 0; i < 3; i++) {
                    for (let lerp_x = 0; lerp_x < this.square_width; lerp_x++) {
                        let v = lerp_x / this.square_width, x = sqr_x + lerp_x, bottom_y = sqr_y + this.square_height;
                        //interpolate right
                        pix_array[x][sqr_y][i] = Math.floor(ZugBoard.lerp(v, c1[i], c2[i]));
                        //interpolate right and below
                        pix_array[x][bottom_y][i] = Math.floor(ZugBoard.lerp(v, c3[i], c4[i]));
                        //interpolate down
                        for (let lerp_y = 0; lerp_y < this.square_height; lerp_y++) {
                            let y = sqr_y + lerp_y; v = lerp_y / this.square_height;
                            pix_array[x][y][i] =
                                Math.floor(ZugBoard.lerp(v, pix_array[x][sqr_y][i], pix_array[x][bottom_y][i]));
                        }
                    }
                }
            }
        }
        return pix_array;
    }

    getInterpolatedSquare(file,rank,pix_array) {
        let img_data = new ImageData(this.square_width,this.square_height); let pixels = img_data.data;
        let array_x = this.square_width + (file * this.square_width),
            array_y = this.square_height + (rank * this.square_height); //pix_array is 10x10
        for (let py = 0; py < this.square_height; py++) {
            for (let px = 0; px < this.square_width; px++) {
                ZugBoard.setPixel((py * img_data.width + px) * 4,pixels,pix_array[array_x + px][array_y + py]);
            }
        }
        return img_data;
    }

    static setPixel(offset,pixels,pix_array) {
        pixels[offset] = pix_array[0]; pixels[offset + 1] = pix_array[1]; pixels[offset + 2] = pix_array[2];
        pixels[offset + 3] = 255;
    }

    static lerp(v, start, end) {
        return (1 - v) * start + v * end;
    }

    static inBounds(x,y,rect) {
        return (x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom);
    }

    static getAlgebraicCoord(coord) { return String.fromCharCode(('a'.charCodeAt(0) + coord.x)) + "" + (8-coord.y); }
    static getAlgebraicMove(move) { return ZugBoard.getAlgebraicCoord(move.from) +ZugBoard.getAlgebraicCoord(move.to);}

    static rgb(r, g, b) {
        r = Math.floor(r); g = Math.floor(g); b = Math.floor(b);
        return ["rgb(",r,",",g,",",b,")"].join("");
    }

    static rgb2array(rgb) {
        return rgb.match(/\d+/g);
    }

    static hexToRgb(hex) {
        return(ZugBoard.Obj_RgbToRgb(ZugBoard.hexToObj_Rgb(hex)));
    }

    static Obj_RgbToRgb(color) {
        return ZugBoard.rgb(color.r,color.g,color.b);
    }

    static hexToObj_Rgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static calcDistance(coords) {
        let x2 = Math.pow(coords.from.x - coords.to.x,2);
        let y2 = Math.pow(coords.from.y - coords.to.y,2);
        return Math.sqrt(x2 + y2);
    }

    static calcAngle(coords) {
        //let dist = ZugBoard.calcDistance(coords);
        return Math.atan2((coords.to.y - coords.from.y),(coords.to.x - coords.from.x));
    }
}










