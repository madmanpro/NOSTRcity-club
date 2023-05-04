import {useState, useEffect} from "react";
import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import '../Styles/BigNote.css';

const BigNote = ({note, relays}) => {

    const [metaData,setMeta] = useState();
    const socketURL = "wss://black.nostrcity.club";
    let navigate = useNavigate();
    let time_since = Math.floor(Date.now() / 1000) - note.created_at;

    useEffect(() => {
        relays.forEach(relay => {
            getMetaData(relay);
        });
    },[]);


    const getMetaData = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            var subscription2 = ["REQ", "my-sub", {"kinds":[0], "limit":1, "authors":[note.pubkey]}];
            ws.send(JSON.stringify(subscription2));
        }

        ws.onmessage = function (event) {
            const [ type, subId, message ] = JSON.parse( event.data );
            const {content} = message || {}

            if(message != null && metaData==null) {
                const metaData = JSON.parse(content);
                setMeta(metaData);
                ws.close();
            }
        }
    }

    const getTime = () => {
        if(time_since < 60) { return `${Math.floor(time_since)}s`; }
        time_since /= 60;
        if(time_since < 60) { return `${Math.floor(time_since)}m`; }
        time_since /= 60;
        if(time_since < 24) { return `${Math.floor(time_since)}h`; }
        time_since /= 24;
        return `${Math.floor(time_since)}d`;
      }

    const getPicture = (data) => {
        if(data!=null && data.picture != null) {
          return data.picture;
        } else {
          return "";
        }
      }
  
    const replaceImage = (error) => {
        error.target.src = 'https://nostrcheck.me/media/coreymarshall/nostrcheck.me_7747374245545459951682385504.jpg'; 
    }

    const getName = () => {
        if(metaData != null && metaData.name != null) {
        return <div id="note-name-big">
            <span id="author-big" onClick={()=> {
                navigate('/users/' + note.pubkey);
                navigate(0);
            }}>{metaData.name}</span>
            <div><span id="pubkey-big">{note.pubkey.substring(0,14)}...</span><BiCopy id="copy-button" onClick={() => {navigator.clipboard.writeText(note.pubkey)}}/></div>
        </div>;
        } else {
        return <div id="note-name-big">
            <span id="author-big" onClick={()=> {
                navigate('/users/' + note.pubkey);
                navigate(0);
            }}>{note.pubkey.substring(0,14)}...</span>
        </div>;
        }
    }

    const getMentions = (input) => {
        input += " ";
        let match = input.match(/#\[(\d+)\]/);
        if (match) {
            const mention_pubkey = note.tags[parseInt(match[1])][1];
            const words = input.split(/#\[\d+\]/);
            //console.log(words);
            const content = words.map((word) => {
                
                if (word == "") {
                  return <span id="other-user" onClick={() => {
                    navigate('/users/' + mention_pubkey);
                    navigate(0);
                  }}>{mention_pubkey.substring(0,14)}...</span>;
                }
                return word;
              });
            return content;
        } else {
            return input;
        }
    }

    const getContent = () => {
        let imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)[^\s]*/gi;
        let tempContent = note.content.replace(imageRegex, "");
        if(tempContent.length > 2000){
            return tempContent.substring(0,2000) + "...";
        }
        return getMentions(tempContent);
    }

    const getContentImage = () => {
        var imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
        var match = note.content.match(imageRegex);
        if (match) {
            return <><img src={match[0]} id="content-image"/></>;
        } else {
            return <></>;
        }
    }

    const getReplyTo = () => {
        for(const tag of note.tags) {
            if(tag[0]==='e'){
              return <p id="replying-big">replying to <span class="highlight link" onClick={() => {
                  navigate('/posts/' + tag[1]);
                  navigate(0);
              }} >{tag[1].substring(0,14)}...</span></p>;
            }
        }
    }


    return (
        <>
            <div className="message-container-big">
                <div id="meta-big">
                    <img id="profile-pic-big" src={getPicture(metaData)} alt="Image error" onError={replaceImage} />
                    {getName()}
                </div>
                {getReplyTo()}
                <p id="message-content">{getContent()}</p>
                {getContentImage()}
                <p class="gray small-text left">{getTime()}</p>
            </div>
        </>
    );
}

export default BigNote;