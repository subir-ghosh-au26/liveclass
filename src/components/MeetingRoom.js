import React, { useContext } from 'react';
import VideoCall from './VideoCall';
import MeetingDetails from './MeetingDetails';
import AdminPanel from './AdminPanel';
import Chat from './Chat';
import './../css/style.css';
import { MeetingContext } from './../context/MeetingContext'


function MeetingRoom() {
    const {
        users,
        state,
        muted,
        isMeetingEnded,
        handleCreateMeeting,
        handleJoinMeeting,
        handleSubmit,
    } = useContext(MeetingContext)



    return (
        <div className="meeting-room-container">
            {!state.meetingId ? (
                <div className='join-meeting-container'>
                    <button onClick={handleCreateMeeting} >Create Meeting</button>
                    <form onSubmit={handleJoinMeeting}>
                        <input type="text" name="meetingId" placeholder="Enter Meeting Id" />
                        <button type="submit">Join</button>
                    </form>
                </div>
            ) : !state.username ? (
                <form onSubmit={handleSubmit} className="username-form">
                    <input type='text' name="username" placeholder='Enter your name' required />
                    <button type='submit'>Submit</button>
                </form>
            )
                : (
                    <>
                        <div className='top-container'>
                            <MeetingDetails meetingId={state.meetingId} />
                            {state.admin && <AdminPanel users={users} meetingId={state.meetingId} />}
                        </div>
                        <div className='meeting-main-container'>
                            <div className='video-main-container'>
                                {state.showVideoCall && <VideoCall
                                    meetingId={state.meetingId}
                                    users={users}
                                    admin={state.admin}
                                    username={state.username}
                                    muted={muted}
                                    isMeetingEnded={isMeetingEnded}
                                />}
                            </div>
                            <div className='chat-main-container'>
                                <Chat meetingId={state.meetingId} username={state.username} />
                            </div>
                        </div>
                    </>
                )}
        </div>
    );
}

export default MeetingRoom;