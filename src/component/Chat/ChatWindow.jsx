import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { ChatUserContext } from '../context/chatUser';
import { useContext } from 'react';
import WelcomeMessage from './Welcome';

function ChatWindow({ setIsMenuOpen, setSendMessage }) {
    const { chatUser } = useContext(ChatUserContext);

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
