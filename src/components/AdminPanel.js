import React, { useState } from 'react';

function AdminPanel({ users, meetingId }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showKickUser, setShowKickUser] = useState(false);
    const [showMuteUser, setShowMuteUser] = useState(false);


    const handleKickUser = () => {
        window.socket.emit('kick-user', { userId: selectedUser, roomID: meetingId })
        setShowKickUser(false);
    };

    const handleMuteUser = () => {
        window.socket.emit('mute-user', { mute: true, userId: selectedUser });
        setShowMuteUser(false)
    };

    const handleUnmuteUser = () => {
        window.socket.emit('mute-user', { mute: false, userId: selectedUser });
        setShowMuteUser(false)
    };

    const handleSelectUser = (userId) => {
        setSelectedUser(userId);
    };

    const handleShowKickUser = (userId) => {
        setSelectedUser(userId);
        setShowKickUser(true)
    }

    const handleShowMuteUser = (userId) => {
        setSelectedUser(userId);
        setShowMuteUser(true);
    };


    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <h3>Users:</h3>
            <ul>
                {users?.map((user) => (
                    <li key={user.socketId}>
                        {user.username}
                        <button onClick={() => handleShowKickUser(user.socketId)} >Kick</button>
                        <button onClick={() => handleShowMuteUser(user.socketId)}>Mute</button>
                    </li>
                ))}
            </ul>
            {showKickUser && <div className="modal">
                <div className='modal-content'>
                    <p>Are you sure want to kick user?</p>
                    <button onClick={handleKickUser}>Yes</button>
                    <button onClick={() => setShowKickUser(false)}>No</button>
                </div>
            </div>}
            {showMuteUser && <div className="modal">
                <div className='modal-content'>
                    <p>Mute user?</p>
                    <button onClick={handleMuteUser}>Yes</button>
                    <button onClick={handleUnmuteUser}>Unmute</button>
                    <button onClick={() => setShowMuteUser(false)}>No</button>
                </div>
            </div>}
        </div>
    );
}

export default AdminPanel;