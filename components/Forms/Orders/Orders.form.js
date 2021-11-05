import React, {useCallback, useState, useEffect} from 'react';
import { Button, Spinner, Toast, Form, FormLayout, Banner, ButtonGroup, AppProvider, Checkbox} from '@shopify/polaris'
import { Datatable } from './Orders.datatable';
import EmptyState from '../../EmptyState';
import styles from './Orders.module.css';
import { useMutation, useQuery } from '@apollo/client';
import  {ORDERS_QUERY, DATA_KEY}  from '../../../graphql/querys/orders.query';
import { isConnected, getAppToken, setJson, getJson} from '../../../helpers/storage.helper';
import { getCities as getlist } from '../../../helpers/location.helper';
import {WEBHOOK_MUTATION } from '../../../graphql/mutations/webhook.mutation';

const OrdersForm = (props)=>{
    const [ordersData, setOrdersData] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [addWebhook, { data : dataWebhook, loading : loadingWebhook, error : errorWebhook }] = useMutation(WEBHOOK_MUTATION);
    const {loading, error, data} = useQuery(ORDERS_QUERY);
    const [connected, setConnected] = useState(false);
    const [application, setApplication] = useState("");
    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    const subscribe = useCallback((newChecked) => {
        if(newChecked){
            setChecked(newChecked);
        }else{
            setChecked(newChecked);
        }
    }, []);

    useEffect(()=>{
        (async () => {
            if(getJson('cities-cache')){
                const list = await getlist();
                setCities(list);
                setJson('cities-cache', list);
            }else{
                setCities(getJson('cities-cache'));
            }
        })()
    }, []);
  
    useEffect(()=>{
        setConnected(isConnected());
        let app = getAppToken();
        
        if(app){
            setApplication(app);
        }

        if(data){
            setOrdersData(data[DATA_KEY].edges);
        }

    }, [application, data, ordersData]);

    const open = async (event)=>{
        event.preventDefault();
        window.open(application); 
    }

    const sync = (event)=>{
        event.preventDefault();
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
                         <Spinner accessibilityLabel="Obteniendo información de la tienda" size="large" />
                    </div>
                ) : (
                <FormLayout>
                    { connected ? (
                    <React.Fragment>
                    {((ordersData.length) > 0) ? <Datatable orders={ordersData} cities={cities} /> : <EmptyState heading={'No tienes pedidos por preparar'}  content={'ir a Rocketfy'} />}
                            {(ordersData.length > 0 )  ? (
                                <React.Fragment>
                                    <ButtonGroup>
                                        <Button primary onClick={open}>Ir a envios en Rocketfy</Button>
                                        <Button onClick={sync}>Sincronizar pedidos</Button>
                                        <Checkbox label="Recibir pedidos automaticamente en rocketfy" checked={checked} onChange={subscribe} />
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