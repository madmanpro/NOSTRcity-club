//import './App.css';
import {useState, useEffect, useContext} from "react";
import { BiCopy } from "react-icons/bi";
import Note from '../Components/Note';
import { useNavigate } from 'react-router-dom';
import { RelayContext,UserContext } from "../Extras/UserContext";
import CustomHeader from "../Components/CustomHeader";
import NewNote from "../Components/NewNote";

const Home = () => {

    const {user, setUser} = useContext(UserContext);
    const {relays} = useContext(RelayContext);
    const [notes, setNotes] = useState([]);
    let hasLoadedNew = false;
    let all_notes = new Set();
    let notesPerLoad = 15;
    let sockets = [];

    let navigate = useNavigate();
  
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        relays.forEach(relay => {
            sockets.push(new WebSocket(relay));
            getNotes(sockets[sockets.length-1]);
        });

        return () => {
          window.removeEventListener('scroll', handleScroll);
          for (let i = 0; i < sockets.length; i++) {
              sockets[i].close();
          }
      }
    }, []);

    const getNotes = (ws) => {
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "limit":notesPerLoad};
            const subscription = ["REQ", "my-sub", filter];
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );

          if(message != null && !all_notes.has(message.id) && message.pubkey != "395b2f660a4aeb573d319e39ba93a2cd53f62e641638fe7bc8cdb24db1f13995") {
            if(all_notes.size < notesPerLoad) {
              all_notes.add(message.id);
              setNotes(notes => [...notes, { note:message, relays:relays, id:message.id}]);
            } else {
              for (let i = 0; i < sockets.length; i++) {
                sockets[i].close();
                return;
              }
            }
              
          }
        };
  
      return () => {
        ws.close();
      };
    }


    const handleScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      if (scrollHeight - clientHeight - scrollTop <= 30 && !hasLoadedNew) {
        hasLoadedNew = true;
        for (let i = 0; i < sockets.length; i++) {
          sockets[i].close();
        }
        sockets = [];
        notesPerLoad += 15;
        relays.forEach(relay => {
          sockets.push(new WebSocket(relay));
          getNotes(sockets[sockets.length-1]);
        });
        setTimeout(() => {
          hasLoadedNew = false;
        }, 2000);
      }
    };

  
    const getSorted = () => {
        return notes.sort(function(a, b) {
            return b.note.created_at - a.note.created_at;
          });
    }
    const noteComponents = getSorted().map(item => <Note key={item.id} relays={item.relays} note={item.note}/>);

    
  
    return (
      <>

        <CustomHeader title={
          <div>
            <h1>
            <img src="https://nostr.build/i/nostr.build_dc3917258fb3ad5bca22599358f5d667e13408adabc2eca0ab40532c9937ea66.gif" alt="NOSTRcity Club" width="124" height="70"/>
            </h1>
            <p>Notes: {notes.length}</p>
          </div>}/>
        
        <div id="content">
          <NewNote/>
          {noteComponents}
        </div>

  
        <button onClick={() => window.scrollTo(0, -100)} id="myBtn" title="Go to top"><i class="fa-sharp fa-regular fa-pen-to-square"></i></button>

      </>
    );
    

}

export default Home;