import {useState, useEffect, useContext, React} from "react";
import '../Styles/App.css';
import { useParams, useNavigate } from "react-router-dom";
import '../Styles/Profile.css';
import CustomHeader from "../Components/CustomHeader";
import { RelayContext } from "../Extras/UserContext";



const Settings = () => {

    const {relays, setRelays} = useContext(RelayContext);
    const [newRelay, setNewRelay] = useState("");


    useEffect(() => {
        //console.log(localStorage.getItem('relays'));
        const storedContext = localStorage.getItem('relays');
        if (storedContext) {
            setRelays(JSON.parse(storedContext));
        }
        //setRelays(JSON.parse(localStorage.getItem('relays')));
    },[]);

    function isValidWebSocketUrl(url) {
        try {
          const ws = new WebSocket(url);
          return true;
        } catch (err) {
          return false;
        }
      }

    const addRelay = () => {
        if(isValidWebSocketUrl(newRelay)) {
            localStorage.setItem('relays', JSON.stringify([...relays, newRelay]));
            setRelays(relays => [...relays, newRelay]);
        }
    }

    const closeRelay = (toRemove) => {
        localStorage.setItem('relays', JSON.stringify(relays.filter(relay => relay != toRemove)));
        setRelays(relays.filter(relay => relay != toRemove));
    }

    const allRelays = relays.map(relay => {
        return <div class="relay large-text">{relay} <span class="small-text link default-link" onClick={() => {
            closeRelay(relay);
        }}>Close</span></div>;
    });

    return (
        <>
            <CustomHeader title={<h1>Relays</h1>}/>

            <div id="content">
                <p class="larger-text">Your relays:</p>
                {allRelays}

                <div id="new-relay">
                    <input type="text" placeholder="Relay" value={newRelay} onChange={(e) => setNewRelay(e.target.value)}/>
                    <button class="classic-button wide" onClick={addRelay}>Add</button>
                </div>
            </div>
        </>
    );
}



export default Settings;