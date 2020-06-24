const gameID = JSON.parse(document.getElementById("game_id").textContent);

var gamePeerConnection = null;    // RTCPeerConnection
var transceiver = null;         // RTCRtpTransceiver
var webcamStream = null;        // MediaStream from webcam

var gameSocket = null;

var constraints = {audio: true, video: true};

window.addEventListener("load", function() {
  gameSocket = new WebSocket("ws://" + window.location.host + "/ws/game/" + gameID + "/");

  connect()
}, false);

function connect() {
  gameSocket.onerror = function(evt) {
    console.dir(evt);
  }

  gameSocket.onmessage = function(event) {
    var msg = JSON.parse(event.data)

    switch (msg.type) {
      case "video-offer":
        handleVideoOfferMsg(msg);
        break;

      case "video-answer":
        handleVideoAnswerMsg(msg);
        break;

      case "new-ice-candidate":
        handleNewICECandidateMsg(msg);
        break;

      default:
        log_error("Unknown message received:");
        log_error(msg);
    }
  }
}

function sendToServer(msg) {
  var msgJSON = JSON.stringify(msg);

  log("Sending '" + msg.type + "' message: " + msgJSON);

  gameSocket.send(msgJSON);
}

async function createPeerConnection() {
  log("Setting up a peer connection...")

  gamePeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org"
      }
    ]
  });

  gamePeerConnection.onicecandidate = handleICECandidateEvent;
  gamePeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
  gamePeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  gamePeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  gamePeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
  gamePeerConnection.ontrack = handleTrackEvent;
}

function handleICEConnectionStateChangeEvent(event) {
  log("*** ICE connection state changed to " + gamePeerConnection.iceConnectionState);

  switch(gamePeerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      break;
  }
}

function handleICEGatheringStateChangeEvent(event) {
  log("*** ICE gathering state changed to: " + gamePeerConnection.iceGatheringState);
}

function handleSignalingStateChangeEvent(event) {
  log("*** WebRTC signaling state changed to: " + gamePeerConnection.signalingState);
  switch(gamePeerConnection.signalingState) {
    case "closed":
      break;
  }
}

async function handleNegotiationNeededEvent() {
  log("*** Negotiation needed");

  try {
    const offer = await gamePeerConnection.createOffer();

    log("---> Setting local description to the offer");
    await gamePeerConnection.setLocalDescription(offer);

    log("---> Sending the offer to the remote peer");
    sendToServer({
      type: "video-offer",
      sdp: gamePeerConnection.localDescription
    });
  } catch(err) {
    log("*** The following error occurred while handling the negotiationneeded event:");
    reportError(err);
  };
}

async function invite(evt) {
  log("Starting to prepare an invitation");
  if (gamePeerConnection) {
    alert("You can't start a call because you already have one open!");
  } else {
    createPeerConnection();

    try {
      webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById("local_video").srcObject = webcamStream;
    } catch(err) {
      handleGetUserMediaError(err);
      return;
    }

    try {
      webcamStream.getTracks().forEach(
        transceiver = track => gamePeerConnection.addTransceiver(track, {streams: [webcamStream]})
      );
    } catch(err) {
      handleGetUserMediaError(err);
    }
  }
}

async function handleVideoOfferMsg(msg) {
  log("Received video chat offer");
  if (!gamePeerConnection) {
    createPeerConnection();
  }

  var desc = new RTCSessionDescription(msg.sdp);

  if (gamePeerConnection.signalingState != "stable") {
    log("  - But the signaling state isn't stable, so triggering rollback");

    await Promise.all([
      gamePeerConnection.setLocalDescription({type: "rollback"}),
      gamePeerConnection.setRemoteDescription(desc)
    ]);

    return;
    
  } else {
    log ("  - Setting remote description");
    await gamePeerConnection.setRemoteDescription(desc);
  }

  if (!webcamStream) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch(err) {
      handleGetUserMediaError(err);
      return;
    }

    document.getElementById("local_video").srcObject = webcamStream;

    try {
      webcamStream.getTracks().forEach(
        transceiver = track => gamePeerConnection.addTransceiver(track, {streams: [webcamStream]})
      );
    } catch(err) {
      handleGetUserMediaError(err);
    }
  }

  log("---> Creating and sending answer to caller");

  await gamePeerConnection.setLocalDescription(await gamePeerConnection.createAnswer());

  sendToServer({
    type: "video-answer",
    sdp: gamePeerConnection.localDescription
  });
}

async function handleVideoAnswerMsg(msg) {
  log("*** Call recipient has accepted our call");

  var desc = new RTCSessionDescription(msg.sdp);
  await gamePeerConnection.setRemoteDescription(desc).catch(reportError);
}

async function handleNewICECandidateMsg(msg) {
  var candidate = new RTCIceCandidate(msg.candidate);

  log("*** Adding received ICE candidate: " + JSON.stringify(candidate));

  try {
  gamePeerConnection.addIceCandidate(candidate)
  } catch(err) {
    reportError(err)
  };
}

function handleICECandidateEvent(event) {
  if (event.candidate) {
    log("*** Outgoing ICE candidate: " + event.candidate.candidate);

    sendToServer({
      type: "new-ice-candidate",
      candidate: event.candidate
    });
  }
}

function handleTrackEvent(event) {
  log("*** Track event");
  document.getElementById("remote_video").srcObject = event.streams[0];
}

function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function log_error(text) {
  var time = new Date();

  console.trace("[" + time.toLocaleTimeString() + "] " + text);
}

function reportError(errMessage) {
  log_error(`Error ${errMessage.name}: ${errMessage.message}`);
}

function handleGetUserMediaError(err) {
  log_error(err);
  switch(err.name) {
    case "NotFoundError":
      alert("Unable to open your call because no camera and/or microphone" +
            "were found.");
      break;
    case "SecurityError":
    case "PermissionDeniedError":
      // Do nothing; this is the same as the user canceling the call.
      break;
    default:
      alert("Error opening your camera and/or microphone: " + err.message);
      break;
  }
}