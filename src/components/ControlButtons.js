import React, { useState } from 'react';

function ControlButtons({ meetingId, admin, setMuted, muted, isMeetingEnded, toggleFullScreen }) {
    const [showActions, setShowActions] = useState(false);

    const handleLeaveRoom = () => {
        window.socket.emit('leave-room', { roomID: meetingId })
        window.location.href = "/"
    }

    const handleMute = () => {
        window.socket.emit('mute-user', { mute: !muted, userId: window.socket.id });
        setMuted(!muted)
    };

    const handleMuteAll = () => {
        window.socket.emit('mute-all', { mute: true, roomID: meetingId });
    };

    const handleUnmuteAll = () => {
        window.socket.emit('mute-all', { mute: false, roomID: meetingId });
    }

    const handleEndMeeting = () => {
        window.socket.emit('end-meeting', { roomID: meetingId });
    };

    const handleShowActions = () => {
        setShowActions(!showActions);
    }


    return (
        <div className='control-buttons-container'>
            <button onClick={handleLeaveRoom} disabled={isMeetingEnded}>Leave</button>
            <button onClick={handleMute} disabled={isMeetingEnded} >{muted ? "Unmute" : "Mute"}</button>
            {admin && !isMeetingEnded && <button onClick={handleShowActions} >More Actions</button>}
            <button onClick={toggleFullScreen}>Fullscreen</button>
            {showActions && admin && !isMeetingEnded && <div className='more-actions-buttons'>
                <button onClick={handleMuteAll} >Mute all</button>
                <button onClick={handleUnmuteAll}>Unmute all</button>
                <button onClick={handleEndMeeting} >End Meeting</button>
            </div>}
        </div>
    )
}

export default ControlButtons