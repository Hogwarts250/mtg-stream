const gameID = JSON.parse(document.getElementById("game_id").textContent);
const localID = Math.floor((1 + Math.random()) * 0x100000);
var remoteID = null;

var scheme = "ws"
if (document.location.protocol == "https:") {
  scheme += "s";
}

const socket = new WebSocket(scheme + "://" + window.location.host + "/ws/game/" + gameID + "/");

var peerConnection = null;
var polite = true;
var isNegotiating = false;

const localVideo = document.getElementById("local_video");
const remoteVideo = document.getElementById("remote_video");

const audioSource = JSON.parse(document.getElementById("audio_source").textContent);
const videoSource = JSON.parse(document.getElementById("video_source").textContent);

const constraints = {
  audio: {deviceId: audioSource},
  video: {deviceId: videoSource}
};

var stream = null;

window.onload = (evt) => {
  navigator.mediaDevices.getUserMedia(constraints)
  .then((media) => {
    localVideo.srcObject = media
    stream = media
  });
}

socket.onopen = function(evt) {
  sendToServer({
    type: "new-member",
    new_member: localID
  })
}

socket.onerror = function(err) {
  // console.log(err);
}

socket.onmessage = function(evt) {
  // console.log(stream)

  let msg = JSON.parse(evt.data);

  if (msg.type == "new-member") {
    handleNewMember(msg);
  } else if (msg.sender !== localID) {
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
        // console.log("Unknown message :" + msg);
        break;
    }
  }
}

function createPeerConnection() {
  // console.log("Creating RTCPeerConnection")
  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      }
    ]
  })

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      // console.log("-- Outgoing ICE candidate: " + e.candidate.candidate)
  
      sendToServer({
        type:"new-ice-candidate",
        candidate: e.candidate
      });
    }
  }
  
  peerConnection.oniceconnectionstatechange = (e) => {
    // console.log("-- ICE connection state changed to " + peerConnection.iceConnectionState);
  
    switch(peerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        break;
    }
  }

  peerConnection.onicegatheringstatechange = (e) => {
    // console.log("-- ICE gathering state changed to: " + peerConnection.iceGatheringState);

    if (peerConnection.iceConnectionState == "failed") {
      peerConnection.restartIce();
    } else if (peerConnection.iceGatheringState !== "complete") {
      return;
    }
  }
  
  peerConnection.onsignalingstatechange = (e) => {
    // console.log("Signalling state changed to: " + peerConnection.signalingState);
  
    isNegotiating = false;
  
    switch(peerConnection.signalingState) {
      case "closed":
        break;
    }
  }
  
  peerConnection.onnegotiationneeded = async () => {
    // console.log("Negotiation needed");
  
    if (!isNegotiating && !polite) {
      try {
        isNegotiating = true;
  
        // console.log("Set local description to offer");
        await peerConnection.setLocalDescription(await peerConnection.createOffer());
  
        // console.log("Sending offer to remote peer");
        sendToServer({
          type: "video-offer",
          sdp: peerConnection.localDescription
        });
      } catch (err) {
        logError(err);
      } finally {
        isNegotiating = false;
      }
    }
  }
  
  peerConnection.ontrack = (e) => {
    // console.log("Track event");
  
    let inboundStream = null;
    
    if (e.streams && e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
    } else {
      if (!inboundStream) {
        inboundStream = new MediaStream();
        remoteVideo.srcObject = inboundStream
      }
  
      inboundStream.addTrack(e.track);
    }
  }
}

function handleNewMember(msg) {
  if (msg.new_member !== localID) {
    remoteID = msg.new_member;
    polite = false;

    // console.log("Creating offer");
    createOffer();
  }
}

async function handleVideoOfferMsg(msg) {
  // console.log("Received video chat offer")

  if (!remoteID) {
    remoteID = msg.sender;
  }

  if (!peerConnection) {
    createPeerConnection();
  }

  try {
    stream.getTracks().forEach(
      track => peerConnection.addTrack(track, stream)
    );
  } catch (err) {
    logError(err);
  }

  const desc = new RTCSessionDescription(msg.sdp);

  peerConnection.setRemoteDescription(desc);

  createAnswer(); 
} 

function handleVideoAnswerMsg(msg) {
  // console.log("Sender accepted our call");

  try {
    stream.getTracks().forEach(
      track => peerConnection.addTrack(track, stream)
    );
  } catch (err) {
    logError(err);
  }
  
  const desc = new RTCSessionDescription(msg.sdp);
  peerConnection.setRemoteDescription(desc);
}

function handleNewICECandidateMsg(msg) {
  // console.log("-- Adding recieved ICE candidate:" + JSON.stringify(msg.candidate));

  try {
    const candidate = new RTCIceCandidate(msg.candidate);
    peerConnection.addIceCandidate(msg.candidate);
  } catch (err) {
    logError(err);
  }
}

function createOffer() {
  if (!peerConnection) {
    createPeerConnection();
  }

  peerConnection.createOffer()
  .then(sdp => {
    sendToServer({
      type: "video-offer",
      sdp: sdp
    });

    peerConnection.setLocalDescription(sdp)
  }, err => {
    // console.log(`${err.name}: ${err.message}`);
  })
}

function createAnswer() {
  // console.log("Setting remote description")
  peerConnection.createAnswer({})
  .then(sdp => {
    sendToServer({
      type: "video-answer",
      sdp: sdp
    })

    peerConnection.setLocalDescription(sdp);
  }, err => {
    // console.log(`${err.name}: ${err.message}`);
  })
}

function sendToServer(msg) {
  if (remoteID) {
    msg["sender"] = localID;
  }

  const msgJSON = JSON.stringify(msg);

  // console.log("Sending " + msg.type);
  socket.send(msgJSON);
}

function logError(err) {
  console.log("*** " + err);
}