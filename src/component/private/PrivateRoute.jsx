import { Outlet, Navigate } from 'react-router-dom';
// import Cookies from 'js-cookie';

const PrivateRoute = () => {
    let isLogin = localStorage.getItem('token');
    const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');
    return (
        !isLogin ? <Navigate to={`${basePath}/login`} /> : <Outlet />
    );
};

export default PrivateRoute;
