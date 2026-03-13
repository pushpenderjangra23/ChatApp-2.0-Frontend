import React from 'react';
import { IoMenu } from 'react-icons/io5';

function WelcomeMessage({ setIsMenuOpen }) {
    return (
        <>
            <div className="block md:hidden cursor-pointer text-main p-4" onClick={() => setIsMenuOpen(true)}>
                <IoMenu size={22} />
            </div>
            <div className="h-full flex items-center justify-center p-6 md:p-10">
                <div className="panel-strong rounded-3xl p-8 md:p-12 max-w-2xl text-center">
                    <span className="inline-flex px-4 py-1 rounded-full panel-soft text-sub text-xs uppercase tracking-[0.2em]">Start chatting</span>
                    <h1 className="text-main text-3xl md:text-5xl font-semibold mt-5">Your conversations, reimagined.</h1>
                    <p className="text-sub text-base md:text-lg mt-4">Select a friend on the left and jump into secure messaging, voice calls, and video calls instantly.</p>
                </div>
            </div>
        </>
    );
}

export default WelcomeMessage;
