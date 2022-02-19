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
            <img src={box2} alt="Box" />;
            {token ? (
                <Frame>
                    <MainTabs {...token}/>
                </Frame>
            ) : null}
        </Page>
    )
} 

export default Home;