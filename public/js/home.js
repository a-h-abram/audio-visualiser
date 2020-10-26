let audioPlayer = null;

$(document).ready(_ => {
    audioPlayer = document.getElementById('audio-player');
    const audioUploader = document.getElementById('audio-uploader');

    let threeScene = new ThreeScene();

    threeScene.run();

    audioUploader.addEventListener('change', async (ev) => {
        const files = ev.target.files;
        const audio = URL.createObjectURL(files[0]);

        audioPlayer.src = audio;
        audioPlayer.load();

        await threeScene.loadAudio(audio, audioPlayer);

        $('#upload-section').fadeOut();
        $('#btn-redo').fadeIn();
    }, false);

    audioPlayer.addEventListener('pause', () => {
        if (threeScene && threeScene.audioVisualiser) {
            threeScene.audioVisualiser.pause();
        }
    });

    audioPlayer.addEventListener('play', () => {
        if (threeScene && threeScene.audioVisualiser) {
            threeScene.audioVisualiser.play();
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (threeScene && threeScene.audioVisualiser) {
            threeScene.audioVisualiser.updateTime();
        }
    });
});

getFile = () => {
    document.getElementById("audio-uploader").click();
};

reload = () => {
    window.location.reload();
};
