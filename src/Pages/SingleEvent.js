import {useState, useEffect, useContext} from "react";
import '../Styles/App.css';
import { useParams, useNavigate } from "react-router-dom";
import BigNote from "../Components/BigNote";
import Note from "../Components/Note";
import { flushSync } from "react-dom";
import { RelayContext } from "../Extras/UserContext";
import CustomHeader from "../Components/CustomHeader";
import NewNote from "../Components/NewNote";

const SingleEvent = () => {

    const {relays} = useContext(RelayContext);
    const [note, setNote] = useState();
    let navigate = useNavigate();
    const socketURL = "wss://black.nostrcity.club";
    const [replies, setReplies] = useState([]);
    let all_replies = new Set();
    let notesPerLoad = 15;
    let hasLoadedNew = false;
    const { event_id } = useParams();

    let sockets = [];

    useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      relays.forEach(relay => {
        sockets.push(new WebSocket(relay));
          getNote(relay);
          getReplies(sockets[sockets.length-1]);
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        for (let i = 0; i < sockets.length; i++) {
          sockets[i].close();
        }
      };
    }, []);

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
          getReplies(sockets[sockets.length-1]);
        });
        setTimeout(() => {
          hasLoadedNew = false;
        }, 1000);
        //console.log('Scrolled to bottom');
      }
    };

      const getNote = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "limit":15, "ids":[event_id]};
            const subscription = ["REQ", "my-sub", filter];
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );
          //console.log(message);
          if(message != null && note==null) {
              setNote(<BigNote note={message} relays={relays} />);
          }
        };
  
      return () => {
        ws.close();
      };
      }

      const getReplies = (ws) => {
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "#e":[event_id]};
            const subscription = ["REQ", "my-sub", filter];//, "ids":["fcef4a917d49c6b3b7142a1f96c6c4e4b293b6f985ba0fc5f51576431d3bad64"]}];//, "authors":["35d26e4690cbe1","82341f882b6eab"]    , "authors":["35d26e4690cbe1","82341f882b6eab","32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"]
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );
          if(message != null && !all_replies.has(message.id)) {
            if(all_replies.size < notesPerLoad) {
              all_replies.add(message.id);
              //console.log(message);
              setReplies(replies => [...replies, { note:message, relays:relays, id:message.id}]);
            } else {
              for (let i = 0; i < sockets.length; i++) {
                sockets[i].close();
                return;
              }
            }
            //setReplies(replies => [...replies, <Note note={message} relays={relays} key={message.id} />]);
          }
        };
  
      return () => {
        ws.close();
      };
    }

    const getSorted = () => {
        return replies.sort(function(a, b) {
            return a.note.created_at - b.note.created_at;
          });
    }
    const replyComponents = getSorted().map(item => <Note key={item.id} relays={item.relays} note={item.note}/>);
    

    return (
        <>
        <CustomHeader title={<h1>Post/Thread</h1>}/>

        <div id="content">
          {note}
          <NewNote replyingTo={event_id}/>
          {replyComponents}
        </div>

        </>
    );
}

export default SingleEvent;