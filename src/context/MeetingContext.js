import React, { createContext, useState, useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const MeetingContext = createContext();

const initialState = {
    meetingId: null,
    username: null,
    admin: false,
    showVideoCall: false
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_MEETING_ID':
            return { ...state, meetingId: action.payload };
        case 'SET_USERNAME':
            return { ...state, username: action.payload };
        case 'SET_ADMIN':
            return { ...state, admin: action.payload };
        case 'SHOW_VIDEO_CALL':
            return { ...state, showVideoCall: action.payload };
        default:
            return state;
    }
}

function MeetingProvider({ children }) {

    const [users, setUsers] = useState([]);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [muted, setMuted] = useState(false);
    const [isMeetingEnded, setMeetingEnded] = useState(false);

    useEffect(() => {
        window.socket = io('https://vc-server-1pxa.onrender.com');
        return () => {
            window.socket.disconnect();
        }
    }, [])

    const handleCreateMeeting = () => {
        const meetingId = uuidv4();
        dispatch({ type: 'SET_MEETING_ID', payload: meetingId });
        dispatch({ type: 'SET_ADMIN', payload: true });
    };

    const handleJoinMeeting = (e) => {
        e.preventDefault();
        const meetingId = e.target.meetingId.value;
        dispatch({ type: 'SET_MEETING_ID', payload: meetingId });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        dispatch({ type: 'SET_USERNAME', payload: username });
        dispatch({ type: 'SHOW_VIDEO_CALL', payload: true });
        if (window.socket && state.meetingId && username) {
            window.socket.emit('join-room', { roomID: state.meetingId, username });
        }
    };


    const contextValue = {
        users,
        setUsers,
        state,
        dispatch,
        muted,
        setMuted,
        isMeetingEnded,
        setMeetingEnded,
        handleCreateMeeting,
        handleJoinMeeting,
        handleSubmit,
    };


    return (
        <MeetingContext.Provider value={contextValue}>
            {children}
        </MeetingContext.Provider>
    );
}


export { MeetingContext, MeetingProvider };