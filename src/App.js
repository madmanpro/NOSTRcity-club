import Home from './Pages/Home';
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SingleEvent from './Pages/SingleEvent';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import Settings from './Pages/Settings';
import { useState } from 'react';
import {UserContext, RelayContext} from './Extras/UserContext';

function App() {

  const [user, setUser] = useState({});
  
  const [relays, setRelays] = useState([
    "wss://black.nostrcity.club",
    "ws://madrig.local:4848"
  ]);

  return (
    <>
      <UserContext.Provider value={{user, setUser}}>
      <RelayContext.Provider value={{relays, setRelays}}>
        <BrowserRouter>
          <Routes>
            <Route path="/profile" element={<UserProfile/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/" element={<Home/>}/>
            <Route path="/users/:author" element={<Profile/>} />
            <Route path="/posts/:event_id" element={<SingleEvent/>}/>
          </Routes>
        </BrowserRouter>
      </RelayContext.Provider>
      </UserContext.Provider>
    </>
  );

}

export default App;
