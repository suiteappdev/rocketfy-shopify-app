import {  Frame, Page } from "@shopify/polaris";
import React, { useState, useEffect} from 'react';
import MainTabs from "./MainTabs";
import { getAcessToken } from "../helpers/request.helper";
import { setRocketfyToken } from "../helpers/storage.helper";

const Home = (props) => {
    const [token, setToken] = useState({});

    useEffect(() => {
        const fetch = async () => {
            let response = await getAcessToken().catch(e=>console.log(e));
            
            if(response && response.token){
                setToken({ token : response.token});
                setRocketfyToken(response.token);                
            }

        }; 

        fetch();

    }, []);

    return (
        <Page>
            {token ? (
                <Frame>
                    <MainTabs {...token}/>
                </Frame>
            ) : null}
        </Page>
    )
} 

export default Home;