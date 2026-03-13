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
            }, 1000);
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
        <div className="min-h-screen app-bg flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl panel rounded-3xl p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="panel-strong rounded-2xl p-6 md:p-8 order-2 md:order-1">
                    <div className="flex justify-end">
                        <button type="button" onClick={toggleTheme} className="panel-soft rounded-xl p-2 text-main">
                            {isDark ? <IoSunny /> : <IoMoon />}
                        </button>
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
                        <p className="text-sub uppercase tracking-[0.3em] text-xs">New user</p>
                        <h1 className="text-main text-4xl font-semibold mt-4">Start your conversations in seconds.</h1>
                        <p className="text-sub mt-3">Create your profile, add friends, and enjoy private text, voice, and video communication.</p>
                    </div>
                    <p className="text-sub text-sm">Switch between dark and light theme anytime.</p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signup;
