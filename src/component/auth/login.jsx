import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user';
import { useTheme } from '../context/theme';
import { IoMoon, IoSunny } from 'react-icons/io5';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [templogin, setTemplogin] = useState(false);
    const { setUser } = useContext(UserContext);
    const { isDark, toggleTheme } = useTheme();
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');

    const notify = () => toast.success('Login Successful!', { autoClose: 2000 });

    const handleSubmit = async (e, isGuest = false) => {
        e.preventDefault();
        setTemplogin(isGuest);
        setError('');
        setLoading(true);

        if (!isGuest && (!email || !password)) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}${isGuest ? '/templogin' : '/login'}`, {
                email,
                password,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            notify();

            setEmail('');
            setPassword('');
            setTimeout(() => {
                setUser(null);
                navigate('/');
            }, 1000);
        } catch (err) {
            console.error('Error during login:', err);
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAllUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/getalluser`);
                if (response.status === 200) {
                    response.data.forEach((u) => {
                        localStorage.removeItem(u._id);
                    });
                }
            } catch (err) {
                console.warn('Skipping cleanup user list fetch:', err?.response?.status || err.message);
            } finally {
                localStorage.removeItem('token');
                localStorage.removeItem('privateKey');
                localStorage.removeItem('publicKey');
            }
        };
        getAllUser();
    }, []);

    return (
        <div className="min-h-screen app-bg flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl panel rounded-3xl p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="hidden md:flex flex-col justify-between panel-soft rounded-2xl p-8">
                    <div>
                        <p className="text-sub uppercase tracking-[0.3em] text-xs">Realtime Chat</p>
                        <h1 className="text-main text-4xl font-semibold mt-4">Connect. Message. Call.</h1>
                        <p className="text-sub mt-3">A fresh chat experience with friend requests, private conversations, and video calls.</p>
                    </div>
                    <p className="text-sub text-sm">Built for speed and secure communication.</p>
                </div>

                <div className="panel-strong rounded-2xl p-6 md:p-8">
                    <div className="flex justify-end">
                        <button type="button" onClick={toggleTheme} className="panel-soft rounded-xl p-2 text-main">
                            {isDark ? <IoSunny /> : <IoMoon />}
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold text-main text-center">Welcome back</h2>
                    <p className="text-sub text-center mt-1">Sign in to continue chatting</p>
                    {error && <div className="text-red-500 text-sm mt-3 text-center">{error}</div>}
                    <form className="mt-8 space-y-4" onSubmit={(e) => handleSubmit(e, false)}>
                        <div>
                            <label className="block text-sub mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 panel-soft rounded-xl outline-none text-main"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sub mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 panel-soft rounded-xl outline-none text-main"
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="w-full accent-btn py-3 rounded-xl font-semibold" disabled={loading || templogin}>
                            {loading && !templogin ? 'Logging in...' : 'Log In'}
                        </button>
                        <button type="button" onClick={(e) => handleSubmit(e, true)} className="w-full panel-soft py-3 rounded-xl text-main font-semibold" disabled={loading}>
                            {loading && templogin ? 'Logging in...' : 'Login as Guest'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/signup`)}
                            className="w-full border border-soft py-3 rounded-xl text-main"
                        >
                            Create New Account
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;
