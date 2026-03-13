import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { ChatUserContext } from '../context/chatUser';
import { useContext } from 'react';
import WelcomeMessage from './Welcome';

function ChatWindow({ setIsMenuOpen, setSendMessage }) {
    const { chatUser } = useContext(ChatUserContext);
    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 w-full" >
            {chatUser && <ChatHeader setIsMenuOpen={setIsMenuOpen} />}
            {chatUser && <ChatMessages setSendMessage={setSendMessage} />}
            {!chatUser && <WelcomeMessage setIsMenuOpen={setIsMenuOpen} />}

    return (
        <div className="flex flex-1 flex-col h-full">
            {chatUser ? (
                <>
                    <ChatHeader setIsMenuOpen={setIsMenuOpen} />
                    <ChatMessages setSendMessage={setSendMessage} />
                </>
            ) : (
                <WelcomeMessage setIsMenuOpen={setIsMenuOpen} />
            )}
        </div>
    );
}

export default ChatWindow;
