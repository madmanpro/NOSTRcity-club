import {useState, useEffect} from "react";
import '../Styles/Note.css';
import {CgClose} from "react-icons/cg";
import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Note = ({note, relays, meta}) => {

    const [metaData,setMeta] = useState();
    const [replyData,setReply] = useState();
    const [showReply, setShowReply] = useState(false);
    const socketURL = "wss://black.nostrcity.club" ;
    let navigate = useNavigate();

    let time_since = Math.floor(Date.now() / 1000) - note.created_at;
    const replyEventKey = note.tags.find(tag => tag[0] === 'e')!=null ? note.tags.find(tag => tag[0] === 'e')[1] : null;

    let sockets = [];

    useEffect(() => {

        if(meta===undefined) {
            relays.forEach(relay => {
                sockets.push(new WebSocket(relay));
                getMetaData(sockets[sockets.length-1]);
            });
        }

        return () => {
            for (let i = 0; i < sockets.length; i++) {
                sockets[i].close();
            }
        }
        
    },[]);


    useEffect(() => {
        setMeta(meta);
    }, [meta]);



    const getMetaData = (ws) => {
        try {
            ws.onopen = (event) => {
                var subscription2 = ["REQ", "my-sub", {"kinds":[0], "limit":1, "authors":[note.pubkey]}];
                ws.send(JSON.stringify(subscription2));
            }

            ws.onmessage = function (event) {
                const [ type, subId, message ] = JSON.parse( event.data );
                const {content} = message || {}

                if(message != null && metaData == null) {
                    const metaData = JSON.parse(content);
                    setMeta(metaData);
                    for (let i = 0; i < sockets.length; i++) {
                        sockets[i].close();
                      }
                    return;
                }
            }

            ws.onerror = (error) => {
                ws.close();
                error.preventDefault();
            }
            
        } catch (error) {
        console.error(error);
        }
    }



    const getReplyTo = () => {
        for(const tag of note.tags) {
            if(tag[0]==='e'){
              return <p class="small-text gray" id="replying">replying to <span class="link highlight" onClick={(event) => {
                    event.stopPropagation();
                  navigate('/posts/' + tag[1]);
                  navigate(0);
              }} >{tag[1].substring(0,14)}...</span></p>;
            }
        }
    }


    const getName = () => {
        if(metaData != null && metaData.name != null) {
            return <><span class="medium-text bold link" onClick={(event)=> {
                event.stopPropagation();
                navigate('/users/' + note.pubkey);
                navigate(0);
            }}>{metaData.name}</span>  <span class="small-text gray">{note.pubkey.substring(0,14)}...</span> <BiCopy id="copy-button" onClick={(event) => {
                event.stopPropagation();
                navigator.clipboard.writeText(note.pubkey)
            }}/> <span class="small-text gray">∙ {getTime()}</span></>;
        } else {
            return <><span class="medium-text bold link" onClick={()=> {
                navigate('/users/' + note.pubkey);
                navigate(0);
            }}>{note.pubkey.substring(0,14)}...</span> <BiCopy id="copy-button" onClick={(event) => {
                event.stopPropagation();
                navigator.clipboard.writeText(note.pubkey)
            }}/> <span class="small-text gray">∙ {getTime()}</span></>;
        }
    }

    const getTime = () => {
        if(time_since < 0)  { return `0s`;}
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

    const getMentions = (input) => {
        input += " ";
        let match = input.match(/#\[(\d+)\]/);
        if (match) {
            const mention_pubkey = note.tags[parseInt(match[1])] ? note.tags[parseInt(match[1])][1] : "";
            const words = input.split(/#\[\d+\]/);
            const content = words.map((word) => {
                if (word == "") {
                  return <span key={mention_pubkey} class="highlight link" onClick={(event) => {
                    //localStorage.setItem('context', JSON.stringify(context));
                    event.stopPropagation();
                    navigate('/users/' + mention_pubkey);
                    navigate(0);
                    //navigate(0);
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

    return (
        <>
            <div class="card" id="message-container"  onClick={()=> {
                navigate('/posts/' + note.id);
                navigate(0);
            }}>
                <img id="note-pic" class="profile-pic small-pic" src={getPicture(metaData)} alt="Image error" onError={replaceImage} />
                <div>
                    <p>{getName()}</p>
                    {getReplyTo()}
                    <p class="wrap">{getContent()}</p>
            {getContentImage()}
                </div>
            </div>
            
        </>
    );
}

export default Note;