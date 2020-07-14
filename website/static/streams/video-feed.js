var webcamStream = null;

var videoSelect = null;
var audioSelect = null;
var selectors = null;

window.addEventListener("load", function() {
  var constraints = {audio: true, video: true};

  webcamStream = navigator.mediaDevices.getUserMedia(constraints)
    .then(document.getElementById("local_video").srcObject = webcamStream);
    
  videoSelect = document.getElementById("video_source");
  audioSelect = document.getElementById("audio_source");

  selectors = [videoSelect, audioSelect];
  
  audioSelect.onchange = start;
  videoSelect.onchange = start;

  start();
}, false);

function getDevices(deviceInfos) { 
  const values = selectors.map(selector => selector.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild)
    }
  });

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;

    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option)
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }

  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(getDevices)

function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
      .then(() => {
        console.log(`Success, audio output device attached: ${sinkId}`);
      })
      .catch(error => {
        let errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
        }
        console.error(errorMessage);
        audioOutputSelect.selectedIndex = 0;
      });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function gotStream(stream) {
  document.getElementById("local_video").srcObject = stream;
  return navigator.mediaDevices.enumerateDevices();
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(getDevices);
}