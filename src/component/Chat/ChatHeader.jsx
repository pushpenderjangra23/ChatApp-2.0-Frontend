import React, { useEffect, useRef, useState } from 'react';
import { ChatUserContext } from '../context/chatUser';
import { IoMenu } from 'react-icons/io5';
import { useContext } from 'react';
import { IoMdSettings, IoMdCall } from 'react-icons/io';
import { FaVideo } from 'react-icons/fa';
import { useSocket } from '../context/socketContext';
import { UserContext } from '../context/user';
import SettingPopup from '../setting/pop.setting';
import Modal from '../utility/zoomimage';
import ThemeToggle from '../utility/ThemeToggle';

function ChatHeader({ setIsMenuOpen }) {
    const { chatUser, setChatUser } = useContext(ChatUserContext);
    const socket = useSocket();
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const { user, setUser } = useContext(UserContext);
    const [showSettingPopup, setShowSettingPopup] = useState(false);
    const [showImageZoomModal, setImageZoomShowModal] = useState(false);
    const [status, setStatus] = useState('offline');
    const [typingStatus, setTypingStatus] = useState(null);
    const typingTimeoutRef = useRef(null);
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');

    useEffect(() => {
        if (socket) {
            socket.on('isTyping', ({ status: typing }) => {
                setTypingStatus(typing);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingStatus(null), 2000);
            });
        }
        return () => {
            socket.off('isTyping');
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket]);

    useEffect(() => {
        if (socket && chatUser) {
            socket.emit('isActive', { ReceiverId: chatUser.id });
            socket.on('isActive', (data) => {
                if (data.status || data.userId === chatUser.id) setStatus('online');
                else if (data.disconnectedUserId === chatUser.id) setStatus('offline');
                else setStatus('offline');
            });
        }
    }, [socket, chatUser]);

    const handleSetData = (value) => {
        sessionStorage.setItem('chatUser', JSON.stringify(chatUser));
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('value', value);
        window.open(`${basePath}/call`, '_blank');
        console.log(socket.id)
    }
    return (
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
            <div className='block md:hidden cursor-pointer text-white' style={{ 'marginRight': '1rem' }} onClick={() => {
                setIsMenuOpen(true);
            }}>
                <IoMenu size={20} />
            </div>
            <div className="flex items-center" style={{ 'fontSize': '13px' }}>
                <img
                    src={chatUser?.profileimg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    onClick={() => setImageZoomShowModal(true)}
                    alt="User"
                    className="rounded-full w-12 h-12 cursor-pointer ring-2 ring-cyan-400/40 object-cover"
                />
                {showImageZoomModal && (
                    <Modal image={chatUser?.profileimg} alt={'user'} onClose={() => setImageZoomShowModal(false)} />)}
                <div className="ml-3">
                    <span className="block font-semibold text-white">{chatUser?.username}</span>
                    <span className="block text-sm text-cyan-200/80" style={{ 'fontSize': '13px' }}>{typingStatus || status}</span>
                </div>
            </div>
            <div className="flex items-center space-x-3 text-white" style={{ 'width': '9em' }}>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                    className="p-2 bg-slate-700/80 hover:bg-cyan-500/20 rounded-full text-white transition"
                    onMouseEnter={() => handleMouseEnter('settings')}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => chatUser ? setShowSettingPopup(true) : setShowSettingPopup(false)}

                >
                    <IoMdSettings size={hoveredIcon === 'settings' ? 17 : 14} />
                </button>
                <button
                    className="p-2 bg-slate-700/80 hover:bg-cyan-500/20 rounded-full text-white transition"
                    onMouseEnter={() => handleMouseEnter('call')}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => chatUser ? handleSetData('voice') : ""}
                >
                    <IoMdCall size={hoveredIcon === 'call' ? 17 : 14} />
                </button>
                <button
                    className="p-2 bg-slate-700/80 hover:bg-cyan-500/20 rounded-full text-white transition"
                    onMouseEnter={() => handleMouseEnter('video')}
                    onMouseLeave={handleMouseLeave}
                    // onClick={() => chatUser ? setShowVideoCall(true) : setShowVideoCall(false)}
                    onClick={() => chatUser ? handleSetData('video') : ""}
                >
                    <FaVideo size={hoveredIcon === 'video' ? 17 : 14} />
                </button>
            </div>

            {showSettingPopup && (
                <SettingPopup
                    currentUser={user}
                    user={chatUser}
                    onClose={() => setShowSettingPopup(false)}
                    setChatUser={setChatUser}
                    socket={socket}
                    setUser={setUser}
                    setImageZoomShowModal={setImageZoomShowModal}
                />
            )}
        </div>
    );
}

export default ChatHeader;
