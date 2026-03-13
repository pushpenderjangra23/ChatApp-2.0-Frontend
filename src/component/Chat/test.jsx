import React, { useEffect, useContext, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useSocket } from '../context/socketContext';
import { UserContext } from '../context/user';
import Peer from 'peerjs';
import UserFetch from '../userFetch';
import forge from 'node-forge';

function Test() {
    const socket = useSocket();
    const { user } = useContext(UserContext);
    const peerInstance = useRef(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCallPopupVisible, setCallPopupVisible] = useState(false);
    const [calluserid, setCallUserId] = useState(null);
    const [peerjsid, setPeerjsId] = useState(null);
    const [callType, setCallType] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sendMessage, setSendMessage] = useState(false);
    const [loadingForKey, setLoadingForKey] = useState(true);
    const username = process.env.REACT_APP_METERED_USERNAME;
    const credential = process.env.REACT_APP_METERED_PASSWORD;
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');

    useEffect(() => {
        if (user && socket) {
            socket.emit('register', { userId: user._id });
            socket.emit('friendRequest', { ReceiverId: user._id });
        }

        return () => {
            if (socket) {
                socket.off('private_message');
            }
        };
    }, [user, socket]);

    useEffect(() => {
        if (!localStorage.getItem('privateKey') && !localStorage.getItem('publicKey')) {
            setLoadingForKey(true);
            setTimeout(() => {
                try {
                    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({ bits: 2048 });
                    localStorage.setItem('privateKey', forge.pki.privateKeyToPem(privateKey));
                    localStorage.setItem('publicKey', forge.pki.publicKeyToPem(publicKey));
                } catch (error) {
                    console.error('Error generating keys:', error);
                } finally {
                    setLoadingForKey(false);
                }
            }, 100);
        } else {
            setLoadingForKey(false);
        }
    }, []);

    useEffect(() => {
        socket.on('voice_call', (data) => {
            setIncomingCall(data);
            setCallPopupVisible(true);
            setCallType(data.callType);

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
                const conn = peer.connect(data.peerId);
                conn.on('open', () => conn.send('hi!'));
                setCallUserId(data.senderId);
                setPeerjsId(id);
            });
        });

        return () => {
            socket.off('voice_call');
        };
    }, [socket, credential, username]);

    const handleAcceptCall = async () => {
        const obj = {
            toUserId: calluserid,
            peerId: peerjsid,
            senderId: user._id,
            callType,
            incomingCall,
        };
        sessionStorage.setItem('currentCall', JSON.stringify(obj));
        window.open(`${basePath}/incomingCall`, '_blank');
        setCallPopupVisible(false);
    };

    const handleDeclineCall = () => {
        setCallPopupVisible(false);
        socket.emit('end-call', { toUserId: incomingCall.senderId });
    };

    return (
        <div className="app-bg min-h-screen p-2 md:p-4">
            {!loadingForKey ? (
                <div className="panel rounded-3xl h-[95vh] md:h-[calc(100vh-2rem)] overflow-hidden flex">
                    <div className="flex w-full h-full">
                        <aside className="hidden md:block h-full">
                            <Sidebar setIsMenuOpen={setIsMenuOpen} sendMessage={sendMessage} />
                        </aside>

                        <aside className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} w-full h-full`}>
                            <Sidebar setIsMenuOpen={setIsMenuOpen} sendMessage={sendMessage} />
                        </aside>

                        <main className={`flex h-full w-full ${!isMenuOpen ? 'block' : 'hidden'}`}>
                            <ChatWindow setIsMenuOpen={setIsMenuOpen} setSendMessage={setSendMessage} />
                        </main>
                    </div>
                    <UserFetch />

                    {isCallPopupVisible && (
                        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="panel-strong rounded-3xl p-6 w-full max-w-sm text-center text-main">
                                <h2 className="text-2xl font-semibold">Incoming {callType} call</h2>
                                <img
                                    src={incomingCall?.senderProfileImg}
                                    alt="Caller"
                                    className="w-24 h-24 rounded-full mx-auto mt-4 mb-3 object-cover border border-soft"
                                />
                                <p className="text-sub">{incomingCall?.senderName} wants to connect with you.</p>
                                <div className="mt-6 flex gap-3 justify-center">
                                    <button onClick={handleAcceptCall} className="success-btn rounded-xl px-5 py-2 font-semibold">Accept</button>
                                    <button onClick={handleDeclineCall} className="danger-btn rounded-xl px-5 py-2 font-semibold">Decline</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="panel-strong rounded-3xl p-10 text-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-cyan-300 border-t-transparent mx-auto"></div>
                        <h2 className="mt-5 text-xl font-semibold text-main">Preparing Secure Session</h2>
                        <p className="text-sub mt-1">Generating encryption keys for private chat.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Test;
