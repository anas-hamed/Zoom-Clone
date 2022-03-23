const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
let myVideoStream;


navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  // .then means we are recieving the user's video (stream) and we are passing it to the socket
  addVideoStream(myVideo, stream)
  myVideoStream = stream
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      // add the video stream from the other user
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// id below is automatically generated using the peer.on function
peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  // Here we are calling the user who connected to the room, and we answer him above in the promise
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const muteUnmute = () => {
  if (myVideoStream.getAudioTracks()[0].enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setAudioState('Unmute');
  } else {
    // if  the audio is disabled-> then enable it
    setAudioState('Mute');
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}



const playStop = () => {
  if (myVideoStream.getVideoTracks()[0].enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setVideoState('Play')
  } else {
    setVideoState('Stop')
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setAudioState = (state) => {
  let html;
  if(state == 'Mute') {
    html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
  }
  else {
      html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
      `
  }
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setVideoState = (state) => {
  let html
  if(state == 'Play') {
    html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
  }
  else {
    html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
  }
  document.querySelector('.main__video_button').innerHTML = html;
}