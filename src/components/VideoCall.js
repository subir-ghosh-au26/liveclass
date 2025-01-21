import React, { useRef, useEffect, useState, useContext } from 'react';
import UserVideo from './UserVideo';
import './../css/style.css'
import { createPeerConnection, handleOffer, handleAnswer, handleIceCandidate } from '../utils/webRTC'
import ControlButtons from './ControlButtons';
import { MeetingContext } from './../context/MeetingContext'

function VideoCall({ meetingId, admin = false, username }) {
    const {
        users,
        setUsers,
        muted,
        setMuted,
        isMeetingEnded,
        setMeetingEnded,
    } = useContext(MeetingContext)
    const [peerConnections, setPeerConnections] = useState({});
    const [remoteVideos, setRemoteVideos] = useState({});
    const [fullScreen, setFullScreen] = useState(false);
    const localVideoRef = useRef();

    const toggleFullScreen = () => {
        setFullScreen(!fullScreen)
    }


    const removeRemoteVideo = (socketId) => {
        setRemoteVideos(prevRemoteVideos => {
            const newRemoteVideos = { ...prevRemoteVideos };
            delete newRemoteVideos[socketId];
            return newRemoteVideos;
        });
    }

    const addRemoteVideo = (socketId, stream) => {
        setRemoteVideos(prevRemoteVideos => ({
            ...prevRemoteVideos,
            [socketId]: stream,
        }));
    };

    useEffect(() => {
        if (isMeetingEnded) {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            for (const connection in peerConnections) {
                peerConnections[connection].peerConnection.close();
            }
            setPeerConnections({});
            setRemoteVideos({});
        }
    }, [isMeetingEnded, setMeetingEnded, peerConnections])

    useEffect(() => {

        const handleUserJoined = async ({ username, socketId }) => {
            const newPeerConnection = await createPeerConnection(socketId, null, addRemoteVideo, removeRemoteVideo, muted);
            const offer = await newPeerConnection.peerConnection.createOffer();
            await newPeerConnection.peerConnection.setLocalDescription(offer);
            window.socket.emit('offer', { offer, to: socketId });
            setPeerConnections(prev => ({ ...prev, [socketId]: newPeerConnection }));
        };

        const handleUserLeft = ({ socketId }) => {
            removeRemoteVideo(socketId);
            setPeerConnections(prev => {
                const newPeerConnections = { ...prev };
                if (newPeerConnections[socketId]) {
                    newPeerConnections[socketId].peerConnection.close();
                }
                delete newPeerConnections[socketId];
                return newPeerConnections
            });
        };

        window.socket.on('user-joined', handleUserJoined);
        window.socket.on('user-left', handleUserLeft);

        return () => {
            window.socket.off('user-joined', handleUserJoined);
            window.socket.off('user-left', handleUserLeft)
        };
    }, [addRemoteVideo, removeRemoteVideo, muted]);

    useEffect(() => {
        const handleOfferReceived = async ({ offer, from }) => {
            await handleOffer(offer, from, peerConnections, setPeerConnections, addRemoteVideo, removeRemoteVideo)
        };

        const handleAnswerReceived = async ({ answer, from }) => {
            await handleAnswer(answer, from, peerConnections);
        };

        const handleIceCandidateReceived = async ({ candidate, from }) => {
            await handleIceCandidate(candidate, from, peerConnections)
        };

        window.socket.on('offer', handleOfferReceived);
        window.socket.on('answer', handleAnswerReceived);
        window.socket.on('ice-candidate', handleIceCandidateReceived);

        return () => {
            window.socket.off('offer', handleOfferReceived);
            window.socket.off('answer', handleAnswerReceived);
            window.socket.off('ice-candidate', handleIceCandidateReceived);
        }
    }, [peerConnections, addRemoteVideo, removeRemoteVideo]);

    useEffect(() => {
        const handleMuteUser = ({ mute }) => {
            const localAudioTrack = document.getElementById("local-video")?.srcObject?.getAudioTracks()?.[0];
            if (localAudioTrack) {
                localAudioTrack.enabled = !mute;
                setMuted(mute)
            }
        };

        const handleMuteAll = ({ mute }) => {
            for (const connection in peerConnections) {
                const remoteStream = peerConnections[connection].remoteStream;
                if (remoteStream) {
                    const audioTrack = remoteStream.getAudioTracks()?.[0];
                    if (audioTrack) {
                        audioTrack.enabled = !mute;
                    }
                }
            }
        }

        window.socket.on('mute-user', handleMuteUser);
        window.socket.on('mute-all', handleMuteAll);
        return () => {
            window.socket.off('mute-user', handleMuteUser);
            window.socket.off('mute-all', handleMuteAll)
        };
    }, [peerConnections, setMuted]);

    useEffect(() => {
        const handleUserListUpdate = (updatedUsers) => {
            setUsers(updatedUsers);
        }

        window.socket.on('user-list-update', handleUserListUpdate);

        return () => {
            window.socket.off('user-list-update', handleUserListUpdate)
        }
    }, [setUsers]);

    useEffect(() => {
        const handleKicked = () => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            for (const connection in peerConnections) {
                peerConnections[connection].peerConnection.close();
            }
            setPeerConnections({});
            setRemoteVideos({});
            window.location.href = '/'
        };

        const handleMeetingEnded = () => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            for (const connection in peerConnections) {
                peerConnections[connection].peerConnection.close();
            }
            setPeerConnections({});
            setRemoteVideos({});
            setMeetingEnded(true)
        };

        window.socket.on('kicked', handleKicked);
        window.socket.on('meeting-ended', handleMeetingEnded);
        return () => {
            window.socket.off('kicked', handleKicked);
            window.socket.off('meeting-ended', handleMeetingEnded);
        };
    }, [peerConnections, setMeetingEnded]);

    useEffect(() => {
        const getUserMedia = async () => {
            const newPeerConnection = await createPeerConnection(null, (stream) => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
            }, addRemoteVideo, removeRemoteVideo, muted);
            setPeerConnections(prev => ({ ...prev, local: newPeerConnection }))
        };
        if (!isMeetingEnded) {
            getUserMedia();
        }

    }, [muted, addRemoteVideo, removeRemoteVideo, isMeetingEnded]);



    return (
        <div className="video-call-container">
            <div className="video-container">
                {fullScreen ?
                    <div className='full-screen-video-grid'>
                        <button onClick={toggleFullScreen} style={{ position: "absolute", zIndex: 1, color: "white", backgroundColor: "#000" }}>Close Fullscreen</button>
                        <div className="local-video-container">
                            <video id="local-video" ref={localVideoRef} autoPlay playsInline muted={muted} style={{ width: "100%", height: "100%" }}></video>
                            <p>{username} (You)</p>
                        </div>
                        {Object.entries(remoteVideos).map(([userId, stream]) => (
                            <div className="user-video-container" key={userId}>
                                <UserVideo stream={stream} muted={false} userId={userId} style={{ width: "100%", height: "100%" }} />
                                {users?.find(user => user.socketId === userId)?.username}
                            </div>
                        ))}
                    </div>
                    :
                    <div className="video-grid">
                        <div className="local-video-container">
                            <video id="local-video" ref={localVideoRef} autoPlay playsInline muted={muted}></video>
                            <p>{username} (You)</p>
                        </div>
                        {Object.entries(remoteVideos).map(([userId, stream]) => (
                            <div className="user-video-container" key={userId}>
                                <UserVideo stream={stream} muted={false} userId={userId} />
                                {users?.find(user => user.socketId === userId)?.username}
                            </div>
                        ))}
                    </div>
                }
            </div>
            <ControlButtons meetingId={meetingId} admin={admin} isMeetingEnded={isMeetingEnded} toggleFullScreen={toggleFullScreen} />
        </div>
    );
}

export default VideoCall;