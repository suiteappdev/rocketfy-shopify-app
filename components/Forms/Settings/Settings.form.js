import React, {useCallback, useState, useEffect} from 'react';
import {Form, FormLayout,Toast, AccountConnection, Link, Banner} from '@shopify/polaris'
import styles from './Settings.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { Get, Put } from '../../../helpers/request.helper';
import {createCarrier as CreateCarrier, getCarriers as GetCarriers, updateCarrier, getCarriers} from '../../../helpers/carrier.helper';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getJson, setJson } from '../../../helpers/storage.helper';

const Settings = (props)=>{
    const [isLoading, setLoading] = useState(false);
    const [storeData, setStoreData] = useState({});
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connectedWebhook, setConnectedWebhook] = useState(false);
    const [connectedCarriers, setConnectedCarriers] = useState(false);
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState({});
    const [carrier, setCarrier] = useState([]);
    const [st, setSt]  = useState('');

    const app = useAppBridge();

    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    const accountName = connectedWebhook || connectedCarriers ? 'Rocketfy' : '';

    let changeStatus =  async (status)=>{
        if(user._id){
            let r = await Put(`/api/settings/status/${user._id}`, {
                webhook : status
            });

            setConnectedWebhook(status);
            toast({ content : `${!connectedWebhook ? 'Conectado' : 'Desconectado'}`, active : true});
        }
    }
  
    const handleActionConnectWebhook = useCallback((user) => {
        setConnectedWebhook((connectedWebhook) => !connectedWebhook);
        changeStatus(!connectedWebhook);
    }, [connectedWebhook, user]);

    let changeStatus_carrier =  async (status)=>{
        if(user._id){
            let r = await Put(`/api/settings/status/${user._id}`, {
                carrier : status
            });

            let token = await getSessionToken(app);
            console.log("carriers", carrier);
            if(carrier.length > 0){
                carrier[0].active = status;
                let updated = await updateCarrier(carrier[0], token);
                console.log("updated", updated);
                if(updated && updated.data){
                    setConnectedCarriers(status);
                    toast({ content : `${!connectedCarriers ? 'Conectado' : 'Desconectado'}`, active : true});
                }
            }else{
                let c = await createCarrier(token);
                if(c){
                    setConnectedCarriers(status);
                    toast({ content : `${!connectedCarriers ? 'Conectado' : 'Desconectado'}`, active : true});
                }
            }
        }
    }

    const handleActionConnectCarriers = useCallback((user) => {
        setConnectedCarriers((connectedCarriers) => !connectedCarriers);
        changeStatus_carrier(!connectedCarriers);
      }, [connectedCarriers, user]);
  
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

                if(rs && rs.connected){
                    setConnected(true);
                    setLoading(false);
                    setUser(rs);
                }else{
                    setConnected(false);
                    setLoading(false);
                }

                setUser(rs);
                setConnectedCarriers(rs.carrier);
                setConnectedWebhook(rs.webhook);
                setLoading(false);

                let getToken = async ()=>{
                    const token = await getSessionToken(app);
                    if(token){
                        const c = await GetCarriers(token);
                        setCarrier(c.carrier_services);
                    }
                }
    
                if(data && data[DATA_KEY]){
                    setStoreData(data[DATA_KEY]);
                    isConnectedSettings();
                }
    
                getToken();
            }
    }, [connected]);

    const createCarrier = async (st)=>{
        if(st){
            let response = await CreateCarrier(st).catch((e)=>{
                console.log(e);
              });
        }
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
                    { !connected ? (
                        <Banner
                            title="Tu cuenta shopify aun no esta conectada a Rocketfy"
                            status="primary"
                            action={{content: 'Conectar', onAction: ()=>{
                                props.setSelectedTab(0)
                            }}}
                            secondaryAction={{content: 'Saber más', url: 'https://rocketfy.co'}}
                            onDismiss={() => {}}
                            >
                            <p>
                            Para sincronizar los pedidos primero debes conectar tu cuenta Shopify a Rocketfy
                            </p>
                        </Banner>
                    ) : (
                        <React.Fragment>
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
                        </React.Fragment>
                    )}
            </FormLayout>
            )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>

    );
}

export default Settings