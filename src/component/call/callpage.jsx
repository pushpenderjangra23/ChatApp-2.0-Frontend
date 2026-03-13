import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useSocket } from '../context/socketContext';
import { FaMicrophone, FaPhoneSlash, FaVideoSlash } from 'react-icons/fa';

function CallPage() {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerInstance = useRef();
    const [peerjsid, setpeerid] = useState(null);
    const socket = useSocket();
    const [isInCall, setIsInCall] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [callType, setCallType] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const username = process.env.REACT_APP_METERED_USERNAME;
    const credential = process.env.REACT_APP_METERED_PASSWORD;

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem('currentCall'));
        setCallType(obj.callType);
        setIncomingCall(obj.incomingCall);

        const peer = new Peer({
            config: {
                iceserver: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun.relay.metered.ca:80' },
                    { urls: 'turn:global.relay.metered.ca:80', username, credential },
                    { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username, credential },
                    { urls: 'turn:global.relay.metered.ca:443', username, credential },
                    { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username, credential },
                ],
            },
        });

        peer.on('open', (id) => {
            setpeerid(id);
            start(id);
        });

        peerInstance.current = peer;

        return () => {
            peer.disconnect();
            peer.destroy();
        };
    }, []);

    const getUserMedia = async (call) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: call === 'video' });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('Error getting user media:', error);
        }
    };

    const start = async (id) => {
        const obj = JSON.parse(sessionStorage.getItem('currentCall'));
        const stream = await getUserMedia(obj.callType);
        peerInstance.current.on('call', (call) => {
            call.answer(stream);
            call.on('stream', (remote) => setRemoteStream(remote));
        });

        socket.emit('user-connected', { toUserId: obj.toUserId, peerId: id, senderId: obj.senderId });
    };

    const handleEndCall = () => {
        if (localStream) localStream.getTracks().forEach((track) => track.stop());
        if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop());
        setIsInCall(false);
        setRemoteStream(null);
        sessionStorage.removeItem('currentCall');
        socket.emit('end-call', { toUserId: incomingCall.senderId });
        window.close();
    };

    const handleMute = () => {
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleVideoHide = () => {
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsVideoOn(!isVideoOn);
    };

    useEffect(() => {
        socket.on('end-call', () => {
            if (localStream) localStream.getTracks().forEach((track) => track.stop());
            if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop());
            setIsInCall(false);
            setRemoteStream(null);
            sessionStorage.removeItem('currentCall');
            window.close();
        });
        return () => {
            socket.off('call-ended');
            socket.off('call-accepted');
            socket.off('user-disconnected');
        };
    }, [socket, localStream]);

    return (
        <div className="app-bg min-h-screen">
            {isInCall && (
                <div className="fixed inset-0 p-4 md:p-8 flex items-center justify-center">
                    <div className="panel rounded-3xl w-full h-full flex flex-col md:flex-row items-center justify-center gap-6 p-4">
                        {callType !== 'video' && (
                            <div className="panel-strong p-6 rounded-2xl text-center max-w-sm">
                                <h2 className="text-xl font-bold text-main">In Call with {incomingCall?.senderName}</h2>
                                <img src={incomingCall?.senderProfileImg} alt="Caller" className="w-20 h-20 rounded-full mx-auto mt-4 mb-2 object-cover border border-soft" />
                                <p className="text-sm text-sub">Connected. You can mute or end call.</p>
                                <div className="mt-4 flex justify-center space-x-3">
                                    <button onClick={handleMute} className="panel-soft text-main font-semibold py-2 px-4 rounded-xl">{isMuted ? 'Unmute' : 'Mute'}</button>
                                    <button onClick={handleEndCall} className="danger-btn font-semibold py-2 px-4 rounded-xl">End Call</button>
                                </div>
                            </div>
                        )}

                        {callType === 'video' ? (
                            <div className="relative">
                                <video
                                    ref={(video) => video && (video.srcObject = localStream)}
                                    autoPlay
                                    muted
                                    className="w-full max-w-md h-[24rem] object-cover rounded-2xl panel-strong"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-3">
                                    <button onClick={handleMute} className={`${isMuted ? 'danger-btn' : 'accent-btn'} text-white p-3 rounded-xl`}><FaMicrophone /></button>
                                    <button onClick={handleEndCall} className="danger-btn p-3 rounded-xl"><FaPhoneSlash /></button>
                                    <button onClick={toggleVideoHide} className={`${isVideoOn ? 'accent-btn' : 'panel-soft text-main'} p-3 rounded-xl`}><FaVideoSlash /></button>
                                </div>
                            </div>
                        ) : (
                            <audio ref={(audio) => audio && (audio.srcObject = localStream)} autoPlay muted></audio>
                        )}

                        {callType === 'video' ? (
                            <video
                                ref={(video) => video && (video.srcObject = remoteStream)}
                                autoPlay
                                className="w-full max-w-md h-[24rem] object-cover rounded-2xl panel-strong"
                                style={{ transform: 'scaleX(-1)' }}
                            ></video>
                        ) : (
                            <audio ref={(audio) => audio && (audio.srcObject = remoteStream)} autoPlay></audio>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CallPage;
