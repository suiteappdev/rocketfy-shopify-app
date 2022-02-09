import React, {useCallback, useState, useEffect} from 'react';
import {Form, FormLayout, Banner, Toast, AccountConnection, Link} from '@shopify/polaris'
import styles from './Settings.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { PostRequest, refreshToken, verifyUrl } from '../../../helpers/request.helper';
import { isConnected, removeRocketfyToken, setAppToken, setCustomerId} from '../../../helpers/storage.helper';
import { getISO } from '../../../helpers/country.helper';

const ROCKETFY_APIHOST = process.env.ROCKETFY_APIHOST;

const Settings = (props)=>{
    const [form, setForm] = useState({});
    const [storeData, setStoreData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connectedWebhook, setConnectedWebhook] = useState(false);
    const [connectedCarriers, setConnectedCarriers] = useState(false);
    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    const accountName = connectedWebhook || connectedCarriers ? 'Rocketfy' : '';
  
    const handleActionConnectWebhook = useCallback(() => {
      setConnectedWebhook((connectedWebhook) => !connectedWebhook);
    }, [connectedWebhook]);

    const handleActionConnectCarriers = useCallback(() => {
        setConnectedCarriers((connectedCarriers) => !connectedCarriers);
      }, [connectedCarriers]);
  
    const buttonTextWebhook = connectedWebhook ? 'Desconectar' : 'Conectar';
    const detailsWebhook = connectedWebhook ? 'Conectado' : 'No conectado';
    const termsWebhook = connectedWebhook ? null : (
      <p>
        Haciendo click en <strong>Conectar</strong>, habilitas la sincronización automatica de pedidos en nuestro
        <Link url="Example App">Panel de Envios Rocketfy</Link>.
    </p>)

    const buttonTextCarriers = connectedCarriers ? 'Desconectar' : 'Conectar';
    const detailsCarriers = connectedCarriers ? 'Conectado' : 'No conectado';
    const termsCarriers = connectedCarriers ? null : (
    <p>
        Haciendo click en <strong>Conectar</strong>, habilitas la sincronización automatica de pedidos en nuestro
        <Link url="Example App">Panel de Envios Rocketfy</Link>.
    </p>)
    
    useEffect(()=>{
        //setConnected(isConnected());
    }, []);

    const toast = (options)=>{
        setShowToast({
            active : options.active,
            content :options.content
        });
    }

    const disconnect = ()=>{
        setLoading(true);
        //setConnected(false);
        removeRocketfyToken();
        setLoading(false);
        localStorage.clear();
    }

    const connect = async ()=>{
        setLoading(true);
        
        let data = {
            email: form.txtEmail,
            name: form.txtShop,
            customer_name : form.txtFullname,
            country : form.txtCountry,
            phone : form.txtPhone,
            terms : true,
            origin_city :form.txtCity,
            origin_departament: form.txtProvince,
            address_shop:form.txtAddress,
            customer_domain : form.txtDomain,
            partnerID:process.env.ROCKETFY_PARTNERID,
        }

        let response = await PostRequest(`http://localhost:4001/api/public/createAccount` , data).catch(e=>toast({
            content : "Ocurrio un error al conectar la cuenta.",
            active : true,
        }));

        if(response){
            if(response.data.redirectUrl){
                //let url = await verifyUrl({ redirectUrl : response.data.redirectUrl}).catch(async (e)=>console.log("error", e));
                    //setConnected(true);
                    setLoading(false);
                    setAppToken(response.data.redirectUrl);
                    setCustomerId(response.data.customerID);
                    toast({
                        content : "Cuenta conectada.",
                        active : true,
                    });
            }
        }
    }

    return (
        <Form>
            {loading || isLoading ? (
                    <div  className={styles.spinner}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" stroke="#7a13c1">
                    <g fill="none" fill-rule="evenodd" stroke-width="2">
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                    </g>
                  </svg>
                    </div>
                ) : (
                <FormLayout>
                  <AccountConnection
                        accountName={accountName}
                        connected={connectedCarriers}
                        title="Importar transportadoras Rocketfy"
                        action={{
                            content: buttonTextCarriers,
                            onAction: handleActionConnectCarriers,
                        }}
                        details={detailsCarriers}
                        termsOfService={termsCarriers}
                 /> 
                  <AccountConnection
                        accountName={accountName}
                        connected={connectedWebhook}
                        title="Sincronizar automaticamente pedidos"
                        action={{
                            content: buttonTextWebhook,
                            onAction: handleActionConnectWebhook,
                        }}
                        details={detailsWebhook}
                        termsOfService={termsWebhook}
                 />
                   {connectedWebhook ? (null) : (
                    <React.Fragment>
                     
                   </React.Fragment>)}
            </FormLayout>
            )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>

    );
}

export default Settings