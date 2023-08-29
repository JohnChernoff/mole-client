let COLOR_CYCLING = false;
let checker_timer;

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
    let w = array.length; let h = w; //array[0].length;
    let n =  w * h; //console.log(w + "," + h + "," + n);
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

function rndCheckerFill(img,millis,inc,canvas,color,callback1,callback2) { //console.log("Check, millis: " +  millis + ", inc: " + inc);
    if (document.visibilityState !== "visible") return; //console.log("CheckerFilling...");
    if (checker_timer != undefined) clearInterval(checker_timer.timer);

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
            checker_timer.seconds -= inc;
            if (callback1 !== null && callback1 !== undefined) callback1();
            if (t < iter) checkerFill(t++,img,matrix,ctx,dim,dim); //drawTime(seconds,max_seconds);
            else {
                clearInterval(checker_timer.timer);
                if (callback2 !== undefined) callback2();
            } //if (checker_timer.seconds <= 0)
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

function animateMole(duration) {
    const mole = document.getElementById("mole-sprite");
    let x = "-44vw";
    let y = "33vh";

    let mole_legs = mole.animate([
        { backgroundImage: 'url("img/sprites/molesprite1.png") '},
        { backgroundImage: 'url("img/sprites/molesprite2.png") '}
    ], {
        duration: 250,
        direction: 'alternate',
        iterations: 'Infinity'
    });

    let mole_ani = mole.animate([
        { transform: "translateX(" + x + ")", offset: .5 },
        { transform: "translateX(" + x + ") rotate(-90deg) scaleY(-1)"  },
        { transform: "translate(" + x + "," + y + ") rotate(-90deg) scaleY(-1)" }
    ], {
        duration: duration,
        fill: 'forwards'
    });

    mole_ani.finished.then( () => {
        mole_legs.cancel();
        mole.animate([
            { opacity: "0" },
        ], {
            duration: 2500,
            fill: 'forwards'
        });
        splash_screen.animate([
            { backgroundImage: 'url("img/bkg/mole-splash2c.png")'}
        ], {
            duration: 2500, //easing: "cubic-bezier(0.42, 0, 1, 1)",
            fill: 'forwards'
        }).finished.then( () => { mole.style.visibility = "hidden"; });
    });

}

function animateDefection(duration,player) {

    main_div.style.display = "none";
    div_defect.style.display = "block";

    let color_txt = player.game_col ? "white" : "black";
    document.getElementById("defect-txt").innerHTML = player.user.name + " defects to " + color_txt + "!";

    const mole = document.getElementById("mole-defect-sprite");
    mole.style.top = player.game_col ? "60%" : "50%";

    let mole_legs = mole.animate([
        { backgroundImage: 'url("img/sprites/molesprite1.png") '},
        { backgroundImage: 'url("img/sprites/molesprite2.png") '}
    ], {
        duration: 250,
        direction: 'alternate',
        iterations: 'Infinity'
    });

    let gradient =
        "linear-gradient(to " + (player.game_col  ? "top" : "bottom") + ", rgba(0,0,0,0) 20%,rgba(0,0,0,.95) 80%)";
    let bkg_ani = div_defect_overlay.animate([
        { background: gradient, offset: 1 },
    ], {
        duration: duration,
    });

    let x = "-" + div_defect.clientWidth + "px";
    let mole_ani = mole.animate([
        { transform: "translateX(" + x + ")", offset: 1 },
    ], {
        duration: duration,
    });

    mole_ani.finished.then( () => {
        mole_legs.cancel(); bkg_ani.cancel();
        main_div.style.display = "block";
        div_defect.style.display = "none";
    });
}

function animateRampage(duration,player) {

    main_div.style.display = "none";
    div_ramp.style.display = "block";

    document.getElementById("ramp-txt").innerHTML = player.user.name + " rampages!";

    const mole = document.getElementById("mole-ramp-sprite");
    mole.style.top = "50%";

    let mole_blink = mole.animate([
        { backgroundImage: 'url("img/sprites/ramp1.png") '},
        { backgroundImage: 'url("img/sprites/ramp2.png") '}
    ], {
        duration: 250,
        direction: 'alternate',
        iterations: 'Infinity'
    });

    let x = "-" + div_ramp.clientWidth + "px";
    let mole_ani = mole.animate([
        { transform: "translateX(" + x + ")", offset: 1 },
    ], {
        duration: duration,
    });

    mole_ani.finished.then( () => {
        mole_blink.cancel();
        main_div.style.display = "block";
        div_ramp.style.display = "none";
    });
}

