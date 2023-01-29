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