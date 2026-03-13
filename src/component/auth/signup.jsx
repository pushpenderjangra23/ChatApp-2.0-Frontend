import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/theme';
import { IoMoon, IoSunny } from 'react-icons/io5';

const Signup = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const notify = () => toast.success('Registered Successful!', { autoClose: 2000 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !email || !password) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/registeruser`, {
                username,
                email,
                password,
            });

            notify();
            setUsername('');
            setEmail('');
            setPassword('');
            setTimeout(() => {
                navigate(`${basePath}/login`);
            }, 3000);
        } catch (err) {
            console.error('Error during signup:', err);
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'An error occurred during signup.');
            } else {
                setError('Network error. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full border border-white/10 bg-slate-900/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                <p className='text-center text-cyan-300 text-sm mb-2'>Create account</p>
                <h2 className="text-3xl font-bold text-center text-white">Sign Up</h2>
                {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-slate-300">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={loading}
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-main text-center">Create account</h2>
                    <p className="text-sub text-center mt-1">Join the chat experience</p>
                    {error && <div className="text-red-500 text-sm mt-3 text-center">{error}</div>}
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sub mb-2">Username</label>
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 panel-soft rounded-xl outline-none text-main" disabled={loading} />
                        </div>
                        <div>
                            <label className="block text-sub mb-2">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 panel-soft rounded-xl outline-none text-main" disabled={loading} />
                        </div>
                        <div>
                            <label className="block text-sub mb-2">Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 panel-soft rounded-xl outline-none text-main" disabled={loading} />
                        </div>
                        <button type="submit" className="w-full accent-btn py-3 rounded-xl font-semibold" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
                        <button type="button" onClick={() => navigate(`${basePath}/login`)} className="w-full border border-soft py-3 rounded-xl text-main">Already have an account? Log In</button>
                    </form>
                </div>
                <div className="hidden md:flex flex-col justify-between panel-soft rounded-2xl p-8 order-1 md:order-2">
                    <div>
                        <button
                            type="submit"
                            className={`w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white py-3 px-4 rounded-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                        <button
                            onClick={() => navigate(`${basePath}/login`)}
                            className="mt-4 w-full bg-transparent border border-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            Log In
                        </button>
                    </div>
                    <p className="text-sub text-sm">Switch between dark and light theme anytime.</p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signup;
