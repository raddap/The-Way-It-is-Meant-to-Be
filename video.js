
var player;
var triedSoundAt = 0;
var TIME_KEY = 'cornerVideoTime';

function savedTime() {
    try {
        return parseFloat(sessionStorage.getItem(TIME_KEY)) || 0;
    } catch (e) {
        return 0;
    }
}

function saveTime() {
    if (!player || !player.getCurrentTime) return;
    var time = player.getCurrentTime();
    if (time > 0) {
        try {
            sessionStorage.setItem(TIME_KEY, time);
        } catch (e) {}
    }
}

function resumeThenPlay() {
    var time = savedTime();
    if (time > 0) player.seekTo(time, true);
    trySound();
    setInterval(saveTime, 250);
    window.addEventListener('pagehide', saveTime);
}

function trySound() {
    if (!player || !player.unMute) return;
    triedSoundAt = Date.now();
    player.unMute();
    player.setVolume(100);
    player.playVideo();
}

// Called automatically by the YouTube script once it has loaded.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('corner-video', {
        events: {
            onReady: resumeThenPlay,
            onStateChange: function (event) {
                var blocked = event.data === YT.PlayerState.PAUSED &&
                              Date.now() - triedSoundAt < 3000;
                if (blocked) {
                    triedSoundAt = 0;
                    player.mute();
                    player.playVideo();
                }
            }
        }
    });
}

document.addEventListener('pointerdown', trySound, true);

var youtubeScript = document.createElement('script');
youtubeScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(youtubeScript);
