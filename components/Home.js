import {  Frame, Page } from "@shopify/polaris";
import React, { useState, useEffect} from 'react';
import MainTabs from "./MainTabs";
import { getAcessToken } from "../helpers/request.helper";
import { getAppToken, getRocketfyToken, setRocketfyToken } from "../helpers/storage.helper";

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
            {token ? (
                <Frame>
                    <img alt="rocketfy imágen" src="https://www.rocketfy.co/static/graf_logistica-7b66ddd77f6e6656b543b7a5921b366c.png" class="graf graf_logistica" style="position: absolute;top: -21px;z-index: 99999;right: 223px;width: 15%;" />
                    <MainTabs {...token}/>
                </Frame>
            ) : null}
        </Page>
    )
} 

export default Home;