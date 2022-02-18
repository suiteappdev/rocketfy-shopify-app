import React, {useCallback, useState, useEffect} from 'react';
import { Button, Spinner, Toast, Form, FormLayout, Banner, ButtonGroup, AppProvider} from '@shopify/polaris'
import { Datatable } from './Orders';
import EmptyState from '../../EmptyState';
import styles from './Orders.module.css';
import {  useQuery } from '@apollo/client';
import  {ORDERS_QUERY, DATA_KEY}  from '../../../graphql/querys/orders.query';
import { setJson, getJson} from '../../../helpers/storage.helper';
import { getCities as getlist } from '../../../helpers/location.helper';
import { Get, refreshToken, verifyUrl }  from '../../../helpers/request.helper';

const OrdersForm = (props)=>{
    const [ordersData, setOrdersData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const {loading, error, data} = useQuery(ORDERS_QUERY);
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState({});
    const [application, setApplication] = useState("");
    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    useEffect(()=>{
        let isConnected  = async ()=>{
            setLoading(true);
            let rs = await Get(`/api/settings/me/${data.shop.myshopifyDomain}`).catch((e)=>{
                setLoading(false);
                toast({ content : "Ocurrio un error al obtener la información de la cuenta.", active : true,});
            });

            if(rs && rs.connected){
                setConnected(true);
                setLoading(false);
                setUser(rs);
            }else{
                setConnected(false);
                setLoading(false);
            }
        }

        if(data){
            setOrdersData(data[DATA_KEY].edges);
            console.log("data[DATA_KEY].edges", data[DATA_KEY].edges)
            isConnected();
        }

    }, [application, data, ordersData]);

    const open = async (event)=>{
        event.preventDefault();

        console.log("user", user);

        let refresh = await refreshToken(user.acesss_token, user.customerID);

        console.log("refres", refresh);

        if(refresh && refresh.data){
            let url = await verifyUrl({
                redirectUrl : refresh.data.redirectUrl
            });

            window.open(url.application); 
        }
    }

    const sync = (event)=>{
        event.preventDefault();
    }

    const toast = (options)=>{
        setShowToast({
            active : options.active,
            content :options.content
        });
    }

    return (
    <AppProvider
        i18n={{}}
        theme={{
          colors: {
            surface: '#111213',
            onSurface: '#111213',
            interactive: '#2e72d2',
            secondary: '#111213',
            primary: '#a74df9',
            critical: '#d82c0d',
            warning: '#ffc453',
            highlight: '#5bcdda',
            success: '#008060',
            decorative: '#ffc96b',
          },
        }}
      >
        <Form >
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
                    { connected ? (
                    <React.Fragment>
                    {((ordersData.length) > 0) ? <Datatable orders={ordersData} toApp={open} /> : <EmptyState heading={'No tienes pedidos por preparar'}  content={'ir a Rocketfy'} />}
                            {(ordersData.length > 0 )  ? (
                                <React.Fragment styles={{marginTop:'30px'}}>
                                    <ButtonGroup>
                                        <Button primary onClick={open}>Ir a envios en Rocketfy</Button>
                                    </ButtonGroup>
                                </React.Fragment>
                            ) : (null) }
                    </React.Fragment>
                    ) : (
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
                    )} 
                </FormLayout>                    
                )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>
        </AppProvider>
    );
}

export default OrdersForm