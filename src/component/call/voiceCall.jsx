import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/socketContext';
import Peer from 'peerjs';
import { FaMicrophone, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

const VoiceCall = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const chatUser = JSON.parse(sessionStorage.getItem('chatUser'));
    const value = sessionStorage.getItem('value');
    const socket = useSocket();
    const [localStream, setLocalStream] = useState(null);
    const [showCallPopup, setShowCallPopup] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoHidden, setIsVideoHidden] = useState(false);

    const peerInstance = useRef(null);
    const username = process.env.REACT_APP_METERED_USERNAME;
    const credential = process.env.REACT_APP_METERED_PASSWORD;

    useEffect(() => {
        const peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun.relay.metered.ca:80' },
                    { urls: 'turn:global.relay.metered.ca:80', username, credential },
                    { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username, credential },
                    { urls: 'turn:global.relay.metered.ca:443', username, credential },
                    { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username, credential },
                ],
            },
        });
        peerInstance.current = peer;

        peer.on('open', (id) => {
            socket.emit('voice_call', {
                toUserId: chatUser?.id,
                peerId: id,
                senderId: user?._id,
                senderName: user?.username,
                senderProfileImg: user?.profileimg,
                callType: value,
            });
        });

        peer.on('call', (call) => {
            if (localStream) {
                call.answer(localStream);
                call.on('stream', (stream) => setRemoteStream(stream));
            }
        });

        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: value === 'video',
                });
                setLocalStream(stream);
                return stream;
            } catch (error) {
                console.error('Error getting user media:', error);
            }
        };

        const handleCall = async () => {
            const stream = await getUserMedia();
            socket.on('user-connected', (data) => {
                const call = peer.call(data.peerId, stream);
                call?.on('stream', (remote) => {
                    setRemoteStream(remote);
                    setIsCalling(false);
                });
            });
        };

        handleCall();
        setIsCalling(true);
        setShowCallPopup(true);
        return () => {
            peerInstance.current?.destroy();
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, [socket]);

    const toggleMute = () => {
        if (localStream) {
            const next = !isMuted;
            localStream.getAudioTracks().forEach((track) => (track.enabled = !next));
            setIsMuted(next);
        }
    };

    const toggleVideoHide = () => {
        if (localStream) {
            const next = !isVideoHidden;
            localStream.getVideoTracks().forEach((track) => (track.enabled = !next));
            setIsVideoHidden(next);
        }
    };

    const handleCallDisconnect = () => {
        setShowCallPopup(false);
        peerInstance.current?.disconnect();
        peerInstance.current?.destroy();
        localStream?.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        socket.emit('end-call', { toUserId: chatUser?.id });
        window.close();
    };

    useEffect(() => {
        socket.on('end-call', () => {
            setShowCallPopup(false);
            peerInstance.current?.disconnect();
            peerInstance.current?.destroy();
            localStream?.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
            sessionStorage.removeItem('chatUser');
            sessionStorage.removeItem('value');
            sessionStorage.removeItem('user');
            window.close();
        });
    }, [localStream, socket]);

    if (!chatUser || !user || !value) window.open('/', '_self');

    return (
        <div className="app-bg min-h-screen">
            {showCallPopup && (
                <div className="fixed inset-0 p-4 md:p-8 flex items-center justify-center">
                    <div className="panel rounded-3xl w-full h-full flex flex-col md:flex-row items-center justify-center gap-6 p-4">
                        {localStream && value === 'video' ? (
                            <div className="relative w-full max-w-md panel-strong rounded-2xl overflow-hidden">
                                {isVideoHidden ? (
                                    <img src={user.profileimg} alt="User" className="w-full h-[22rem] object-cover" />
                                ) : (
                                    <video
                                        ref={(video) => video && (video.srcObject = localStream)}
                                        autoPlay
                                        muted
                                        className="w-full h-[22rem] object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    ></video>
                                )}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
                                    <button onClick={toggleMute} className={`${isMuted ? 'danger-btn' : 'accent-btn'} rounded-xl p-3`}><FaMicrophone /></button>
                                    <button onClick={handleCallDisconnect} className="danger-btn rounded-xl p-3"><FaPhoneSlash /></button>
                                    {value === 'video' && <button onClick={toggleVideoHide} className="panel-soft text-main rounded-xl p-3"><FaVideoSlash /></button>}
                                </div>
                            </div>
                        ) : (
                            <audio ref={(audio) => audio && (audio.srcObject = localStream)} autoPlay muted></audio>
                        )}

                        {isCalling && !remoteStream && (
                            <div className="panel-strong rounded-2xl p-6 text-center">
                                <h3 className="text-main font-semibold">Calling {chatUser.username}...</h3>
                                <p className="text-sub text-sm mt-2">Waiting for answer</p>
                            </div>
                        )}

                        {remoteStream && (
                            value === 'video' ? (
                                <video
                                    ref={(video) => video && (video.srcObject = remoteStream)}
                                    autoPlay
                                    className="w-full max-w-md h-[22rem] object-cover rounded-2xl panel-strong"
                                    style={{ transform: 'scaleX(-1)' }}
                                ></video>
                            ) : (
                                <audio ref={(audio) => audio && (audio.srcObject = remoteStream)} autoPlay></audio>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceCall;
