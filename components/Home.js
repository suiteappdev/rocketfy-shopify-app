import {  Frame, Page } from "@shopify/polaris";
import React, { useState, useEffect} from 'react';
import MainTabs from "./MainTabs";
import { getAcessToken } from "../helpers/request.helper";
import { getAppToken, getRocketfyToken, setRocketfyToken } from "../helpers/storage.helper";
import box2 from '../assets/images/box2.png'

const Home = (props) => {
    const [token, setToken] = useState({});

    useEffect(() => {
        const fetch = async () => {
            let response = await getAcessToken().catch(e=>console.log(e));
            
            if(response && response.token){
                setRocketfyToken(response.token);                
            }
        }; 

        if(!getRocketfyToken()){
            fetch();
        }

    }, []);

    return (
        <Page>
<<<<<<< HEAD
=======
            <img src='https://www.rocketfy.co/static/graf_drop-2821422d99ea86f94f6dc11c038e62b3.png' alt="logo" />;
>>>>>>> cdab411bc63814c3a63c9559420e709717f839a6
            {token ? (
                <Frame>
                    <MainTabs {...token}/>
                </Frame>
            ) : null}
        </Page>
    )
} 

export default Home;