import {useState, useEffect, React} from "react";
import '../Styles/App.css';
import { useNavigate } from "react-router-dom";
import '../Styles/Profile.css';
import '@fortawesome/fontawesome-free/css/all.css';


const CustomHeader = ({title}) => {

    let navigate = useNavigate();

    return (
        <>
        <div id="header">
            {title}
            <p id="link" onClick={()=>{
                navigate("/");
            }}><i className="fas fa-home"></i>
            </p>

            <p id="link" onClick={()=>{
                navigate("/profile");
            }}><i class="fa fa-id-card" aria-hidden="true"></i>
            </p>

            <p id="link" onClick={()=>{
                navigate("/settings");
            }}><i class="fa fa-wifi" aria-hidden="true"></i>
            </p>
        
            <p id="link" onClick={()=>{
                navigate("https://www.nostrcity.club/");
            }}><i class="fa fa-info-circle" aria-hidden="true"></i>
            </p>


        </div>

        </>
    );
}



export default CustomHeader;