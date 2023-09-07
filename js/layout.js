const LAYOUT_STYLES = createEnum(['UNDEFINED','HORIZONTAL','VERTICAL']);
let layout_style = LAYOUT_STYLES.UNDEFINED;

function createEnum(arr) {
    let obj = Object.create(null);
    for (let val of arr) {
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}

function setLayout() {
    let main_div_size;
    let max_board_width = window.innerWidth / 2.5;
    let max_board_height = window.innerHeight * .89;
    if (window.innerWidth > window.innerHeight) {
        layout_style = LAYOUT_STYLES.HORIZONTAL;
        sidebar_left.style.left = "0px";
        sidebar_left.style.top = "0px";
        sidebar_left.style.width = "20vw";
        sidebar_left.style.height = "100vh";

        main_div_size = Math.floor(Math.min(max_board_width, max_board_height));
        main_div_size -= (main_div_size % 8); //to make squares equally divisible in the grid
        let extra_width = (max_board_width - main_div_size)/2;
        main_div.style.left = Math.floor((window.innerWidth * .25) + (extra_width > 0 ? extra_width : 0)) + "px";

        status_div.style.left =  main_div.style.left;
        status_div.style.top = "";
        status_div.style.bottom = "1vh";
        status_div.style.width = (main_div_size-8) + "px";
        status_div.style.height = "7vh";

        games_div.style.left = "70vw";
        games_div.style.top = "0px";
        games_div.style.width = "30vw";
        games_div.style.height = "50vh";

        moves_div.style.left = "70vw";
        moves_div.style.top = "50vh";
        moves_div.style.width = "30vw";
        moves_div.style.height = "50vh";
    }
    else {
        layout_style = LAYOUT_STYLES.VERTICAL;
        comm_div.style.left = "0px";
        comm_div.style.top = "0px";
        comm_div.style.width = "30vw";
        comm_div.style.height = "99vh";

        main_div_size = Math.floor(window.innerWidth * .67);
        main_div_size -= (main_div_size % 8); //to make squares equally divisible in the grid
        main_div.style.left = "33vw"; //(window.innerWidth * .25) + "px";

        let lower_div_height = Math.floor(window.innerWidth * .70);

        let clock_height = 50;
        status_div.style.left = main_div.style.left;
        status_div.style.top = lower_div_height + "px";
        status_div.style.bottom = "";
        status_div.style.width = main_div_size + "px";
        status_div.style.height = clock_height + "px";

        games_div.style.left = "33vw";
        games_div.style.top = (lower_div_height + clock_height + 20) + "px";
        games_div.style.width =  (main_div_size / 2) + "px";
        games_div.style.height = (window.innerHeight - lower_div_height) + "px";

        moves_div.style.left = "66vw";
        moves_div.style.top = (lower_div_height + clock_height + 20) + "px";
        moves_div.style.width =  (main_div_size / 2) + "px";
        moves_div.style.height = (window.innerHeight - lower_div_height) + "px";
    }
    main_div.style.top = ((max_board_height - main_div_size) / 2) + "px";  //"1vh";
    main_div.style.width =  main_div_size + "px";
    main_div.style.height = main_div_size + "px";
}
