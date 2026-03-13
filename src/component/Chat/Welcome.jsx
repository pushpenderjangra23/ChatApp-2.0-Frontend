import React from 'react';
import { IoMenu } from 'react-icons/io5';

function WelcomeMessage({ setIsMenuOpen }) {
    return (
        <>
            <div className='block md:hidden cursor-pointer text-white p-6' style={{ 'marginRight': '1rem' }} onClick={() => {
                setIsMenuOpen(true);
            }}>
                <IoMenu size={20} />
            </div>
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-50 p-8">

                <div className='max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 md:p-12 shadow-2xl backdrop-blur-md'>
                    <p className='inline-flex mb-4 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-1 text-sm text-cyan-200'>Secure • Real-time • Modern</p>

                    <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                        Welcome to RealTalk.
                    </h1>
                    <p className="text-base md:text-lg mb-2 text-slate-300">
                        A beautiful space for instant messaging, crystal-clear voice/video calls, and media sharing.
                    </p>
                    <p className="text-base md:text-lg text-slate-400">
                        Pick a friend from the sidebar and start chatting in style.
                    </p>
                </div>
            </div>
        </>
    );
}

export default WelcomeMessage;
