let COLOR_CYCLING = false;

function colorCycle(elem,ticks) {
    COLOR_CYCLING = true;
    let t = ticks;
    let c =  getComputedStyle(elem,null).backgroundColor; //console.log("BKG: " + c);
    let color = toRGBArray(c); //console.log("Current Color: " + color);
    let target = rndColorArray(color); //console.log("New Target: " + target);
    let interval = setInterval(() => {
        elem.style.backgroundColor = array2rgb(color);
        if (nextCol(color,target,t--)) {
            clearInterval(interval);
            if (COLOR_CYCLING) colorCycle(elem,ticks);
        }
    },50);
}

function nextCol(current_color,target_color,ticks) {
    let diffs = [3]; //let min_diff = 255;
    for (let i=0;i<3;i++) {
        diffs[i] = current_color[i] - target_color[i];
        let diff = Math.abs(diffs[i]); //if (diff < min_diff) min_diff = diff;
    }
    for (let i=0;i<3;i++) {
        current_color[i] -= (diffs[i] / ticks);
    }
    return (ticks <= 0);
}

function stopCycle() {
    COLOR_CYCLING = false;
}

function rndColorArray(prev_color) {
    let new_color = [3];
    for (let i=0; i<3; i++) {
        new_color[i] = Math.floor(Math.random() * 128);
        if (prev_color[i] < 128) new_color[i] += 128;
    }
    return new_color;
}

function array2rgb(c) {
    let r = Math.floor(c[0]), g = Math.floor(c[1]), b = Math.floor(c[2]);
    return ["rgb(",r,",",g,",",b,")"].join("");
}

const toRGBArray = rgbStr => rgbStr.match(/\d+/g).map(Number);


function get2D(n, w) {
    return { "y" :  Math.floor(n/w), "x" : n % w }
}

function shuffle2D(array) {
    let w = array.length; let h = array[0].length; let n =  w * h; //console.log(w + "," + h + "," + n);
    for (let i = n - 1; i > 0; i--) {
        let c1 = get2D(i,w);
        const currentElement = array[c1.x][c1.y]; //console.log(JSON.stringify(currentElement));
        const swapIndex = Math.floor(Math.random() * (i + 1));
        let c2 = get2D(swapIndex,w);
        const swapElement = array[c2.x][c2.y]; //console.log(JSON.stringify(swapElement));
        array[c1.x][c1.y] = swapElement;
        array[c2.x][c2.y] = currentElement;
    }
}

let checker_timer;
function rndCheckerFill(img,millis,inc,canvas,color,fun) { //console.log(img);
    if (document.visibilityState !== "visible") return;
    if (checker_timer != undefined) clearInterval(checker_timer);
    let interval = 1000 * inc;
    let i = millis / interval;
    let iter = Math.pow(Math.floor(Math.sqrt(i)),2); //console.log("Iter: " + iter);
    canvas.width = iter; canvas.height = iter; //img.width = iter; img.height = iter;
    let dim = Math.floor(Math.sqrt(iter)); //iter = dim*dim;

    let matrix = new Array(dim);
    for (let x = 0; x < matrix.length; x++) {
        matrix[x] = new Array(dim);
        for (let y = 0; y < matrix[x].length; y++) { //console.log(x + "," + y);
            matrix[x][y] = { "filled" : false, "rndX" : x * dim, "rndY" : y * dim }
        }
    }
    shuffle2D(matrix); //if (timer !== null) clearInterval(timer);

    let ctx = canvas.getContext('2d');
    ctx.width = canvas.width; ctx.height = canvas.height;
    ctx.fillStyle = color; ctx.fillRect(0,0,canvas.width,canvas.height);

    let t = 0;
    checker_timer = {
        "timer" : setInterval(() => {
        if (fun !== undefined) fun();
        checker_timer.seconds -= inc;
        if (t < iter) checkerFill(t++,img,matrix,ctx,dim,dim); //drawTime(seconds,max_seconds);
        else clearInterval(checker_timer.timer); //if (checker_timer.seconds <= 0)
    },interval) ,
    "seconds" : (millis/1000)
    };

}

function checkerFill(i,img,mat,ctx,w,h) { //console.log(i + "," + img);
    let c = get2D(i,mat.length);
    let x = mat[c.x][c.y].rndX, y = mat[c.x][c.y].rndY; //console.log("x: " + x + ", y: " + y);
    let fx = (img.width / ctx.width), fy = (img.height / ctx.height);
    ctx.drawImage(img,x * fx,y * fy,w * fx,h * fy,x,y,w,h);
}