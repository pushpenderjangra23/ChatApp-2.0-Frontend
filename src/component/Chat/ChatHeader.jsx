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
    };

    return (
        <div className="px-4 md:px-6 py-3 border-b border-soft panel-strong flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
                <button className="block md:hidden text-main" onClick={() => setIsMenuOpen(true)}>
                    <IoMenu size={20} />
                </button>
                <img
                    src={chatUser?.profileimg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    onClick={() => setImageZoomShowModal(true)}
                    alt="User"
                    className="rounded-full w-11 h-11 object-cover cursor-pointer border border-soft"
                />
                {showImageZoomModal && <Modal image={chatUser?.profileimg} alt="user" onClose={() => setImageZoomShowModal(false)} />}
                <div className="min-w-0">
                    <p className="text-main font-semibold truncate">{chatUser?.username}</p>
                    <p className="text-sub text-sm truncate">{typingStatus || status}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                    className="panel-soft rounded-xl p-2 text-main"
                    onMouseEnter={() => setHoveredIcon('settings')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    onClick={() => chatUser && setShowSettingPopup(true)}
                >
                    <IoMdSettings size={hoveredIcon === 'settings' ? 17 : 14} />
                </button>
                <button
                    className="panel-soft rounded-xl p-2 text-main"
                    onMouseEnter={() => setHoveredIcon('call')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    onClick={() => chatUser && handleSetData('voice')}
                >
                    <IoMdCall size={hoveredIcon === 'call' ? 17 : 14} />
                </button>
                <button
                    className="panel-soft rounded-xl p-2 text-main"
                    onMouseEnter={() => setHoveredIcon('video')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    onClick={() => chatUser && handleSetData('video')}
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
