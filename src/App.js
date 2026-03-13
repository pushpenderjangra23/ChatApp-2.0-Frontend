import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
// import Join from "./component/join";
// import Chat from "./component/chat";
import Test from "./component/Chat/test";
import Signup from "./component/auth/signup";
import Login from "./component/auth/login";
import UserFetch from "./component/userFetch";
import UserComponent from "./component/user/userprofile";
import { useContext } from 'react';
import { UserContext } from './component/context/user';
import Protectedlogin from "./component/private/Protectedlogin";
import PrivateRoute from "./component/private/PrivateRoute";
import VoiceCall from "./component/call/voiceCall";
import CallPage from "./component/call/callpage";
function App() {
  const { user } = useContext(UserContext);
  const basePath = (process.env.REACT_APP_BASE_URL || '').replace(/\/$/, '');
  const routePath = (path) => `${basePath}${path}`;
  return (
    <BrowserRouter>
      <UserFetch />
      <Routes>
        {/* <Route exact path="/" element={<Join />} /> */}
        {/* <Route exact path="/chat" element={<Chat />} /> */}
        <Route element={<PrivateRoute />}>
          <Route exact path={'/'} element={<Test />} />
          {/* {user && ( */}
          <Route
            exact
            path={routePath('/profile')}
            element={<UserComponent user={user} />}
          />
          {/* )} */}
          <Route exact path={routePath('/call')} element={<VoiceCall />} />
          <Route exact path={routePath('/incomingCall')} element={<CallPage />} />
        </Route>
        <Route element={<Protectedlogin />}>
          <Route exact path={routePath('/signup')} element={<Signup />} />
          <Route exact path={routePath('/login')} element={<Login />} />
        </Route>
        {basePath && (
          <>
            {/* fallback routes for environments where BASE_URL is set but frontend still loads on root */}
            <Route element={<PrivateRoute />}>
              <Route exact path={'/profile'} element={<UserComponent user={user} />} />
              <Route exact path={'/call'} element={<VoiceCall />} />
              <Route exact path={'/incomingCall'} element={<CallPage />} />
            </Route>
            <Route element={<Protectedlogin />}>
              <Route exact path={'/signup'} element={<Signup />} />
              <Route exact path={'/login'} element={<Login />} />
            </Route>
          </>
        )}
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
