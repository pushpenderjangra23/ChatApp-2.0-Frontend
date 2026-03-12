import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user';
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [templogin, setTemplogin] = useState(false);
    const { setUser } = useContext(UserContext);
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');
    const notify = () => toast.success("Login Successful!", {
        autoClose: 2000,
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!templogin) {
            if (!email || !password) {
                setError('All fields are required');
                setLoading(false);
                return;
            }
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}${templogin ? '/templogin' : '/login'}`, {
                email,
                password,
            });

            console.log('Login successful:', response.data);
            const { token } = response.data;

            // Save JWT token in localStorage
            localStorage.setItem('token', token);
            //   onLogin(token);
            notify()
            console.log(response.data);

            setEmail('');
            setPassword('');
            setTimeout(() => {
                setUser(null);
                navigate('/');
            }, 3000);
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
    }, [])
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full border border-white/10 bg-slate-900/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                <p className='text-center text-cyan-300 text-sm mb-2'>Welcome back</p>
                <h2 className="text-3xl font-bold text-center text-white">Log In</h2>
                {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-slate-300">Email</label>
                        <input
                            type="email"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className={`w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white py-3 px-4 rounded-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                            onClick={() => setTemplogin(true)}
                        >
                            {loading ? 'Logging in...' : 'Login as a Guest'}
                        </button>
                        <button
                            type="submit"
                            className={`mt-4 w-full bg-slate-700 text-white py-3 px-4 rounded-xl hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}

                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                        <button
                            onClick={() => navigate(`${basePath}/signup`)}
                            className="mt-4 w-full bg-transparent border border-white/20 text-white py-3 px-4 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Login;
