import {  Frame, Page } from "@shopify/polaris";
import React, { useState, useEffect, Link} from 'react';
import MainTabs from "./MainTabs";
import { getAcessToken } from "../helpers/request.helper";
import { getRocketfyToken, setRocketfyToken } from "../helpers/storage.helper";

const Home = () => {
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
                    <MainTabs {...token}/>
                </Frame>
            ) : null}
            <p>
                Rocketfy <strong>v0.0.1</strong> 
                <Link url="https://www.rocketfy.co/universo/guias">Documentación</Link>.
            </p>
        </Page>
    )
} 

export default Home;