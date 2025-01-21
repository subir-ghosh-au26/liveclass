export async function createPeerConnection(socketId, setLocalVideo, addRemoteVideo, removeRemoteVideo, muted) {
    const peerConnection = new RTCPeerConnection(servers);
    let localStream = null;
    let remoteStream = null;


    if (setLocalVideo) {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        }).catch((error) => {
            console.error('Error accessing media devices:', error);
            // Display an error message to the user
        });

        console.log('localStream', localStream)
        const localVideoElement = document.getElementById("local-video")
        if (localStream) {
            if (localVideoElement) {
                localVideoElement.srcObject = localStream
                const audioTrack = localStream.getAudioTracks()[0];
                if (muted) {
                    audioTrack.enabled = false;
                } else {
                    audioTrack.enabled = true;
                }
            }

            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        }
    }


    peerConnection.ontrack = (event) => {
        console.log('ontrack event', event)
        remoteStream = event.streams[0];
        if (remoteStream) {
            addRemoteVideo(socketId, remoteStream);
        }
    };


    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const candidate = event.candidate
            window.socket.emit('ice-candidate', {
                candidate,
                to: socketId,
            });
        }
    };
    peerConnection.onconnectionstatechange = () => {
        console.log('peer connection state change', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected') {
            removeRemoteVideo(socketId);
            if (setLocalVideo && localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
        }
    }
    return { peerConnection, localStream, remoteStream }
}