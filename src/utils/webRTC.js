const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ],
        },
    ],
};

export async function createPeerConnection(socketId, setLocalVideo, addRemoteVideo, removeRemoteVideo, muted) {
    const peerConnection = new RTCPeerConnection(servers);
    let localStream = null;
    let remoteStream = null;


    if (setLocalVideo) {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        const localVideoElement = document.getElementById("local-video")

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


    peerConnection.ontrack = (event) => {
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
        if (peerConnection.connectionState === 'disconnected') {
            removeRemoteVideo(socketId);
            if (setLocalVideo) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
        }
    }
    return { peerConnection, localStream, remoteStream }
}

export const handleOffer = async (offer, from, peerConnections, setPeerConnections, setRemoteVideo, removeRemoteVideo) => {

    const newPeerConnection = await createPeerConnection(from, null, setRemoteVideo, removeRemoteVideo)
    newPeerConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await newPeerConnection.peerConnection.createAnswer()
    await newPeerConnection.peerConnection.setLocalDescription(answer)
    window.socket.emit('answer', { answer, to: from })
    setPeerConnections({ ...peerConnections, [from]: newPeerConnection });

}


export const handleAnswer = async (answer, from, peerConnections) => {
    if (peerConnections[from]) {
        await peerConnections[from].peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
}

export const handleIceCandidate = async (candidate, from, peerConnections) => {
    if (peerConnections[from]) {
        try {
            await peerConnections[from].peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (error) {
            console.log(error)
        }
    }
}