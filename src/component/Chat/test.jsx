import React, { useEffect, useContext, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useSocket } from '../context/socketContext';
import { UserContext } from '../context/user';
import Peer from 'peerjs';
import UserFetch from '../userFetch';
import axios from 'axios';
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
            // Show loading state
            setLoadingForKey(true);

            // Use setTimeout to move the heavy computation off the main thread
            setTimeout(() => {
                try {
                    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({ bits: 2048 });
                    localStorage.setItem('privateKey', forge.pki.privateKeyToPem(privateKey));
                    localStorage.setItem('publicKey', forge.pki.publicKeyToPem(publicKey));
                } catch (error) {
                    console.error("Error generating keys:", error);
                } finally {
                    setLoadingForKey(false);
                }
            }, 100);
        } else {
            setLoadingForKey(false); // Set loading to false if keys already exist
        }
    }, [])
    useEffect(() => {
        socket.on('voice_call', (data) => {
            console.log('Incoming call:', data);
            setIncomingCall(data);
            setCallPopupVisible(true);
            setCallType(data.callType); // Set the call type ('audio' or 'video')

            const peer = new Peer({
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: "stun:stun.relay.metered.ca:80",
                        },
                        {
                            urls: "turn:global.relay.metered.ca:80",
                            username,
                            credential,
                        },
                        {
                            urls: "turn:global.relay.metered.ca:80?transport=tcp",
                            username,
                            credential,
                        },
                        {
                            urls: "turn:global.relay.metered.ca:443",
                            username,
                            credential,
                        },
                        {
                            urls: "turns:global.relay.metered.ca:443?transport=tcp",
                            username,
                            credential,
                        },
                    ]
                }
            });
            peerInstance.current = peer;

            peer.on('open', (id) => {
                const conn = peer.connect(data.peerId);
                conn.on('open', () => {
                    conn.send('hi!');
                });
                setCallUserId(data.senderId);
                setPeerjsId(id);
            });

        });
        return () => {
            socket.off('voice_call');
        };
    }, [socket]);


    const handleAcceptCall = async () => {

        const obj = {
            toUserId: calluserid,
            peerId: peerjsid,
            senderId: user._id,
            callType: callType,
            incomingCall: incomingCall
        }
        sessionStorage.setItem('currentCall', JSON.stringify(obj))
        window.open(`${basePath}/incomingCall`, '_blank');
        setCallPopupVisible(false);
    };

    const handleDeclineCall = () => {
        setCallPopupVisible(false);
        socket.emit('end-call', { toUserId: incomingCall.senderId });
    };

    return (
        <div className="chat-app-shell min-h-[93vh] md:min-h-screen bg-slate-950 p-2 md:p-4">
            {!loadingForKey ? (<div className="flex h-[91vh] md:h-[calc(100vh-2rem)] rounded-3xl border border-white/10 bg-slate-900/80 shadow-[0_20px_80px_rgba(56,189,248,0.18)] backdrop-blur-xl overflow-hidden">{/* style={{ 'height': '93vh' }} */}
                <div className='flex w-full h-full' >
                    <div className="hidden md:block"> {/* Hidden on small screens, visible on medium and above */}
                        <Sidebar setIsMenuOpen={setIsMenuOpen} sendMessage={sendMessage} />
                    </div>
                    {/* {isMenuOpen && <Sidebar setIsMenuOpen={setIsMenuOpen} sendMessage={sendMessage} />} */}
                    <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} w-full h-[93vh] md:h-screen flex bg-slate-900`}>
                        <Sidebar setIsMenuOpen={setIsMenuOpen} sendMessage={sendMessage} />
                    </div>
                    <div className={`flex h-full w-full ${!isMenuOpen ? 'block' : 'hidden'}  bg-slate-900`} >
                        <ChatWindow setIsMenuOpen={setIsMenuOpen} setSendMessage={setSendMessage} />
                    </div>
                </div>
                {/* {!isMenuOpen && <ChatWindow setIsMenuOpen={setIsMenuOpen} setSendMessage={setSendMessage} />} */}
                <UserFetch />
                {/* Incoming Call Popup */}
                {isCallPopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-950/70 backdrop-blur-sm px-4">
                        <div className="w-full max-w-sm border border-white/20 bg-slate-900 p-6 rounded-2xl shadow-2xl text-center text-white">
                            <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
                            <img
                                src={incomingCall?.senderProfileImg}
                                alt="Caller"
                                className="w-20 h-20 rounded-full mx-auto mb-3 ring-2 ring-cyan-400"
                            />
                            <p className="text-slate-300">{incomingCall?.senderName} is calling you...</p>
                            <div className="mt-4 flex justify-center space-x-4">
                                <button
                                    onClick={handleAcceptCall}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded-xl transition"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={handleDeclineCall}
                                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-5 rounded-xl transition"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>) :
                (<div className="flex flex-col items-center justify-center bg-slate-900 h-[93vh] md:h-screen">
                    <div className="p-8 rounded-2xl border border-white/10 bg-slate-800/70 shadow-2xl text-center text-white">
                        <div className="mb-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto"></div>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-3">Preparing Encryption Keys</h2>
                        <p className="text-gray-300">
                            This may take a moment. We're generating secure keys for your messages.
                        </p>
                    </div>
                </div>)
            }
        </div>
    );
}

export default Test;
