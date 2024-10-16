// static/js/scripts.js

// Existing Conversion and Translation Functionality
document.getElementById('convertBtn').addEventListener('click', function () {
    const audioInput = document.getElementById('audioInput').files[0];
    if (!audioInput) {
        alert('Please upload an audio file.');
        return;
    }

    const formData = new FormData();
    formData.append('audio_file', audioInput);

    fetch('/convert', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('transcription').value = data.transcription;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('translateBtn').addEventListener('click', function () {
    const text = document.getElementById('transcription').value;
    if (!text) {
        alert('No text to translate.');
        return;
    }

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('translation').value = data.translation;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// New Recording Functionality
let mediaRecorder;
let audioChunks = [];

document.getElementById('recordBtn').addEventListener('click', function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            document.getElementById('recordBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { 'type': 'audio/wav;' });
                audioChunks = [];
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = document.getElementById('audioPlayback');
                audio.src = audioUrl;

                // Automatically upload the recorded audio
                const formData = new FormData();
                formData.append('audio_file', audioBlob, 'recorded_audio.wav');

                fetch('/convert', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        document.getElementById('transcription').value = data.transcription;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            });
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('Could not access the microphone. Please check your permissions.');
        });
});

document.getElementById('stopBtn').addEventListener('click', function () {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }
});
