import React, {useCallback, useState, useEffect} from 'react';
import {Form, FormLayout,Toast, AccountConnection, Link} from '@shopify/polaris'
import styles from './Settings.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { Get, Put } from '../../../helpers/request.helper';
import {createCarrier as CreateCarrier} from '../../../helpers/carrier.helper';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

const Settings = (props)=>{
    const [isLoading, setLoading] = useState(false);
    const [storeData, setStoreData] = useState({});
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connectedWebhook, setConnectedWebhook] = useState(false);
    const [connectedCarriers, setConnectedCarriers] = useState(false);
    const [user, setUser] = useState({});
    const [shopifyToken, setShopifyToken]  = useState({});
    const app = useAppBridge();

    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    const accountName = connectedWebhook || connectedCarriers ? 'Rocketfy' : '';
  
    const handleActionConnectWebhook = useCallback((user) => {
        setConnectedWebhook((connectedWebhook) => !connectedWebhook);

        let changeStatus =  async (status)=>{
            let r = await Put(`/api/settings/status/${user._id}`, {
                webhook : status
            });

            toast({ content : `${!connectedWebhook ? 'Conectado' : 'Desconectado'}`, active : true});
         }

        changeStatus(!connectedWebhook);

    }, [connectedWebhook]);

    const handleActionConnectCarriers = useCallback((user) => {
        setConnectedCarriers((connectedCarriers) => !connectedCarriers);

        let changeStatus =  async (status)=>{
            let r = await Put(`/api/settings/status/${user._id}`, {
                carrier : status
            });

            let c = await createCarrier(shopifyToken);

            if(c){
                console.log(c);
            }

            toast({ content : `${!connectedCarriers ? 'Conectado' : 'Desconectado'}`, active : true});
        }

        changeStatus(!connectedCarriers);

      }, [connectedCarriers]);
  
    const buttonTextWebhook = connectedWebhook ? 'Desconectar' : 'Conectar';
    const detailsWebhook = connectedWebhook ? 'Conectado' : 'No conectado';
    const termsWebhook = connectedWebhook ? null : (
      <p>
        Haciendo click en <strong>Conectar</strong>, habilitas la sincronización automatica de pedidos en nuestro
        <Link url="Example App"> Panel de Envios Rocketfy</Link>.
    </p>)

    const buttonTextCarriers = connectedCarriers ? 'Desconectar' : 'Conectar';
    const detailsCarriers = connectedCarriers ? 'Conectado' : 'No conectado';
    const termsCarriers = connectedCarriers ? null : (
    <p>
        Haciendo click en <strong>Conectar</strong>, habilitas todas las transportadoras disponibles en Rocketfy
    </p>)
    
    useEffect(()=>{
            let isConnectedSettings =  async ()=>{
                setLoading(true);
                
                let rs = await Get(`/api/settings/me/${data[DATA_KEY].myshopifyDomain}`).catch((e)=>{
                    setLoading(false);
                    toast({ content : "Ocurrio un error al obtener la información de la cuenta.", active : true});
                });

                setUser(rs);

                setConnectedCarriers(rs.carrier);
                setConnectedWebhook(rs.webhook);

                setLoading(false);
            }

            let getToken = async ()=>{
                const token = await getSessionToken(app);
                console.log("t", token);
                setShopifyToken({ st : token });
            }

            if(data && data[DATA_KEY]){
                setStoreData(data[DATA_KEY]);
                isConnectedSettings();
            }

            getToken();

    }, []);

    const createCarrier = async ()=>{
        console.log("shopifyToken", shopifyToken)
        /*let response = await CreateCarrier(shopifyToken).catch((e)=>{
          console.log(e);
        });*/
    }

    const toast = (options)=>{
        setShowToast({
            active : options.active,
            content :options.content
        });
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
                            onAction: ()=>{
                                handleActionConnectCarriers(user);
                            },
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
                            onAction: ()=>{
                                handleActionConnectWebhook(user);
                            },
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