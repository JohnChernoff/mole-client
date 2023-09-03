let AUDIO = {
    sound : false,
    music : true
};

let AUDIO_PRELOAD = -1;

let AUDIO_LOAD = {
    sound : AUDIO_PRELOAD,
    music : AUDIO_PRELOAD
};

const AUDIO_CLIPS = {
    sound : createList(['CREATE','VOTE','ACCUSE','BUMP','IS_MOLE','NOT_MOLE','MOVE1','MOVE2','DEFECT','RAMPAGE']),
    music: createList(['INTRO','EPIC','FUGUE'])
}

let clips = {
    sound : [AUDIO_CLIPS.sound.length],
    music : [AUDIO_CLIPS.music.length]
};

let current_sfx,current_track,fader;

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

function loadAudio(onload) {
    loadSounds(onload);
}

function loadSounds(onload) {
    AUDIO_LOAD.sound = 0; let track = 0;
    for (let clip in AUDIO_CLIPS.sound.enum) {
        clips.sound[track] = new Audio("audio/sounds/" + clip.toLowerCase() + ".mp3");
        clips.sound[track++].addEventListener('loadeddata', () => {
            AUDIO_LOAD.sound++;
            console.log("Loaded: " + clip + " (" + AUDIO_LOAD.sound + "/" + AUDIO_CLIPS.sound.length + ")");
            if (AUDIO_LOAD.sound === AUDIO_CLIPS.sound.length) {
                console.log("Loaded all sound files");
                loadMusic(onload);
            }
        });
    }
}

function loadMusic(onload) {
    AUDIO_LOAD.music = 0; let track = 0;
    for (let clip in AUDIO_CLIPS.music.enum) {
        clips.music[track] = new Audio("audio/music/" + clip.toLowerCase() + ".mp3");
        clips.music[track++].addEventListener('loadeddata', () => {
            AUDIO_LOAD.music++;
            console.log("Loaded: " + clip + " (" + AUDIO_LOAD.music + "/" + AUDIO_CLIPS.music.length + ")");
            if (AUDIO_LOAD.music === AUDIO_CLIPS.music.length) {
                console.log("Loaded all music tracks");
                onload();
            }
        });
    }
}

function toggleSound(bool) {
    if (bool !== undefined) AUDIO.sound = bool; else AUDIO.sound = !AUDIO.sound;
    let buttons = document.getElementsByClassName("audio-toggle");
    for (let i =0; i < buttons.length; i++) {
        buttons[i].innerHTML = AUDIO.sound ? "Sound Off" : "Sound On";
    }
    if (!AUDIO.sound) {
        clips.sound[current_sfx.index].pause();
        clips.sound[current_sfx.index].currentTime = 0;
    }
}

function toggleMusic(bool) {
    if (bool !== undefined) AUDIO.music = bool; else AUDIO.music = !AUDIO.music;
    let buttons = document.getElementsByClassName("music-toggle");
    for (let i= 0; i < buttons.length; i++) {
        buttons[i].innerHTML = AUDIO.sound ? "Music Off" : "Music On";
    }
    if (!AUDIO.music) clips.music[current_track.index].pause();
}

function fadeAndPlay(clip,sfx) { //console.log("Fading...");
    if (current_track) {
        let audio = clips.music[current_track.index];
        if (fader) clearInterval(fader);
        fader = setInterval(()=> {
            let v = audio.volume - 0.1;
            if (AUDIO.music && v >= 0) audio.volume = v;
            else {
                clearInterval(fader); //current_track = undefined;
                if (sfx) playSFX(clip); else playTrack(clip);
            }
        },200);
    }
    else {
        if (sfx) playSFX(clip); else playTrack(clip);
    }
}

function playTrack(clip) {
    if (!clip) return;

    let prev_clip = current_track;
    current_track = clip;

    if (prev_clip) pauseClip(prev_clip);

    if (current_track !== prev_clip || clips.music[prev_clip.index].ended) {
        clips.music[current_track.index].currentTime = 0;
    }

    if (AUDIO.music) {
        console.log("Playing Track: " + clip.name);
        clips.music[current_track.index].volume = .8;
        try {
            if (prev_clip && !clips.music[prev_clip.index].ended) //&& prev_clip !== current_track
                clips.music[current_track.index].addEventListener("ended",() => {
                    current_track = prev_clip;
                    clips.music[current_track.index].addEventListener("ended",() => {});
                    clips.music[current_track.index].play();
                });
            else clips.music[current_track.index].addEventListener("ended",() => {});
            clips.music[current_track.index].loop = false;
            clips.music[current_track.index].play();
        }
        catch(err) { console.log("Error: " + err); }
    }
}

function playSFX(clip) {
    if (!clip) return;
    //if (current_sfx) clips.sound[current_sfx.index].pause();
    current_sfx = clip;
    clips.sound[current_sfx.index].play();
}

function pauseClip(clip) {
    if (clip !== undefined) clips.music[clip.index].pause();
}