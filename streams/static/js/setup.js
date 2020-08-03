"use strict";

const localVideo = document.getElementById("video");

const audioSelect = document.getElementById("id_audio_select");
const videoSelect = document.getElementById("id_video_select");
const selectors = [audioSelect, videoSelect];

const formAudio = document.getElementById("id_audio_source");
const formVideo = document.getElementById("id_video_source");
const submitBtn = document.getElementById("id_submit");

var stream = null;

var constraints = {
  audio: true, 
  video: true
};

window.onload = () => {
  updateMediaStreams();
}

audioSelect.onchange = updateMediaStreams;
videoSelect.onchange = updateMediaStreams;

submitBtn.onclick = setForm;

function getDevices(devices) {
  const values = selectors.map(select => select.value);

  selectors.forEach(selector => {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  });

  for (let i = 0; i < devices.length; ++i) {
    const device = devices[i];
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label;

    if (device.kind === "audioinput") {
      audioSelect.appendChild(option);
    } else if (device.kind === "videoinput") {
      videoSelect.appendChild(option);
    } else {
      // console.log(device);
    }

    selectors.forEach((select, index) => {
      if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[index])) {
        select.value = values[index];
      }
    });
  }
}

function getStream(media) {
  localVideo.srcObject = media
  stream = media;

  return navigator.mediaDevices.enumerateDevices()
}

function setForm() {
  formAudio.value = audioSelect.value;
  formVideo.value = videoSelect.value;
}

function updateMediaStreams() {
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;

  constraints = {
    audio: {deviceId: audioSource},
    video: {deviceId: videoSource}
  }

  setForm();

  // console.log("Updating media streams")
  navigator.mediaDevices.getUserMedia(constraints).then(getStream).then(getDevices).catch(logError);
}

function logError(err) {
  console.log("*** " + err);
}