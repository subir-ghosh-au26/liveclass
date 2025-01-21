import React, { useRef, useEffect } from 'react';

function UserVideo({ stream, muted, userId }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = muted;
        }
    }, [stream, muted]);

    return <video id={userId} ref={videoRef} autoPlay playsInline />;
}

export default UserVideo;