window.addEventListener("load", function() {
  var webcam = document.getElementById("local_video");
  var constraints = {
    audio: true, 
    video: {
      aspectRatio: {ideal: 1.333333}
    }
  };

  if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function onSuccess(localStream) {
          webcam.srcObject = localStream;
          localStream.getTracks().forEach(track => GamePeerConnection.addTrack(track, localStream));
      })
      .catch(function onFailure(error) {
          alert(JSON.stringify(error))
      })
  } else {
    alert('getUserMedia is not supported in this browser.');
  }
}, false);